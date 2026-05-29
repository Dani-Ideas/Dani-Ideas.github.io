// ──────────────────────────────────────────────────────────────────────────────
// Static mock data for the SGI demo. Nothing here is mutated directly —
// all mutable state lives in sgi-store.ts.
// ──────────────────────────────────────────────────────────────────────────────

export type TrackingMode = "BY_SERIAL" | "BY_LOT" | "BY_EXPIRY" | "NONE"
export type ItemStatus = "AVAILABLE" | "IN_PROCESS" | "RESERVED" | "SOLD" | "EXPIRED" | "DAMAGED"

export interface MockProductItem {
  id: string
  qrCode: string
  status: ItemStatus
  locationId: string | null
}

export interface MockLot {
  id: string
  lotNumber: string
  quantity: number
  availableQty: number
  expiryDate: string | null
  createdAt: string
  productId: string
  locationId: string | null
  removalStrategy: string
}

export interface MockProduct {
  id: string
  name: string
  slug: string
  brand: string
  category: string
  price: number
  stock: number
  minStock: number | null
  images: string[]
  isActive: boolean
  trackingMode: TrackingMode
  productItems?: MockProductItem[]
  lots?: MockLot[]
}

export interface MockLocation {
  id: string
  name: string
  shortCode: string | null
  type: string
  parentId: string | null
  inboundSteps: number
  outboundSteps: number
  isActive: boolean
  isScrap: boolean
  returnLocation: boolean
  children: Array<{ id: string; name: string; shortCode: string | null; type: string }>
}

export interface MockReceptionLine {
  id: string
  quantity: number
  lotNumber: string | null
  expiryDate: string | null
  notes: string | null
  product: { id: string; name: string; trackingMode: TrackingMode; removalStrategy: string; category: { name: string }; brand: { name: string }; price: string }
  lot: null | { id: string; lotNumber: string; quantity: number; availableQty: number; productItems: Array<{ id: string; qrCode: string; status: string }> }
}

export interface MockReception {
  id: string
  reference: string
  status: "DRAFT" | "IN_PROGRESS" | "DONE" | "CANCELLED"
  notes: string | null
  createdAt: string
  updatedAt: string
  destinationLocation: { id: string; name: string } | null
  lines: MockReceptionLine[]
}

export interface MockTransfer {
  id: string
  reference: string
  status: "DRAFT" | "DONE" | "CANCELLED"
  notes: string | null
  createdAt: string
  sourceLocation: { id: string; name: string } | null
  destinationLocation: { id: string; name: string } | null
  lines: Array<{ id: string; quantity: number; product: { id: string; name: string } }>
}

export interface MockDelivery {
  id: string
  reference: string
  status: "DRAFT" | "DONE" | "CANCELLED"
  shippingPolicy: "ASAP" | "ALL_AT_ONCE"
  notes: string | null
  createdAt: string
  sourceLocation: { id: string; name: string } | null
  destinationLocation: { id: string; name: string } | null
  lines: Array<{ id: string; quantity: number; doneQty: number; product: { id: string; name: string } }>
}

export interface MockStockMove {
  id: string
  quantity: number
  type: "INCOMING" | "OUTGOING" | "ADJUSTMENT" | "TRANSFER"
  reference: string | null
  notes: string | null
  createdAt: string
  product: { id: string; name: string }
  lot: { id: string; lotNumber: string } | null
  fromLocation: { id: string; name: string } | null
  toLocation: { id: string; name: string } | null
}

export interface MockReorderingRule {
  id: string
  minQty: number
  maxQty: number
  isActive: boolean
  product: { id: string; name: string; stock: number }
  location: { id: string; name: string; shortCode: string | null }
}

// ── Helper to build a date N days ago ──────────────────────────────────────
function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

function daysFromNow(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString()
}

// ── LOCATIONS ──────────────────────────────────────────────────────────────

