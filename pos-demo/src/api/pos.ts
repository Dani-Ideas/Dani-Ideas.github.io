import { MOCK_CATEGORIES, MOCK_PRODUCTS, MOCK_TERMINALS } from "@/data/mock"
import { useDemoStore } from "@/stores/demo-store"
import type { DemoSession, DemoOrder } from "@/stores/demo-store"

export type { DemoSession, DemoOrder }

// ── Terminals ──────────────────────────────────────────────────────────────────

export async function getTerminals() {
  return MOCK_TERMINALS
}

export async function toggleTerminal(_id: string) {
  // In demo mode terminals are always active
  return { ok: true }
}

// ── Sessions ───────────────────────────────────────────────────────────────────

export async function getSessions(): Promise<DemoSession[]> {
  return useDemoStore.getState().sessions.filter((s) => s.status === "OPEN")
}

export async function getSession(id: string) {
  const { getSession: get } = useDemoStore.getState()
  const session = get(id)
  if (!session) return null
  // Build full session with orders
  const allOrders = useDemoStore.getState().orders.filter((o) =>
    useDemoStore.getState().sessions.some(
      (s) => s.id === id && s.orders.some((so) => so.id === o.id)
    )
  )
  return { ...session, orders: allOrders }
}

export async function createSession(params: {
  posId: string
  initialAmount: number
  notes?: string
}): Promise<DemoSession & { posId: string; pos: { name: string; locationId: null } }> {
  const session = useDemoStore.getState().createSession(params)
  return {
    ...session,
    posId: params.posId,
    pos: { name: session.pos.name, locationId: null },
  }
}

export async function closeSession(id: string, actualAmount: number) {
  useDemoStore.getState().closeSession(id, actualAmount)
  return { ok: true }
}

// ── Products ───────────────────────────────────────────────────────────────────

export async function getProducts(params?: { search?: string; limit?: number; category?: string }) {
  const { getProductStock } = useDemoStore.getState()
  let products = MOCK_PRODUCTS

  if (params?.category && params.category !== "all") {
    products = products.filter((p) => p.category === params.category)
  }

  if (params?.search?.trim()) {
    const q = params.search.toLowerCase()
    products = products.filter((p) => p.name.toLowerCase().includes(q))
  }

  const withStock = products.map((p) => ({
    ...p,
    stock: getProductStock(p.id),
    brand: p.brand,
    category: p.category,
  }))

  const limited = params?.limit ? withStock.slice(0, params.limit) : withStock

  return { products: limited, total: limited.length }
}

export async function getCategories() {
  return MOCK_CATEGORIES
}

export async function getAvailableItems(productId: string) {
  return useDemoStore.getState().getAvailableItems(productId)
}

// ── Orders ─────────────────────────────────────────────────────────────────────

export async function createOrder(params: {
  cashSessionId: string
  items: Array<{ productId: string; productItemId: string; qrCode: string; name: string; price: number }>
  paymentMethod: string
  paymentAmount?: number
  paymentRef?: string
  posCustomer?: Record<string, string> | null
  splitPayment?: { method: string; amount: number; ref?: string }
}): Promise<{ id: string; orderNumber: string; total: number; sellerName: string; createdAt: string }> {
  const store = useDemoStore.getState()

  const session = store.sessions.find((s) => s.id === params.cashSessionId)
  if (!session || session.status !== "OPEN") {
    throw new Error("SESSION_NOT_OPEN")
  }

  // Consume stock
  for (const item of params.items) {
    if (item.qrCode.startsWith("LOT:")) {
      const lotId = item.qrCode.split(":")[1]
      store.consumeLotUnit(lotId)
    } else if (item.productItemId) {
      // Check if it's a NONE-type product by looking it up
      const product = MOCK_PRODUCTS.find((p) => p.id === item.productId)
      if (product?.trackingMode === "NONE") {
        store.decrementStock(item.productId)
      } else {
        store.consumeItem(item.productItemId)
      }
    }
  }

  const year = new Date().getFullYear()
  const counter = store.orderCounter + 1
  const orderNumber = `POS-${year}-${String(counter).padStart(4, "0")}`
  const total = params.items.reduce((sum, i) => sum + i.price, 0)

  const notes = params.splitPayment
    ? JSON.stringify({
        payment1: { method: params.paymentMethod, amount: params.paymentAmount ?? total },
        payment2: { method: params.splitPayment.method, amount: params.splitPayment.amount, ref: params.splitPayment.ref },
      })
    : null

  const order = store.createOrder({
    sessionId: params.cashSessionId,
    orderNumber,
    total,
    paymentMethod: params.paymentMethod,
    notes,
    posCustomer: params.posCustomer ?? null,
    items: params.items,
  })

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    total: order.total,
    sellerName: "Demo Vendedor",
    createdAt: order.createdAt,
  }
}

// ── Mercado Pago Point — demo-blocked ──────────────────────────────────────────

export async function createPaymentIntent() {
  return { error: "DEMO_BLOCKED", demo: true as const }
}
