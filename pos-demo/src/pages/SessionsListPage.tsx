import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Plus, ShoppingBag, Clock, MonitorSpeaker, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useSettingsStore, formatPrice } from "@/stores/settings-store"
import { getSessions } from "@/api/pos"
import type { DemoSession } from "@/api/pos"

export function SessionsListPage() {
  const currency = useSettingsStore((s) => s.settings.currency)
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<DemoSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSessions().then((data) => {
      setSessions(data)
      if (data.length === 1) {
        navigate(`/sessions/${data[0].id}`, { replace: true })
      }
    }).finally(() => setLoading(false))
  }, [navigate])

  if (loading) {
    return <div className="py-16 text-center text-muted-foreground">Cargando...</div>
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Punto de Venta</h1>
          <p className="text-muted-foreground">Gestiona las sesiones de caja activas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/terminals">
              <MonitorSpeaker className="mr-2 h-4 w-4" />
              Terminales
            </Link>
          </Button>
          <Button asChild>
            <Link to="/sessions/new">
              <Plus className="mr-2 h-4 w-4" />
              Abrir Nueva Caja
            </Link>
          </Button>
        </div>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-4">
            <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <div>
              <p className="font-medium">No hay sesiones de caja abiertas</p>
              <p className="text-sm text-muted-foreground">
                Abre una nueva sesión para empezar a vender
              </p>
            </div>
            <Button asChild>
              <Link to="/sessions/new">
                <Plus className="mr-2 h-4 w-4" />
                Abrir Nueva Caja
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <Card key={session.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{session.pos.name}</CardTitle>
                  <Badge variant="default">Abierta</Badge>
                </div>
                <CardDescription className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {session.user.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {new Date(session.createdAt).toLocaleString("es-PE", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "short",
                  })}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Monto inicial</span>
                  <span className="font-medium">{formatPrice(Number(session.initialAmount), currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ventas</span>
                  <span className="font-medium">{session._count.orders} órdenes</span>
                </div>
                <Button className="w-full" asChild>
                  <Link to={`/sessions/${session.id}`}>Continuar</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
