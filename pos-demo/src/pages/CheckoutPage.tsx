import { useState, useMemo, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  Banknote,
  Building,
  Smartphone,
  CreditCard,
  X,
  Loader2,
  Delete,
  Check,
  ArrowLeft,
  Printer,
  Monitor,
  User,
  Plus,
} from "lucide-react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { usePOSStore } from "@/stores/pos-store"
import { useSettingsStore, formatPrice } from "@/stores/settings-store"
import { createOrder } from "@/api/pos"
import QRCode from "qrcode"

type PaymentMethodValue = "CASH" | "TRANSFER" | "MERCADO_PAGO_POINT" | "CARD"
type Step = "first" | "second" | "ticket"

interface ConfirmedOrder {
  id: string
  orderNumber: string
  total: number
  sellerName: string
  createdAt: string
}

const METHODS: Array<{
  value: PaymentMethodValue
  label: string
  Icon: React.ComponentType<{ className?: string }>
}> = [
  { value: "CASH", label: "Efectivo", Icon: Banknote },
  { value: "TRANSFER", label: "Transferencia", Icon: Building },
  { value: "MERCADO_PAGO_POINT", label: "MP Point", Icon: Smartphone },
  { value: "CARD", label: "Tarjeta", Icon: CreditCard },
]

const METHOD_LABEL: Record<PaymentMethodValue, string> = {
  CASH: "Efectivo",
  TRANSFER: "Transferencia",
  MERCADO_PAGO_POINT: "MP Point",
  CARD: "Tarjeta",
}

const NUMPAD_ROWS = [
  ["1", "2", "3", "+10"],
  ["4", "5", "6", "+20"],
  ["7", "8", "9", "+50"],
  ["+/-", "0", ".", "⌫"],
]

