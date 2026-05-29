import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface POSCustomer {
  id?: string
  name?: string
  email?: string
  phone?: string
  socialMedia?: string
  address?: string
  notes?: string
  status?: "active" | "suspended"
}

export interface POSOrderItem {
  productId: string
  productItemId: string
  qrCode: string
  name: string
  price: number
  image: string
}

export interface POSOrder {
  id: string
  label: string
  items: POSOrderItem[]
  customer?: POSCustomer
  paymentMethod?: "CASH" | "TRANSFER" | "MERCADO_PAGO_POINT" | "CARD"
  paymentRef?: string
}

export interface POSSession {
  sessionId: string
  posId: string
  posName: string
  posLocationId: string | null
  openedAt: string
  initialAmount: number
}

const MAX_ORDERS = 5

interface POSStore {
  activeSession: POSSession | null
  orders: POSOrder[]
  activeOrderIndex: number

  setSession: (session: POSSession) => void
  refreshSession: (session: POSSession) => void
  clearSession: () => void

  addOrder: () => void
  removeOrder: (orderId: string) => void
  setActiveOrder: (index: number) => void

  addItemToOrder: (orderId: string, item: POSOrderItem) => boolean
  removeItemFromOrder: (orderId: string, qrCode: string) => void

  setCustomer: (orderId: string, customer: POSCustomer) => void
  setPaymentMethod: (orderId: string, method: POSOrder["paymentMethod"], ref?: string) => void

  getActiveOrder: () => POSOrder | null
  getOrderTotal: (orderId: string) => number
}

export const usePOSStore = create<POSStore>()(
  persist(
    (set, get) => ({
      activeSession: null,
      orders: [],
      activeOrderIndex: 0,

      setSession: (session) => {
        set({
          activeSession: session,
          orders: [{ id: crypto.randomUUID(), label: "Orden 1", items: [] }],
          activeOrderIndex: 0,
        })
      },

      refreshSession: (session) => {
        set((state) => ({
          activeSession: state.activeSession
            ? { ...state.activeSession, ...session }
            : session,
        }))
      },

      clearSession: () => {
        set({ activeSession: null, orders: [], activeOrderIndex: 0 })
      },

      addOrder: () => {
        const { orders } = get()
        if (orders.length >= MAX_ORDERS) return
        const newOrder: POSOrder = {
          id: crypto.randomUUID(),
          label: `Orden ${orders.length + 1}`,
          items: [],
        }
        set((state) => ({
          orders: [...state.orders, newOrder],
          activeOrderIndex: state.orders.length,
        }))
      },

      removeOrder: (orderId) => {
        const { orders, activeOrderIndex } = get()
        const index = orders.findIndex((o) => o.id === orderId)
        if (index === -1) return
        const newOrders = orders.filter((o) => o.id !== orderId)
        const newIndex = newOrders.length === 0 ? 0 : Math.min(activeOrderIndex, newOrders.length - 1)
        set({ orders: newOrders, activeOrderIndex: newIndex })
      },

      setActiveOrder: (index) => {
        set({ activeOrderIndex: index })
      },

      addItemToOrder: (orderId, item) => {
        const { orders } = get()
        const order = orders.find((o) => o.id === orderId)
        if (!order) return false
        if (order.items.some((i) => i.qrCode === item.qrCode)) return false
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, items: [...o.items, item] } : o
          ),
        }))
        return true
      },

      removeItemFromOrder: (orderId, qrCode) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? { ...o, items: o.items.filter((i) => i.qrCode !== qrCode) }
              : o
          ),
        }))
      },

      setCustomer: (orderId, customer) => {
        set((state) => ({
          orders: state.orders.map((o) => (o.id === orderId ? { ...o, customer } : o)),
        }))
      },

      setPaymentMethod: (orderId, method, ref) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, paymentMethod: method, paymentRef: ref } : o
          ),
        }))
      },

      getActiveOrder: () => {
        const { orders, activeOrderIndex } = get()
        return orders[activeOrderIndex] ?? null
      },

      getOrderTotal: (orderId) => {
        const { orders } = get()
        const order = orders.find((o) => o.id === orderId)
        if (!order) return 0
        return order.items.reduce((sum, item) => sum + item.price, 0)
      },
    }),
    { name: "basictech-pos" }
  )
)
