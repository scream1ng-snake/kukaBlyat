
export const confTypes = {
  redirect: "redirect",
  embedded: "embedded",
} as const
export type ConfType = typeof confTypes[keyof typeof confTypes]
export const loadStates = {
  INITIAL: "INITIAL",
  LOADING: "LOADING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
} as const
export type LoadState = typeof loadStates[keyof typeof loadStates]

export type PaymentResult = {
  id: string,
  status: string,
  amount: {
    value: string,
    currency: string
  },
  description: string, 
  recipient: {
    account_id: string,
    gateway_id: string
  },
  created_at: string,
  confirmation: {
    type: ConfType,
    confirmation_url: string,
    confirmation_token: string
  },
  test: boolean,
  paid: boolean,
  refundable: boolean,
  metadata: {}
}