export const MOCK_LOCATIONS: MockLocation[] = [
  {
    id: "wh-1", name: "Almacén Central", shortCode: "CENTRAL", type: "INTERNAL",
    parentId: null, inboundSteps: 3, outboundSteps: 2, isActive: true, isScrap: false, returnLocation: false,
    children: [
      { id: "wh-1-input", name: "Almacén Central/Entrada", shortCode: "INPUT", type: "INTERNAL" },
      { id: "wh-1-qc", name: "Almacén Central/Calidad", shortCode: "QC", type: "INTERNAL" },
      { id: "wh-1-stock", name: "Almacén Central/Stock", shortCode: "STOCK", type: "INTERNAL" },
      { id: "wh-1-output", name: "Almacén Central/Salida", shortCode: "OUTPUT", type: "INTERNAL" },
      { id: "wh-1-scrap", name: "Almacén Central/Descarte", shortCode: "SCRAP", type: "INTERNAL" },
      { id: "wh-1-returns", name: "Almacén Central/Devoluciones", shortCode: "RETURNS", type: "INTERNAL" },
    ],
  },
  {
    id: "wh-2", name: "Tienda Lima", shortCode: "LIMA", type: "INTERNAL",
    parentId: null, inboundSteps: 1, outboundSteps: 1, isActive: true, isScrap: false, returnLocation: false,
    children: [
      { id: "wh-2-stock", name: "Tienda Lima/Stock", shortCode: "STOCK", type: "INTERNAL" },
      { id: "wh-2-scrap", name: "Tienda Lima/Descarte", shortCode: "SCRAP", type: "INTERNAL" },
      { id: "wh-2-returns", name: "Tienda Lima/Devoluciones", shortCode: "RETURNS", type: "INTERNAL" },
    ],
  },
  {
    id: "wh-3", name: "Depósito Norte", shortCode: "NORTE", type: "INTERNAL",
    parentId: null, inboundSteps: 2, outboundSteps: 1, isActive: true, isScrap: false, returnLocation: false,
    children: [
      { id: "wh-3-input", name: "Depósito Norte/Entrada", shortCode: "INPUT", type: "INTERNAL" },
      { id: "wh-3-stock", name: "Depósito Norte/Stock", shortCode: "STOCK", type: "INTERNAL" },
      { id: "wh-3-scrap", name: "Depósito Norte/Descarte", shortCode: "SCRAP", type: "INTERNAL" },
      { id: "wh-3-returns", name: "Depósito Norte/Devoluciones", shortCode: "RETURNS", type: "INTERNAL" },
    ],
  },
]

export const MOCK_FLAT_LOCATIONS = MOCK_LOCATIONS.flatMap((wh) => [
  { id: wh.id, name: wh.name, shortCode: wh.shortCode, type: wh.type, parentId: wh.parentId },
  ...wh.children.map((c) => ({ id: c.id, name: c.name, shortCode: c.shortCode, type: c.type, parentId: wh.id })),
])

