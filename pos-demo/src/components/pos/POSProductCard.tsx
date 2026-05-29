import { useState } from "react"
import { Plus, Check, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { POSOrderItem } from "@/stores/pos-store"
import { useSettingsStore, formatPrice } from "@/stores/settings-store"
import { getAvailableItems } from "@/api/pos"

const PLACEHOLDER = "https://images.unsplash.com/photo-1629429408209-1f912961dbd8?w=400&h=400&fit=crop"

interface POSProduct {
  id: string
  name: string
  price: number
  stock: number
  images: string[]
  isNew: boolean
  brand?: string
  trackingMode?: string
}

interface POSProductCardProps {
  product: POSProduct
  onAdd: (item: POSOrderItem) => boolean | void
}

export function POSProductCard({ product, onAdd }: POSProductCardProps) {
  const [state, setState] = useState<"idle" | "loading" | "added" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const currency = useSettingsStore((s) => s.settings.currency)

  const handleAdd = async () => {
    if (product.stock === 0 || state === "loading") return
    setState("loading")
    setErrorMsg("")

    try {
      const items = await getAvailableItems(product.id)

      if (!items.length) {
        setState("error")
        setErrorMsg("Sin unidades")
        setTimeout(() => setState("idle"), 2000)
        return
      }

      const unit = items[0]
      const qrCode = unit.isLot
        ? `LOT:${unit.id}:${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
        : unit.qrCode

      const result = onAdd({
        productId: product.id,
        productItemId: unit.id,
        qrCode,
        name: product.name,
        price: Number(product.price),
        image: product.images[0] ?? "",
      })

      if (result === false) {
        setState("error")
        setErrorMsg("Ya en orden")
        setTimeout(() => setState("idle"), 2000)
      } else {
        setState("added")
        setTimeout(() => setState("idle"), 1200)
      }
    } catch {
      setState("error")
      setErrorMsg("Error")
      setTimeout(() => setState("idle"), 2000)
    }
  }

  const outOfStock = product.stock === 0

  return (
    <Card
      className={`group overflow-hidden transition-all cursor-pointer select-none
        ${outOfStock ? "opacity-50" : "hover:shadow-md hover:border-primary/50"}
        ${state === "added" ? "border-green-500" : ""}
        ${state === "error" ? "border-destructive" : ""}
      `}
      onClick={handleAdd}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.isNew && (
          <Badge className="absolute left-1.5 top-1.5 z-10 text-[10px] px-1.5 py-0">
            Nuevo
          </Badge>
        )}

        <img
          src={product.images[0] || PLACEHOLDER}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform ${!outOfStock ? "group-hover:scale-105" : ""}`}
        />

        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors">
          <div className={`
            flex items-center justify-center h-9 w-9 rounded-full shadow-md transition-all
            ${state === "loading" ? "bg-muted" : ""}
            ${state === "added" ? "bg-green-500 text-white scale-110" : ""}
            ${state === "error" ? "bg-destructive text-white" : ""}
            ${state === "idle" && !outOfStock ? "bg-primary text-primary-foreground opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100" : ""}
          `}>
            {state === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
            {state === "added" && <Check className="h-4 w-4" />}
            {state === "idle" && !outOfStock && <Plus className="h-4 w-4" />}
          </div>
        </div>
      </div>

      <CardContent className="p-2">
        {product.brand && (
          <p className="text-[10px] text-muted-foreground leading-none mb-0.5">{product.brand}</p>
        )}
        <p className="text-xs font-medium line-clamp-2 leading-tight">{product.name}</p>
        <div className="mt-1 flex items-baseline justify-between gap-1">
          <span className="text-sm font-bold text-primary">
            {formatPrice(Number(product.price), currency)}
          </span>
          {state === "error" ? (
            <span className="text-[10px] text-destructive">{errorMsg}</span>
          ) : outOfStock ? (
            <span className="text-[10px] text-destructive">Agotado</span>
          ) : (
            <span className="text-[10px] text-muted-foreground">{product.stock} uds.</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
