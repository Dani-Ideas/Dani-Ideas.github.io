export interface MockProductItem {
  id: string
  qrCode: string
  status: "AVAILABLE" | "USED"
}

export interface MockLot {
  id: string
  availableQty: number
}

export interface MockProduct {
  id: string
  name: string
  slug: string
  price: number
  comparePrice?: number
  stock: number
  images: string[]
  isNew: boolean
  brand: string
  category: string
  trackingMode: "BY_SERIAL" | "BY_LOT" | "NONE"
  productItems?: MockProductItem[]
  lot?: MockLot
}

export interface MockTerminal {
  id: string
  name: string
  details: string | null
  isActive: boolean
  locationId: null
}

export interface MockCategory {
  id: string
  name: string
  slug: string
}

export const MOCK_CATEGORIES: MockCategory[] = [
  { id: "cat-1", name: "Laptops", slug: "laptops" },
  { id: "cat-2", name: "Monitores", slug: "monitores" },
  { id: "cat-3", name: "Teclados", slug: "teclados" },
  { id: "cat-4", name: "Ratones", slug: "ratones" },
]

export const MOCK_TERMINALS: MockTerminal[] = [
  { id: "term-1", name: "Caja Principal", details: "Entrada principal", isActive: true, locationId: null },
  { id: "term-2", name: "Caja 2", details: "Sala lateral", isActive: true, locationId: null },
  { id: "term-3", name: "Caja Express", details: "Solo efectivo", isActive: true, locationId: null },
]