// ── PRODUCTS ──────────────────────────────────────────────────────────────

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: "prod-1", name: "Laptop HP ProBook 450 G9", slug: "laptop-hp-probook", brand: "HP",
    category: "Laptops", price: 2499, stock: 3, minStock: 2,
    images: ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=300&fit=crop"],
    isActive: true, trackingMode: "BY_SERIAL",
    productItems: [
      { id: "pi-1-1", qrCode: "HP-PRB-001", status: "AVAILABLE", locationId: "wh-1-stock" },
      { id: "pi-1-2", qrCode: "HP-PRB-002", status: "AVAILABLE", locationId: "wh-1-stock" },
      { id: "pi-1-3", qrCode: "HP-PRB-003", status: "IN_PROCESS", locationId: "wh-1-input" },
    ],
  },
  {
    id: "prod-2", name: "Monitor LG UltraWide 29\"", slug: "monitor-lg-uw29", brand: "LG",
    category: "Monitores", price: 1299, stock: 4, minStock: 3,
    images: ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&h=300&fit=crop"],
    isActive: true, trackingMode: "BY_SERIAL",
    productItems: [
      { id: "pi-2-1", qrCode: "LG-UW29-001", status: "AVAILABLE", locationId: "wh-1-stock" },
      { id: "pi-2-2", qrCode: "LG-UW29-002", status: "AVAILABLE", locationId: "wh-1-stock" },
      { id: "pi-2-3", qrCode: "LG-UW29-003", status: "AVAILABLE", locationId: "wh-2-stock" },
      { id: "pi-2-4", qrCode: "LG-UW29-004", status: "AVAILABLE", locationId: "wh-2-stock" },
    ],
  },
  {
    id: "prod-3", name: "Teclado Mecánico Redragon K552", slug: "teclado-redragon-k552", brand: "Redragon",
    category: "Teclados", price: 189, stock: 10, minStock: 5,
    images: ["https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=300&h=300&fit=crop"],
    isActive: true, trackingMode: "BY_LOT",
    lots: [
      { id: "lot-3-1", lotNumber: "RD-K552-A1", quantity: 10, availableQty: 6, expiryDate: null, createdAt: daysAgo(30), productId: "prod-3", locationId: "wh-1-stock", removalStrategy: "FIFO" },
      { id: "lot-3-2", lotNumber: "RD-K552-B2", quantity: 8, availableQty: 4, expiryDate: null, createdAt: daysAgo(10), productId: "prod-3", locationId: "wh-2-stock", removalStrategy: "FIFO" },
    ],
  },
  {
    id: "prod-4", name: "Mouse Logitech G203", slug: "mouse-logitech-g203", brand: "Logitech",
    category: "Ratones", price: 129, stock: 15, minStock: 8,
    images: ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop"],
    isActive: true, trackingMode: "BY_LOT",
    lots: [
      { id: "lot-4-1", lotNumber: "LG-G203-X1", quantity: 20, availableQty: 10, expiryDate: null, createdAt: daysAgo(45), productId: "prod-4", locationId: "wh-1-stock", removalStrategy: "FIFO" },
      { id: "lot-4-2", lotNumber: "LG-G203-X2", quantity: 10, availableQty: 5, expiryDate: null, createdAt: daysAgo(15), productId: "prod-4", locationId: "wh-3-stock", removalStrategy: "FIFO" },
    ],
  },
  {
    id: "prod-5", name: "Audífonos Sony WH-CH510", slug: "audifonos-sony-wh", brand: "Sony",
    category: "Audio", price: 189, stock: 8, minStock: 3,
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop"],
    isActive: true, trackingMode: "BY_EXPIRY",
    lots: [
      { id: "lot-5-1", lotNumber: "SONY-WH-E1", quantity: 5, availableQty: 3, expiryDate: daysFromNow(5), createdAt: daysAgo(60), productId: "prod-5", locationId: "wh-1-stock", removalStrategy: "FEFO" },
      { id: "lot-5-2", lotNumber: "SONY-WH-E2", quantity: 8, availableQty: 5, expiryDate: daysFromNow(25), createdAt: daysAgo(20), productId: "prod-5", locationId: "wh-1-stock", removalStrategy: "FEFO" },
      { id: "lot-5-3", lotNumber: "SONY-WH-E3", quantity: 4, availableQty: 0, expiryDate: daysAgo(3), createdAt: daysAgo(90), productId: "prod-5", locationId: "wh-1-stock", removalStrategy: "FEFO" },
    ],
  },
  {
    id: "prod-6", name: "Cable HDMI 2.0 2m", slug: "cable-hdmi-2m", brand: "Generic",
    category: "Accesorios", price: 29.90, stock: 20, minStock: 10,
    images: ["https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=300&h=300&fit=crop"],
    isActive: true, trackingMode: "NONE",
  },
  {
    id: "prod-7", name: "Hub USB-C 7-en-1", slug: "hub-usbc-7en1", brand: "Aukey",
    category: "Accesorios", price: 99.90, stock: 1, minStock: 5,
    images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop"],
    isActive: true, trackingMode: "NONE",
  },
  {
    id: "prod-8", name: "Pad Mouse XL RGB", slug: "pad-mouse-xl", brand: "Redragon",
    category: "Accesorios", price: 59.90, stock: 0, minStock: 5,
    images: ["https://images.unsplash.com/photo-1593642632632-2ed66e64a2ee?w=300&h=300&fit=crop"],
    isActive: true, trackingMode: "NONE",
  },
]

// ── RECEPTIONS ────────────────────────────────────────────────────────────

