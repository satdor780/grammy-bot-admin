export const PRODUCT_TYPE = {
  MAIL: 'mail',
  FULL: 'full',
} as const

export type ProductType =
  typeof PRODUCT_TYPE[keyof typeof PRODUCT_TYPE]

export interface MailProduct {
  _id: string
  type: 'mail'
  price: number
  data: {
    mail: string
    firstName: string
    lastName: string
    age: number
  }
  createdAt: string
}

export interface FullProduct {
  _id: string
  type: 'full'
  price: number
  data: {
    fullName: string
    address: string
    city: string
    state: string
    zipCode: string
    creditScore: number
  }
  createdAt: string
}

export type Product = MailProduct | FullProduct
