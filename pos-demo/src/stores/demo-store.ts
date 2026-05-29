import { create } from "zustand"
import { persist } from "zustand/middleware"
import { MOCK_PRODUCTS, MOCK_TERMINALS } from "@/data/mock"

export interface DemoSession {
  id: string
  posId: string
  status: "OPEN" | "CLOSED"
  initialAmount: number
  currentAmount: number
  createdAt: string
  pos: { name: string }
  user: { name: string }
  orders: DemoOrder[]
  _count: { orders: number }
}

export interface DemoOrderItem {
  id: string
  name: string
  price: number
  quantity: number
  qrCode: string | null
  corrected: boolean
  product: { id: string; trackingMode: string }
}

export interface DemoOrder {
  id: string
  orderNumber: string
  status: "COMPLETED" | "CANCELLED"
  total: number
  paymentMethod: string
  notes: string | null
  createdAt: string
  posCustomer: Record<string, string> | null
  items: DemoOrderItem[]
  productItems: Array<{ id: string; qrCode: string; status: string }>
}

function buildInitialStock() {
  const productItemStatus: Record<string, "AVAILABLE" | "USED"> = {}
  const lotStock: Record<string, number> = {}
  const productStock: Record<string, number> = {}

  for (const p of MOCK_PRODUCTS) {
    if (p.trackingMode === "BY_SERIAL" && p.productItems) {
      for (const pi of p.productItems) {
        productItemStatus[pi.id] = pi.status
      }
    } else if ((p.trackingMode === "BY_LOT") && p.lot) {
      lotStock[p.lot.id] = p.lot.availableQty
    } else if (p.trackingMode === "NONE") {
      productStock[p.id] = p.stock
    }
  }

  return { productItemStatus, lotStock, productStock }
}

interface DemoState {
  sessions: DemoSession[]
  orders: DemoOrder[]
  orderCounter: number

  productItemStatus: Record<string, "AVAILABLE" | "USED">
  lotStock: Record<string, number>
  productStock: Record<string, number>

  // Session actions
  createSession: (params: { posId: string; initialAmount: number; notes?: string }) => DemoSession
  getSession: (id: string) => DemoSession | undefined
  closeSession: (id: string, actualAmount: number) => void

  // Order actions
  createOrder: (params: {
    sessionId: string
    orderNumber: string
    total: number
    paymentMethod: string
    notes: string | null
    posCustomer?: Record<string, string> | null
    items: Array<{ productId: string; productItemId: string; qrCode: string; name: string; price: number }>
  }) => DemoOrder

  // Stock mutations
  consumeItem: (productItemId: string) => void
  consumeLotUnit: (lotId: string) => void
  decrementStock: (productId: string) => void

  // Stock read
  getAvailableItems: (productId: string) => Array<{ id: string; qrCode: string; isLot: boolean }>

  // Dynamic stock for products list
  getProductStock: (productId: string) => number
}

const initialStock = buildInitialStock()