export const MOCK_RECEPTIONS: MockReception[] = [
  {
    id: "rec-1", reference: "REC-20260101-001", status: "DRAFT",
    notes: "Pedido urgente HP", createdAt: daysAgo(2), updatedAt: daysAgo(2),
    destinationLocation: { id: "wh-1-stock", name: "Almacén Central/Stock" },
    lines: [
      {
        id: "rl-1-1", quantity: 3, lotNumber: null, expiryDate: null, notes: null, lot: null,
        product: { id: "prod-1", name: "Laptop HP ProBook 450 G9", trackingMode: "BY_SERIAL", removalStrategy: "FIFO", category: { name: "Laptops" }, brand: { name: "HP" }, price: "2499.00" },
      },
      {
        id: "rl-1-2", quantity: 5, lotNumber: null, expiryDate: null, notes: null, lot: null,
        product: { id: "prod-2", name: "Monitor LG UltraWide 29\"", trackingMode: "BY_SERIAL", removalStrategy: "FIFO", category: { name: "Monitores" }, brand: { name: "LG" }, price: "1299.00" },
      },
    ],
  },
  {
    id: "rec-2", reference: "REC-20260103-002", status: "DRAFT",
    notes: null, createdAt: daysAgo(1), updatedAt: daysAgo(1),
    destinationLocation: { id: "wh-2-stock", name: "Tienda Lima/Stock" },
    lines: [
      {
        id: "rl-2-1", quantity: 20, lotNumber: null, expiryDate: null, notes: null, lot: null,
        product: { id: "prod-6", name: "Cable HDMI 2.0 2m", trackingMode: "NONE", removalStrategy: "FIFO", category: { name: "Accesorios" }, brand: { name: "Generic" }, price: "29.90" },
      },
    ],
  },
  {
    id: "rec-3", reference: "REC-20260110-003", status: "IN_PROGRESS",
    notes: "Lote Redragon batch Q1", createdAt: daysAgo(5), updatedAt: daysAgo(3),
    destinationLocation: { id: "wh-1-stock", name: "Almacén Central/Stock" },
    lines: [
      {
        id: "rl-3-1", quantity: 12, lotNumber: "RD-K552-C3", expiryDate: null, notes: null,
        product: { id: "prod-3", name: "Teclado Mecánico Redragon K552", trackingMode: "BY_LOT", removalStrategy: "FIFO", category: { name: "Teclados" }, brand: { name: "Redragon" }, price: "189.00" },
        lot: { id: "lot-3-3", lotNumber: "RD-K552-C3", quantity: 12, availableQty: 12, productItems: [] },
      },
    ],
  },
  {
    id: "rec-4", reference: "REC-20260112-004", status: "IN_PROGRESS",
    notes: null, createdAt: daysAgo(4), updatedAt: daysAgo(2),
    destinationLocation: { id: "wh-3-stock", name: "Depósito Norte/Stock" },
    lines: [
      {
        id: "rl-4-1", quantity: 10, lotNumber: "LG-G203-Y3", expiryDate: null, notes: null,
        product: { id: "prod-4", name: "Mouse Logitech G203", trackingMode: "BY_LOT", removalStrategy: "FIFO", category: { name: "Ratones" }, brand: { name: "Logitech" }, price: "129.00" },
        lot: { id: "lot-4-3", lotNumber: "LG-G203-Y3", quantity: 10, availableQty: 10, productItems: [] },
      },
    ],
  },
  {
    id: "rec-5", reference: "REC-20260115-005", status: "DONE",
    notes: null, createdAt: daysAgo(10), updatedAt: daysAgo(8),
    destinationLocation: { id: "wh-1-stock", name: "Almacén Central/Stock" },
    lines: [
      {
        id: "rl-5-1", quantity: 8, lotNumber: "SONY-WH-E2", expiryDate: daysFromNow(25), notes: null,
        product: { id: "prod-5", name: "Audífonos Sony WH-CH510", trackingMode: "BY_EXPIRY", removalStrategy: "FEFO", category: { name: "Audio" }, brand: { name: "Sony" }, price: "189.00" },
        lot: { id: "lot-5-2", lotNumber: "SONY-WH-E2", quantity: 8, availableQty: 5, productItems: [] },
      },
    ],
  },
  {
    id: "rec-6", reference: "REC-20260118-006", status: "DONE",
    notes: "Reposición urgente monitores", createdAt: daysAgo(15), updatedAt: daysAgo(14),
    destinationLocation: { id: "wh-1-stock", name: "Almacén Central/Stock" },
    lines: [
      {
        id: "rl-6-1", quantity: 2, lotNumber: null, expiryDate: null, notes: null,
        product: { id: "prod-1", name: "Laptop HP ProBook 450 G9", trackingMode: "BY_SERIAL", removalStrategy: "FIFO", category: { name: "Laptops" }, brand: { name: "HP" }, price: "2499.00" },
        lot: null,
      },
    ],
  },
]

// ── TRANSFERS (INTERNO) ────────────────────────────────────────────────────

