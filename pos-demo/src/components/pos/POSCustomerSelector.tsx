import { useState } from "react"
import { User, X, UserPlus, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { POSCustomer } from "@/stores/pos-store"

interface POSCustomerSelectorProps {
  customer?: POSCustomer
  onChange: (customer: POSCustomer | undefined) => void
}

export function POSCustomerSelector({ customer, onChange }: POSCustomerSelectorProps) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState("")

  const hasCustomer = !!(customer?.name || customer?.id)

  const handleConfirm = () => {
    if (name.trim()) {
      onChange({ name: name.trim() })
    }
    setEditing(false)
    setName("")
  }

  if (hasCustomer) {
    return (
      <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm bg-muted/30">
        <User className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{customer?.name ?? "Cliente"}</p>
        </div>
        <button
          onClick={() => onChange(undefined)}
          className="text-muted-foreground hover:text-foreground flex-shrink-0"
          title="Quitar cliente"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          placeholder="Nombre del cliente..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleConfirm()
            if (e.key === "Escape") { setEditing(false); setName("") }
          }}
          className="h-8 text-sm flex-1"
          autoFocus
        />
        <button
          onClick={handleConfirm}
          className="text-primary hover:text-primary/80 flex-shrink-0"
          title="Confirmar"
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          onClick={() => { setEditing(false); setName("") }}
          className="text-muted-foreground hover:text-foreground flex-shrink-0"
          title="Cancelar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="flex w-full items-center gap-2 rounded-md border px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
    >
      <User className="h-4 w-4" />
      <span className="flex-1 text-left">Cliente (opcional)</span>
      <UserPlus className="h-3.5 w-3.5" />
    </button>
  )
}
