import React, { useState, useEffect } from 'react'
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
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cartReady, setCartReady] = useState(false)
  const [currentCart, setCurrentCart] = useState<any>(null)
  const [stripeConfigured, setStripeConfigured] = useState<boolean>(false)

  // Check if Stripe is configured in Swell settings
  useEffect(() => {
    const checkStripeConfig = async () => {
      try {
        const settings: any = await swell.settings.get()
        const stripeConfig = settings?.payments?.methods?.find((m: any) => m.id === 'stripe')
        
        if (stripeConfig && stripeConfig.connected) {
          console.log('Stripe is configured and connected')
          setStripeConfigured(true)
        } else {
          console.log('Stripe not configured or not connected')
          setStripeConfigured(false)
        }
      } catch (err) {
        console.error('Error checking Stripe config:', err)
        setStripeConfigured(false)
      }
    }

    checkStripeConfig()
  }, [])

  // Ensure cart is ready
  useEffect(() => {
    const ensureCartReady = async () => {
      try {
        let cart = await swell.cart.get()
        
        if (!cart || !cart.items || cart.items.length === 0) {
          console.log('Cart empty, ensuring cart has items...')
          setError('Cart must have items before processing payment')
          return
        }
        
        console.log('Cart ready:', {
          id: cart.id,
          itemCount: cart.items?.length,
          total: cart.grand_total
        })
        
        setCurrentCart(cart)
        setCartReady(true)
      } catch (err) {
        console.error('Error checking cart:', err)
        setError('Error initializing payment form')
      }
    }

    ensureCartReady()
  }, [])

  const processStripePayment = async () => {
    console.log('Processing payment with Swell card tokenization...')
    
    // Use Swell's card tokenization instead of direct Stripe API
    const tokenResponse: any = await swell.card.createToken({
      number: cardData.number.replace(/\s/g, ''), // Remove spaces
      exp_month: parseInt(cardData.exp_month),
      exp_year: parseInt(`20${cardData.exp_year}`), // Convert 25 to 2025
      cvc: cardData.cvc,
      billing: {
        name: cardData.name
      }
    })

    if (tokenResponse?.error) {
      throw new Error(tokenResponse.error.message || 'Card tokenization failed')
    }

    console.log('Swell card token created:', tokenResponse)

    // Update cart with payment information
    await swell.cart.update({
      billing: {
        ...currentCart?.billing,
        method: 'stripe',
        card: {
          token: tokenResponse.token,
          last4: tokenResponse.last4 || cardData.number.slice(-4),
          brand: tokenResponse.brand || 'card',
          exp_month: parseInt(cardData.exp_month),
          exp_year: parseInt(`20${cardData.exp_year}`),
        }
      }
    })

    console.log('Cart updated with Swell card token')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (processing) return
    
    try {
      setProcessing(true)
      setError(null)

      console.log('Starting payment processing...', paymentMethod)

      if (paymentMethod === 'stripe') {
        // Validate required fields
        if (!cardData.name.trim()) {
          throw new Error('Please enter the name on the card.')
        }
        if (!cardData.number || !cardData.exp_month || !cardData.exp_year || !cardData.cvc) {
          throw new Error('Please fill in all card details.')
        }

        await processStripePayment()
        
      } else if (paymentMethod === 'paypal') {
        // For PayPal, just set the payment method
        await swell.cart.update({
          billing: {
            ...currentCart?.billing,
            method: 'paypal'
          }
        })
        console.log('Cart updated with PayPal payment method')
        
      } else {
        // For custom payment methods
        await swell.cart.update({
          billing: {
            ...currentCart?.billing,
            method: paymentMethod
          }
        })
        console.log('Cart updated with custom payment method')
      }

      console.log('Payment setup complete, submitting order...')
      
      // Submit the order
      const order = await swell.cart.submitOrder()
      
      if (!order) {
        throw new Error('Order submission failed - no order returned')
      }
      
      console.log('Order submitted successfully:', {
        id: order.id,
        number: order.number,
        status: order.status,
        total: order.grand_total,
        paid: order.paid
      })
      
      // Call the completion handler with the order
      onOrderComplete(order)
      
    } catch (error: any) {
      console.error('Payment submission failed:', error)
      setError(error.message || 'Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    // Format card number with spaces
    if (name === 'number') {
      const formatted = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim()
      setCardData(prev => ({ ...prev, [name]: formatted }))
    } else {
      setCardData(prev => ({ ...prev, [name]: value }))
    }
  }

  const isButtonDisabled = loading || 
    processing || 
    !cartReady ||
    !!error ||
    (paymentMethod === 'stripe' && !stripeConfigured)

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
            <span className="ml-2 text-sm font-medium">
              Credit Card (Swell + Stripe)
              {!stripeConfigured && <span className="text-red-500 ml-1">- Not configured</span>}
            </span>
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
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700">
              Using Swell card tokenization (manual implementation)
            </p>
          </div>
          
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
              maxLength={19} // 16 digits + 3 spaces
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

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Debug Info */}
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs">
        <p><strong>Status:</strong></p>
        <p>Cart ready: {cartReady ? 'Yes' : 'No'}</p>
        <p>Stripe: {stripeConfigured ? 'Configured' : 'Not configured'}</p>
        <p>Processing: {processing ? 'Yes' : 'No'}</p>
        <p>Button disabled: {isButtonDisabled ? 'Yes' : 'No'}</p>
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
          ) : (
            'Complete Order'
          )}
        </button>
      </div>
    </form>
  )
}

export default PaymentForm