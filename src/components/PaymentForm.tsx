import React, { useState, useEffect } from 'react'
import { PaymentInfo } from '@/types'
import swell from '@/lib/swell'

interface PaymentFormProps {
  onSubmit: (data: PaymentInfo) => void
  onNext: () => void
  onPrev: () => void
  loading?: boolean
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  onSubmit,
  onNext,
  onPrev,
  loading = false
}) => {
  const [paymentMethod, setPaymentMethod] = useState<string>('stripe')
  const [cardData, setCardData] = useState({
    number: '',
    exp_month: '',
    exp_year: '',
    cvc: '',
    name: ''
  })
  const [stripeElements, setStripeElements] = useState<any>(null)
  const [cardElement, setCardElement] = useState<any>(null)
  const [tokenizing, setTokenizing] = useState(false)
  const [tokenized, setTokenized] = useState(false)
  const [elementError, setElementError] = useState<string | null>(null)

  // Initialize Stripe Elements when component mounts
  useEffect(() => {
    if (paymentMethod === 'stripe') {
      initializeStripeElements()
    }
  }, [paymentMethod])

  const initializeStripeElements = async () => {
    try {
      console.log('Initializing Stripe Elements...')
      setElementError(null)
      
      // Clear any existing elements first
      const cardContainer = document.getElementById('stripe-card-element')
      if (cardContainer) {
        cardContainer.innerHTML = ''
      }
      
      const elements = await swell.payment.createElements({
        card: {
          elementId: '#stripe-card-element',
          options: {
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#dc2626',
                iconColor: '#dc2626'
              }
            },
            hidePostalCode: true
          },
          onSuccess: (result: any) => {
            console.log('Stripe Elements mounted successfully:', result)
            setElementError(null)
          },
          onError: (error: any) => {
            console.error('Stripe Elements error:', error)
            setElementError(error.message || 'Payment form error')
          },
          onChange: (event: any) => {
            if (event.error) {
              setElementError(event.error.message)
            } else {
              setElementError(null)
            }
          }
        }
      })
      
      if (elements) {
        setStripeElements(elements)
        setCardElement(elements.card || elements)
        console.log('Stripe Elements initialized successfully')
      } else {
        throw new Error('Failed to create Stripe Elements')
      }
    } catch (error: any) {
      console.error('Failed to initialize Stripe Elements:', error)
      setElementError(error.message || 'Failed to load payment form')
    }
  }

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCardData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const paymentData: PaymentInfo = {
        method: paymentMethod,
        gateway: paymentMethod
      }

      if (paymentMethod === 'stripe') {
        setTokenizing(true)
        setElementError(null)
        
        try {
          // Validate that Stripe Elements are ready
          if (!stripeElements || !cardElement) {
            throw new Error('Payment form not ready. Please wait and try again.')
          }
          
          // Use Swell's proper tokenization method
          console.log('Tokenizing payment with Swell...')
          
          let tokenizeSuccess = false
          
          await swell.payment.tokenize({
            card: {
              onSuccess: (result: any) => {
                console.log('Payment tokenized successfully:', result)
                setTokenized(true)
                tokenizeSuccess = true
                paymentData.tokenized = true
              },
              onError: (err: any) => {
                console.error('Tokenization error:', err)
                setElementError(err.message || 'Payment tokenization failed')
                throw new Error(err.message || 'Payment tokenization failed')
              }
            }
          })
          
          // Wait a moment for tokenization to complete
          await new Promise(resolve => setTimeout(resolve, 100))
          
          if (!tokenizeSuccess && !tokenized) {
            throw new Error('Payment tokenization did not complete successfully')
          }
          
          // Add card info for display purposes (using name from form)
          paymentData.card = {
            name: cardData.name,
            last4: '****', // Will be populated by Stripe
            brand: 'card',
            tokenized: true
          }
          
          console.log('Payment data prepared:', paymentData)
          
        } catch (tokenError: any) {
          console.error('Payment tokenization failed:', tokenError)
          setElementError(tokenError.message || 'Payment processing failed')
          
          // Only provide fallback if explicitly in demo/test mode
          if (process.env.NODE_ENV === 'development') {
            console.log('Using fallback payment data for development')
            paymentData.card = {
              name: cardData.name || 'Test User',
              last4: '4242',
              brand: 'visa',
              tokenized: false // Mark as not tokenized
            }
          } else {
            throw tokenError // Re-throw in production
          }
        } finally {
          setTokenizing(false)
        }
      }

      await onSubmit(paymentData)
      onNext()
    } catch (error) {
      console.error('Failed to save payment info:', error)
      setTokenizing(false)
    }
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

          {/* Stripe Elements Container */}
          <div>
            <label className="form-label">
              Card Details *
            </label>
            <div 
              id="stripe-card-element" 
              className={`form-input min-h-[48px] flex items-center transition-colors ${
                elementError ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              style={{ 
                padding: '12px',
                borderRadius: '12px',
                backgroundColor: elementError ? 'rgba(254, 242, 242, 0.5)' : 'rgba(255, 255, 255, 0.5)'
              }}
            >
              {!cardElement && !elementError && (
                <div className="flex items-center text-gray-400 text-sm">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-2"></div>
                  Loading payment form...
                </div>
              )}
              {/* Stripe Elements will be mounted here */}
            </div>
            {elementError && (
              <p className="text-xs text-red-600 mt-1 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {elementError}
              </p>
            )}
            {!elementError && (
              <p className="text-xs text-gray-500 mt-1">
                Use test card: 4242 4242 4242 4242
              </p>
            )}
            {tokenized && (
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Payment method ready
              </p>
            )}
          </div>

          {/* Fallback manual fields (hidden when Stripe Elements is available) */}
          {!cardElement && (
            <>
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
            </>
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
          disabled={loading || tokenizing || (paymentMethod === 'stripe' && !tokenized && !elementError)}
          className="btn btn-primary"
        >
          {tokenizing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : loading ? (
            'Saving...'
          ) : (
            'Review Order'
          )}
        </button>
      </div>
    </form>
  )
}

export default PaymentForm