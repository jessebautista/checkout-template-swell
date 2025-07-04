import React from 'react'
import { Cart } from '@/types'

interface OrderSummaryProps {
  cart: Cart
  className?: string
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ cart, className = '' }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: cart.currency || 'USD'
    }).format(price)
  }

  return (
    <div className={`card ${className}`}>
      <div className="card-header">
        <h3 className="text-lg font-bold text-gray-900 flex items-center">
          <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          Order Summary
        </h3>
      </div>
      
      <div className="card-body">
        <div className="space-y-4">
          {cart.items?.map((item) => (
            <div key={item.id} className="flex justify-between items-start p-3 bg-gray-50/50 rounded-xl">
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-gray-900">{item.name}</h4>
                <div className="flex items-center mt-1 space-x-2">
                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                    Qty: {item.quantity}
                  </span>
                  {item.options && item.options.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.options.map((option) => (
                        <span key={option.id} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          {option.name}: {option.value}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right ml-4">
                <p className="font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                {item.quantity > 1 && (
                  <p className="text-xs text-gray-500">{formatPrice(item.price)} each</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100 space-y-3">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span className="font-medium">{formatPrice(cart.sub_total || 0)}</span>
          </div>
          
          {cart.shipping_total > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>Shipping</span>
              <span className="font-medium">{formatPrice(cart.shipping_total)}</span>
            </div>
          )}
          
          {cart.tax_total > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tax</span>
              <span className="font-medium">{formatPrice(cart.tax_total)}</span>
            </div>
          )}
          
          <div className="flex justify-between font-bold text-lg pt-3 border-t border-gray-200">
            <span className="text-gray-900">Total</span>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {formatPrice(cart.grand_total || 0)}
            </span>
          </div>
        </div>

        {cart.items && cart.items.length > 0 && (
          <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-200">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-green-800">
                {cart.items.length} item{cart.items.length > 1 ? 's' : ''} in your order
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderSummary