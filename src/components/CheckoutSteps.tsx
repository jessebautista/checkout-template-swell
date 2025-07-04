import React from 'react'
import { CheckoutStep } from '@/types'

interface CheckoutStepsProps {
  steps: CheckoutStep[]
  onStepClick: (stepId: string) => void
}

const CheckoutSteps: React.FC<CheckoutStepsProps> = ({ steps, onStepClick }) => {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <button
            onClick={() => onStepClick(step.id)}
            className={`
              flex items-center justify-center w-10 h-10 rounded-full border-2 font-medium
              ${step.active 
                ? 'bg-primary-600 text-white border-primary-600' 
                : step.completed 
                  ? 'bg-green-500 text-white border-green-500'
                  : 'bg-gray-200 text-gray-600 border-gray-300'
              }
              ${step.completed || step.active ? 'cursor-pointer' : 'cursor-not-allowed'}
            `}
            disabled={!step.completed && !step.active}
          >
            {step.completed ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <span>{index + 1}</span>
            )}
          </button>
          
          <span className={`ml-3 font-medium ${step.active ? 'text-primary-600' : 'text-gray-500'}`}>
            {step.title}
          </span>
          
          {index < steps.length - 1 && (
            <div className={`w-16 h-0.5 mx-4 ${step.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

export default CheckoutSteps