import { useEffect, useState } from "react"
import { Loader2, PackageOpen } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getDeliveries } from "@/api/sgi"
import type { MockDelivery } from "@/data/mock"

const STATUS_LABEL: Record<MockDelivery["status"], string> = { DRAFT: "Borrador", DONE: "Completado", CANCELLED: "Cancelado" }
const STATUS_VARIANT: Record<MockDelivery["status"], "secondary" | "default" | "destructive"> = { DRAFT: "secondary", DONE: "default", CANCELLED: "destructive" }
const POLICY_LABEL: Record<MockDelivery["shippingPolicy"], string> = { ASAP: "ASAP", ALL_AT_ONCE: "Completo" }

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es", { day: "2-digit", month: "2-digit", year: "numeric" })
}

export function SalidasPage() {
  const [deliveries, setDeliveries] = useState<MockDelivery[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDeliveries().then((d) => setDeliveries(d as MockDelivery[])).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Salidas</h1>
        <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded">Demo — solo lectura</span>
      </div>

      <div className="bg-card border rounded-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : deliveries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
            <PackageOpen className="h-8 w-8 opacity-30" />
            <p className="text-sm">No hay salidas registradas</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-muted-foreground text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-2 font-medium">Referencia</th>
                <th className="text-left px-4 py-2 font-medium">Productos</th>
                <th className="text-left px-4 py-2 font-medium">Origen</th>
                <th className="text-left px-4 py-2 font-medium">Política</th>
                <th className="text-left px-4 py-2 font-medium">Fecha</th>
                <th className="text-right px-4 py-2 font-medium">Uds.</th>
                <th className="text-center px-4 py-2 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {deliveries.map((d) => {
                const totalUnits = d.lines.reduce((s, l) => s + l.quantity, 0)
                return (
                  <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2 font-medium font-mono text-xs">{d.reference}</td>
                    <td className="px-4 py-2 text-muted-foreground max-w-[200px] truncate">
                      {d.lines.length === 1 ? d.lines[0].product.name : `${d.lines.length} productos`}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">{d.sourceLocation?.name ?? <span className="opacity-40 italic">—</span>}</td>
                    <td className="px-4 py-2"><Badge variant="outline" className="text-xs">{POLICY_LABEL[d.shippingPolicy]}</Badge></td>
                    <td className="px-4 py-2 text-muted-foreground">{formatDate(d.createdAt)}</td>
                    <td className="px-4 py-2 text-right">{totalUnits}</td>
                    <td className="px-4 py-2 text-center"><Badge variant={STATUS_VARIANT[d.status]}>{STATUS_LABEL[d.status]}</Badge></td>
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
