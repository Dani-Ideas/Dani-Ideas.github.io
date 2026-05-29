import { useEffect, useState } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { ArrowLeft, Loader2, AlertTriangle, CheckCircle } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { usePOSStore } from "@/stores/pos-store"
import { useSettingsStore, formatPrice } from "@/stores/settings-store"
import { getSession, closeSession } from "@/api/pos"
import type { DemoOrder } from "@/api/pos"

const schema = z.object({
  actualAmount: z.number().min(0, "El monto debe ser mayor o igual a 0"),
})
type FormData = z.infer<typeof schema>

interface SessionOrder extends DemoOrder {}

function netCashForOrder(o: SessionOrder): number {
  if (o.status === "CANCELLED") return 0
  const total = Number(o.total)
  if (o.notes) {
    try {
      const parsed = JSON.parse(o.notes) as {
        payment1?: { method: string; amount: number }
        payment2?: { method: string; amount: number }
      }
      if (parsed.payment1 && parsed.payment2) {
        if (parsed.payment1.method === "CASH") return Math.max(0, total - parsed.payment2.amount)
        if (parsed.payment2.method === "CASH") return Math.max(0, total - parsed.payment1.amount)
        return 0
      }
    } catch { /* not split */ }
  }
  return o.paymentMethod === "CASH" ? total : 0
}

export function CloseSessionPage() {
  const currency = useSettingsStore((s) => s.settings.currency)
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { clearSession } = usePOSStore()
  const [session, setSessionData] = useState<{
    id: string
    initialAmount: number
    status: string
    pos: { name: string }
    user: { name: string }
    createdAt: string
    orders: SessionOrder[]
  } | null>(null)
  const [loading, setLoading] = useState(true)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const actualAmount = watch("actualAmount") ?? 0

  useEffect(() => {
    if (!id) return
    getSession(id)
      .then((data) => {
        if (data) setSessionData(data as typeof session)
      })
      .finally(() => setLoading(false))
  }, [id])

  const cashSales = session ? session.orders.reduce((sum, o) => sum + netCashForOrder(o), 0) : 0
  const expectedAmount = session ? Number(session.initialAmount) + cashSales : 0
  const difference = actualAmount - expectedAmount

  const onSubmit = async (data: FormData) => {
    if (!id) return
    await closeSession(id, data.actualAmount)
    clearSession()
    navigate("/terminals")
  }

  if (loading) {
    return <div className="py-16 text-center text-muted-foreground">Cargando...</div>
  }

  if (!session) {
    return <div className="py-16 text-center text-destructive">Sesión no encontrada</div>
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/sessions/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al POS
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cierre de Caja</h1>
          <p className="text-muted-foreground">{session.pos.name}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumen de la sesión</CardTitle>
          <CardDescription>
            Operador: {session.user.name} — Apertura:{" "}
            {new Date(session.createdAt).toLocaleString("es-PE")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Monto inicial</span>
            <span>{formatPrice(Number(session.initialAmount), currency)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Efectivo neto en ventas</span>
            <span>+ {formatPrice(cashSales, currency)}</span>
          </div>
          <div className="flex justify-between font-medium border-t pt-2">
            <span>Monto esperado</span>
            <span>{formatPrice(expectedAmount, currency)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conteo de caja</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="actualAmount">Monto real en caja (S/) *</Label>
              <Input
                id="actualAmount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register("actualAmount", { valueAsNumber: true })}
              />
              {errors.actualAmount && (
                <p className="text-sm text-destructive">{errors.actualAmount.message}</p>
              )}
            </div>

            {!isNaN(actualAmount) && actualAmount >= 0 && (
              <div
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                  difference === 0
                    ? "bg-green-100 text-green-700"
                    : Math.abs(difference) < 10
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                )}
              >
                {difference === 0 ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                <span>
                  Diferencia:{" "}
                  {difference >= 0 ? "+" : ""}
                  {formatPrice(difference, currency)}
                  {difference !== 0 && " — se registraría en auditoría"}
                </span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting} variant="destructive">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Cerrar caja
              </Button>
              <Button variant="outline" asChild>
                <Link to={`/sessions/${id}`}>Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
