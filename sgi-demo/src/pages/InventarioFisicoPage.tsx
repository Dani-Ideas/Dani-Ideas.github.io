import { useEffect, useState, useCallback } from "react"
import { Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getProducts, adjustInventory } from "@/api/sgi"
import type { Adjustment } from "@/stores/sgi-store"

interface ProductRow { id: string; name: string; category: string; stock: number; counted: number | ""; trackingMode: string }

export function InventarioFisicoPage() {
  const [rows, setRows] = useState<ProductRow[]>([])
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    type RawP = { id: string; name: string; category?: { name: string } | string; stock?: number; trackingMode?: string }
    getProducts().then((data) => {
      setRows((data as unknown as RawP[]).map((p) => ({
        id: p.id, name: p.name,
        category: typeof p.category === "string" ? p.category : (p.category as { name: string } | undefined)?.name ?? "—",
        stock: p.stock ?? 0, counted: "", trackingMode: p.trackingMode ?? "NONE",
      })))
    }).finally(() => setLoading(false))
  }, [])

  const setCounted = useCallback((id: string, val: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, counted: val === "" ? "" : Number(val) } : r)))
  }, [])

  const applyAll = async () => {
    const dirty = rows.filter((r) => r.counted !== "" && r.counted !== r.stock)
    if (dirty.length === 0) return
    setApplying(true)
    const adjustments: Adjustment[] = dirty.map((r) => ({
      productId: r.id,
      productName: r.name,
      diff: (r.counted as number) - r.stock,
      counted: r.counted as number,
      previous: r.stock,
    }))
    await adjustInventory(adjustments)
    setAppliedIds(new Set(dirty.map((r) => r.id)))
    setRows((prev) => prev.map((r) => r.counted !== "" ? { ...r, stock: r.counted as number, counted: "" } : r))
    setApplying(false)
  }

  const dirtyCount = rows.filter((r) => r.counted !== "" && r.counted !== r.stock).length

  const TRACKING_LABEL: Record<string, { label: string; title: string }> = {
    BY_SERIAL: { label: "QR único", title: "Ajuste da de baja un QR individual" },
    BY_LOT: { label: "Por lote", title: "Ajuste da de baja lotes en orden FIFO" },
    BY_EXPIRY: { label: "Lote + caducidad", title: "Ajuste da de baja lotes en orden FIFO" },
    NONE: { label: "Sin QR", title: "Solo ajusta el contador de stock" },
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Inventario físico</h1>
        <Button size="sm" onClick={applyAll} disabled={applying || dirtyCount === 0}>
          {applying && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
          Aplicar todo {dirtyCount > 0 && `(${dirtyCount})`}
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Ingresa la cantidad contada para cada producto. Solo los productos con diferencia serán ajustados.
      </p>

      <div className="bg-card border rounded-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-muted-foreground text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-2 font-medium">Producto</th>
                <th className="text-left px-4 py-2 font-medium">Categoría</th>
                <th className="text-left px-4 py-2 font-medium">Trazabilidad</th>
                <th className="text-right px-4 py-2 font-medium">A la mano</th>
                <th className="text-right px-4 py-2 font-medium">Contado</th>
                <th className="text-right px-4 py-2 font-medium">Diferencia</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((row) => {
                const diff = row.counted !== "" ? (row.counted as number) - row.stock : null
                const isApplied = appliedIds.has(row.id)
                const tm = TRACKING_LABEL[row.trackingMode] ?? { label: row.trackingMode, title: "" }
                return (
                  <tr key={row.id} className={`hover:bg-muted/20 transition-colors ${isApplied ? "opacity-60" : ""}`}>
                    <td className="px-4 py-2 font-medium">{row.name}</td>
                    <td className="px-4 py-2 text-muted-foreground">{row.category}</td>
                    <td className="px-4 py-2">
                      <span title={tm.title} className="text-xs text-muted-foreground border rounded px-1.5 py-0.5 cursor-help">{tm.label}</span>
                    </td>
                    <td className="px-4 py-2 text-right">{row.stock}</td>
                    <td className="px-4 py-2">
                      <Input
                        type="number" min={0} value={row.counted} disabled={isApplied}
                        onChange={(e) => setCounted(row.id, e.target.value)}
                        className="h-7 text-xs text-right w-20 ml-auto" placeholder="—"
                      />
                    </td>
                    <td className="px-4 py-2 text-right font-medium">
                      {diff !== null ? (
                        <span className={diff > 0 ? "text-emerald-600" : diff < 0 ? "text-destructive" : "text-muted-foreground"}>
                          {diff > 0 ? `+${diff}` : diff}
                        </span>
                      ) : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-2 py-2 text-center">
                      {isApplied && <Check className="h-4 w-4 text-emerald-600 mx-auto" />}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
