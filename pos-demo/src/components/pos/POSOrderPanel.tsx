import { useState, useMemo } from "react"
import {
  Trash2,
  Loader2,
  CreditCard,
  Banknote,
  Smartphone,
  Building,
  ChevronRight,
  Check,
} from "lucide-react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { POSCustomerSelector } from "./POSCustomerSelector"
import { POSNumpad } from "./POSNumpad"
import type { POSOrder, POSCustomer, POSOrderItem } from "@/stores/pos-store"
import { useSettingsStore, formatPrice } from "@/stores/settings-store"
import { getAvailableItems } from "@/api/pos"

interface POSOrderPanelProps {
  order: POSOrder
  total: number
  onRemoveItem: (qrCode: string) => void
  onAddItem: (item: POSOrderItem) => boolean | void
  onSetCustomer: (customer: POSCustomer | undefined) => void
  onSetPaymentMethod?: (method: POSOrder["paymentMethod"], ref?: string) => void
  onCheckout?: () => void
}

const PAYMENT_METHODS: Array<{
  value: NonNullable<POSOrder["paymentMethod"]>
  label: string
  icon: React.ReactNode
}> = [
  { value: "CASH", label: "Efectivo", icon: <Banknote className="h-5 w-5" /> },
  { value: "TRANSFER", label: "Transferencia", icon: <Building className="h-5 w-5" /> },
  { value: "MERCADO_PAGO_POINT", label: "MP Point", icon: <Smartphone className="h-5 w-5" /> },
  { value: "CARD", label: "Tarjeta", icon: <CreditCard className="h-5 w-5" /> },
]

function groupItems(items: POSOrderItem[]) {
  const map = new Map<string, { items: POSOrderItem[]; representative: POSOrderItem }>()
  for (const item of items) {
    if (!map.has(item.productId)) {
      map.set(item.productId, { items: [], representative: item })
    }
    map.get(item.productId)!.items.push(item)
  }
  return Array.from(map.values())
}

