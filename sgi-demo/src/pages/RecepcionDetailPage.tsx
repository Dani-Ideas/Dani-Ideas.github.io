import { useEffect, useState } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { Loader2, ChevronDown, ChevronRight, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getReception, approveReception, completeReception, cancelReception } from "@/api/sgi"
import type { MockReception } from "@/data/mock"

const STATUS_LABEL: Record<MockReception["status"], string> = {
  DRAFT: "Borrador", IN_PROGRESS: "En proceso", DONE: "Hecho", CANCELLED: "Cancelado",
}
const STATUS_VARIANT: Record<MockReception["status"], "secondary" | "outline" | "default" | "destructive"> = {
  DRAFT: "secondary", IN_PROGRESS: "outline", DONE: "default", CANCELLED: "destructive",
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

export function RecepcionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [reception, setReception] = useState<MockReception | null>(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedLines, setExpandedLines] = useState<Set<string>>(new Set())

  const load = () => {
    if (!id) return
    setLoading(true)
    getReception(id).then(setReception).finally(() => setLoading(false))
  }

  useEffect(load, [id])

  const toggleLine = (lineId: string) => {
    setExpandedLines((prev) => {
      const next = new Set(prev)
      next.has(lineId) ? next.delete(lineId) : next.add(lineId)
      return next
    })
  }

  const doAction = async (action: "approve" | "done" | "cancel") => {
    if (!id) return
    setActing(true)
    setError(null)
    try {
      if (action === "approve") await approveReception(id)
      else if (action === "done") await completeReception(id)
      else await cancelReception(id)
      load()
    } catch {
      setError("Error al ejecutar la acción")
    } finally {
      setActing(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-32"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
  }

  if (!reception) {
    return <div className="text-center py-20 text-destructive">Recepción no encontrada</div>
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3">
            <Link to="/recepciones" className="text-muted-foreground hover:text-foreground text-sm">← Recepciones</Link>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-xl font-bold font-mono">{reception.reference}</h1>
            <Badge variant={STATUS_VARIANT[reception.status]}>{STATUS_LABEL[reception.status]}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Creada: {formatDate(reception.createdAt)} · Destino: {reception.destinationLocation?.name ?? "Sin destino"}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 flex-wrap">
          {reception.status === "DRAFT" && (
            <>
              <Button size="sm" disabled={acting} onClick={() => doAction("approve")}>
                {acting && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                Aprobar
              </Button>
              <Button size="sm" variant="outline" disabled={acting} onClick={() => doAction("cancel")}>
                Cancelar
              </Button>
            </>
          )}
          {reception.status === "IN_PROGRESS" && (
            <>
              <Button size="sm" disabled={acting} onClick={() => doAction("done")}>
                {acting && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                Marcar como hecho
              </Button>
              <Button size="sm" variant="outline" disabled={acting} onClick={() => doAction("cancel")}>
                Cancelar
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded px-4 py-2">{error}</div>
      )}

      {/* Demo notice */}
      <div className="text-xs text-blue-800 bg-blue-50 border border-blue-200 rounded px-3 py-2">
        <strong>Demo:</strong> Las transiciones de estado son simplificadas. En el sistema real, "Aprobar" genera QRs individuales por unidad y "Marcar como hecho" actualiza las ubicaciones con rutas multi-paso (INPUT → QC → STOCK).
      </div>

      {/* Lines */}
      <div className="bg-card border rounded-sm overflow-hidden">
        <div className="px-4 py-3 border-b bg-muted/20">
          <h2 className="font-semibold text-sm">
            Líneas de recepción ({reception.lines.length})
          </h2>
        </div>
        <div className="divide-y">
          {reception.lines.map((line) => {
            const isExpanded = expandedLines.has(line.id)
            return (
              <div key={line.id}>
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted/20 transition-colors text-left"
                  onClick={() => toggleLine(line.id)}
                >
                  {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{line.product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {line.product.category.name} · {line.product.brand.name} · {line.product.trackingMode}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold">{line.quantity} uds.</p>
                    {line.lotNumber && <p className="text-xs text-muted-foreground font-mono">{line.lotNumber}</p>}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-8 pb-4 space-y-3 bg-muted/5">
                    <div className="grid grid-cols-3 gap-4 text-sm pt-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Trazabilidad</p>
                        <p>{line.product.trackingMode}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Nº Lote</p>
                        <p className="font-mono">{line.lotNumber ?? "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Caducidad</p>
                        <p>{line.expiryDate ? new Date(line.expiryDate).toLocaleDateString("es") : "—"}</p>
                      </div>
                    </div>

                    {line.lot && (
                      <div className="border rounded p-3 space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Lote generado</p>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="font-mono">{line.lot.lotNumber}</Badge>
                          <span className="text-sm">{line.lot.availableQty} / {line.lot.quantity} disponibles</span>
                        </div>
                        {line.lot.productItems.length > 0 && (
                          <p className="text-xs text-muted-foreground">{line.lot.productItems.length} QR generados</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Flow visualization for multi-step */}
      {reception.status !== "DRAFT" && reception.destinationLocation && (
        <div className="bg-card border rounded-sm p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Ruta de recepción (Almacén Central — 3 pasos)</p>
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { label: "Proveedor", color: "bg-muted text-muted-foreground" },
              { label: "→" },
              { label: "Entrada (INPUT)", color: "bg-blue-100 text-blue-700" },
              { label: "→" },
              { label: "Calidad (QC)", color: "bg-yellow-100 text-yellow-700" },
              { label: "→" },
              { label: "Stock", color: "bg-green-100 text-green-700" },
            ].map((n, i) =>
              "color" in n ? (
                <span key={i} className={`text-xs px-2 py-1 rounded font-medium ${n.color}`}>{n.label}</span>
              ) : (
                <ArrowRight key={i} className="h-3 w-3 text-muted-foreground" />
              )
            )}
          </div>
        </div>
      )}
    </div>
  )
}
