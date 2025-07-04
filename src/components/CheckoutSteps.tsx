import React from 'react'
import { CheckoutStep } from '@/types'

interface CheckoutStepsProps {
  steps: CheckoutStep[]
  onStepClick: (stepId: string) => void
}

const CheckoutSteps: React.FC<CheckoutStepsProps> = ({ steps, onStepClick }) => {
  return (
    <div className="flex items-center justify-between max-w-2xl mx-auto">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <button
              onClick={() => onStepClick(step.id)}
              className={`
                step-indicator
                ${step.active ? 'step-active' : ''}
                ${step.completed ? 'step-completed' : ''}
                ${!step.completed && !step.active ? 'step-pending' : ''}
                ${step.completed || step.active ? 'cursor-pointer hover:shadow-lg' : 'cursor-not-allowed'}
              `}
              disabled={!step.completed && !step.active}
            >
              {step.completed ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <span>{index + 1}</span>
              )}
            </button>
            
            <div className="mt-3 text-center">
              <p className={`
                text-sm font-medium transition-colors duration-200
                ${step.active ? 'text-blue-600' : step.completed ? 'text-green-600' : 'text-gray-500'}
              `}>
                {step.title}
              </p>
              {step.active && (
                <p className="text-xs text-gray-400 mt-1">Current Step</p>
              )}
              {step.completed && (
                <p className="text-xs text-green-500 mt-1">Completed</p>
              )}
            </div>
          </div>
          
          {index < steps.length - 1 && (
            <div className={`
              step-line
              ${step.completed ? 'step-line-completed' : 'step-line-pending'}
            `} />
          )}
        </div>
      ))}
    </div>
  )
}

export default CheckoutSteps