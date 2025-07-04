import React from 'react'
import { useCart } from '@/hooks/useCart'
import { useCheckoutSteps } from '@/hooks/useCheckoutSteps'
import CheckoutSteps from '@/components/CheckoutSteps'
import CustomerInfoForm from '@/components/CustomerInfoForm'
import ShippingForm from '@/components/ShippingForm'
import PaymentForm from '@/components/PaymentForm'
import OrderReview from '@/components/OrderReview'
import OrderSummary from '@/components/OrderSummary'
import { BillingAddress, ShippingAddress, PaymentInfo } from '@/types'

const CheckoutPage: React.FC = () => {
  const { cart, loading: cartLoading, error: cartError, updateCart, submitOrder } = useCart()
  const { steps, currentStep, goToStep, nextStep, prevStep } = useCheckoutSteps(cart)

  const handleCustomerInfoSubmit = async (data: BillingAddress) => {
    await updateCart({ billing: data })
  }

  const handleShippingSubmit = async (data: ShippingAddress) => {
    await updateCart({ shipping: data })
  }

  const handlePaymentSubmit = async (data: PaymentInfo) => {
    await updateCart({ 
      billing: { ...cart?.billing, method: data.method },
      payment: data 
    })
  }

  const handleOrderSubmit = async () => {
    return await submitOrder()
  }

  if (cartLoading && !cart) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    )
  }

  if (cartError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <h2 className="text-lg font-medium text-red-800 mb-2">Error Loading Checkout</h2>
            <p className="text-red-600">{cartError}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
            <h2 className="text-lg font-medium text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-600">Add some items to your cart to proceed with checkout.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">Checkout</h1>
          <CheckoutSteps steps={steps} onStepClick={goToStep} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              {currentStep === 'customer' && (
                <CustomerInfoForm
                  initialData={cart.billing}
                  onSubmit={handleCustomerInfoSubmit}
                  onNext={nextStep}
                  loading={cartLoading}
                />
              )}

              {currentStep === 'shipping' && (
                <ShippingForm
                  billingAddress={cart.billing}
                  initialData={cart.shipping}
                  onSubmit={handleShippingSubmit}
                  onNext={nextStep}
                  onPrev={prevStep}
                  loading={cartLoading}
                />
              )}

              {currentStep === 'payment' && (
                <PaymentForm
                  onSubmit={handlePaymentSubmit}
                  onNext={nextStep}
                  onPrev={prevStep}
                  loading={cartLoading}
                />
              )}

              {currentStep === 'review' && (
                <OrderReview
                  cart={cart}
                  onSubmit={handleOrderSubmit}
                  onPrev={prevStep}
                  loading={cartLoading}
                />
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <OrderSummary cart={cart} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage