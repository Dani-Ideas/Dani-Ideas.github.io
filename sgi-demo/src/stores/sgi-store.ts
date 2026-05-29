import { create } from "zustand"
import { persist } from "zustand/middleware"
import {
  MOCK_RECEPTIONS, MOCK_TRANSFERS, MOCK_PRODUCTS, MOCK_MOVEMENTS, MOCK_LOTS,
  type MockReception, type MockTransfer, type MockProduct, type MockStockMove, type MockLot,
} from "@/data/mock"

export interface Adjustment {
  productId: string
  productName: string
  diff: number
  counted: number
  previous: number
}

interface SGIState {
  receptions: MockReception[]
  transfers: MockTransfer[]
  products: MockProduct[]
  movements: MockStockMove[]
  lots: MockLot[]

  // Reception mutations
  approveReception: (id: string) => void
  completeReception: (id: string) => void
  cancelReception: (id: string) => void

  // Transfer mutations
  confirmTransfer: (id: string) => void

  // Inventory adjustment
  adjustInventory: (adjustments: Adjustment[]) => void
}

let moveCounter = MOCK_MOVEMENTS.length

export const useSGIStore = create<SGIState>()(
  persist(
    (set, get) => ({
      receptions: MOCK_RECEPTIONS,
      transfers: MOCK_TRANSFERS,
      products: MOCK_PRODUCTS,
      movements: [...MOCK_MOVEMENTS],
      lots: MOCK_LOTS,

      approveReception: (id) => {
        set((s) => ({
          receptions: s.receptions.map((r) =>
            r.id === id && r.status === "DRAFT"
              ? { ...r, status: "IN_PROGRESS", updatedAt: new Date().toISOString() }
              : r
          ),
        }))
      },

      completeReception: (id) => {
        const { receptions, products, movements } = get()
        const rec = receptions.find((r) => r.id === id)
        if (!rec || rec.status !== "IN_PROGRESS") return

        // Simplified: just increment stock for each line product
        const updatedProducts = products.map((p) => {
          const line = rec.lines.find((l) => l.product.id === p.id)
          if (!line) return p
          return { ...p, stock: p.stock + line.quantity }
        })

        // Add incoming stock moves
        const newMoves: MockStockMove[] = rec.lines.map((line) => ({
          id: `mv-auto-${++moveCounter}`,
          quantity: line.quantity,
          type: "INCOMING" as const,
          reference: `${rec.reference}-DONE`,
          notes: "Recepción completada (demo)",
          createdAt: new Date().toISOString(),
          product: { id: line.product.id, name: line.product.name },
          lot: line.lot ? { id: line.lot.id, lotNumber: line.lot.lotNumber } : null,
          fromLocation: null,
          toLocation: rec.destinationLocation,
        }))

        set({
          products: updatedProducts,
          movements: [...newMoves, ...movements],
          receptions: receptions.map((r) =>
            r.id === id ? { ...r, status: "DONE", updatedAt: new Date().toISOString() } : r
          ),
        })
      },

      cancelReception: (id) => {
        set((s) => ({
          receptions: s.receptions.map((r) =>
            r.id === id && r.status !== "DONE"
              ? { ...r, status: "CANCELLED", updatedAt: new Date().toISOString() }
              : r
          ),
        }))
      },

      confirmTransfer: (id) => {
        const { transfers, movements } = get()
        const tr = transfers.find((t) => t.id === id)
        if (!tr || tr.status !== "DRAFT") return

        const newMoves: MockStockMove[] = tr.lines.map((line) => ({
          id: `mv-auto-${++moveCounter}`,
          quantity: line.quantity,
          type: "TRANSFER" as const,
          reference: tr.reference,
          notes: "Traslado confirmado (demo)",
          createdAt: new Date().toISOString(),
          product: { id: line.product.id, name: line.product.name },
          lot: null,
          fromLocation: tr.sourceLocation,
          toLocation: tr.destinationLocation,
        }))

        set({
          movements: [...newMoves, ...movements],
          transfers: transfers.map((t) =>
            t.id === id ? { ...t, status: "DONE" } : t
          ),
        })
      },

      adjustInventory: (adjustments) => {
        const { products, movements } = get()

        const updatedProducts = products.map((p) => {
          const adj = adjustments.find((a) => a.productId === p.id)
          if (!adj) return p
          return { ...p, stock: adj.counted }
        })

        const newMoves: MockStockMove[] = adjustments.map((adj) => ({
          id: `mv-auto-${++moveCounter}`,
          quantity: adj.diff,
          type: "ADJUSTMENT" as const,
          reference: `INV-ADJ-${adj.productId.slice(-6).toUpperCase()}`,
          notes: `Ajuste inventario físico. Contado: ${adj.counted}, Sistema: ${adj.previous}`,
          createdAt: new Date().toISOString(),
          product: { id: adj.productId, name: adj.productName },
          lot: null,
          fromLocation: adj.diff < 0 ? { id: "wh-1-stock", name: "Almacén Central/Stock" } : null,
          toLocation: adj.diff > 0 ? { id: "wh-1-stock", name: "Almacén Central/Stock" } : null,
        }))

        set({
          products: updatedProducts,
          movements: [...newMoves, ...movements],
        })
      },
    }),
    {
      name: "basictech-sgi-demo",
      partialize: (s) => ({
        receptions: s.receptions,
        transfers: s.transfers,
        products: s.products,
        movements: s.movements,
        lots: s.lots,
      }),
    }
  )
)
