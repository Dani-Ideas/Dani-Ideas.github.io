import { useCallback, useEffect, useState } from "react"
import { History, Loader2, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useSettingsStore, formatPrice } from "@/stores/settings-store"
import { getSession } from "@/api/pos"
import type { DemoOrder } from "@/api/pos"

const PAYMENT_LABELS: Record<string, string> = {
  CASH: "Efectivo",
  TRANSFER: "Transferencia",
  MERCADO_PAGO_POINT: "Mercado Pago",
  CARD: "Tarjeta",
}

interface POSSalesHistoryProps {
  sessionId: string
}

export function POSSalesHistory({ sessionId }: POSSalesHistoryProps) {
  const currency = useSettingsStore((s) => s.settings.currency)
  const [open, setOpen] = useState(false)
  const [orders, setOrders] = useState<DemoOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getSession(sessionId)
      if (!data) return
      const raw = data.orders ?? []
      setOrders(raw)
      setExpandedOrders(new Set(raw.filter((o) => o.status !== "CANCELLED").map((o) => o.id)))
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const activeCount = orders.filter((o) => o.status !== "CANCELLED").length

  const toggleExpand = (orderId: string) => {
    setExpandedOrders((prev) => {
      const next = new Set(prev)
      next.has(orderId) ? next.delete(orderId) : next.add(orderId)
      return next
    })
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        disabled={activeCount === 0}
        onClick={() => {
          setOpen(true)
          fetchOrders()
        }}
        className="relative"
      >
        <History className="h-4 w-4 mr-1" />
        Historial
        {activeCount > 0 && (
          <Badge className="ml-1 h-4 px-1 text-[10px] leading-none">{activeCount}</Badge>
        )}
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full max-w-lg flex flex-col p-0">
          <SheetHeader className="px-4 pt-4 pb-3 border-b shrink-0">
            <SheetTitle className="text-base">Historial de ventas — sesión actual</SheetTitle>
            <p className="text-xs text-muted-foreground">
              Ventas realizadas en esta sesión de caja.
            </p>
          </SheetHeader>

          {/* Demo notice */}
          <div className="mx-4 mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            <span className="font-semibold">Modo Demo:</span> Las correcciones de error no están disponibles en la demo.
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {loading && (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}

            {!loading && orders.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">
                No hay ventas en esta sesión
              </p>
            )}

            {orders.map((order) => {
              const isExpanded = expandedOrders.has(order.id)
              const isCancelled = order.status === "CANCELLED"

              return (
                <div key={order.id} className={`border rounded-sm text-sm ${isCancelled ? "opacity-50" : ""}`}>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted/30 transition-colors"
                    onClick={() => toggleExpand(order.id)}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono font-medium text-xs">{order.orderNumber}</span>
                      {isCancelled && (
                        <Badge variant="secondary" className="text-[10px] px-1 py-0">Anulado</Badge>
                      )}
                      <span className="text-muted-foreground text-xs">
                        {new Date(order.createdAt).toLocaleTimeString("es-PE", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-semibold">{formatPrice(order.total, currency)}</span>
                      <span className="text-muted-foreground text-xs">
                        {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
                      </span>
                      {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t px-3 pb-3 space-y-2">
                      <div className="divide-y mt-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between py-1.5 gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium truncate">{item.name}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{formatPrice(item.price, currency)}</span>
                                {item.quantity > 1 && <span>×{item.quantity}</span>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
