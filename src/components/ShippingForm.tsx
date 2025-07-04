import React, { useState, useEffect } from 'react'
import { ShippingAddress, BillingAddress } from '@/types'

interface ShippingFormProps {
  billingAddress?: BillingAddress
  initialData?: Partial<ShippingAddress>
  onSubmit: (data: ShippingAddress) => void
  onNext: () => void
  onPrev: () => void
  loading?: boolean
}

const ShippingForm: React.FC<ShippingFormProps> = ({
  billingAddress,
  initialData,
  onSubmit,
  onNext,
  onPrev,
  loading = false
}) => {
  const [sameAsBilling, setSameAsBilling] = useState(initialData?.same_as_billing || false)
  const [formData, setFormData] = useState<ShippingAddress>({
    first_name: initialData?.first_name || '',
    last_name: initialData?.last_name || '',
    address1: initialData?.address1 || '',
    address2: initialData?.address2 || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    zip: initialData?.zip || '',
    country: initialData?.country || 'US',
    phone: initialData?.phone || '',
    same_as_billing: sameAsBilling
  })

  // Update form data when initialData changes (cart loads)
  useEffect(() => {
    if (initialData && !sameAsBilling) {
      setFormData({
        first_name: initialData.first_name || '',
        last_name: initialData.last_name || '',
        address1: initialData.address1 || '',
        address2: initialData.address2 || '',
        city: initialData.city || '',
        state: initialData.state || '',
        zip: initialData.zip || '',
        country: initialData.country || 'US',
        phone: initialData.phone || '',
        same_as_billing: initialData.same_as_billing || false
      })
      setSameAsBilling(initialData.same_as_billing || false)
    }
  }, [initialData])

  useEffect(() => {
    if (sameAsBilling && billingAddress) {
      // Only copy allowed fields from billing address
      setFormData({
        first_name: billingAddress.first_name || '',
        last_name: billingAddress.last_name || '',
        address1: billingAddress.address1 || '',
        address2: billingAddress.address2 || '',
        city: billingAddress.city || '',
        state: billingAddress.state || '',
        zip: billingAddress.zip || '',
        country: billingAddress.country || 'US',
        phone: billingAddress.phone || '',
        same_as_billing: true
      })
    } else if (!sameAsBilling && !initialData) {
      // Only reset if we don't have initial data to preserve
      setFormData(prev => ({
        first_name: prev.first_name,
        last_name: prev.last_name,
        address1: prev.address1,
        address2: prev.address2,
        city: prev.city,
        state: prev.state,
        zip: prev.zip,
        country: prev.country,
        phone: prev.phone,
        same_as_billing: false
      }))
    }
  }, [sameAsBilling, billingAddress, initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSameAsBillingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSameAsBilling(e.target.checked)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await onSubmit(formData)
      onNext()
    } catch (error) {
      console.error('Failed to save shipping info:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center">
        <input
          type="checkbox"
          id="same_as_billing"
          checked={sameAsBilling}
          onChange={handleSameAsBillingChange}
          className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
        />
        <label htmlFor="same_as_billing" className="ml-2 text-sm text-gray-700">
          Same as billing address
        </label>
      </div>

      {!sameAsBilling && (
        <>
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
                className="form-input"
                required
              />
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
                className="form-input"
                required
              />
            </div>
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
              className="form-input"
              required
            />
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
                className="form-input"
                required
              />
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
                className="form-input"
                required
              />
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
                className="form-input"
                required
              />
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
        </>
      )}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="btn btn-secondary"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? 'Saving...' : 'Continue to Payment'}
        </button>
      </div>
    </form>
  )
}

export default ShippingForm