export function POSOrderPanel({
  order,
  total,
  onRemoveItem,
  onAddItem,
  onSetCustomer,
  onCheckout,
}: POSOrderPanelProps) {
  const [view, setView] = useState<"numpad" | "checkout">("numpad")
  const [numpadValue, setNumpadValue] = useState("0")
  const [qtyProductId, setQtyProductId] = useState<string | null>(null)
  const [qtyLoading, setQtyLoading] = useState(false)
  const currency = useSettingsStore((s) => s.settings.currency)

  const grouped = useMemo(() => groupItems(order.items), [order.items])

  const enterQtyMode = (productId: string, currentCount: number) => {
    setQtyProductId(productId)
    setNumpadValue(String(currentCount))
  }

  const exitQtyMode = () => {
    setQtyProductId(null)
    setNumpadValue("0")
  }

  const confirmQty = async () => {
    if (!qtyProductId) return
    const group = grouped.find((g) => g.representative.productId === qtyProductId)
    if (!group) return
    const current = group.items.length
    const desired = parseInt(numpadValue) || 0

    if (desired === current) { exitQtyMode(); return }

    if (desired < current) {
      const toRemove = group.items.slice(desired)
      for (const item of toRemove) onRemoveItem(item.qrCode)
      exitQtyMode()
      return
    }

    const toAdd = desired - current
    setQtyLoading(true)
    try {
      const available = await getAvailableItems(qtyProductId)
      const isLotProduct = available[0]?.isLot === true
      const alreadyInOrder = new Set(group.items.map((i) => i.qrCode))
      const fresh = isLotProduct
        ? available
        : available.filter((a) => !alreadyInOrder.has(a.qrCode))

      const addCount = Math.min(toAdd, fresh.length)
      for (let i = 0; i < addCount; i++) {
        const unit = fresh[i]
        const qrCode = isLotProduct
          ? `LOT:${unit.id}:${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
          : unit.qrCode
        onAddItem({
          productId: qtyProductId,
          productItemId: unit.id,
          qrCode,
          name: group.representative.name,
          price: group.representative.price,
          image: group.representative.image,
        })
      }
    } catch { /* silently fail */ } finally {
      setQtyLoading(false)
      exitQtyMode()
    }
  }

  const cashAmount = parseFloat(numpadValue) || 0
  const change = order.paymentMethod === "CASH" ? cashAmount - total : 0

  return (
    <div className="flex flex-col h-full">
      {/* Items list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 min-h-0">
        {grouped.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Agrega productos escaneando un QR o buscando
          </div>
        ) : (
          grouped.map(({ representative: rep, items: groupItems }) => {
            const qty = groupItems.length
            const subtotal = rep.price * qty
            const isEditingQty = qtyProductId === rep.productId

            return (
              <div
                key={rep.productId}
                className={cn(
                  "rounded-md border p-2 text-sm transition-colors",
                  isEditingQty && "border-primary bg-primary/5"
                )}
              >
                <div className="flex items-center gap-2">
                  {rep.image ? (
                    <img src={rep.image} alt={rep.name} className="h-9 w-9 rounded object-cover flex-shrink-0" />
                  ) : (
                    <div className="h-9 w-9 rounded bg-muted flex-shrink-0" />
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-xs leading-tight">{rep.name}</p>
                    <p className="text-xs text-muted-foreground">{formatPrice(Number(rep.price), currency)} c/u</p>
                  </div>

                  <button
                    onClick={() => isEditingQty ? exitQtyMode() : enterQtyMode(rep.productId, qty)}
                    className={cn(
                      "flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-bold transition-colors",
                      isEditingQty
                        ? "border-primary bg-primary text-primary-foreground"
                        : "hover:border-primary hover:text-primary"
                    )}
                    title="Cambiar cantidad"
                  >
                    ×{qty}
                  </button>

                  <span className="font-semibold text-xs flex-shrink-0 w-14 text-right">
                    {formatPrice(subtotal, currency)}
                  </span>

                  <button
                    className="text-muted-foreground hover:text-destructive flex-shrink-0"
                    onClick={() => {
                      if (isEditingQty) exitQtyMode()
                      groupItems.forEach((i) => onRemoveItem(i.qrCode))
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Customer */}
      <div className="px-3 pb-2 border-t pt-2">
        <POSCustomerSelector customer={order.customer} onChange={onSetCustomer} />
      </div>

      {/* Bottom: numpad */}
      {view === "numpad" ? (
        <div className="border-t p-3">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-xs text-muted-foreground">
              {order.items.length} {order.items.length === 1 ? "producto" : "productos"}
            </span>
            <span className="text-lg font-bold">{formatPrice(total, currency)}</span>
          </div>

          <div className="flex gap-2 items-stretch">
            {qtyProductId ? (
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex-1 flex items-center justify-center rounded-xl border-2 border-primary bg-primary/5 font-mono text-3xl font-bold text-primary min-h-[3.5rem]">
                  {numpadValue}
                </div>
                <button
                  onClick={confirmQty}
                  disabled={qtyLoading || parseInt(numpadValue) < 0}
                  className={cn(
                    "rounded-xl py-2 text-sm font-bold transition-colors flex items-center justify-center gap-1",
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                    "disabled:opacity-40 disabled:cursor-not-allowed"
                  )}
                >
                  {qtyLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  Confirmar
                </button>
              </div>
            ) : (
              <button
                onClick={() => onCheckout ? onCheckout() : setView("checkout")}
                disabled={order.items.length === 0}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center rounded-xl border-2 gap-1 transition-colors select-none",
                  "disabled:opacity-40 disabled:cursor-not-allowed",
                  "border-primary bg-primary/5 hover:bg-primary/10 active:bg-primary/20",
                  "text-primary font-bold"
                )}
              >
                <ChevronRight className="h-8 w-8" />
                <span className="text-sm tracking-wide">PAGAR</span>
              </button>
            )}

            <div className="flex-1">
              <POSNumpad
                value={numpadValue}
                onChange={(v) => {
                  if (qtyProductId && v.includes(".")) return
                  setNumpadValue(v)
                }}
              />
              {!qtyProductId && order.paymentMethod === "CASH" && cashAmount > 0 && (
                <div className={cn(
                  "mt-1.5 text-center text-xs font-medium rounded px-2 py-0.5",
                  change >= 0 ? "text-green-700 bg-green-50" : "text-destructive bg-destructive/10"
                )}>
                  {change >= 0 ? `Cambio: ${formatPrice(change, currency)}` : `Faltan: ${formatPrice(Math.abs(change), currency)}`}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Checkout view */
        <div className="border-t flex flex-col overflow-hidden" style={{ maxHeight: "55%" }}>
          <div className="flex items-center gap-2 px-3 pt-2 pb-1.5 border-b flex-shrink-0">
            <button onClick={() => setView("numpad")} className="text-muted-foreground hover:text-foreground text-sm">
              ←
            </button>
            <span className="text-sm font-semibold flex-1">Confirmar pago</span>
            <span className="text-lg font-bold">{formatPrice(total, currency)}</span>
          </div>

          <div className="overflow-y-auto flex-1 p-3 space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Método de pago</Label>
              <div className="grid grid-cols-2 gap-1.5">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.value}
                    type="button"
                    className={cn(
                      "flex items-center gap-2 rounded-md border px-3 py-2.5 text-sm transition-colors",
                      order.paymentMethod === method.value
                        ? "border-primary bg-primary/5 text-primary font-medium"
                        : "hover:bg-muted"
                    )}
                    onClick={() => {}}
                  >
                    {method.icon}
                    {method.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="px-3 pb-3 pt-1 flex-shrink-0">
            <button
              onClick={() => onCheckout?.()}
              disabled={order.items.length === 0}
              className={cn(
                "w-full rounded-lg py-3 text-sm font-bold transition-colors",
                "bg-primary text-primary-foreground hover:bg-primary/90",
                "disabled:opacity-40 disabled:cursor-not-allowed"
              )}
            >
              Ir al pago completo
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
