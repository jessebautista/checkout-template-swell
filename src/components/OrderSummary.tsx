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
    <div className={`bg-gray-50 p-6 rounded-lg ${className}`}>
      <h3 className="text-lg font-medium mb-4">Order Summary</h3>
      
      <div className="space-y-3">
        {cart.items?.map((item) => (
          <div key={item.id} className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="font-medium text-sm">{item.name}</h4>
              <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
              {item.options && item.options.length > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  {item.options.map((option) => (
                    <div key={option.id}>
                      {option.name}: {option.value}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-4 mt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>{formatPrice(cart.sub_total || 0)}</span>
        </div>
        
        {cart.shipping_total > 0 && (
          <div className="flex justify-between text-sm">
            <span>Shipping</span>
            <span>{formatPrice(cart.shipping_total)}</span>
          </div>
        )}
        
        {cart.tax_total > 0 && (
          <div className="flex justify-between text-sm">
            <span>Tax</span>
            <span>{formatPrice(cart.tax_total)}</span>
          </div>
        )}
        
        <div className="flex justify-between font-bold text-lg border-t pt-2">
          <span>Total</span>
          <span>{formatPrice(cart.grand_total || 0)}</span>
        </div>
      </div>
    </div>
  )
}

export default OrderSummary