export const MOCK_TRANSFERS: MockTransfer[] = [
  {
    id: "tr-1", reference: "ROUTE-REC-20260110-003-S1", status: "DRAFT",
    notes: "Traslado automático INPUT → QC", createdAt: daysAgo(3),
    sourceLocation: { id: "wh-1-input", name: "Almacén Central/Entrada" },
    destinationLocation: { id: "wh-1-qc", name: "Almacén Central/Calidad" },
    lines: [{ id: "tl-1-1", quantity: 12, product: { id: "prod-3", name: "Teclado Mecánico Redragon K552" } }],
  },
  {
    id: "tr-2", reference: "OUTBOUND-POS-2026-0042-S1", status: "DRAFT",
    notes: "Despacho POS Lima", createdAt: daysAgo(1),
    sourceLocation: { id: "wh-2-stock", name: "Tienda Lima/Stock" },
    destinationLocation: { id: "wh-2-stock", name: "Tienda Lima/Salida" },
    lines: [{ id: "tl-2-1", quantity: 2, product: { id: "prod-3", name: "Teclado Mecánico Redragon K552" } }],
  },
  {
    id: "tr-3", reference: "INT-20260120-001", status: "DONE",
    notes: "Reposición a tienda Lima", createdAt: daysAgo(7),
    sourceLocation: { id: "wh-1-stock", name: "Almacén Central/Stock" },
    destinationLocation: { id: "wh-2-stock", name: "Tienda Lima/Stock" },
    lines: [
      { id: "tl-3-1", quantity: 5, product: { id: "prod-6", name: "Cable HDMI 2.0 2m" } },
      { id: "tl-3-2", quantity: 3, product: { id: "prod-4", name: "Mouse Logitech G203" } },
    ],
  },
  {
    id: "tr-4", reference: "INT-20260118-002", status: "CANCELLED",
    notes: null, createdAt: daysAgo(12),
    sourceLocation: { id: "wh-3-stock", name: "Depósito Norte/Stock" },
    destinationLocation: { id: "wh-1-stock", name: "Almacén Central/Stock" },
    lines: [{ id: "tl-4-1", quantity: 10, product: { id: "prod-4", name: "Mouse Logitech G203" } }],
  },
]

// ── DELIVERIES (SALIDAS) ────────────────────────────────────────────────────

export const MOCK_DELIVERIES: MockDelivery[] = [
  {
    id: "dlv-1", reference: "DLV-20260125-001", status: "DONE",
    shippingPolicy: "ASAP", notes: null, createdAt: daysAgo(5),
    sourceLocation: { id: "wh-1-stock", name: "Almacén Central/Stock" },
    destinationLocation: null,
    lines: [
      { id: "dl-1-1", quantity: 2, doneQty: 2, product: { id: "prod-1", name: "Laptop HP ProBook 450 G9" } },
      { id: "dl-1-2", quantity: 1, doneQty: 1, product: { id: "prod-2", name: "Monitor LG UltraWide 29\"" } },
    ],
  },
  {
    id: "dlv-2", reference: "DLV-20260126-002", status: "DRAFT",
    shippingPolicy: "ALL_AT_ONCE", notes: "Pedido corporativo", createdAt: daysAgo(1),
    sourceLocation: { id: "wh-1-stock", name: "Almacén Central/Stock" },
    destinationLocation: null,
    lines: [
      { id: "dl-2-1", quantity: 5, doneQty: 0, product: { id: "prod-6", name: "Cable HDMI 2.0 2m" } },
      { id: "dl-2-2", quantity: 3, doneQty: 0, product: { id: "prod-4", name: "Mouse Logitech G203" } },
    ],
  },
  {
    id: "dlv-3", reference: "DLV-20260120-003", status: "DONE",
    shippingPolicy: "ASAP", notes: null, createdAt: daysAgo(10),
    sourceLocation: { id: "wh-2-stock", name: "Tienda Lima/Stock" },
    destinationLocation: null,
    lines: [
      { id: "dl-3-1", quantity: 4, doneQty: 4, product: { id: "prod-3", name: "Teclado Mecánico Redragon K552" } },
    ],
  },
]

// ── LOTS (flattened) ────────────────────────────────────────────────────────

export const MOCK_LOTS: MockLot[] = MOCK_PRODUCTS.flatMap((p) => p.lots ?? [])

// ── MOVEMENTS (30 entries) ──────────────────────────────────────────────────

