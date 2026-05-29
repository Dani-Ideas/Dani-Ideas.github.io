import { useState } from "react"
import { Search, QrCode, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { searchQR } from "@/api/sgi"

interface ItemResult {
  id: string; qrCode: string; status: string
  product: { name: string; price: number; images: string[] }
  location: { name: string } | null
  lot?: { lotNumber: string } | null
}

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Disponible", IN_PROCESS: "En tránsito", RESERVED: "Reservado",
  SOLD: "Vendido", RETURNED: "Devuelto", EXPIRED: "Vencido", DAMAGED: "Dañado",
}
const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  AVAILABLE: "default", IN_PROCESS: "secondary", RESERVED: "outline",
  SOLD: "secondary", EXPIRED: "destructive", DAMAGED: "destructive",
}

const SAMPLE_CODES = ["HP-PRB-001", "LG-UW29-002", "LG-G203-X1", "RD-K552-A1", "SONY-WH-E2"]

export function QRSearchPage() {
  const [input, setInput] = useState("")
  const [result, setResult] = useState<ItemResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const search = async (code: string) => {
    const q = code.trim()
    if (!q) return
    setLoading(true)
    setResult(null)
    setError(null)
    const data = await searchQR(q)
    if (data) {
      setResult(data as ItemResult)
      setInput(q)
    } else {
      setError("QR no encontrado")
    }
    setLoading(false)
  }

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Buscar QR</h1>
        <p className="text-sm text-muted-foreground">Escribe un código QR para ver el estado del ítem</p>
      </div>

      {/* Demo notice: no camera */}
      <div className="flex items-center gap-2 bg-muted/50 border rounded-lg px-3 py-2 text-xs text-muted-foreground">
        <QrCode className="h-4 w-4 shrink-0" />
        Escáner de cámara no disponible en demo — usa los códigos de ejemplo o escribe uno manualmente.
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search(input)}
            placeholder="Escribe o pega un código QR..."
            className="pl-8 font-mono text-sm"
          />
        </div>
        <Button onClick={() => search(input)} disabled={loading} variant="secondary">
          {loading ? "..." : "Buscar"}
        </Button>
      </div>

      {/* Sample codes */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Códigos de ejemplo:</p>
        <div className="flex flex-wrap gap-1.5">
          {SAMPLE_CODES.map((code) => (
            <button
              key={code}
              onClick={() => { setInput(code); search(code) }}
              className="font-mono text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80 transition-colors"
            >
              {code}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">{error}</div>
      )}

      {/* Result */}
      {result && (
        <div className="border rounded-lg p-4 space-y-3 bg-card">
          <div className="flex items-start gap-3">
            {result.product.images?.[0] ? (
              <img src={result.product.images[0]} alt={result.product.name} className="w-14 h-14 rounded object-cover border shrink-0" />
            ) : (
              <div className="w-14 h-14 rounded border bg-muted flex items-center justify-center shrink-0">
                <Package className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm leading-tight">{result.product.name}</p>
              <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate">{result.qrCode}</p>
              <div className="mt-1.5">
                <Badge variant={STATUS_VARIANT[result.status] ?? "outline"}>
                  {STATUS_LABELS[result.status] ?? result.status}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground">Ubicación</p>
              <p className="font-medium">{result.location?.name ?? "Sin asignar"}</p>
            </div>
            {result.lot && (
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Lote</p>
                <p className="font-medium font-mono">{result.lot.lotNumber}</p>
              </div>
            )}
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground">Precio</p>
              <p className="font-medium">S/ {result.product.price.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
