import { useState, useCallback } from "react"
import { Search, Loader2, PackageX } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { POSOrderItem } from "@/stores/pos-store"
import { useSettingsStore, formatPrice } from "@/stores/settings-store"
import { getProducts, getAvailableItems } from "@/api/pos"

interface Product {
  id: string
  name: string
  price: number
  stock: number
  images: string[]
}

interface POSProductSearchProps {
  onAddItem: (item: POSOrderItem) => boolean | void
  onQueryChange?: (query: string) => void
  hideDropdown?: boolean
}

export function POSProductSearch({ onAddItem, onQueryChange, hideDropdown = false }: POSProductSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Product[]>([])
  const [searching, setSearching] = useState(false)
  const currency = useSettingsStore((s) => s.settings.currency)
  const [addingId, setAddingId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const timerRef: { current?: ReturnType<typeof setTimeout> } = {}

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      return
    }
    setSearching(true)
    try {
      const data = await getProducts({ search: q, limit: 8 })
      setResults(data.products ?? [])
    } finally {
      setSearching(false)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    setMessage(null)
    onQueryChange?.(val)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => search(val), 350)
  }

  const handleSelectProduct = async (product: Product) => {
    if (product.stock <= 0) {
      setMessage(`${product.name} no tiene stock disponible`)
      return
    }
    setAddingId(product.id)
    setMessage(null)
    try {
      const items = await getAvailableItems(product.id)
      if (!items.length) {
        setMessage(`No hay unidades disponibles de ${product.name}`)
        return
      }
      const unit = items[0]
      const qrCode = unit.isLot
        ? `LOT:${unit.id}:${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
        : unit.qrCode
      const added = onAddItem({
        productId: product.id,
        productItemId: unit.id,
        qrCode,
        name: product.name,
        price: product.price,
        image: product.images[0] ?? "",
      })
      if (added === false) {
        setMessage("Este producto ya está en la orden")
      } else {
        setQuery("")
        setResults([])
        onQueryChange?.("")
      }
    } catch {
      setMessage("Error al agregar el producto")
    } finally {
      setAddingId(null)
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar producto por nombre..."
          value={query}
          onChange={handleChange}
          className="pl-9 pr-9"
        />
        {searching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {message && (
        <p className="mt-1 text-xs text-destructive px-1">{message}</p>
      )}

      {results.length > 0 && !hideDropdown && (
        <div className="absolute z-20 mt-1 w-full rounded-md border bg-background shadow-lg">
          {results.map((product) => (
            <button
              key={product.id}
              className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted transition-colors disabled:opacity-50"
              onClick={() => handleSelectProduct(product)}
              disabled={addingId === product.id}
            >
              {product.images[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="h-9 w-9 rounded object-cover flex-shrink-0"
                />
              ) : (
                <div className="h-9 w-9 rounded bg-muted flex-shrink-0 flex items-center justify-center">
                  <PackageX className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium">{product.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatPrice(Number(product.price), currency)} · Stock: {product.stock}
                </p>
              </div>
              {addingId === product.id && (
                <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