export const MOCK_PRODUCTS: MockProduct[] = [
  // ── BY_SERIAL: Laptops ─────────────────────────────────────────────────────
  {
    id: "prod-1",
    name: "Laptop HP ProBook 450 G9",
    slug: "laptop-hp-probook-450",
    price: 2499.00,
    comparePrice: 2799.00,
    stock: 3,
    images: ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop"],
    isNew: true,
    brand: "HP",
    category: "laptops",
    trackingMode: "BY_SERIAL",
    productItems: [
      { id: "pi-1-1", qrCode: "HP-PROBOOK-001", status: "AVAILABLE" },
      { id: "pi-1-2", qrCode: "HP-PROBOOK-002", status: "AVAILABLE" },
      { id: "pi-1-3", qrCode: "HP-PROBOOK-003", status: "AVAILABLE" },
    ],
  },
  {
    id: "prod-2",
    name: "Laptop Lenovo ThinkPad E15",
    slug: "laptop-lenovo-thinkpad-e15",
    price: 3199.00,
    stock: 2,
    images: ["https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&h=400&fit=crop"],
    isNew: false,
    brand: "Lenovo",
    category: "laptops",
    trackingMode: "BY_SERIAL",
    productItems: [
      { id: "pi-2-1", qrCode: "LNV-THINKPAD-001", status: "AVAILABLE" },
      { id: "pi-2-2", qrCode: "LNV-THINKPAD-002", status: "AVAILABLE" },
    ],
  },
  // ── BY_SERIAL: Monitores ───────────────────────────────────────────────────
  {
    id: "prod-3",
    name: "Monitor LG UltraWide 29\"",
    slug: "monitor-lg-ultrawide-29",
    price: 1299.00,
    stock: 4,
    images: ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=400&fit=crop"],
    isNew: true,
    brand: "LG",
    category: "monitores",
    trackingMode: "BY_SERIAL",
    productItems: [
      { id: "pi-3-1", qrCode: "LG-UW29-001", status: "AVAILABLE" },
      { id: "pi-3-2", qrCode: "LG-UW29-002", status: "AVAILABLE" },
      { id: "pi-3-3", qrCode: "LG-UW29-003", status: "AVAILABLE" },
      { id: "pi-3-4", qrCode: "LG-UW29-004", status: "AVAILABLE" },
    ],
  },
  {
    id: "prod-4",
    name: "Monitor Samsung 24\" FHD",
    slug: "monitor-samsung-24-fhd",
    price: 699.00,
    stock: 5,
    images: ["https://images.unsplash.com/photo-1561736778-92e52a7769ef?w=400&h=400&fit=crop"],
    isNew: false,
    brand: "Samsung",
    category: "monitores",
    trackingMode: "BY_SERIAL",
    productItems: [
      { id: "pi-4-1", qrCode: "SAM-24FHD-001", status: "AVAILABLE" },
      { id: "pi-4-2", qrCode: "SAM-24FHD-002", status: "AVAILABLE" },
      { id: "pi-4-3", qrCode: "SAM-24FHD-003", status: "AVAILABLE" },
      { id: "pi-4-4", qrCode: "SAM-24FHD-004", status: "AVAILABLE" },
      { id: "pi-4-5", qrCode: "SAM-24FHD-005", status: "AVAILABLE" },
    ],
  },
  // ── BY_LOT: Teclados ───────────────────────────────────────────────────────
  {
    id: "prod-5",
    name: "Teclado Mecánico Redragon K552",
    slug: "teclado-mecanico-redragon-k552",
    price: 189.00,
    stock: 10,
    images: ["https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=400&fit=crop"],
    isNew: false,
    brand: "Redragon",
    category: "teclados",
    trackingMode: "BY_LOT",
    lot: { id: "lot-5-1", availableQty: 10 },
  },
  {
    id: "prod-6",
    name: "Teclado Inalámbrico Logitech K380",
    slug: "teclado-inalambrico-logitech-k380",
    price: 229.00,
    comparePrice: 259.00,
    stock: 8,
    images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop"],
    isNew: true,
    brand: "Logitech",
    category: "teclados",
    trackingMode: "BY_LOT",
    lot: { id: "lot-6-1", availableQty: 8 },
  },
  {
    id: "prod-7",
    name: "Teclado Gamer HyperX Alloy",
    slug: "teclado-gamer-hyperx-alloy",
    price: 349.00,
    stock: 6,
    images: ["https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400&h=400&fit=crop"],
    isNew: false,
    brand: "HyperX",
    category: "teclados",
    trackingMode: "BY_LOT",
    lot: { id: "lot-7-1", availableQty: 6 },
  },
  // ── BY_LOT: Ratones ────────────────────────────────────────────────────────
  {
    id: "prod-8",
    name: "Mouse Logitech G203 LIGHTSYNC",
    slug: "mouse-logitech-g203",
    price: 129.00,
    stock: 15,
    images: ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop"],
    isNew: false,
    brand: "Logitech",
    category: "ratones",
    trackingMode: "BY_LOT",
    lot: { id: "lot-8-1", availableQty: 15 },
  },
  // ── NONE: Sin trazabilidad ─────────────────────────────────────────────────
  {
    id: "prod-9",
    name: "Cable HDMI 2.0 2m",
    slug: "cable-hdmi-2m",
    price: 29.90,
    stock: 20,
    images: ["https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=400&fit=crop"],
    isNew: false,
    brand: "Generic",
    category: "monitores",
    trackingMode: "NONE",
  },
  {
    id: "prod-10",
    name: "Pad Mouse XL RGB",
    slug: "pad-mouse-xl-rgb",
    price: 59.90,
    stock: 20,
    images: ["https://images.unsplash.com/photo-1593642632632-2ed66e64a2ee?w=400&h=400&fit=crop"],
    isNew: false,
    brand: "Redragon",
    category: "ratones",
    trackingMode: "NONE",
  },
  {
    id: "prod-11",
    name: "Audífonos Bluetooth Sony WH-CH510",
    slug: "audifonos-bt-sony-wh-ch510",
    price: 189.00,
    stock: 12,
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop"],
    isNew: false,
    brand: "Sony",
    category: "ratones",
    trackingMode: "NONE",
  },
  {
    id: "prod-12",
    name: "Hub USB-C 7-en-1",
    slug: "hub-usbc-7en1",
    price: 99.90,
    comparePrice: 129.00,
    stock: 15,
    images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop"],
    isNew: true,
    brand: "Aukey",
    category: "teclados",
    trackingMode: "NONE",
  },
]
