import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { POSOrder } from "@/stores/pos-store"

interface POSOrderTabsProps {
  orders: POSOrder[]
  activeIndex: number
  onSelectTab: (index: number) => void
  onAddOrder: () => void
  onRemoveOrder: (orderId: string) => void
}

const MAX_ORDERS = 5

export function POSOrderTabs({ orders, activeIndex, onSelectTab, onAddOrder, onRemoveOrder }: POSOrderTabsProps) {
  return (
    <div className="flex items-center gap-1 border-b px-2 pt-2 overflow-x-auto">
      {orders.map((order, index) => (
        <div
          key={order.id}
          className={cn(
            "flex items-center gap-1 rounded-t-md border border-b-0 px-3 py-1.5 text-sm cursor-pointer transition-colors",
            index === activeIndex
              ? "bg-background text-foreground font-medium"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
          onClick={() => onSelectTab(index)}
        >
          <span>{order.label}</span>
          {order.items.length > 0 && (
            <span className="ml-1 rounded-full bg-primary/10 px-1.5 text-xs text-primary">
              {order.items.length}
            </span>
          )}
          {orders.length > 1 && (
            <button
              className="ml-1 rounded hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation()
                onRemoveOrder(order.id)
              }}
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      ))}

      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 rounded-t-md border border-b-0 p-0"
        onClick={onAddOrder}
        disabled={orders.length >= MAX_ORDERS}
        title={orders.length >= MAX_ORDERS ? "Máximo 5 órdenes simultáneas" : "Nueva orden"}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}
