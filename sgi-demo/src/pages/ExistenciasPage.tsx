import { useEffect, useState, useCallback } from "react"
import { Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { LocationTreeSelect } from "@/components/sgi/LocationTreeSelect"
import { getExistencias, getFlatLocations } from "@/api/sgi"

interface Product {
  id: string; name: string; stock: number; locationStock: number | null; minStock: number | null
  trackingMode: string; category: { name: string } | null; brand: { name: string } | null
}

const ALL = "_all"
const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = { OK: "default", Bajo: "secondary", Agotado: "destructive" }
const TRACKING_LABEL: Record<string, string> = { BY_SERIAL: "Serie", BY_LOT: "Lote", BY_EXPIRY: "Vencimiento", NONE: "Simple" }

function stockStatus(stock: number, min: number | null) {
  if (stock === 0) return "Agotado"
  if (min !== null && stock <= min) return "Bajo"
  return "OK"
}

export function ExistenciasPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [flatLocations, setFlatLocations] = useState<Array<{ id: string; name: string; type: string; parentId: string | null }>>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [locationId, setLocationId] = useState<string>(ALL)

  useEffect(() => {
    getFlatLocations().then((d) => setFlatLocations(d as typeof flatLocations))
  }, [])

  const load = useCallback(() => {
    setLoading(true)
    getExistencias(locationId === ALL ? undefined : locationId)
      .then((d) => setProducts(d as Product[]))
      .finally(() => setLoading(false))
  }, [locationId])

  useEffect(() => { load() }, [load])

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
  const displayStock = (p: Product) => locationId !== ALL && p.locationStock !== null ? p.locationStock : p.stock

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-lg font-semibold">Existencias</h1>
        <div className="flex items-center gap-2">
          <LocationTreeSelect
            locations={flatLocations}
            value={locationId}
            onChange={setLocationId}
            allValue={ALL}
            allLabel="Todos los almacenes"
          />
          <Input
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 max-w-xs text-sm"
          />
        </div>
      </div>

      <div className="bg-card border rounded-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-muted-foreground text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-2 font-medium">Producto</th>
                <th className="text-left px-4 py-2 font-medium">Categoría</th>
                <th className="text-left px-4 py-2 font-medium">Seguimiento</th>
                <th className="text-right px-4 py-2 font-medium">{locationId !== ALL ? "Stock (ubicación)" : "Stock"}</th>
                <th className="text-right px-4 py-2 font-medium">Stock mínimo</th>
                <th className="text-center px-4 py-2 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-muted-foreground text-sm">No se encontraron productos</td></tr>
              ) : (
                filtered.map((p) => {
                  const stock = displayStock(p)
                  const status = stockStatus(stock, p.minStock)
                  return (
                    <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-2 font-medium">{p.name}</td>
                      <td className="px-4 py-2 text-muted-foreground">{p.category?.name ?? "—"}</td>
                      <td className="px-4 py-2">
                        <Badge variant="outline" className="text-xs font-normal">{TRACKING_LABEL[p.trackingMode] ?? p.trackingMode}</Badge>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <span className={stock === 0 ? "text-destructive font-semibold" : stock <= (p.minStock ?? 0) ? "text-amber-600 font-semibold" : ""}>
                          {stock}
                        </span>
                        {locationId !== ALL && p.stock !== stock && (
                          <span className="text-xs text-muted-foreground ml-1">/{p.stock} global</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right text-muted-foreground">{p.minStock ?? "—"}</td>
                      <td className="px-4 py-2 text-center"><Badge variant={STATUS_VARIANT[status]}>{status}</Badge></td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {filtered.length} producto{filtered.length !== 1 ? "s" : ""} —{" "}
        {filtered.filter((p) => stockStatus(displayStock(p), p.minStock) === "Agotado").length} agotados,{" "}
        {filtered.filter((p) => stockStatus(displayStock(p), p.minStock) === "Bajo").length} con stock bajo
      </p>
    </div>
  )
}
