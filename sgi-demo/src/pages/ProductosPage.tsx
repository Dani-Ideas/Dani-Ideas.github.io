import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { getProducts } from "@/api/sgi"

interface Product {
  id: string; name: string; brand: string; category: string; price: number; stock: number; images: string[]; isActive: boolean; trackingMode: string
}

const TRACKING_LABEL: Record<string, string> = { BY_SERIAL: "QR único", BY_LOT: "Por lote", BY_EXPIRY: "Lote + caducidad", NONE: "Sin QR" }

export function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    type RawP = { id: string; name: string; brand: { name: string } | string; category: { name: string } | string; price: number; stock: number; images: string[]; isActive: boolean; trackingMode: string }
    getProducts().then((d) => setProducts(
      (d as unknown as RawP[]).map((p) => ({
        ...p,
        brand: typeof p.brand === "string" ? p.brand : (p.brand as { name: string }).name,
        category: typeof p.category === "string" ? p.category : (p.category as { name: string }).name,
      }))
    )).finally(() => setLoading(false))
  }, [])

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-lg font-semibold">Productos</h1>
        <Input
          placeholder="Buscar producto o marca..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 max-w-xs text-sm"
        />
      </div>

      <div className="bg-card border rounded-sm overflow-hidden">
        {loading ? (
          <table className="w-full text-sm">
            <tbody className="divide-y">
              {[1,2,3,4,5].map((i) => (
                <tr key={i}>
                  <td className="px-4 py-2"><Skeleton className="h-10 w-10 rounded-md" /></td>
                  <td className="px-4 py-2"><Skeleton className="h-4 w-36" /></td>
                  <td className="px-4 py-2"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-4 py-2"><Skeleton className="h-4 w-16" /></td>
                  <td className="px-4 py-2"><Skeleton className="h-4 w-8" /></td>
                  <td className="px-4 py-2"><Skeleton className="h-5 w-16 rounded-full" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-muted-foreground text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-2 font-medium w-14">Img</th>
                <th className="text-left px-4 py-2 font-medium">Producto</th>
                <th className="text-left px-4 py-2 font-medium">Categoría</th>
                <th className="text-right px-4 py-2 font-medium">Precio</th>
                <th className="text-right px-4 py-2 font-medium">Stock</th>
                <th className="text-left px-4 py-2 font-medium">Trazabilidad</th>
                <th className="text-center px-4 py-2 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">No se encontraron productos</td></tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2">
                      {p.images[0]
                        ? <img src={p.images[0]} alt={p.name} className="h-10 w-10 rounded object-cover" />
                        : <div className="h-10 w-10 rounded bg-muted" />
                      }
                    </td>
                    <td className="px-4 py-2">
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.brand}</p>
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">{p.category}</td>
                    <td className="px-4 py-2 text-right font-mono">S/ {p.price.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right">
                      <span className={p.stock === 0 ? "text-destructive font-bold" : p.stock <= 3 ? "text-amber-600 font-semibold" : ""}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <Badge variant="outline" className="text-xs font-normal">{TRACKING_LABEL[p.trackingMode] ?? p.trackingMode}</Badge>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <Badge variant={p.stock > 0 ? "default" : "destructive"}>{p.stock > 0 ? "En stock" : "Agotado"}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
