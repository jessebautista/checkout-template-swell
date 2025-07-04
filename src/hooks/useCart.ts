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

  const submitOrder = async () => {
    try {
      setSubmitting(true)
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