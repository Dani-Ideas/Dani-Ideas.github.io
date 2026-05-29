import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Loader2, Package } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getReceptions } from "@/api/sgi"
import type { MockReception } from "@/data/mock"

const STATUS_LABEL: Record<MockReception["status"], string> = {
  DRAFT: "Borrador", IN_PROGRESS: "En proceso", DONE: "Hecho", CANCELLED: "Cancelado",
}
const STATUS_VARIANT: Record<MockReception["status"], "secondary" | "outline" | "default" | "destructive"> = {
  DRAFT: "secondary", IN_PROGRESS: "outline", DONE: "default", CANCELLED: "destructive",
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es", { day: "2-digit", month: "2-digit", year: "numeric" })
}

export function RecepcionesPage() {
  const [receptions, setReceptions] = useState<MockReception[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getReceptions().then(setReceptions).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Recepciones</h1>
        <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded">
          Demo — no se pueden crear recepciones nuevas
        </span>
      </div>

      <div className="bg-card border rounded-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : receptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
            <Package className="h-8 w-8 opacity-30" />
            <p className="text-sm">No hay recepciones registradas</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-muted-foreground text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-2 font-medium">Referencia</th>
                <th className="text-left px-4 py-2 font-medium">Productos</th>
                <th className="text-left px-4 py-2 font-medium">Destino</th>
                <th className="text-left px-4 py-2 font-medium">Fecha</th>
                <th className="text-right px-4 py-2 font-medium">Unidades</th>
                <th className="text-center px-4 py-2 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {receptions.map((rec) => {
                const totalUnits = rec.lines.reduce((s, l) => s + l.quantity, 0)
                return (
                  <tr key={rec.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2">
                      <Link to={`/recepciones/${rec.id}`} className="font-medium text-primary hover:underline">
                        {rec.reference}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-muted-foreground max-w-[240px] truncate">
                      {rec.lines.length === 1 ? rec.lines[0].product.name : `${rec.lines.length} productos`}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {rec.destinationLocation?.name ?? <span className="text-muted-foreground/50 italic">Sin destino</span>}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">{formatDate(rec.createdAt)}</td>
                    <td className="px-4 py-2 text-right">{totalUnits}</td>
                    <td className="px-4 py-2 text-center">
                      <Badge variant={STATUS_VARIANT[rec.status]}>{STATUS_LABEL[rec.status]}</Badge>
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
