import { useState, useEffect } from 'react'
import swell from '@/lib/swell'
import { Cart } from '@/types'

export const useCart = () => {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCart = async () => {
    try {
      setLoading(true)
      const currentCart = await swell.cart.get()
      setCart(currentCart)
      setError(null)
    } catch (err) {
      setError('Failed to fetch cart')
      console.error('Cart fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadCartByCheckoutId = async (checkoutId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      // First try to set the cart by checkout ID
      const cartData = await swell.cart.recover(checkoutId)
      if (cartData) {
        setCart(cartData)
      } else {
        // If recover doesn't work, try to get cart and set checkout ID
        const currentCart = await swell.cart.get()
        if (currentCart) {
          setCart(currentCart)
        } else {
          throw new Error('No cart found')
        }
      }
    } catch (err) {
      setError('Failed to load checkout')
      console.error('Checkout load error:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateCart = async (updates: Partial<Cart>) => {
    try {
      setUpdating(true)
      const updatedCart = await swell.cart.update(updates)
      setCart(updatedCart)
      setError(null)
      return updatedCart
    } catch (err) {
      setError('Failed to update cart')
      console.error('Cart update error:', err)
      throw err
    } finally {
      setUpdating(false)
    }
  }

  const createGuestAccount = async (email: string, firstName?: string, lastName?: string) => {
    try {
      console.log('Attempting to create guest account with:', { email, firstName, lastName })
      
      const guestAccount = await swell.account.create({
        email: email,
        first_name: firstName,
        last_name: lastName,
        email_optin: false
        // No password = guest account
      })
      
      if (guestAccount) {
        console.log('Guest account created successfully:', {
          id: guestAccount.id,
          email: guestAccount.email,
          guest: guestAccount.guest
        })
      } else {
        console.log('Guest account creation returned null/undefined')
      }
      
      return guestAccount
    } catch (error: any) {
      console.error('Failed to create guest account:', error)
      
      // If account already exists, try to login/retrieve it
      if (error.code === 'duplicate_email' || error.message?.includes('already exists')) {
        console.log('Account already exists, attempting to retrieve...')
        try {
          // Try to get the current account
          const existingAccount = await swell.account.get()
          if (existingAccount) {
            console.log('Retrieved existing account:', existingAccount.id)
            return existingAccount
          }
        } catch (getError) {
          console.error('Failed to retrieve existing account:', getError)
        }
      }
      
      // Return null instead of throwing to allow order submission to continue
      return null
    }
  }

  const submitOrder = async (customerEmail?: string) => {
    try {
      setSubmitting(true)
      
      // Get current cart to check account status
      const currentCart = await swell.cart.get()
      console.log('Current cart before order submission:', {
        id: currentCart?.id,
        account_id: currentCart?.account_id,
        items: currentCart?.items?.length,
        billing: !!currentCart?.billing,
        shipping: !!currentCart?.shipping,
        email: customerEmail || currentCart?.billing?.email
      })
      
      // Create guest account if needed
      const emailToUse = customerEmail || currentCart?.billing?.email
      if (emailToUse && !currentCart?.account_id) {
        console.log('Creating guest account for:', emailToUse)
        
        const guestAccount = await createGuestAccount(
          emailToUse,
          currentCart?.billing?.first_name,
          currentCart?.billing?.last_name
        )
        
        if (guestAccount) {
          console.log('Account created, now associating with cart...')
          
          // Try to explicitly associate account with cart
          try {
            await swell.cart.update({
              account_id: guestAccount.id
            })
            console.log('Successfully associated account with cart')
          } catch (updateError) {
            console.error('Failed to associate account with cart:', updateError)
            // Continue anyway, the association might happen automatically
          }
        }
        
        // Refresh cart to get the account_id
        const refreshedCart = await swell.cart.get()
        console.log('Cart after account creation and association:', {
          id: refreshedCart?.id,
          account_id: refreshedCart?.account_id,
          account_logged_in: !!refreshedCart?.account_id
        })
        setCart(refreshedCart)
        
        // If still no account_id, there might be a bigger issue
        if (!refreshedCart?.account_id) {
          console.error('Cart still has no account_id after account creation')
          // Let's try one more time to get the account
          const currentAccount = await swell.account.get()
          console.log('Current account status:', currentAccount)
        }
      }
      
      console.log('Final cart check before order submission:')
      const finalCart = await swell.cart.get()
      console.log({
        cart_id: finalCart?.id,
        account_id: finalCart?.account_id,
        has_items: finalCart?.items?.length > 0,
        has_billing: !!finalCart?.billing,
        has_shipping: !!finalCart?.shipping
      })
      
      console.log('Submitting order...')
      const order = await swell.cart.submitOrder()
      setError(null)
      
      // Log order status for debugging
      console.log('Order submitted successfully:', {
        id: order.id,
        number: order.number,
        status: order.status,
        total: order.total,
        paid: order.paid,
        payment_balance: order.payment_balance
      })
      
      return order
    } catch (err: any) {
      // Enhanced error handling based on order lifecycle
      let errorMessage = 'Failed to submit order'
      
      if (err.code === 'validation_error') {
        errorMessage = `Order validation failed: ${err.message}`
      } else if (err.code === 'payment_error') {
        errorMessage = 'Payment processing failed. Please check your payment details.'
      } else if (err.code === 'inventory_error') {
        errorMessage = 'Some items are no longer available. Please review your cart.'
      }
      
      setError(errorMessage)
      console.error('Order submit error:', err)
      throw err
    } finally {
      setSubmitting(false)
    }
  }

  // Don't auto-fetch cart on mount - let the component decide
  // useEffect(() => {
  //   fetchCart()
  // }, [])

  return {
    cart,
    loading,
    updating,
    submitting,
    error,
    fetchCart,
    loadCartByCheckoutId,
    updateCart,
    submitOrder
  }
}