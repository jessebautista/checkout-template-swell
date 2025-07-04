import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
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
  const { checkoutId } = useParams<{ checkoutId: string }>()
  const [searchParams] = useSearchParams()
  
  // Get checkout ID from URL params or query string
  const finalCheckoutId = checkoutId || searchParams.get('checkout_id') || searchParams.get('id')
  
  // Store payment method selection locally
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentInfo | null>(null)
  
  const { cart, loading, updating, submitting, error: cartError, updateCart, submitOrder, loadCartByCheckoutId, fetchCart } = useCart()
  const { steps, currentStep, goToStep, nextStep, prevStep } = useCheckoutSteps(cart)

  // Load cart when component mounts
  useEffect(() => {
    if (finalCheckoutId) {
      // If we have a checkout ID, load that specific cart
      loadCartByCheckoutId(finalCheckoutId)
    } else {
      // Otherwise, load the current cart
      fetchCart()
    }
  }, [finalCheckoutId]) // Remove dependencies to prevent infinite loops

  const handleCustomerInfoSubmit = async (data: BillingAddress) => {
    // Only send allowed billing fields, exclude restricted fields
    const allowedBillingFields = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      address1: data.address1,
      address2: data.address2,
      city: data.city,
      state: data.state,
      zip: data.zip,
      country: data.country,
      phone: data.phone
    }
    
    await updateCart({ billing: allowedBillingFields })
  }

  const handleShippingSubmit = async (data: ShippingAddress) => {
    // Only send allowed shipping fields, exclude restricted fields like account_card_id
    const allowedShippingFields = {
      first_name: data.first_name,
      last_name: data.last_name,
      address1: data.address1,
      address2: data.address2,
      city: data.city,
      state: data.state,
      zip: data.zip,
      country: data.country,
      phone: data.phone
    }
    
    await updateCart({ shipping: allowedShippingFields })
  }

  const handlePaymentSubmit = async (data: PaymentInfo) => {
    // Store payment method locally for display in review
    setSelectedPaymentMethod(data)
    
    // Update cart with billing method and optional metadata
    // Following Swell's recommended pattern for custom payments
    const updateData: any = { 
      billing: {
        first_name: cart?.billing?.first_name,
        last_name: cart?.billing?.last_name,
        email: cart?.billing?.email,
        address1: cart?.billing?.address1,
        address2: cart?.billing?.address2,
        city: cart?.billing?.city,
        state: cart?.billing?.state,
        zip: cart?.billing?.zip,
        country: cart?.billing?.country,
        phone: cart?.billing?.phone,
        method: data.method
      }
    }
    
    // Add custom metadata if needed for payment processing
    if (data.method === 'custom' || data.method === 'stripe') {
      updateData.metadata = {
        ...cart?.metadata,
        payment_method_details: {
          type: data.method,
          gateway: data.gateway || data.method
        }
      }
    }
    
    await updateCart(updateData)
  }

  const handleOrderSubmit = async () => {
    return await submitOrder()
  }

  if (loading && !cart) {
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
                  loading={updating}
                />
              )}

              {currentStep === 'shipping' && (
                <ShippingForm
                  billingAddress={cart.billing}
                  initialData={cart.shipping}
                  onSubmit={handleShippingSubmit}
                  onNext={nextStep}
                  onPrev={prevStep}
                  loading={updating}
                />
              )}

              {currentStep === 'payment' && (
                <PaymentForm
                  onSubmit={handlePaymentSubmit}
                  onNext={nextStep}
                  onPrev={prevStep}
                  loading={updating}
                />
              )}

              {currentStep === 'review' && (
                <OrderReview
                  cart={cart}
                  paymentMethod={selectedPaymentMethod}
                  onSubmit={handleOrderSubmit}
                  onPrev={prevStep}
                  loading={submitting}
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