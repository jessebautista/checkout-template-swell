import { useState, useEffect } from 'react'
import swell from '@/lib/swell'
import { Cart } from '@/types'

export const useCart = () => {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
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
      setLoading(true)
      const updatedCart = await swell.cart.update(updates)
      setCart(updatedCart)
      setError(null)
      return updatedCart
    } catch (err) {
      setError('Failed to update cart')
      console.error('Cart update error:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const submitOrder = async () => {
    try {
      setLoading(true)
      const order = await swell.cart.submitOrder()
      setError(null)
      return order
    } catch (err) {
      setError('Failed to submit order')
      console.error('Order submit error:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCart()
  }, [])

  return {
    cart,
    loading,
    error,
    fetchCart,
    loadCartByCheckoutId,
    updateCart,
    submitOrder
  }
}