import { useEffect, useState } from "react"
import { Loader2, AlertTriangle, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getReorderingRules } from "@/api/sgi"

interface Rule {
  id: string; minQty: number; maxQty: number; isActive: boolean
  product: { id: string; name: string; stock: number }
  location: { id: string; name: string; shortCode: string | null }
}

export function ReabastecimientoPage() {
  const [all, setAll] = useState<Rule[]>([])
  const [triggered, setTriggered] = useState<Rule[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"triggered" | "all">("triggered")

  useEffect(() => {
    Promise.all([
      getReorderingRules({ triggered: true }),
      getReorderingRules(),
    ]).then(([t, a]) => {
      setTriggered(t as Rule[])
      setAll(a as Rule[])
    }).finally(() => setLoading(false))
  }, [])

  const rows = tab === "triggered" ? triggered : all

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Reabastecimiento</h1>
          <p className="text-sm text-muted-foreground">Alertas cuando el stock cae por debajo del mínimo</p>
        </div>
        {triggered.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded px-3 py-1.5">
            <AlertTriangle className="h-4 w-4" />
            {triggered.length} producto{triggered.length > 1 ? "s" : ""} por debajo del mínimo
          </div>
        )}
      </div>

      <div className="flex gap-1 border-b">
        {[
          { key: "triggered", label: `Necesitan reabastecimiento (${triggered.length})` },
          { key: "all", label: `Todas las reglas (${all.length})` },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as "triggered" | "all")}
            className={`px-4 py-2 text-sm border-b-2 -mb-px transition-colors ${
              tab === t.key ? "border-primary text-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-card border rounded-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
            <p className="text-sm">
              {tab === "triggered" ? "Ningún producto está por debajo del stock mínimo" : "No hay reglas de reabastecimiento"}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-muted-foreground text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-2 font-medium">Producto</th>
                <th className="text-left px-4 py-2 font-medium">Ubicación</th>
                <th className="text-right px-4 py-2 font-medium">Stock actual</th>
                <th className="text-right px-4 py-2 font-medium">Mínimo</th>
                <th className="text-right px-4 py-2 font-medium">Máximo</th>
                <th className="text-right px-4 py-2 font-medium">A pedir</th>
                <th className="text-center px-4 py-2 font-medium">Estado</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((rule) => {
                const belowMin = rule.product.stock <= rule.minQty
                const gap = rule.maxQty - rule.product.stock
                return (
                  <tr key={rule.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2.5 font-medium">{rule.product.name}</td>
                    <td className="px-4 py-2.5 text-muted-foreground text-xs">
                      {rule.location.shortCode ? `${rule.location.shortCode} — ` : ""}{rule.location.name}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span className={belowMin ? "text-destructive font-bold" : ""}>{rule.product.stock}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground">{rule.minQty}</td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground">{rule.maxQty}</td>
                    <td className="px-4 py-2.5 text-right">
                      {belowMin ? <span className="font-semibold text-primary">{Math.max(0, gap)}</span> : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {belowMin ? <Badge variant="destructive" className="text-xs">Bajo mínimo</Badge> : <Badge variant="outline" className="text-xs">OK</Badge>}
                    </td>
                    <td className="px-2 py-2.5 text-center">
                      {belowMin && <ArrowRight className="h-4 w-4 text-muted-foreground mx-auto" aria-label="Crear recepción" />}
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