function PaymentNumpad({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const handle = (key: string) => {
    if (key === "⌫") { onChange(value.slice(0, -1) || "0"); return }
    if (key === "+/-") { onChange("0"); return }
    if (key.startsWith("+")) {
      const add = parseFloat(key)
      if (!isNaN(add)) onChange(((parseFloat(value) || 0) + add).toFixed(2))
      return
    }
    if (key === ".") { if (!value.includes(".")) onChange(value + "."); return }
    const next = value === "0" ? key : value + key
    const parts = next.split(".")
    if (parts[0].length > 6 || (parts[1] && parts[1].length > 2)) return
    onChange(next)
  }

  return (
    <div className="grid gap-1.5">
      {NUMPAD_ROWS.map((row, ri) => (
        <div key={ri} className="grid grid-cols-4 gap-1.5">
          {row.map((key) => {
            const isShortcut = key.startsWith("+") && key !== "+/-"
            const isDel = key === "⌫"
            return (
              <button
                key={key}
                type="button"
                onClick={() => handle(key)}
                className={cn(
                  "flex items-center justify-center h-12 rounded-lg border font-medium text-sm transition-colors select-none active:scale-95",
                  "bg-card hover:bg-muted",
                  isShortcut && "bg-muted/50 text-primary border-primary/30 font-bold",
                  isDel && "text-destructive hover:bg-destructive/10"
                )}
              >
                {isDel ? <Delete className="h-4 w-4" /> : key}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

function groupItems(items: Array<{ productId: string; name: string; price: number }>) {
  const map = new Map<string, { name: string; price: number; qty: number }>()
  for (const item of items) {
    if (!map.has(item.productId)) map.set(item.productId, { name: item.name, price: item.price, qty: 0 })
    map.get(item.productId)!.qty++
  }
  return Array.from(map.values())
}

export function CheckoutPage() {
  const currency = useSettingsStore((s) => s.settings.currency)
  const storeName = useSettingsStore((s) => s.settings.storeName)
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    activeSession,
    getActiveOrder,
    getOrderTotal,
    removeOrder,
    addOrder,
    orders,
    setPaymentMethod,
  } = usePOSStore()

  const order = getActiveOrder()
  const total = order ? getOrderTotal(order.id) : 0
  const grouped = useMemo(() => (order ? groupItems(order.items) : []), [order])

  const [step, setStep] = useState<Step>("first")
  const [method1, setMethod1] = useState<PaymentMethodValue | null>(order?.paymentMethod ?? null)
  const [amount1, setAmount1] = useState(total > 0 ? total.toFixed(2) : "0")
  const [ref1, setRef1] = useState(order?.paymentRef ?? "")
  const [method2, setMethod2] = useState<PaymentMethodValue | null>(null)
  const [amount2, setAmount2] = useState("0")
  const [ref2, setRef2] = useState("")
  const [confirming, setConfirming] = useState(false)
  const [saleError, setSaleError] = useState<string | null>(null)
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrder | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState("")

  const num1 = parseFloat(amount1) || 0
  const num2 = parseFloat(amount2) || 0
  const def1 = METHODS.find((m) => m.value === method1)
  const def2 = METHODS.find((m) => m.value === method2)
  const remaining = Math.max(0, total - num1)
  const totalPaid = step === "second" ? num1 + num2 : num1
  const change = Math.max(0, totalPaid - total)

  const isMethod1Ready = !!method1 && num1 > 0
  const canValidateSingle = isMethod1Ready && num1 >= total && method1 !== "MERCADO_PAGO_POINT"
  const showAddSecond = isMethod1Ready && num1 < total && method1 !== "MERCADO_PAGO_POINT"
  const canValidateSplit = !!method2 && num2 > 0 && num1 + num2 >= total && method2 !== "MERCADO_PAGO_POINT"
  const canConfirm = !confirming && (step === "first" ? canValidateSingle : canValidateSplit)

  useEffect(() => {
    if (step !== "ticket" || !confirmedOrder) return
    QRCode.toDataURL(confirmedOrder.orderNumber, { width: 180, margin: 1, errorCorrectionLevel: "M" })
      .then(setQrDataUrl)
      .catch(console.error)
  }, [step, confirmedOrder])

  const handleSelectMethod1 = (value: PaymentMethodValue) => {
    setMethod1(value)
    setPaymentMethod(order!.id, value, undefined)
    setAmount1(total.toFixed(2))
    setSaleError(null)
  }

  const handleSelectMethod2 = (value: PaymentMethodValue) => {
    setMethod2(value)
    setSaleError(null)
  }

  const handleAddSecondPayment = () => {
    setAmount2(remaining.toFixed(2))
    setStep("second")
    setSaleError(null)
  }

  const handleCancelSecond = () => {
    setStep("first")
    setMethod2(null)
    setAmount2("0")
    setRef2("")
    setSaleError(null)
  }

  const handleRemoveMethod = () => {
    if (step === "first") {
      setMethod1(null)
      setAmount1(total.toFixed(2))
      setRef1("")
    } else {
      setMethod2(null)
      setAmount2(remaining.toFixed(2))
      setRef2("")
    }
  }

  const handleConfirm = async () => {
    if (!order || !activeSession || !method1) return
    setSaleError(null)
    setConfirming(true)
    try {
      const body = {
        cashSessionId: activeSession.sessionId,
        items: order.items,
        paymentMethod: method1,
        paymentAmount: num1,
        paymentRef: ref1 || undefined,
        posCustomer: order.customer ? { name: order.customer.name ?? "" } : undefined,
        ...(method2 ? { splitPayment: { method: method2, amount: num2, ref: ref2 || undefined } } : {}),
      }
      const data = await createOrder(body)
      setConfirmedOrder(data)
      setStep("ticket")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al procesar la venta"
      setSaleError(message)
    } finally {
      setConfirming(false)
    }
  }

  const handleNewOrder = () => {
    if (!order) return
    removeOrder(order.id)
    if (orders.length <= 1) addOrder()
    navigate(`/sessions/${id}`)
  }

  const printTicket = () => {
    if (!confirmedOrder || !order || !activeSession) return
    const win = window.open("", "_blank", "width=430,height=700")
    if (!win) return

    const fmt = (iso: string) =>
      new Date(iso).toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" })
    const fp = (n: number) => formatPrice(n, currency)

    const itemRows = grouped
      .map((g) => `<tr><td>${g.name}</td><td style="text-align:center">${g.qty}</td><td style="text-align:right">${fp(g.price)}</td><td style="text-align:right">${fp(g.price * g.qty)}</td></tr>`)
      .join("")

    const payRows = method2
      ? `<tr><td>· ${METHOD_LABEL[method1!]}${ref1 ? ` (${ref1})` : ""}</td><td style="text-align:right">${fp(num1)}</td></tr>
         <tr><td>· ${METHOD_LABEL[method2]}${ref2 ? ` (${ref2})` : ""}</td><td style="text-align:right">${fp(num2)}</td></tr>`
      : `<tr><td>· ${METHOD_LABEL[method1!]}${ref1 ? ` (${ref1})` : ""}</td><td style="text-align:right">${fp(num1)}</td></tr>`

    const changeRow = change > 0
      ? `<tr style="font-weight:bold;color:#16a34a"><td>Cambio</td><td style="text-align:right">${fp(change)}</td></tr>`
      : ""

    const qrImg = qrDataUrl
      ? `<div style="text-align:center;margin:12px 0"><img src="${qrDataUrl}" width="140" height="140" alt="QR"/></div>`
      : ""

    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Ticket ${confirmedOrder.orderNumber}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Courier New',monospace;font-size:12px;padding:20px;max-width:320px}
    h2{text-align:center;font-size:16px;margin-bottom:2px}
    .sub{text-align:center;font-size:11px;color:#555;margin:1px 0}
    .sep{border-top:1px dashed #999;margin:8px 0}
    table{width:100%;border-collapse:collapse}
    th{font-size:10px;color:#666;text-align:left;border-bottom:1px solid #ddd;padding:2px 0}
    th:last-child,td:last-child{text-align:right}
    td{padding:2px 0;font-size:11px}
    .total-row td{font-weight:bold;font-size:13px;border-top:1px solid #999;padding-top:4px}
    .footer{text-align:center;font-size:10px;color:#888;margin-top:10px}
    .demo-badge{text-align:center;font-size:9px;color:#aaa;margin-top:4px;letter-spacing:1px}
  </style>
</head>
<body>
  <h2>${storeName}</h2>
  <p class="sub">Terminal: ${activeSession.posName}</p>
  <p class="sub">${confirmedOrder.orderNumber} · ${fmt(confirmedOrder.createdAt)}</p>
  <div class="sep"></div>
  <table>
    <thead><tr><th>Producto</th><th style="text-align:center">Qty</th><th style="text-align:right">P.Unit</th><th style="text-align:right">Total</th></tr></thead>
    <tbody>
      ${itemRows}
      <tr class="total-row"><td colspan="3">SUBTOTAL</td><td style="text-align:right">${fp(total)}</td></tr>
    </tbody>
  </table>
  <div class="sep"></div>
  <table><tbody>${payRows}${changeRow}</tbody></table>
  <div class="sep"></div>
  <table>
    <tbody>
      <tr><td style="color:#555">Cliente</td><td style="text-align:right">${order.customer?.name ?? "Sin cliente"}</td></tr>
      <tr><td style="color:#555">Atendió</td><td style="text-align:right">${confirmedOrder.sellerName}</td></tr>
    </tbody>
  </table>
  <div class="sep"></div>
  ${qrImg}
  <p class="footer">¡Gracias por su compra!</p>
  <p class="demo-badge">— DEMO —</p>
</body>
</html>`)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 600)
  }

  if (!order || !activeSession) {
    navigate(`/sessions/${id}`, { replace: true })
    return null
  }

  // ── Ticket screen ────────────────────────────────────────────────────────────
  if (step === "ticket" && confirmedOrder) {
    const fmt = (iso: string) =>
      new Date(iso).toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" })

    return (
      <div className="flex flex-col min-h-screen bg-background">
        <header className="flex items-center justify-between border-b px-6 py-3 bg-card flex-shrink-0">
          <button onClick={handleNewOrder} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Nueva orden
          </button>
          <h1 className="text-base font-semibold">Venta completada</h1>
          <button onClick={printTicket} className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors font-medium">
            <Printer className="h-4 w-4" />
            Imprimir
          </button>
        </header>

        <div className="flex-1 overflow-y-auto flex items-start justify-center p-6">
          <div className="w-full max-w-sm bg-card border rounded-xl shadow-sm overflow-hidden">
            <div className="bg-primary/5 border-b px-5 py-4 text-center">
              <p className="font-bold text-base">{storeName}</p>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-0.5">
                <Monitor className="h-3 w-3" />
                {activeSession.posName}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {confirmedOrder.orderNumber} · {fmt(confirmedOrder.createdAt)}
              </p>
            </div>

            <div className="px-5 py-3 border-b">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-muted-foreground">
                    <th className="text-left pb-1.5 font-medium border-b">Producto</th>
                    <th className="text-center pb-1.5 font-medium border-b w-8">Qty</th>
                    <th className="text-right pb-1.5 font-medium border-b">P.Unit</th>
                    <th className="text-right pb-1.5 font-medium border-b">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {grouped.map((g, i) => (
                    <tr key={i}>
                      <td className="py-1 pr-2 max-w-[120px] truncate">{g.name}</td>
                      <td className="py-1 text-center">{g.qty}</td>
                      <td className="py-1 text-right font-mono">{formatPrice(g.price, currency)}</td>
                      <td className="py-1 text-right font-mono font-medium">{formatPrice(g.price * g.qty, currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-between text-sm font-bold border-t mt-2 pt-2">
                <span>SUBTOTAL</span>
                <span className="font-mono">{formatPrice(total, currency)}</span>
              </div>
            </div>

            <div className="px-5 py-3 border-b">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mb-2">Pago</p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{METHOD_LABEL[method1!]}{ref1 && <span className="text-xs ml-1">({ref1})</span>}</span>
                  <span className="font-mono">{formatPrice(num1, currency)}</span>
                </div>
                {method2 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{METHOD_LABEL[method2]}{ref2 && <span className="text-xs ml-1">({ref2})</span>}</span>
                    <span className="font-mono">{formatPrice(num2, currency)}</span>
                  </div>
                )}
                {change > 0 && (
                  <div className="flex justify-between text-sm font-semibold text-green-600 border-t pt-1.5">
                    <span>Cambio</span>
                    <span className="font-mono">{formatPrice(change, currency)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="px-5 py-3 border-b space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" />Cliente</span>
                <span>{order.customer?.name ?? "Sin cliente"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Atendió</span>
                <span>{confirmedOrder.sellerName}</span>
              </div>
            </div>

            <div className="px-5 py-4 border-b flex flex-col items-center gap-2">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Código QR del ticket</p>
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR Ticket" className="w-36 h-36" />
              ) : (
                <div className="w-36 h-36 border rounded-lg flex items-center justify-center bg-muted/30">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="px-5 py-4 flex gap-3">
              <button onClick={printTicket} className="flex-1 flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium hover:bg-muted transition-colors">
                <Printer className="h-4 w-4" />
                Generar PDF
              </button>
              <button onClick={handleNewOrder} className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors">
                <Check className="h-4 w-4" />
                Nueva orden
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Payment screen ───────────────────────────────────────────────────────────
  const activeMethod = step === "first" ? method1 : method2
  const activeDef = step === "first" ? def1 : def2
  const activeAmount = step === "first" ? amount1 : amount2

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between border-b px-6 py-3 bg-card flex-shrink-0">
        <button
          onClick={step === "second" ? handleCancelSecond : () => navigate(`/sessions/${id}`)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {step === "second" ? "Cancelar 2do pago" : "Volver"}
        </button>

        <h1 className="text-base font-semibold">{step === "second" ? "2do método de pago" : "Pago"}</h1>

        {activeMethod === "MERCADO_PAGO_POINT" ? (
          <div className="w-24" />
        ) : step === "first" && showAddSecond ? (
          <button
            onClick={handleAddSecondPayment}
            disabled={!isMethod1Ready}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
              "bg-secondary text-secondary-foreground hover:bg-secondary/80",
              "disabled:opacity-40 disabled:cursor-not-allowed"
            )}
          >
            <Plus className="h-4 w-4" />
            Agregar 2do pago
          </button>
        ) : (
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
              "bg-primary text-primary-foreground hover:bg-primary/90",
              "disabled:opacity-40 disabled:cursor-not-allowed"
            )}
          >
            {confirming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Validar ›
          </button>
        )}
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: method selection */}
        <aside className="w-[280px] flex flex-col border-r overflow-hidden flex-shrink-0">
          {step === "second" && (
            <div className="p-4 border-b bg-muted/20">
              <p className="text-[10px] text-muted-foreground mb-2 font-medium uppercase tracking-wide">Pago 1 (confirmado)</p>
              <div className="flex items-center gap-3 rounded-lg border bg-muted/50 px-3 py-2 opacity-60">
                {def1 && <def1.Icon className="h-4 w-4 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{METHOD_LABEL[method1!]}</p>
                  {ref1 && <p className="text-xs text-muted-foreground truncate">{ref1}</p>}
                </div>
                <span className="text-sm font-mono font-semibold shrink-0">{formatPrice(num1, currency)}</span>
              </div>
              <div className="mt-2 flex justify-between text-xs">
                <span className="text-muted-foreground">Restante a cobrar</span>
                <span className="font-semibold text-primary">{formatPrice(remaining, currency)}</span>
              </div>
            </div>
          )}

          <div className="p-4 border-b">
            <p className="text-[10px] text-muted-foreground mb-2 font-medium uppercase tracking-wide">
              {step === "second" ? "Método 2 seleccionado" : "Método seleccionado"}
            </p>
            {activeMethod ? (
              <div className="flex items-center gap-3 rounded-lg border border-primary bg-primary/5 px-3 py-2.5">
                {activeDef && <activeDef.Icon className="h-4 w-4 shrink-0 text-primary" />}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{METHOD_LABEL[activeMethod]}</p>
                  <p className="text-xs text-muted-foreground">{formatPrice(parseFloat(activeAmount), currency)}</p>
                </div>
                <button onClick={handleRemoveMethod} className="text-muted-foreground hover:text-destructive transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed px-3 py-2.5 text-xs text-muted-foreground text-center">
                Selecciona un método abajo
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <p className="text-[10px] text-muted-foreground mb-2 font-medium uppercase tracking-wide">Métodos disponibles</p>
            <div className="space-y-1.5">
              {METHODS
                .filter((m) => step !== "second" || m.value !== method1)
                .map((m) => {
                  const isActive = activeMethod === m.value
                  return (
                    <button
                      key={m.value}
                      onClick={() => step === "first" ? handleSelectMethod1(m.value) : handleSelectMethod2(m.value)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors",
                        isActive ? "border-primary bg-primary/5 text-primary font-semibold" : "hover:bg-muted"
                      )}
                    >
                      <m.Icon className="h-4 w-4 shrink-0" />
                      {m.label}
                    </button>
                  )
                })}
            </div>
          </div>

          <div className="border-t p-4 space-y-1 overflow-y-auto max-h-44">
            <p className="text-[10px] text-muted-foreground mb-1.5 font-medium uppercase tracking-wide">
              Artículos ({order.items.length})
            </p>
            {grouped.map((g, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="truncate flex-1 mr-2 text-muted-foreground">{g.name} ×{g.qty}</span>
                <span className="font-medium shrink-0">{formatPrice(g.price * g.qty, currency)}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* RIGHT: numpad or MP demo blocked */}
        <section className="flex-1 flex flex-col p-6 gap-4 overflow-hidden">
          <div className="rounded-xl border bg-card px-5 py-4 flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                {step === "second" ? "Monto del 2do pago" : "Monto del cliente"}
              </span>
              <span className="text-xs text-muted-foreground">Total: {formatPrice(total, currency)}</span>
            </div>
            <div className="text-right font-mono font-bold text-3xl tracking-tight">
              {formatPrice(parseFloat(activeAmount) || 0, currency)}
            </div>
          </div>

          <div className="rounded-xl border bg-card px-4 py-3 space-y-1.5 text-sm flex-shrink-0">
            {step === "second" && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pago 1 ({METHOD_LABEL[method1!]})</span>
                <span className="font-mono font-medium">{formatPrice(num1, currency)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total adeudo</span>
              <span className="font-semibold font-mono">{formatPrice(total, currency)}</span>
            </div>
            {step === "second" && (
              <div className="flex justify-between border-t pt-1.5">
                <span className="text-muted-foreground">Restante</span>
                <span className={cn("font-semibold font-mono", remaining > 0 ? "text-destructive" : "text-green-600")}>
                  {formatPrice(remaining, currency)}
                </span>
              </div>
            )}
            {change > 0 && (
              <div className="flex justify-between border-t pt-1.5">
                <span className="text-muted-foreground">Cambio</span>
                <span className="font-bold font-mono text-green-600">{formatPrice(change, currency)}</span>
              </div>
            )}
          </div>

          {activeMethod === "MERCADO_PAGO_POINT" ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-amber-400 bg-amber-50/50 p-8">
              <Smartphone className="h-10 w-10 text-amber-500" />
              <div className="text-center space-y-1">
                <p className="font-semibold text-amber-800">Modo Demo — Función deshabilitada</p>
                <p className="text-sm text-amber-600 max-w-xs">
                  La integración con Mercado Pago Point requiere hardware físico y credenciales de producción.
                  Selecciona Efectivo o Transferencia para completar la demo.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-start">
              <PaymentNumpad
                value={activeAmount}
                onChange={step === "first" ? setAmount1 : setAmount2}
              />
            </div>
          )}

          {saleError && (
            <p className="text-sm text-destructive text-center flex-shrink-0">{saleError}</p>
          )}
        </section>
      </div>
    </div>
  )
}
