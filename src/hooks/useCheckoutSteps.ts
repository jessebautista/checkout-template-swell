import { useState, useEffect } from 'react'
import { CheckoutStep, Cart } from '@/types'

const initialSteps: CheckoutStep[] = [
  { id: 'customer', title: 'Customer Info', completed: false, active: true },
  { id: 'shipping', title: 'Shipping', completed: false, active: false },
  { id: 'payment', title: 'Payment', completed: false, active: false },
  { id: 'review', title: 'Review', completed: false, active: false }
]

export const useCheckoutSteps = (cart: Cart | null) => {
  const [steps, setSteps] = useState<CheckoutStep[]>(initialSteps)
  const [currentStep, setCurrentStep] = useState('customer')

  const goToStep = (stepId: string) => {
    setCurrentStep(stepId)
    setSteps(steps => steps.map(step => ({
      ...step,
      active: step.id === stepId
    })))
  }

  const completeStep = (stepId: string) => {
    setSteps(steps => steps.map(step => 
      step.id === stepId ? { ...step, completed: true } : step
    ))
  }

  const nextStep = () => {
    const currentIndex = steps.findIndex(step => step.active)
    const nextIndex = currentIndex + 1
    
    if (nextIndex < steps.length) {
      completeStep(steps[currentIndex].id)
      goToStep(steps[nextIndex].id)
    }
  }

  const prevStep = () => {
    const currentIndex = steps.findIndex(step => step.active)
    const prevIndex = currentIndex - 1
    
    if (prevIndex >= 0) {
      goToStep(steps[prevIndex].id)
    }
  }

  useEffect(() => {
    if (cart) {
      const hasCustomerInfo = cart.billing?.first_name && cart.billing?.last_name
      const hasShipping = cart.shipping?.address1
      const hasPayment = cart.payment?.method
      
      setSteps(steps => steps.map(step => ({
        ...step,
        completed: 
          (step.id === 'customer' && hasCustomerInfo) ||
          (step.id === 'shipping' && hasShipping) ||
          (step.id === 'payment' && hasPayment) ||
          step.completed
      })))
    }
  }, [cart])

  return {
    steps,
    currentStep,
    goToStep,
    completeStep,
    nextStep,
    prevStep
  }
}