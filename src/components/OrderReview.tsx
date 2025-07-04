import React, { useState } from 'react'
import { Cart, Order, PaymentInfo } from '@/types'
import OrderSummary from './OrderSummary'

interface OrderReviewProps {
  cart: Cart
  paymentMethod?: PaymentInfo | null
  onSubmit: () => Promise<Order>
  onPrev: () => void
  loading?: boolean
}

const OrderReview: React.FC<OrderReviewProps> = ({
  cart,
  paymentMethod,
  onSubmit,
  onPrev,
  loading = false
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [order, setOrder] = useState<Order | null>(null)

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      const newOrder = await onSubmit()
      setOrder(newOrder)
    } catch (error) {
      console.error('Failed to submit order:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (order) {
    return (
      <div className="text-center space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Order Confirmed!</h2>
          <p className="text-green-700">
            Your order #{order.number} has been successfully placed and is currently <span className="font-semibold">{order.status || 'pending'}</span>.
          </p>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Order Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Order Number:</span>
              <span className="font-medium">{order.number}</span>
            </div>
            <div className="flex justify-between">
              <span>Total:</span>
              <span className="font-medium">${order.total}</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="capitalize font-medium">{order.status}</span>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-600 space-y-2">
          <p>A confirmation email has been sent to your email address.</p>
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <h4 className="font-medium text-blue-800 mb-1">What happens next?</h4>
            <ul className="text-blue-700 text-xs space-y-1">
              <li>• Your payment will be processed</li>
              <li>• You'll receive email updates on your order status</li>
              <li>• Shipping information will be provided once items are dispatched</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Review Your Order</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Billing Address</h4>
              {cart.billing && (
                <div className="text-sm text-gray-600">
                  <p>{cart.billing.first_name} {cart.billing.last_name}</p>
                  <p>{cart.billing.address1}</p>
                  {cart.billing.address2 && <p>{cart.billing.address2}</p>}
                  <p>{cart.billing.city}, {cart.billing.state} {cart.billing.zip}</p>
                  <p>{cart.billing.country}</p>
                  {cart.billing.phone && <p>{cart.billing.phone}</p>}
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Shipping Address</h4>
              {cart.shipping && (
                <div className="text-sm text-gray-600">
                  <p>{cart.shipping.first_name} {cart.shipping.last_name}</p>
                  <p>{cart.shipping.address1}</p>
                  {cart.shipping.address2 && <p>{cart.shipping.address2}</p>}
                  <p>{cart.shipping.city}, {cart.shipping.state} {cart.shipping.zip}</p>
                  <p>{cart.shipping.country}</p>
                  {cart.shipping.phone && <p>{cart.shipping.phone}</p>}
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Payment Method</h4>
              {paymentMethod && (
                <div className="text-sm text-gray-600">
                  <p className="capitalize">{paymentMethod.method}</p>
                  {paymentMethod.card && (
                    <p>**** **** **** {paymentMethod.card.last4}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <OrderSummary cart={cart} />
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onPrev}
          disabled={submitting}
          className="btn btn-secondary"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || loading}
          className="btn btn-primary"
        >
          {submitting ? 'Placing Order...' : 'Place Order'}
        </button>
      </div>
    </div>
  )
}

export default OrderReview