export const MOCK_MOVEMENTS: MockStockMove[] = [
  // Receptions
  { id: "mv-1", quantity: 3, type: "INCOMING", reference: "REC-20260115-005-L1", notes: null, createdAt: daysAgo(10), product: { id: "prod-5", name: "Audífonos Sony WH-CH510" }, lot: { id: "lot-5-2", lotNumber: "SONY-WH-E2" }, fromLocation: null, toLocation: { id: "wh-1-stock", name: "Almacén Central/Stock" } },
  { id: "mv-2", quantity: 2, type: "INCOMING", reference: "REC-20260118-006-L1", notes: null, createdAt: daysAgo(15), product: { id: "prod-1", name: "Laptop HP ProBook 450 G9" }, lot: null, fromLocation: null, toLocation: { id: "wh-1-stock", name: "Almacén Central/Stock" } },
  { id: "mv-3", quantity: 10, type: "INCOMING", reference: "REC-20260110-003-L1", notes: null, createdAt: daysAgo(5), product: { id: "prod-3", name: "Teclado Mecánico Redragon K552" }, lot: { id: "lot-3-1", lotNumber: "RD-K552-A1" }, fromLocation: null, toLocation: { id: "wh-1-stock", name: "Almacén Central/Stock" } },
  { id: "mv-4", quantity: 8, type: "INCOMING", reference: "REC-20260110-003-L2", notes: null, createdAt: daysAgo(5), product: { id: "prod-3", name: "Teclado Mecánico Redragon K552" }, lot: { id: "lot-3-2", lotNumber: "RD-K552-B2" }, fromLocation: null, toLocation: { id: "wh-2-stock", name: "Tienda Lima/Stock" } },
  { id: "mv-5", quantity: 20, type: "INCOMING", reference: "REC-20260112-004-L1", notes: null, createdAt: daysAgo(20), product: { id: "prod-4", name: "Mouse Logitech G203" }, lot: { id: "lot-4-1", lotNumber: "LG-G203-X1" }, fromLocation: null, toLocation: { id: "wh-1-stock", name: "Almacén Central/Stock" } },
  { id: "mv-6", quantity: 10, type: "INCOMING", reference: "REC-20260112-004-L2", notes: null, createdAt: daysAgo(15), product: { id: "prod-4", name: "Mouse Logitech G203" }, lot: { id: "lot-4-2", lotNumber: "LG-G203-X2" }, fromLocation: null, toLocation: { id: "wh-3-stock", name: "Depósito Norte/Stock" } },
  { id: "mv-7", quantity: 30, type: "INCOMING", reference: "REC-20260101-001-L1", notes: null, createdAt: daysAgo(25), product: { id: "prod-6", name: "Cable HDMI 2.0 2m" }, lot: null, fromLocation: null, toLocation: { id: "wh-1-stock", name: "Almacén Central/Stock" } },
  { id: "mv-8", quantity: 10, type: "INCOMING", reference: "REC-20260101-001-L2", notes: null, createdAt: daysAgo(25), product: { id: "prod-7", name: "Hub USB-C 7-en-1" }, lot: null, fromLocation: null, toLocation: { id: "wh-1-stock", name: "Almacén Central/Stock" } },
  { id: "mv-9", quantity: 15, type: "INCOMING", reference: "REC-20260101-001-L3", notes: null, createdAt: daysAgo(25), product: { id: "prod-8", name: "Pad Mouse XL RGB" }, lot: null, fromLocation: null, toLocation: { id: "wh-1-stock", name: "Almacén Central/Stock" } },
  { id: "mv-10", quantity: 4, type: "INCOMING", reference: "REC-20260118-006-L2", notes: null, createdAt: daysAgo(14), product: { id: "prod-2", name: "Monitor LG UltraWide 29\"" }, lot: null, fromLocation: null, toLocation: { id: "wh-1-stock", name: "Almacén Central/Stock" } },
  // Outgoing / sales
  { id: "mv-11", quantity: -2, type: "OUTGOING", reference: "DLV-20260125-001", notes: null, createdAt: daysAgo(5), product: { id: "prod-1", name: "Laptop HP ProBook 450 G9" }, lot: null, fromLocation: { id: "wh-1-stock", name: "Almacén Central/Stock" }, toLocation: null },
  { id: "mv-12", quantity: -1, type: "OUTGOING", reference: "DLV-20260125-001", notes: null, createdAt: daysAgo(5), product: { id: "prod-2", name: "Monitor LG UltraWide 29\"" }, lot: null, fromLocation: { id: "wh-1-stock", name: "Almacén Central/Stock" }, toLocation: null },
  { id: "mv-13", quantity: -4, type: "OUTGOING", reference: "DLV-20260120-003", notes: null, createdAt: daysAgo(10), product: { id: "prod-3", name: "Teclado Mecánico Redragon K552" }, lot: { id: "lot-3-1", lotNumber: "RD-K552-A1" }, fromLocation: { id: "wh-2-stock", name: "Tienda Lima/Stock" }, toLocation: null },
  { id: "mv-14", quantity: -5, type: "OUTGOING", reference: "POS-2026-0015", notes: null, createdAt: daysAgo(8), product: { id: "prod-4", name: "Mouse Logitech G203" }, lot: { id: "lot-4-1", lotNumber: "LG-G203-X1" }, fromLocation: { id: "wh-1-stock", name: "Almacén Central/Stock" }, toLocation: null },
  { id: "mv-15", quantity: -3, type: "OUTGOING", reference: "POS-2026-0022", notes: null, createdAt: daysAgo(6), product: { id: "prod-6", name: "Cable HDMI 2.0 2m" }, lot: null, fromLocation: { id: "wh-1-stock", name: "Almacén Central/Stock" }, toLocation: null },
  { id: "mv-16", quantity: -9, type: "OUTGOING", reference: "POS-2026-0031", notes: null, createdAt: daysAgo(3), product: { id: "prod-7", name: "Hub USB-C 7-en-1" }, lot: null, fromLocation: { id: "wh-1-stock", name: "Almacén Central/Stock" }, toLocation: null },
  { id: "mv-17", quantity: -15, type: "OUTGOING", reference: "POS-2026-0038", notes: null, createdAt: daysAgo(2), product: { id: "prod-8", name: "Pad Mouse XL RGB" }, lot: null, fromLocation: { id: "wh-1-stock", name: "Almacén Central/Stock" }, toLocation: null },
  // Transfers
  { id: "mv-18", quantity: 5, type: "TRANSFER", reference: "INT-20260120-001", notes: null, createdAt: daysAgo(7), product: { id: "prod-6", name: "Cable HDMI 2.0 2m" }, lot: null, fromLocation: { id: "wh-1-stock", name: "Almacén Central/Stock" }, toLocation: { id: "wh-2-stock", name: "Tienda Lima/Stock" } },
  { id: "mv-19", quantity: 3, type: "TRANSFER", reference: "INT-20260120-001", notes: null, createdAt: daysAgo(7), product: { id: "prod-4", name: "Mouse Logitech G203" }, lot: { id: "lot-4-2", lotNumber: "LG-G203-X2" }, fromLocation: { id: "wh-1-stock", name: "Almacén Central/Stock" }, toLocation: { id: "wh-2-stock", name: "Tienda Lima/Stock" } },
  { id: "mv-20", quantity: 2, type: "TRANSFER", reference: "ROUTE-REC-20260110-003-S1", notes: "Paso 1: Input → QC", createdAt: daysAgo(4), product: { id: "prod-3", name: "Teclado Mecánico Redragon K552" }, lot: { id: "lot-3-3", lotNumber: "RD-K552-C3" }, fromLocation: { id: "wh-1-input", name: "Almacén Central/Entrada" }, toLocation: { id: "wh-1-qc", name: "Almacén Central/Calidad" } },
  // Adjustments
  { id: "mv-21", quantity: -2, type: "ADJUSTMENT", reference: "INV-ADJ-000001", notes: "Ajuste inventario físico. Contado: 18, Sistema: 20", createdAt: daysAgo(12), product: { id: "prod-6", name: "Cable HDMI 2.0 2m" }, lot: null, fromLocation: { id: "wh-1-stock", name: "Almacén Central/Stock" }, toLocation: null },
  { id: "mv-22", quantity: 1, type: "ADJUSTMENT", reference: "INV-ADJ-000002", notes: "Hallazgo en conteo físico", createdAt: daysAgo(11), product: { id: "prod-4", name: "Mouse Logitech G203" }, lot: { id: "lot-4-1", lotNumber: "LG-G203-X1" }, fromLocation: null, toLocation: { id: "wh-1-stock", name: "Almacén Central/Stock" } },
  { id: "mv-23", quantity: -1, type: "ADJUSTMENT", reference: "INV-ADJ-000003", notes: "Unidad dañada en transporte", createdAt: daysAgo(9), product: { id: "prod-5", name: "Audífonos Sony WH-CH510" }, lot: { id: "lot-5-1", lotNumber: "SONY-WH-E1" }, fromLocation: { id: "wh-1-stock", name: "Almacén Central/Stock" }, toLocation: null },
  { id: "mv-24", quantity: -3, type: "ADJUSTMENT", reference: "INV-ADJ-000004", notes: "Ajuste inventario físico. Contado: 5, Sistema: 8", createdAt: daysAgo(8), product: { id: "prod-2", name: "Monitor LG UltraWide 29\"" }, lot: null, fromLocation: { id: "wh-1-stock", name: "Almacén Central/Stock" }, toLocation: null },
  { id: "mv-25", quantity: 5, type: "INCOMING", reference: "REC-20260103-002-L1", notes: null, createdAt: daysAgo(1), product: { id: "prod-6", name: "Cable HDMI 2.0 2m" }, lot: null, fromLocation: null, toLocation: { id: "wh-1-stock", name: "Almacén Central/Stock" } },
  { id: "mv-26", quantity: -2, type: "OUTGOING", reference: "POS-2026-0041", notes: null, createdAt: daysAgo(1), product: { id: "prod-3", name: "Teclado Mecánico Redragon K552" }, lot: { id: "lot-3-2", lotNumber: "RD-K552-B2" }, fromLocation: { id: "wh-2-stock", name: "Tienda Lima/Stock" }, toLocation: null },
  { id: "mv-27", quantity: -1, type: "OUTGOING", reference: "POS-2026-0040", notes: null, createdAt: daysAgo(2), product: { id: "prod-5", name: "Audífonos Sony WH-CH510" }, lot: { id: "lot-5-2", lotNumber: "SONY-WH-E2" }, fromLocation: { id: "wh-1-stock", name: "Almacén Central/Stock" }, toLocation: null },
  { id: "mv-28", quantity: 3, type: "INCOMING", reference: "REC-20260101-001-L4", notes: null, createdAt: daysAgo(0), product: { id: "prod-1", name: "Laptop HP ProBook 450 G9" }, lot: null, fromLocation: null, toLocation: { id: "wh-1-stock", name: "Almacén Central/Stock" } },
  { id: "mv-29", quantity: -4, type: "OUTGOING", reference: "DLV-20260126-002", notes: null, createdAt: daysAgo(0), product: { id: "prod-6", name: "Cable HDMI 2.0 2m" }, lot: null, fromLocation: { id: "wh-1-stock", name: "Almacén Central/Stock" }, toLocation: null },
  { id: "mv-30", quantity: 2, type: "TRANSFER", reference: "INT-20260127-003", notes: null, createdAt: daysAgo(0), product: { id: "prod-2", name: "Monitor LG UltraWide 29\"" }, lot: null, fromLocation: { id: "wh-1-stock", name: "Almacén Central/Stock" }, toLocation: { id: "wh-3-stock", name: "Depósito Norte/Stock" } },
]

