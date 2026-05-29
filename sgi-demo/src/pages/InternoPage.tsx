import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Loader2, ArrowRightLeft, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getTransfers, confirmTransfer } from "@/api/sgi"
import type { MockTransfer } from "@/data/mock"

const STATUS_LABEL: Record<MockTransfer["status"], string> = {
  DRAFT: "Borrador", DONE: "Completado", CANCELLED: "Cancelado",
}
const STATUS_VARIANT: Record<MockTransfer["status"], "secondary" | "default" | "destructive"> = {
  DRAFT: "secondary", DONE: "default", CANCELLED: "destructive",
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es", { day: "2-digit", month: "2-digit", year: "numeric" })
}

export function InternoPage() {
  const [transfers, setTransfers] = useState<MockTransfer[]>([])
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState<string | null>(null)

  const load = () => {
    getTransfers().then(setTransfers).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleConfirm = async (id: string) => {
    setConfirming(id)
    await confirmTransfer(id)
    load()
    setConfirming(null)
  }

  const routePending = transfers.filter((t) => t.reference.startsWith("ROUTE-") && t.status === "DRAFT")
  const outboundPending = transfers.filter((t) => t.reference.startsWith("OUTBOUND-") && t.status === "DRAFT")

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Traslados internos</h1>
        <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded">
          Demo — solo puedes confirmar los traslados pendientes
        </span>
      </div>

      {/* Pending ROUTE transfers */}
      {!loading && routePending.length > 0 && (
        <div className="bg-card border border-amber-200 rounded-sm overflow-hidden">
          <div className="px-4 py-3 border-b bg-amber-50 flex items-center gap-2">
            <span className="text-sm font-medium text-amber-800">Rutas pendientes</span>
            <span className="bg-amber-400 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{routePending.length}</span>
            <span className="text-xs text-amber-600 ml-auto">Confirma el movimiento físico para avanzar en la cadena</span>
          </div>
          <div className="divide-y">
            {routePending.map((t) => {
              const step = t.reference.match(/-S(\d+)$/)?.[1]
              const totalUnits = t.lines.reduce((s, l) => s + l.quantity, 0)
              return (
                <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />
                  <div className="flex-1 text-sm min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium font-mono text-xs">{t.reference}</span>
                      {step && <span className="text-xs bg-amber-100 text-amber-700 rounded px-1 font-medium">Paso {step}</span>}
                      <span className="text-xs text-muted-foreground">· {totalUnits} uds.</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                      <span>{t.sourceLocation?.name ?? "—"}</span>
                      <ArrowRight className="h-3 w-3" />
                      <span className="font-medium text-foreground">{t.destinationLocation?.name ?? "—"}</span>
                    </div>
                  </div>
                  <Button
                    size="sm" variant="outline" className="shrink-0 text-xs h-7"
                    disabled={confirming === t.id}
                    onClick={() => handleConfirm(t.id)}
                  >
                    {confirming === t.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Confirmar"}
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Pending OUTBOUND transfers */}
      {!loading && outboundPending.length > 0 && (
        <div className="bg-card border border-purple-200 rounded-sm overflow-hidden">
          <div className="px-4 py-3 border-b bg-purple-50 flex items-center gap-2">
            <span className="text-sm font-medium text-purple-800">Rutas de salida pendientes</span>
            <span className="bg-purple-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{outboundPending.length}</span>
            <span className="text-xs text-purple-600 ml-auto">Confirma el traslado para despachar al cliente</span>
          </div>
          <div className="divide-y">
            {outboundPending.map((t) => {
              const step = t.reference.match(/-S(\d+)$/)?.[1]
              const totalUnits = t.lines.reduce((s, l) => s + l.quantity, 0)
              return (
                <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="h-2 w-2 rounded-full bg-purple-400 shrink-0" />
                  <div className="flex-1 text-sm min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium font-mono text-xs">{t.reference}</span>
                      {step && <span className="text-xs bg-purple-100 text-purple-700 rounded px-1 font-medium">Paso {step}</span>}
                      <span className="text-xs text-muted-foreground">· {totalUnits} uds.</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                      <span>{t.sourceLocation?.name ?? "—"}</span>
                      <ArrowRight className="h-3 w-3" />
                      <span className="font-medium text-foreground">{t.destinationLocation?.name ?? "—"}</span>
                    </div>
                  </div>
                  <Button
                    size="sm" variant="outline" className="shrink-0 text-xs h-7"
                    disabled={confirming === t.id}
                    onClick={() => handleConfirm(t.id)}
                  >
                    {confirming === t.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Confirmar"}
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* All transfers */}
      <div className="bg-card border rounded-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : transfers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
            <ArrowRightLeft className="h-8 w-8 opacity-30" />
            <p className="text-sm">No hay traslados registrados</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-muted-foreground text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-2 font-medium">Referencia</th>
                <th className="text-left px-4 py-2 font-medium">Productos</th>
                <th className="text-left px-4 py-2 font-medium">Desde</th>
                <th className="text-left px-4 py-2 font-medium">Hacia</th>
                <th className="text-left px-4 py-2 font-medium">Fecha</th>
                <th className="text-right px-4 py-2 font-medium">Uds.</th>
                <th className="text-center px-4 py-2 font-medium">Estado</th>
                <th className="w-24" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {transfers.map((t) => {
                const totalUnits = t.lines.reduce((s, l) => s + l.quantity, 0)
                const isRoute = t.reference.startsWith("ROUTE-")
                const isOutbound = t.reference.startsWith("OUTBOUND-")
                const step = t.reference.match(/-S(\d+)$/)?.[1]
                return (
                  <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-primary font-mono text-xs">{t.reference}</span>
                        {isRoute && step && <span className="text-[10px] bg-amber-100 text-amber-700 rounded px-1 py-0.5 font-medium">Entrada paso {step}</span>}
                        {isOutbound && step && <span className="text-[10px] bg-purple-100 text-purple-700 rounded px-1 py-0.5 font-medium">Salida paso {step}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-muted-foreground max-w-[180px] truncate">
                      {t.lines.length === 1 ? t.lines[0].product.name : `${t.lines.length} productos`}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">{t.sourceLocation?.name ?? <span className="opacity-40 italic">—</span>}</td>
                    <td className="px-4 py-2 text-muted-foreground">{t.destinationLocation?.name ?? <span className="opacity-40 italic">—</span>}</td>
                    <td className="px-4 py-2 text-muted-foreground">{formatDate(t.createdAt)}</td>
                    <td className="px-4 py-2 text-right">{totalUnits}</td>
                    <td className="px-4 py-2 text-center">
                      <Badge variant={STATUS_VARIANT[t.status]}>{STATUS_LABEL[t.status]}</Badge>
                    </td>
                    <td className="px-2 py-2 text-right">
                      {t.status === "DRAFT" && (
                        <Button size="sm" variant="outline" className="h-7 text-xs" disabled={confirming === t.id} onClick={() => handleConfirm(t.id)}>
                          {confirming === t.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Confirmar"}
                        </Button>
                      )}
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
