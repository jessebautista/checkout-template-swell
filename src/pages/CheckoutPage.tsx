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
  // Store customer email separately (can't be updated in cart billing)
  const [customerEmail, setCustomerEmail] = useState<string>('')
  const [orderComplete, setOrderComplete] = useState(false)
  const [completedOrder, setCompletedOrder] = useState<any>(null)
  
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

  // Set customer email when cart loads
  useEffect(() => {
    if (cart?.billing?.email && !customerEmail) {
      setCustomerEmail(cart.billing.email)
    }
  }, [cart, customerEmail])

  const handleCustomerInfoSubmit = async (data: BillingAddress) => {
    // Only send allowed billing fields, exclude restricted fields like email
    const allowedBillingFields = {
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
    
    // Store email separately for account creation during order submission
    setCustomerEmail(data.email)
    
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

  const handleOrderComplete = (order: any) => {
    setCompletedOrder(order)
    setOrderComplete(true)
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

  // Show loading state while cart is being initialized
  if (loading && !cart) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing checkout...</p>
        </div>
      </div>
    )
  }

  // Show cart empty state only if we have no cart after loading
  if (!loading && (!cart || !cart.items || cart.items.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
            <h2 className="text-lg font-medium text-yellow-800 mb-2">Setting up checkout</h2>
            <p className="text-yellow-600 mb-4">This checkout template requires a cart with items to demonstrate payment processing.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-primary"
            >
              Initialize Demo Cart
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Secure Checkout
            </h1>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>SSL Encrypted</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Progress Steps */}
        <div className="mb-12">
          <CheckoutSteps steps={steps} onStepClick={goToStep} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-3">
            <div className="card">
              <div className="card-body">
                {currentStep === 'customer' && (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">Contact Information</h2>
                    </div>
                    <CustomerInfoForm
                      initialData={cart.billing}
                      onSubmit={handleCustomerInfoSubmit}
                      onNext={nextStep}
                      loading={updating}
                    />
                  </div>
                )}

                {currentStep === 'shipping' && (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">Shipping Address</h2>
                    </div>
                    <ShippingForm
                      billingAddress={cart.billing}
                      initialData={cart.shipping}
                      onSubmit={handleShippingSubmit}
                      onNext={nextStep}
                      onPrev={prevStep}
                      loading={updating}
                    />
                  </div>
                )}

                {currentStep === 'payment' && (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
                    </div>
                    <PaymentForm
                      onOrderComplete={handleOrderComplete}
                      onPrev={prevStep}
                      loading={updating || submitting}
                    />
                  </div>
                )}

                {orderComplete && completedOrder && (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">Order Complete!</h2>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-green-800 mb-2">
                          Thank you for your order!
                        </h3>
                        <p className="text-green-700 mb-4">
                          Order #{completedOrder.number || completedOrder.id}
                        </p>
                        <div className="bg-white rounded-lg p-4 text-left">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600">Order ID:</span>
                            <span className="font-medium">{completedOrder.id}</span>
                          </div>
                          {completedOrder.number && (
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-gray-600">Order Number:</span>
                              <span className="font-medium">#{completedOrder.number}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600">Status:</span>
                            <span className="font-medium capitalize">{completedOrder.status || 'Pending'}</span>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600">Total:</span>
                            <span className="font-bold text-lg">${(completedOrder.grand_total || 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Payment Status:</span>
                            <span className={`font-medium ${
                              completedOrder.paid ? 'text-green-600' : 'text-yellow-600'
                            }`}>
                              {completedOrder.paid ? 'Paid' : 'Pending'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="xl:col-span-2">
            <div className="sticky top-24">
              <OrderSummary cart={cart} />
              
              {/* Trust Indicators */}
              <div className="mt-6 card">
                <div className="card-body">
                  <h3 className="font-semibold text-gray-900 mb-4">Secure Checkout</h3>
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span>SSL Encrypted Connection</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span>Secure Payment Processing</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span>Money Back Guarantee</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage