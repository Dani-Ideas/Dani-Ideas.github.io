import { useEffect, useState } from "react"
import { Search, Loader2, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getLots } from "@/api/sgi"

interface Lot {
  id: string; lotNumber: string; quantity: number; availableQty: number; expiryDate: string | null
  createdAt: string; removalStrategy: string; product: { id: string; name: string; trackingMode: string; removalStrategy: string }
}

function daysUntil(date: string) {
  return Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

function ExpiryBadge({ expiryDate }: { expiryDate: string | null }) {
  if (!expiryDate) return <span className="text-muted-foreground text-sm">—</span>
  const days = daysUntil(expiryDate)
  if (days <= 0) return <Badge variant="destructive">Vencido</Badge>
  if (days <= 7) return <Badge variant="destructive">{days}d</Badge>
  if (days <= 30) return <Badge className="bg-amber-100 text-amber-800">{days}d</Badge>
  return <Badge variant="secondary">{new Date(expiryDate).toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" })}</Badge>
}

export function LotsPage() {
  const [lots, setLots] = useState<Lot[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    getLots().then((d) => setLots(d as Lot[])).finally(() => setLoading(false))
  }, [])

  const filtered = lots.filter((lot) => {
    const matchSearch =
      lot.product.name.toLowerCase().includes(search.toLowerCase()) ||
      lot.lotNumber.toLowerCase().includes(search.toLowerCase())
    if (filter === "expiring") return matchSearch && lot.expiryDate && daysUntil(lot.expiryDate) <= 30
    if (filter === "empty") return matchSearch && lot.availableQty === 0
    return matchSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Lotes</h1>
          <p className="text-muted-foreground">Gestión de lotes y series de mercancía</p>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por producto o nº lote..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="expiring">Próximos a vencer</SelectItem>
            <SelectItem value="empty">Sin stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
            <AlertTriangle className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-muted-foreground">No se encontraron lotes</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Nº Lote</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Disponible</TableHead>
                <TableHead>Caducidad</TableHead>
                <TableHead>Estrategia</TableHead>
                <TableHead className="text-right">Ingreso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((lot) => (
                <TableRow key={lot.id}>
                  <TableCell className="font-medium">{lot.product.name}</TableCell>
                  <TableCell className="font-mono text-sm">{lot.lotNumber}</TableCell>
                  <TableCell className="text-right">{lot.quantity}</TableCell>
                  <TableCell className="text-right">
                    <span className={lot.availableQty === 0 ? "text-muted-foreground" : ""}>{lot.availableQty}</span>
                  </TableCell>
                  <TableCell><ExpiryBadge expiryDate={lot.expiryDate} /></TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{lot.product.removalStrategy}</Badge></TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {new Date(lot.createdAt).toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
