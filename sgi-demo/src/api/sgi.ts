import { useSGIStore } from "@/stores/sgi-store"
import { MOCK_LOCATIONS, MOCK_FLAT_LOCATIONS, MOCK_PRODUCTS, MOCK_REORDERING_RULES } from "@/data/mock"
import type { Adjustment } from "@/stores/sgi-store"

const delay = () => new Promise((r) => setTimeout(r, 80))

// ── Warehouses / Locations ─────────────────────────────────────────────────

export async function getWarehouses() {
  await delay()
  return MOCK_LOCATIONS
}

export async function getFlatLocations() {
  await delay()
  return MOCK_FLAT_LOCATIONS
}

// ── Products ───────────────────────────────────────────────────────────────

export async function getProducts() {
  await delay()
  const store = useSGIStore.getState()
  return store.products.map((p) => ({
    ...p,
    category: { name: p.category },
    brand: { name: p.brand },
  }))
}

// ── Existencias (stock by location) ────────────────────────────────────────

export async function getExistencias(locationId?: string) {
  await delay()
  const store = useSGIStore.getState()

  return store.products.map((p) => {
    let locationStock: number | null = null

    if (locationId) {
      if (p.trackingMode === "BY_SERIAL" && p.productItems) {
        locationStock = p.productItems.filter(
          (pi) => pi.status === "AVAILABLE" && pi.locationId === locationId
        ).length
      } else if ((p.trackingMode === "BY_LOT" || p.trackingMode === "BY_EXPIRY") && p.lots) {
        locationStock = p.lots
          .filter((l) => l.locationId === locationId)
          .reduce((sum, l) => sum + l.availableQty, 0)
      } else {
        locationStock = p.stock
      }
    }

    return {
      id: p.id,
      name: p.name,
      stock: p.stock,
      locationStock,
      minStock: p.minStock,
      trackingMode: p.trackingMode,
      category: { name: p.category },
      brand: { name: p.brand },
    }
  })
}

// ── Receptions ─────────────────────────────────────────────────────────────

export async function getReceptions() {
  await delay()
  return useSGIStore.getState().receptions
}

export async function getReception(id: string) {
  await delay()
  return useSGIStore.getState().receptions.find((r) => r.id === id) ?? null
}

export async function approveReception(id: string) {
  await delay()
  useSGIStore.getState().approveReception(id)
  return { ok: true }
}

export async function completeReception(id: string) {
  await delay()
  useSGIStore.getState().completeReception(id)
  return { ok: true }
}

export async function cancelReception(id: string) {
  await delay()
  useSGIStore.getState().cancelReception(id)
  return { ok: true }
}

// ── Transfers ──────────────────────────────────────────────────────────────

export async function getTransfers() {
  await delay()
  return useSGIStore.getState().transfers
}

export async function confirmTransfer(id: string) {
  await delay()
  useSGIStore.getState().confirmTransfer(id)
  return { ok: true }
}

// ── Deliveries ─────────────────────────────────────────────────────────────

export async function getDeliveries() {
  await delay()
  const { MOCK_DELIVERIES } = await import("@/data/mock")
  return MOCK_DELIVERIES
}

// ── Movements (Kardex) ─────────────────────────────────────────────────────

export async function getMovements(params: { page: number; limit: number; reference?: string }) {
  await delay()
  const { page, limit, reference } = params
  let moves = useSGIStore.getState().movements

  if (reference?.trim()) {
    const q = reference.toLowerCase()
    moves = moves.filter((m) => m.reference?.toLowerCase().includes(q))
  }

  const total = moves.length
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const start = (page - 1) * limit
  const data = moves.slice(start, start + limit)

  return {
    data,
    meta: { total, page, limit, totalPages },
  }
}

// ── Dashboard ──────────────────────────────────────────────────────────────

