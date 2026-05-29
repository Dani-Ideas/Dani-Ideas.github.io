import { useEffect, useState } from "react"
import { BellDot, Loader2, AlertTriangle, TrendingDown, PackageX } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getLots, getLowStockAlerts } from "@/api/sgi"

interface Lot { id: string; lotNumber: string; availableQty: number; expiryDate: string | null; product: { id: string; name: string } }
interface LowStockProduct { id: string; name: string; stock: number; minStock: number; images: string[]; trackingMode: string }

const TRACKING_LABEL: Record<string, string> = { BY_SERIAL: "Por serie", BY_LOT: "Por lote", BY_EXPIRY: "Por vencimiento", NONE: "Simple" }

function daysUntil(date: string) {
  return Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

export function AlertsPage() {
  const [lots, setLots] = useState<Lot[]>([])
  const [lowStock, setLowStock] = useState<LowStockProduct[]>([])
  const [loadingLots, setLoadingLots] = useState(true)
  const [loadingLow, setLoadingLow] = useState(true)

  useEffect(() => {
    getLots({ expiringSoon: true }).then((d) => setLots(d as Lot[])).finally(() => setLoadingLots(false))
    getLowStockAlerts().then(setLowStock).finally(() => setLoadingLow(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BellDot className="h-6 w-6 text-amber-500" />
        <div>
          <h1 className="text-2xl font-bold">Alertas</h1>
          <p className="text-muted-foreground">Lotes próximos a vencer y productos con stock bajo</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Lotes próximos a vencer (30 días)
          </CardTitle>
        </CardHeader>
        {loadingLots ? (
          <CardContent className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></CardContent>
        ) : lots.length === 0 ? (
          <CardContent><p className="text-center text-muted-foreground py-8">No hay lotes próximos a vencer</p></CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Nº Lote</TableHead>
                <TableHead className="text-right">Disponible</TableHead>
                <TableHead>Caducidad</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lots.map((lot) => {
                const days = lot.expiryDate ? daysUntil(lot.expiryDate) : null
                return (
                  <TableRow key={lot.id}>
                    <TableCell className="font-medium">{lot.product.name}</TableCell>
                    <TableCell className="font-mono text-sm">{lot.lotNumber}</TableCell>
                    <TableCell className="text-right">{lot.availableQty}</TableCell>
                    <TableCell className="text-sm">
                      {lot.expiryDate ? new Date(lot.expiryDate).toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                    </TableCell>
                    <TableCell>
                      {days === null ? null : days <= 0 ? (
                        <Badge variant="destructive">Vencido</Badge>
                      ) : days <= 7 ? (
                        <Badge variant="destructive">{days}d restantes</Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-800">{days}d restantes</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-destructive" />
            Stock bajo mínimo
          </CardTitle>
        </CardHeader>
        {loadingLow ? (
          <CardContent className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></CardContent>
        ) : lowStock.length === 0 ? (
          <CardContent><p className="text-center text-muted-foreground py-8">Todos los productos están sobre el stock mínimo</p></CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead className="text-right">Stock actual</TableHead>
                <TableHead className="text-right">Stock mínimo</TableHead>
                <TableHead className="text-right">Déficit</TableHead>
                <TableHead>Seguimiento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowStock.map((p) => {
                const deficit = p.minStock - p.stock
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {p.images[0] ? (
                          <img src={p.images[0]} alt={p.name} className="h-8 w-8 rounded object-cover flex-shrink-0" />
                        ) : (
                          <div className="h-8 w-8 rounded bg-muted flex-shrink-0 flex items-center justify-center">
                            <PackageX className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <span className="font-medium">{p.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={p.stock === 0 ? "text-destructive font-bold" : "text-amber-600 font-semibold"}>{p.stock}</span>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">{p.minStock}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="destructive" className="font-mono">-{deficit}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs font-normal">{TRACKING_LABEL[p.trackingMode] ?? p.trackingMode}</Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}
