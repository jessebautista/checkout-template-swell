export interface CartItem {
  id: string
  product_id: string
  quantity: number
  price: number
  name: string
  image?: string
  variant_id?: string
  options?: Array<{
    id: string
    name: string
    value: string
  }>
}

export interface Cart {
  id: string
  items: CartItem[]
  item_quantity: number
  sub_total: number
  tax_total: number
  shipping_total: number
  grand_total: number
  currency: string
  billing?: BillingAddress
  shipping?: ShippingAddress
  payment?: PaymentInfo
}

export interface BillingAddress {
  first_name: string
  last_name: string
  address1: string
  address2?: string
  city: string
  state: string
  zip: string
  country: string
  phone?: string
}

export interface ShippingAddress extends BillingAddress {
  same_as_billing?: boolean
}

export interface PaymentInfo {
  method: string
  card?: {
    token: string
    last4: string
    exp_month: number
    exp_year: number
    brand: string
  }
  gateway?: string
  intent?: {
    stripe?: {
      id: string
    }
  }
}

export interface Order {
  id: string
  number: string
  status: string
  total: number
  items: CartItem[]
  billing: BillingAddress
  shipping: ShippingAddress
  payment: PaymentInfo
  created_at: string
}

export interface CheckoutStep {
  id: string
  title: string
  completed: boolean
  active: boolean
}

export interface ValidationError {
  field: string
  message: string
}