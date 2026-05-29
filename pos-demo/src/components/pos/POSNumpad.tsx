import { Delete } from "lucide-react"
import { cn } from "@/lib/utils"

interface POSNumpadProps {
  value: string
  onChange: (v: string) => void
}

const ROWS = [
  ["7", "8", "9"],
  ["4", "5", "6"],
  ["1", "2", "3"],
  [".", "0", "⌫"],
]

export function POSNumpad({ value, onChange }: POSNumpadProps) {
  const handle = (key: string) => {
    if (key === "⌫") {
      onChange(value.slice(0, -1) || "0")
      return
    }
    if (key === ".") {
      if (!value.includes(".")) onChange(value + ".")
      return
    }
    const next = value === "0" ? key : value + key
    const parts = next.split(".")
    if (parts[0].length > 6 || (parts[1] && parts[1].length > 2)) return
    onChange(next)
  }

  return (
    <div className="grid gap-1.5">
      {ROWS.map((row, ri) => (
        <div key={ri} className="grid grid-cols-3 gap-1.5">
          {row.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => handle(key)}
              className={cn(
                "flex items-center justify-center h-10 rounded-lg border font-medium text-sm transition-colors select-none active:scale-95",
                "bg-card hover:bg-muted",
                key === "⌫" && "text-destructive hover:bg-destructive/10"
              )}
            >
              {key === "⌫" ? <Delete className="h-4 w-4" /> : key}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}
