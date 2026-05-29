import { useEffect, useState } from "react"
import { Loader2, Warehouse, ChevronRight, Settings } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getWarehouses } from "@/api/sgi"
import type { MockLocation } from "@/data/mock"

const SUBLOC_BADGE: Record<string, { label: string; color: string }> = {
  INPUT:   { label: "Entrada",       color: "bg-blue-100 text-blue-700" },
  QC:      { label: "Calidad",       color: "bg-yellow-100 text-yellow-700" },
  STOCK:   { label: "Stock",         color: "bg-green-100 text-green-700" },
  PACK:    { label: "Empaque",       color: "bg-purple-100 text-purple-700" },
  OUTPUT:  { label: "Salida",        color: "bg-orange-100 text-orange-700" },
  SCRAP:   { label: "Descarte",      color: "bg-red-100 text-red-600" },
  RETURNS: { label: "Devoluciones",  color: "bg-gray-100 text-gray-600" },
}

const STEP_COLORS = ["", "bg-muted text-muted-foreground", "bg-blue-100 text-blue-700", "bg-amber-100 text-amber-700"]

function RouteFlow({ steps, type }: { steps: number; type: "inbound" | "outbound" }) {
  const inboundFlow = [
    steps >= 2 && { code: "INPUT", label: "Input" },
    steps >= 3 && { code: "QC", label: "QC" },
    { code: "STOCK", label: "Stock" },
  ].filter(Boolean) as { code: string; label: string }[]

  const outboundFlow = [
    { code: "STOCK", label: "Stock" },
    steps >= 3 && { code: "PACK", label: "Packing" },
    steps >= 2 && { code: "OUTPUT", label: "Output" },
  ].filter(Boolean) as { code: string; label: string }[]

  const flow = type === "inbound" ? inboundFlow : outboundFlow

  return (
    <div className="flex items-center gap-1">
      {flow.map((node, i) => {
        const style = SUBLOC_BADGE[node.code]
        return (
          <div key={node.code} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground/50 shrink-0" />}
            <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${style?.color ?? ""}`}>
              {node.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export function WarehousePage() {
  const [warehouses, setWarehouses] = useState<MockLocation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getWarehouses().then(setWarehouses).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-4 max-w-5xl">
      <div>
        <h1 className="text-lg font-semibold">Almacenes</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Ubicaciones raíz con sus sub-ubicaciones y rutas configuradas
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-4">
          {warehouses.map((wh) => {
            const mainSubs = wh.children.filter((c) => !["SCRAP", "RETURNS"].includes(c.shortCode ?? ""))
            const virtualSubs = wh.children.filter((c) => ["SCRAP", "RETURNS"].includes(c.shortCode ?? ""))

            return (
              <div key={wh.id} className="bg-card border rounded-sm overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b bg-muted/20">
                  <Warehouse className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-base">{wh.name}</h2>
                      {wh.shortCode && (
                        <span className="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">{wh.shortCode}</span>
                      )}
                      {!wh.isActive && <Badge variant="destructive" className="text-xs">Inactivo</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{wh.children.length} sub-ubicaciones</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-xs text-muted-foreground flex items-center gap-1 px-2 py-1 rounded">
                      <Settings className="h-3.5 w-3.5" />
                      Demo — solo lectura
                    </span>
                  </div>
                </div>

                {/* Routes */}
                <div className="grid grid-cols-2 divide-x border-b">
                  <div className="px-5 py-3 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Entrada</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${STEP_COLORS[wh.inboundSteps]}`}>
                        {wh.inboundSteps} {wh.inboundSteps === 1 ? "paso" : "pasos"}
                      </span>
                    </div>
                    <RouteFlow steps={wh.inboundSteps} type="inbound" />
                  </div>
                  <div className="px-5 py-3 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Salida</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${STEP_COLORS[wh.outboundSteps]}`}>
                        {wh.outboundSteps} {wh.outboundSteps === 1 ? "paso" : "pasos"}
                      </span>
                    </div>
                    <RouteFlow steps={wh.outboundSteps} type="outbound" />
                  </div>
                </div>

                {/* Sub-locations */}
                <div className="px-5 py-4 space-y-3">
                  {mainSubs.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-2">Sub-ubicaciones operativas</p>
                      <div className="flex flex-wrap gap-2">
                        {mainSubs.map((child) => {
                          const style = SUBLOC_BADGE[child.shortCode ?? ""]
                          return (
                            <span
                              key={child.id}
                              className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded border ${style?.color ?? "bg-muted text-foreground"}`}
                            >
                              <span className="font-medium">{child.name.replace(`${wh.name}/`, "")}</span>
                              {child.shortCode && <span className="opacity-60 font-mono text-[10px]">{child.shortCode}</span>}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {virtualSubs.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-2">Ubicaciones virtuales</p>
                      <div className="flex flex-wrap gap-2">
                        {virtualSubs.map((child) => {
                          const style = SUBLOC_BADGE[child.shortCode ?? ""]
                          return (
                            <span key={child.id} className={`inline-flex items-center text-xs px-2.5 py-1.5 rounded border ${style?.color ?? "bg-muted text-foreground"}`}>
                              {child.name.replace(`${wh.name}/`, "")}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
