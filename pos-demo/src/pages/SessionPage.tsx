import { useEffect, useState, useCallback } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { QrCode, X, Clock, DollarSign } from "lucide-react"
import { POSSalesHistory } from "@/components/pos/POSSalesHistory"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { POSOrderTabs } from "@/components/pos/POSOrderTabs"
import { POSProductSearch } from "@/components/pos/POSProductSearch"
import { POSProductGrid } from "@/components/pos/POSProductGrid"
import { POSOrderPanel } from "@/components/pos/POSOrderPanel"
import { usePOSStore, type POSOrderItem, type POSCustomer } from "@/stores/pos-store"
import { useSettingsStore, formatPrice } from "@/stores/settings-store"
import { getSession } from "@/api/pos"

export function SessionPage() {
  const currency = useSettingsStore((s) => s.settings.currency)
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    activeSession,
    orders,
    activeOrderIndex,
    setSession,
    refreshSession,
    addOrder,
    removeOrder,
    setActiveOrder,
    addItemToOrder,
    removeItemFromOrder,
    setCustomer,
    getActiveOrder,
    getOrderTotal,
  } = usePOSStore()

  const [scannerOpen, setScannerOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [sessionLoaded, setSessionLoaded] = useState(false)
  const [elapsed, setElapsed] = useState("")

  useEffect(() => {
    if (!id) return
    const load = async () => {
      const data = await getSession(id)
      if (!data || data.status !== "OPEN") {
        navigate("/", { replace: true })
        return
      }
      const sessionData = {
        sessionId: data.id,
        posId: data.posId,
        posName: data.pos.name,
        posLocationId: null,
        openedAt: data.createdAt,
        initialAmount: Number(data.initialAmount),
      }
      if (activeSession?.sessionId === id) {
        refreshSession(sessionData)
      } else {
        setSession(sessionData)
      }
      setSessionLoaded(true)
    }
    load()
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!activeSession) return
    const update = () => {
      const diff = Date.now() - new Date(activeSession.openedAt).getTime()
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      setElapsed(`${h}h ${m}m`)
    }
    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [activeSession])

  const activeOrder = getActiveOrder()

  const handleAddItem = useCallback(
    (item: POSOrderItem): boolean => {
      if (!activeOrder) return false
      return addItemToOrder(activeOrder.id, item)
    },
    [activeOrder, addItemToOrder]
  )

  if (!sessionLoaded) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Cargando sesión...
      </div>
    )
  }

  if (!activeSession) return null

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b px-4 py-2 bg-card flex-shrink-0">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-sm">{activeSession.posName}</span>
          <Badge variant="outline" className="text-xs gap-1">
            <Clock className="h-3 w-3" />
            {elapsed}
          </Badge>
          <Badge variant="outline" className="text-xs gap-1">
            <DollarSign className="h-3 w-3" />
            {formatPrice(activeSession.initialAmount, currency)} inicial
          </Badge>
          <Badge className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">
            DEMO
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <POSSalesHistory sessionId={activeSession.sessionId} />
          <Button variant="destructive" size="sm" asChild>
            <Link to={`/sessions/${activeSession.sessionId}/close`}>
              Cerrar Caja
            </Link>
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL */}
        <div className="flex flex-col w-[55%] border-r overflow-hidden">
          <POSOrderTabs
            orders={orders}
            activeIndex={activeOrderIndex}
            onSelectTab={setActiveOrder}
            onAddOrder={addOrder}
            onRemoveOrder={removeOrder}
          />

          <div className="flex gap-2 px-3 py-2 border-b">
            <div className="flex-1">
              <POSProductSearch
                onAddItem={handleAddItem}
                onQueryChange={setSearchQuery}
                hideDropdown
              />
            </div>
            <Button
              variant={scannerOpen ? "default" : "outline"}
              size="sm"
              className="flex-shrink-0"
              onClick={() => setScannerOpen((o) => !o)}
            >
              {scannerOpen ? (
                <><X className="h-4 w-4 mr-1" /> Cerrar</>
              ) : (
                <><QrCode className="h-4 w-4 mr-1" /> Simular QR</>
              )}
            </Button>
          </div>

          {scannerOpen && (
            <div className="px-3 py-3 border-b bg-muted/30">
              <p className="text-xs text-center text-muted-foreground italic">
                El escáner de QR físico no está disponible en la demo.
                Usa la búsqueda o haz click en los productos para agregarlos.
              </p>
            </div>
          )}

          <div className="flex-1 overflow-hidden">
            <POSProductGrid
              searchQuery={searchQuery}
              onAddItem={handleAddItem}
            />
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex flex-col w-[45%] overflow-hidden">
          {activeOrder ? (
            <POSOrderPanel
              order={activeOrder}
              total={getOrderTotal(activeOrder.id)}
              onRemoveItem={(qrCode) => removeItemFromOrder(activeOrder.id, qrCode)}
              onAddItem={handleAddItem}
              onSetCustomer={(customer: POSCustomer | undefined) =>
                setCustomer(activeOrder.id, customer ?? {})
              }
              onCheckout={() => navigate(`/sessions/${activeSession.sessionId}/checkout`)}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
              Selecciona una orden
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
