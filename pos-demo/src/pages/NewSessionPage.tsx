import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { usePOSStore } from "@/stores/pos-store"
import { getTerminals, createSession } from "@/api/pos"
import type { MockTerminal } from "@/data/mock"

const schema = z.object({
  posId: z.string().min(1, "Selecciona un terminal"),
  initialAmount: z.number().min(0, "El monto debe ser mayor o igual a 0"),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function NewSessionPage() {
  const navigate = useNavigate()
  const { setSession } = usePOSStore()
  const [terminals, setTerminals] = useState<MockTerminal[]>([])
  const [loadingTerminals, setLoadingTerminals] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  useEffect(() => {
    getTerminals()
      .then((data) => setTerminals(data.filter((t) => t.isActive)))
      .finally(() => setLoadingTerminals(false))
  }, [])

  const onSubmit = async (data: FormData) => {
    setError(null)
    try {
      const json = await createSession(data)
      const terminal = terminals.find((t) => t.id === data.posId)
      setSession({
        sessionId: json.id,
        posId: json.posId,
        posName: terminal?.name ?? json.pos?.name ?? "",
        posLocationId: json.pos?.locationId ?? null,
        openedAt: json.createdAt,
        initialAmount: data.initialAmount,
      })
      navigate(`/sessions/${json.id}`)
    } catch {
      setError("Error al abrir sesión")
    }
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Abrir Caja</h1>
          <p className="text-muted-foreground">Inicia una nueva sesión de venta</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Apertura de caja</CardTitle>
          <CardDescription>
            Ingresa el monto inicial en efectivo disponible en la caja.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Terminal *</Label>
              {loadingTerminals ? (
                <div className="h-10 animate-pulse rounded bg-muted" />
              ) : (
                <Select onValueChange={(v) => setValue("posId", v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un terminal activo" />
                  </SelectTrigger>
                  <SelectContent>
                    {terminals.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}{t.details ? ` — ${t.details}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.posId && <p className="text-sm text-destructive">{errors.posId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="initialAmount">Monto inicial en caja (S/) *</Label>
              <Input
                id="initialAmount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register("initialAmount", { valueAsNumber: true })}
              />
              {errors.initialAmount && <p className="text-sm text-destructive">{errors.initialAmount.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Nota (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Observaciones de apertura..."
                rows={2}
                {...register("notes")}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting || loadingTerminals}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Abrir caja
              </Button>
              <Button variant="outline" asChild>
                <Link to="/">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
