import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Store, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getTerminals } from "@/api/pos"
import type { MockTerminal } from "@/data/mock"

export function TerminalsPage() {
  const [terminals, setTerminals] = useState<MockTerminal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTerminals().then(setTerminals).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Puntos de Venta</h1>
        <Button asChild size="sm">
          <Link to="/sessions/new">
            <Plus className="h-4 w-4 mr-1.5" />
            Abrir caja
          </Link>
        </Button>
      </div>

      {/* Demo banner */}
      <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">
        <span className="font-semibold">Demo:</span> Los terminales son datos de ejemplo pre-cargados.
      </div>

      <div className="bg-card border rounded-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
            Cargando...
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-muted-foreground text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-2 font-medium">Nombre</th>
                <th className="text-left px-4 py-2 font-medium">Detalles</th>
                <th className="text-center px-4 py-2 font-medium">Estado</th>
                <th className="text-right px-4 py-2 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {terminals.map((pos) => (
                <tr key={pos.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium">{pos.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-muted-foreground text-xs">
                    {pos.details ?? <span className="italic opacity-50">—</span>}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <Badge variant="default" className="text-xs">Activo</Badge>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                        <Link to="/sessions/new">Abrir caja</Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