// Sort movements by date desc (newest first)
MOCK_MOVEMENTS.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

// ── REORDERING RULES ────────────────────────────────────────────────────────

export const MOCK_REORDERING_RULES: MockReorderingRule[] = [
  { id: "rr-1", minQty: 5, maxQty: 20, isActive: true, product: { id: "prod-7", name: "Hub USB-C 7-en-1", stock: 1 }, location: { id: "wh-1-stock", name: "Almacén Central/Stock", shortCode: "STOCK" } },
  { id: "rr-2", minQty: 5, maxQty: 15, isActive: true, product: { id: "prod-8", name: "Pad Mouse XL RGB", stock: 0 }, location: { id: "wh-1-stock", name: "Almacén Central/Stock", shortCode: "STOCK" } },
  { id: "rr-3", minQty: 8, maxQty: 30, isActive: true, product: { id: "prod-4", name: "Mouse Logitech G203", stock: 15 }, location: { id: "wh-1-stock", name: "Almacén Central/Stock", shortCode: "STOCK" } },
  { id: "rr-4", minQty: 10, maxQty: 40, isActive: true, product: { id: "prod-6", name: "Cable HDMI 2.0 2m", stock: 20 }, location: { id: "wh-1-stock", name: "Almacén Central/Stock", shortCode: "STOCK" } },
  { id: "rr-5", minQty: 2, maxQty: 8, isActive: true, product: { id: "prod-1", name: "Laptop HP ProBook 450 G9", stock: 3 }, location: { id: "wh-1-stock", name: "Almacén Central/Stock", shortCode: "STOCK" } },
]
