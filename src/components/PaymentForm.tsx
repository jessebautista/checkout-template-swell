import React, { useState, useEffect } from 'react'
import { PaymentInfo } from '@/types'
import swell from '@/lib/swell'

interface PaymentFormProps {
  onOrderComplete: (order: any) => void
  onPrev: () => void
  loading?: boolean
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  onOrderComplete,
  onPrev,
  loading = false
}) => {
  const [paymentMethod, setPaymentMethod] = useState<string>('stripe')
  const [cardData, setCardData] = useState({
    name: '',
    number: '',
    exp_month: '',
    exp_year: '',
    cvc: ''
  })
  const [elementsCreated, setElementsCreated] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cartReady, setCartReady] = useState(false)
  const [useStripeElements, setUseStripeElements] = useState(true)
  const [currentCart, setCurrentCart] = useState<any>(null)

  // DEBUG: Log button state
  const isButtonDisabled = loading || 
    processing || 
    (paymentMethod === 'stripe' && useStripeElements && (!elementsCreated || !cartReady)) ||
    !!error

  console.log('DEBUG: Button state', {
    loading,
    processing,
    paymentMethod,
    useStripeElements,
    elementsCreated,
    cartReady,
    error,
    isButtonDisabled
  })

  // Ensure cart is ready before creating elements
  useEffect(() => {
    const ensureCartReady = async () => {
      try {
        console.log('DEBUG: Checking cart...')
        let cart = await swell.cart.get()
        
        console.log('DEBUG: Cart retrieved:', cart)
        
        // If no cart or cart is empty, we need to add something to make Stripe Elements work
        if (!cart || !cart.items || cart.items.length === 0) {
          console.log('DEBUG: Cart empty, ensuring cart has items for Stripe Elements...')
          setError('Cart must have items before processing payment')
          return
        }
        
        console.log('DEBUG: Cart ready:', {
          id: cart.id,
          itemCount: cart.items?.length,
          total: cart.grand_total
        })
        
        setCurrentCart(cart)
        setCartReady(true)
      } catch (err) {
        console.error('DEBUG: Error checking cart:', err)
        setError('Error initializing payment form')
      }
    }

    ensureCartReady()
  }, [])

  // Initialize Stripe Elements when cart is ready and payment method is stripe
  useEffect(() => {
    console.log('DEBUG: Stripe Elements effect triggered', {
      paymentMethod,
      cartReady,
      useStripeElements,
      elementsCreated
    })
    
    if (paymentMethod === 'stripe' && cartReady && useStripeElements && !elementsCreated) {
      initializeStripeElements()
    }
  }, [paymentMethod, cartReady, useStripeElements])

  const initializeStripeElements = async () => {
    try {
      setError(null)
      console.log('DEBUG: Creating Stripe Elements...')
      
      // Follow Swell docs exactly - use # prefix for elementId
      await swell.payment.createElements({
        card: {
          elementId: '#card-element', // Note: Swell docs show # prefix is required
          options: {
            style: {
              base: {
                fontWeight: '500',
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
                fontFamily: 'system-ui, sans-serif',
              },
              invalid: {
                color: '#fa755a',
                iconColor: '#fa755a'
              }
            }
          },
          onChange: (event: any) => {
            console.log('DEBUG: Stripe Elements onChange:', event)
            if (event?.error) {
              setError(event.error.message)
            } else {
              setError(null)
            }
          },
          onReady: (event: any) => {
            // This is the correct callback according to Swell docs
            console.log('DEBUG: Stripe Elements ready:', event)
            setElementsCreated(true)
          },
          onError: (error: any) => {
            console.error('DEBUG: Stripe Elements error:', error)
            setError(error?.message || 'Payment form error')
            // Fall back to manual form
            setUseStripeElements(false)
          }
        }
      })
      
      console.log('DEBUG: Stripe Elements created successfully')
      
    } catch (error: any) {
      console.error('DEBUG: Failed to create Stripe Elements:', error)
      setError(null) // Clear error and fall back to manual form
      setUseStripeElements(false)
      console.log('DEBUG: Falling back to manual card entry form')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('DEBUG: handleSubmit called!')
    console.log('DEBUG: Event:', e)
    
    e.preventDefault()
    console.log('DEBUG: Form submitted!')
    
    if (processing) {
      console.log('DEBUG: Already processing, returning')
      return
    }
    
    // Additional validation logging
    console.log('DEBUG: Form validation state:', {
      paymentMethod,
      cardName: cardData.name,
      useStripeElements,
      elementsCreated,
      cartReady
    })
    
    try {
      setProcessing(true)
      setError(null)
      console.log('DEBUG: Starting payment processing...')

      console.log('DEBUG: Processing payment with method:', paymentMethod)

      if (paymentMethod === 'stripe') {
        if (!cardData.name.trim()) {
          throw new Error('Please enter the name on the card.')
        }

        console.log('DEBUG: Payment submission state:', {
          useStripeElements,
          elementsCreated,
          paymentMethod
        })

        if (useStripeElements && elementsCreated) {
          console.log('DEBUG: Tokenizing with Stripe Elements...')
          
          // Follow Swell docs exactly for tokenization
          await new Promise<void>((resolve, reject) => {
            swell.payment.tokenize({
              card: {
                onSuccess: () => {
                  console.log('DEBUG: Stripe Elements tokenization successful')
                  console.log('DEBUG: Cart billing automatically updated by tokenization')
                  resolve()
                },
                onError: (err: any) => {
                  console.error('DEBUG: Stripe Elements tokenization error:', err)
                  reject(new Error(err?.message || 'Payment tokenization failed'))
                }
              }
            })
          })
          
        } else {
          console.log('DEBUG: Using manual card tokenization...')
          
          // Validate manual form fields only when NOT using Stripe Elements
          if (!cardData.number || !cardData.exp_month || !cardData.exp_year || !cardData.cvc) {
            throw new Error('Please fill in all card details.')
          }
          
          // Use manual card tokenization as documented
          const tokenResponse: any = await swell.card.createToken({
            number: cardData.number.replace(/\s/g, ''), // Remove spaces
            exp_month: parseInt(cardData.exp_month),
            exp_year: parseInt(cardData.exp_year),
            cvc: cardData.cvc,
            billing: {
              name: cardData.name
            }
          })
          
          if (tokenResponse?.error) {
            throw new Error(tokenResponse.error.message || 'Card tokenization failed')
          }
          
          console.log('DEBUG: Manual tokenization successful')
          
          // For manual tokenization, we need to update the cart with the token
          await swell.cart.update({
            billing: {
              ...currentCart?.billing,
              card: tokenResponse
            }
          })
          
          console.log('DEBUG: Cart updated with manual token')
        }
        
      } else {
        // For other payment methods (PayPal, etc.), set basic billing method
        await swell.cart.update({
          billing: {
            ...currentCart?.billing,
            method: paymentMethod
          }
        })
        console.log('DEBUG: Cart updated with payment method:', paymentMethod)
      }

      console.log('DEBUG: Payment tokenization complete, submitting order...')
      
      // Submit the order after successful tokenization
      // According to docs, tokenization automatically updates cart billing
      const order = await swell.cart.submitOrder()
      
      if (!order) {
        throw new Error('Order submission failed - no order returned')
      }
      
      console.log('DEBUG: Order submitted successfully:', {
        id: order.id,
        number: order.number,
        status: order.status,
        total: order.grand_total,
        paid: order.paid
      })
      
      // Call the completion handler with the order
      onOrderComplete(order)
      
    } catch (error: any) {
      console.error('DEBUG: Payment submission failed:', error)
      setError(error.message || 'Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  // DEBUG: Add click handler to see if button clicks are registered
  const handleButtonClick = (e: React.MouseEvent) => {
    console.log('DEBUG: Button clicked!', e)
    console.log('DEBUG: Button disabled state:', isButtonDisabled)
  }

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCardData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Payment Method</h3>
        
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="payment_method"
              value="stripe"
              checked={paymentMethod === 'stripe'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm font-medium">Credit Card (Stripe)</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="radio"
              name="payment_method"
              value="paypal"
              checked={paymentMethod === 'paypal'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm font-medium">PayPal</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="radio"
              name="payment_method"
              value="custom"
              checked={paymentMethod === 'custom'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm font-medium">Custom Payment</span>
          </label>
        </div>
      </div>

      {paymentMethod === 'stripe' && (
        <div className="space-y-4">
          <div>
            <label htmlFor="card_name" className="form-label">
              Name on Card *
            </label>
            <input
              type="text"
              id="card_name"
              name="name"
              value={cardData.name}
              onChange={handleCardChange}
              className="form-input"
              required
            />
          </div>

          {useStripeElements ? (
            <div>
              <label className="form-label">
                Card Details *
              </label>
              
              {/* Stripe Elements Container - Note: NO # in the id, but Swell expects it in elementId */}
              <div 
                id="card-element"
                className="form-input min-h-[48px] transition-colors border-gray-300"
                style={{ 
                  padding: '12px',
                  borderRadius: '12px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #d1d5db'
                }}
              >
                {!cartReady && (
                  <div className="flex items-center text-gray-400 text-sm">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-2"></div>
                    Checking cart...
                  </div>
                )}
                {cartReady && !elementsCreated && (
                  <div className="flex items-center text-gray-400 text-sm">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-2"></div>
                    Loading secure payment form...
                  </div>
                )}
                {/* Stripe Elements will be mounted here by Swell */}
              </div>
              
              {elementsCreated && (
                <p className="text-xs text-gray-500 mt-1">
                  Use test card: 4242 4242 4242 4242, any future date, any CVC
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700">
                  Using manual card entry (Stripe Elements unavailable)
                </p>
              </div>
              
              <div>
                <label htmlFor="card_number" className="form-label">
                  Card Number *
                </label>
                <input
                  type="text"
                  id="card_number"
                  name="number"
                  value={cardData.number}
                  onChange={handleCardChange}
                  placeholder="4242 4242 4242 4242"
                  className="form-input"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="exp_month" className="form-label">
                    Month *
                  </label>
                  <input
                    type="text"
                    id="exp_month"
                    name="exp_month"
                    value={cardData.exp_month}
                    onChange={handleCardChange}
                    placeholder="12"
                    maxLength={2}
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="exp_year" className="form-label">
                    Year *
                  </label>
                  <input
                    type="text"
                    id="exp_year"
                    name="exp_year"
                    value={cardData.exp_year}
                    onChange={handleCardChange}
                    placeholder="25"
                    maxLength={2}
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="cvc" className="form-label">
                    CVC *
                  </label>
                  <input
                    type="text"
                    id="cvc"
                    name="cvc"
                    value={cardData.cvc}
                    onChange={handleCardChange}
                    placeholder="123"
                    maxLength={4}
                    className="form-input"
                    required
                  />
                </div>
              </div>
              
              <p className="text-xs text-gray-500">
                Use test card: 4242 4242 4242 4242, exp: 12/25, CVC: 123
              </p>
            </div>
          )}
          
          {error && (
            <p className="text-xs text-red-600 mt-1 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          )}
        </div>
      )}

      {paymentMethod === 'paypal' && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            You will be redirected to PayPal to complete your payment.
          </p>
        </div>
      )}

      {paymentMethod === 'custom' && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            Custom payment method will be processed after order submission.
          </p>
        </div>
      )}

      {/* DEBUG INFO */}
      <div className="p-3 bg-gray-100 border rounded-lg text-xs">
        <p><strong>Debug Info:</strong></p>
        <p>Button disabled: {isButtonDisabled ? 'Yes' : 'No'}</p>
        <p>Cart ready: {cartReady ? 'Yes' : 'No'}</p>
        <p>Elements created: {elementsCreated ? 'Yes' : 'No'}</p>
        <p>Processing: {processing ? 'Yes' : 'No'}</p>
        <p>Error: {error || 'None'}</p>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="btn btn-secondary"
        >
          Back
        </button>
        <button
          type="submit"
          onClick={handleButtonClick}
          disabled={isButtonDisabled}
          className="btn btn-primary"
        >
          {processing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : !cartReady ? (
            'Loading...'
          ) : loading ? (
            'Saving...'
          ) : (
            'Complete Order'
          )}
        </button>
      </div>
    </form>
  )
}

export default PaymentForm