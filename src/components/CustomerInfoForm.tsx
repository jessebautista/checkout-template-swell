import React, { useState, useEffect } from 'react'
import { BillingAddress, ValidationError } from '@/types'

interface CustomerInfoFormProps {
  initialData?: Partial<BillingAddress>
  onSubmit: (data: BillingAddress) => void
  onNext: () => void
  loading?: boolean
}

const CustomerInfoForm: React.FC<CustomerInfoFormProps> = ({
  initialData,
  onSubmit,
  onNext,
  loading = false
}) => {
  const [formData, setFormData] = useState<BillingAddress>({
    first_name: initialData?.first_name || '',
    last_name: initialData?.last_name || '',
    email: initialData?.email || '',
    address1: initialData?.address1 || '',
    address2: initialData?.address2 || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    zip: initialData?.zip || '',
    country: initialData?.country || 'US',
    phone: initialData?.phone || ''
  })

  const [errors, setErrors] = useState<ValidationError[]>([])

  // Update form data when initialData changes (cart loads)
  useEffect(() => {
    if (initialData) {
      setFormData({
        first_name: initialData.first_name || '',
        last_name: initialData.last_name || '',
        email: initialData.email || '',
        address1: initialData.address1 || '',
        address2: initialData.address2 || '',
        city: initialData.city || '',
        state: initialData.state || '',
        zip: initialData.zip || '',
        country: initialData.country || 'US',
        phone: initialData.phone || ''
      })
    }
  }, [initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    setErrors(prev => prev.filter(error => error.field !== name))
  }

  const validateForm = (): boolean => {
    const newErrors: ValidationError[] = []

    if (!formData.first_name.trim()) {
      newErrors.push({ field: 'first_name', message: 'First name is required' })
    }
    if (!formData.last_name.trim()) {
      newErrors.push({ field: 'last_name', message: 'Last name is required' })
    }
    if (!formData.email.trim()) {
      newErrors.push({ field: 'email', message: 'Email is required' })
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.push({ field: 'email', message: 'Email is invalid' })
    }
    if (!formData.address1.trim()) {
      newErrors.push({ field: 'address1', message: 'Address is required' })
    }
    if (!formData.city.trim()) {
      newErrors.push({ field: 'city', message: 'City is required' })
    }
    if (!formData.state.trim()) {
      newErrors.push({ field: 'state', message: 'State is required' })
    }
    if (!formData.zip.trim()) {
      newErrors.push({ field: 'zip', message: 'ZIP code is required' })
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      await onSubmit(formData)
      onNext()
    } catch (error) {
      console.error('Failed to save customer info:', error)
    }
  }

  const getFieldError = (fieldName: string) => {
    return errors.find(error => error.field === fieldName)?.message
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="first_name" className="form-label">
            First Name *
          </label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            className={`form-input ${getFieldError('first_name') ? 'border-red-500' : ''}`}
            required
          />
          {getFieldError('first_name') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('first_name')}</p>
          )}
        </div>

        <div>
          <label htmlFor="last_name" className="form-label">
            Last Name *
          </label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            className={`form-input ${getFieldError('last_name') ? 'border-red-500' : ''}`}
            required
          />
          {getFieldError('last_name') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('last_name')}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="email" className="form-label">
          Email Address *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`form-input ${getFieldError('email') ? 'border-red-500' : ''}`}
          required
        />
        {getFieldError('email') && (
          <p className="mt-1 text-sm text-red-600">{getFieldError('email')}</p>
        )}
      </div>

      <div>
        <label htmlFor="address1" className="form-label">
          Address *
        </label>
        <input
          type="text"
          id="address1"
          name="address1"
          value={formData.address1}
          onChange={handleChange}
          className={`form-input ${getFieldError('address1') ? 'border-red-500' : ''}`}
          required
        />
        {getFieldError('address1') && (
          <p className="mt-1 text-sm text-red-600">{getFieldError('address1')}</p>
        )}
      </div>

      <div>
        <label htmlFor="address2" className="form-label">
          Address Line 2
        </label>
        <input
          type="text"
          id="address2"
          name="address2"
          value={formData.address2}
          onChange={handleChange}
          className="form-input"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="city" className="form-label">
            City *
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className={`form-input ${getFieldError('city') ? 'border-red-500' : ''}`}
            required
          />
          {getFieldError('city') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('city')}</p>
          )}
        </div>

        <div>
          <label htmlFor="state" className="form-label">
            State *
          </label>
          <input
            type="text"
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className={`form-input ${getFieldError('state') ? 'border-red-500' : ''}`}
            required
          />
          {getFieldError('state') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('state')}</p>
          )}
        </div>

        <div>
          <label htmlFor="zip" className="form-label">
            ZIP Code *
          </label>
          <input
            type="text"
            id="zip"
            name="zip"
            value={formData.zip}
            onChange={handleChange}
            className={`form-input ${getFieldError('zip') ? 'border-red-500' : ''}`}
            required
          />
          {getFieldError('zip') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('zip')}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="form-label">
          Phone Number
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="form-input"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? 'Saving...' : 'Continue to Shipping'}
        </button>
      </div>
    </form>
  )
}

export default CustomerInfoForm