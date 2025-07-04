import React, { useState } from 'react'
import { PaymentInfo } from '@/types'

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
        paymentData.card = {
          token: 'tok_visa',
          last4: cardData.number.slice(-4),
          exp_month: parseInt(cardData.exp_month),
          exp_year: parseInt(cardData.exp_year),
          brand: 'visa'
        }
      }

      await onSubmit(paymentData)
      onNext()
    } catch (error) {
      console.error('Failed to save payment info:', error)
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
              placeholder="1234 5678 9012 3456"
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
                placeholder="MM"
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
                placeholder="YY"
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
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? 'Saving...' : 'Review Order'}
        </button>
      </div>
    </form>
  )
}

export default PaymentForm