export const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => ({
      sessions: [],
      orders: [],
      orderCounter: 0,
      ...initialStock,

      createSession: ({ posId, initialAmount, notes: _notes }) => {
        const terminal = MOCK_TERMINALS.find((t) => t.id === posId)
        const session: DemoSession = {
          id: crypto.randomUUID(),
          posId,
          status: "OPEN",
          initialAmount,
          currentAmount: initialAmount,
          createdAt: new Date().toISOString(),
          pos: { name: terminal?.name ?? "Terminal" },
          user: { name: "Demo Vendedor" },
          orders: [],
          _count: { orders: 0 },
        }
        set((s) => ({ sessions: [...s.sessions, session] }))
        return session
      },

      getSession: (id) => {
        const { sessions, orders } = get()
        const session = sessions.find((s) => s.id === id)
        if (!session) return undefined
        return {
          ...session,
          orders: orders.filter((o) => {
            const sess = sessions.find((s) => s.orders.some((so) => so.id === o.id))
            return sess?.id === id
          }),
          _count: { orders: orders.filter((o) => {
            const sess = sessions.find((s) => s.orders.some((so) => so.id === o.id))
            return sess?.id === id && o.status !== "CANCELLED"
          }).length },
        }
      },

      closeSession: (id, _actualAmount) => {
        set((s) => ({
          sessions: s.sessions.map((sess) =>
            sess.id === id ? { ...sess, status: "CLOSED" } : sess
          ),
        }))
      },

      createOrder: ({ sessionId, orderNumber, total, paymentMethod, notes, posCustomer, items }) => {
        const orderItems: DemoOrderItem[] = items.map((item, idx) => ({
          id: `oi-${Date.now()}-${idx}`,
          name: item.name,
          price: item.price,
          quantity: 1,
          qrCode: item.qrCode,
          corrected: false,
          product: {
            id: item.productId,
            trackingMode: MOCK_PRODUCTS.find((p) => p.id === item.productId)?.trackingMode ?? "NONE",
          },
        }))

        const order: DemoOrder = {
          id: crypto.randomUUID(),
          orderNumber,
          status: "COMPLETED",
          total,
          paymentMethod,
          notes,
          createdAt: new Date().toISOString(),
          posCustomer: posCustomer ?? null,
          items: orderItems,
          productItems: items
            .filter((item) => !item.qrCode.startsWith("LOT:"))
            .map((item) => ({ id: item.productItemId, qrCode: item.qrCode, status: "SOLD" })),
        }

        set((s) => ({
          orders: [...s.orders, order],
          orderCounter: s.orderCounter + 1,
          sessions: s.sessions.map((sess) =>
            sess.id === sessionId
              ? { ...sess, orders: [...sess.orders, order], _count: { orders: sess._count.orders + 1 } }
              : sess
          ),
        }))

        return order
      },

      consumeItem: (productItemId) => {
        set((s) => ({
          productItemStatus: { ...s.productItemStatus, [productItemId]: "USED" },
        }))
      },

      consumeLotUnit: (lotId) => {
        set((s) => ({
          lotStock: { ...s.lotStock, [lotId]: Math.max(0, (s.lotStock[lotId] ?? 0) - 1) },
        }))
      },

      decrementStock: (productId) => {
        set((s) => ({
          productStock: { ...s.productStock, [productId]: Math.max(0, (s.productStock[productId] ?? 0) - 1) },
        }))
      },

      getAvailableItems: (productId) => {
        const product = MOCK_PRODUCTS.find((p) => p.id === productId)
        if (!product) return []
        const { productItemStatus, lotStock } = get()

        if (product.trackingMode === "BY_SERIAL" && product.productItems) {
          return product.productItems
            .filter((pi) => (productItemStatus[pi.id] ?? pi.status) === "AVAILABLE")
            .map((pi) => ({ id: pi.id, qrCode: pi.qrCode, isLot: false }))
        }

        if (product.trackingMode === "BY_LOT" && product.lot) {
          const qty = lotStock[product.lot.id] ?? product.lot.availableQty
          if (qty <= 0) return []
          return [{ id: product.lot.id, qrCode: `LOT:${product.lot.id}`, isLot: true }]
        }

        return []
      },

      getProductStock: (productId) => {
        const product = MOCK_PRODUCTS.find((p) => p.id === productId)
        if (!product) return 0
        const { productItemStatus, lotStock, productStock } = get()

        if (product.trackingMode === "BY_SERIAL" && product.productItems) {
          return product.productItems.filter(
            (pi) => (productItemStatus[pi.id] ?? pi.status) === "AVAILABLE"
          ).length
        }

        if (product.trackingMode === "BY_LOT" && product.lot) {
          return lotStock[product.lot.id] ?? product.lot.availableQty
        }

        return productStock[productId] ?? product.stock
      },
    }),
    {
      name: "basictech-pos-demo",
      partialize: (state) => ({
        sessions: state.sessions,
        orders: state.orders,
        orderCounter: state.orderCounter,
        productItemStatus: state.productItemStatus,
        lotStock: state.lotStock,
        productStock: state.productStock,
      }),
    }
  )
)