export async function getDashboardData() {
  await delay()
  const moves = useSGIStore.getState().movements
  const lots = useSGIStore.getState().lots

  function buildWeekChart(items: Array<{ createdAt: string; type?: string }>, typeFilter?: string) {
    const buckets = Array(7).fill(0)
    const now = Date.now()
    let total = 0
    for (const m of items) {
      if (typeFilter && (m as { type?: string }).type !== typeFilter) continue
      const diff = (now - new Date(m.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      if (diff >= 0 && diff < 7) { buckets[6 - Math.min(6, Math.floor(diff))]++; total++ }
    }
    return { chart: buckets, total }
  }

  const receptionData = buildWeekChart(lots)
  const deliveryData = buildWeekChart(moves, "OUTGOING")
  const adjustmentData = buildWeekChart(moves, "ADJUSTMENT")

  return {
    receptions: lots.length,
    receptionChart: receptionData.chart,
    deliveries: deliveryData.total,
    deliveryChart: deliveryData.chart,
    adjustments: adjustmentData.total,
    adjustmentChart: adjustmentData.chart,
  }
}

// ── Lots ───────────────────────────────────────────────────────────────────

export async function getLots(params?: { expiringSoon?: boolean }) {
  await delay()
  let lots = useSGIStore.getState().lots
  const products = useSGIStore.getState().products

  const withProduct = lots.map((lot) => {
    const p = products.find((pr) => pr.id === lot.productId)
    return {
      ...lot,
      product: {
        id: p?.id ?? lot.productId,
        name: p?.name ?? lot.productId,
        trackingMode: p?.trackingMode ?? "BY_LOT",
        removalStrategy: lot.removalStrategy,
      },
    }
  })

  if (params?.expiringSoon) {
    const cutoff = Date.now() + 30 * 24 * 60 * 60 * 1000
    return withProduct.filter((l) => l.expiryDate && new Date(l.expiryDate).getTime() <= cutoff)
  }

  return withProduct
}

// ── Alerts ─────────────────────────────────────────────────────────────────

export async function getLowStockAlerts() {
  await delay()
  return useSGIStore.getState().products
    .filter((p) => p.minStock !== null && p.stock <= p.minStock)
    .map((p) => ({
      id: p.id,
      name: p.name,
      stock: p.stock,
      minStock: p.minStock!,
      images: p.images,
      trackingMode: p.trackingMode,
    }))
}

// ── Reordering rules ───────────────────────────────────────────────────────

export async function getReorderingRules(params?: { triggered?: boolean }) {
  await delay()
  const store = useSGIStore.getState()
  const rules = MOCK_REORDERING_RULES.map((rule) => {
    const p = store.products.find((pr) => pr.id === rule.product.id)
    return { ...rule, product: { ...rule.product, stock: p?.stock ?? rule.product.stock } }
  })

  if (params?.triggered) {
    return rules.filter((r) => r.product.stock <= r.minQty)
  }

  return rules
}

// ── QR Search ──────────────────────────────────────────────────────────────

export async function searchQR(code: string) {
  await delay()
  const store = useSGIStore.getState()
  const products = store.products

  for (const p of products) {
    if (p.productItems) {
      const pi = p.productItems.find((i) => i.qrCode === code)
      if (pi) {
        const loc = MOCK_FLAT_LOCATIONS.find((l) => l.id === pi.locationId)
        return {
          id: pi.id,
          qrCode: pi.qrCode,
          status: pi.status,
          product: { name: p.name, price: p.price, images: p.images },
          location: loc ? { name: loc.name } : null,
          lot: null,
        }
      }
    }

    if (p.lots) {
      for (const lot of p.lots) {
        if (lot.lotNumber === code || `LOT:${lot.id}` === code) {
          const loc = MOCK_FLAT_LOCATIONS.find((l) => l.id === lot.locationId)
          return {
            id: lot.id,
            qrCode: lot.lotNumber,
            status: lot.availableQty > 0 ? "AVAILABLE" : "EXPIRED",
            product: { name: p.name, price: p.price, images: p.images },
            location: loc ? { name: loc.name } : null,
            lot: { lotNumber: lot.lotNumber },
          }
        }
      }
    }
  }

  return null
}

// ── Inventory adjustment ───────────────────────────────────────────────────

export async function adjustInventory(adjustments: Adjustment[]) {
  await delay()
  useSGIStore.getState().adjustInventory(adjustments)
  return { ok: true }
}

// Re-export mock data for easy access
export { MOCK_PRODUCTS, MOCK_FLAT_LOCATIONS }
