import { useEffect, useState, useCallback } from "react"
import * as XLSX from "xlsx"
import { ArrowLeftRight, ChevronLeft, ChevronRight, Download, Loader2, Search, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getMovements } from "@/api/sgi"
import type { MockStockMove } from "@/data/mock"

const LIMIT = 20

const TYPE_LABEL: Record<string, string> = {
  INCOMING: "Entrada", OUTGOING: "Salida", ADJUSTMENT: "Ajuste", TRANSFER: "Traslado",
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString("es-PE", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

export function MovementsPage() {
  const [moves, setMoves] = useState<MockStockMove[]>([])
  const [meta, setMeta] = useState<{ total: number; page: number; limit: number; totalPages: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1) }, 350)
    return () => clearTimeout(t)
  }, [search])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const json = await getMovements({ page, limit: LIMIT, reference: debouncedSearch || undefined })
      setMoves(json.data)
      setMeta(json.meta)
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch])

  useEffect(() => { load() }, [load])

  const handleExport = () => {
    const rows = moves.map((m) => ({
      "Fecha": fmt(m.createdAt),
      "Tipo": TYPE_LABEL[m.type] ?? m.type,
      "Producto": m.product.name,
      "Lote": m.lot?.lotNumber ?? "—",
      "Desde": m.fromLocation?.name ?? "—",
      "Hacia": m.toLocation?.name ?? "—",
      "Qty": m.quantity,
      "Referencia": m.reference ?? "—",
      "Notas": m.notes ?? "—",
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    ws["!cols"] = [{ wch: 18 }, { wch: 10 }, { wch: 28 }, { wch: 14 }, { wch: 20 }, { wch: 20 }, { wch: 6 }, { wch: 22 }, { wch: 36 }]
    const wb = XLSX.utils.book_new()
    const pageLabel = meta ? `p${meta.page}` : "p1"
    XLSX.utils.book_append_sheet(wb, ws, "Movimientos")
    XLSX.writeFile(wb, `kardex_${pageLabel}_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Movimientos (Kardex)</h1>
        <p className="text-muted-foreground">Historial completo de movimientos de stock</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por referencia..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {meta && <p className="text-sm text-muted-foreground ml-auto">{meta.total} movimiento{meta.total !== 1 ? "s" : ""}</p>}
        <Button variant="outline" size="sm" onClick={handleExport} disabled={loading || moves.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Exportar página
        </Button>
      </div>

      <Card>
        {loading ? (
          <CardContent className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></CardContent>
        ) : moves.length === 0 ? (
          <CardContent className="flex flex-col items-center justify-center py-20 gap-3">
            <ArrowLeftRight className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-muted-foreground">
              {debouncedSearch ? "Sin resultados para esa referencia" : "No hay movimientos registrados"}
            </p>
          </CardContent>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Lote</TableHead>
                  <TableHead>Desde</TableHead>
                  <TableHead>Hacia</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Referencia</TableHead>
                  <TableHead>Notas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {moves.map((move) => (
                  <TableRow key={move.id}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{fmt(move.createdAt)}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{TYPE_LABEL[move.type] ?? move.type}</Badge></TableCell>
                    <TableCell className="font-medium">{move.product.name}</TableCell>
                    <TableCell>
                      {move.lot
                        ? <span className="font-mono text-xs">{move.lot.lotNumber}</span>
                        : <span className="text-muted-foreground text-xs">—</span>}
                    </TableCell>
                    <TableCell className="text-sm">
                      {move.fromLocation
                        ? <Badge variant="outline" className="font-normal text-xs">{move.fromLocation.name}</Badge>
                        : <span className="text-muted-foreground text-xs">—</span>}
                    </TableCell>
                    <TableCell className="text-sm">
                      {move.toLocation
                        ? <Badge variant="outline" className="font-normal text-xs">{move.toLocation.name}</Badge>
                        : <span className="text-muted-foreground text-xs">—</span>}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold">
                      <span className={move.quantity > 0 ? "text-green-600" : "text-destructive"}>
                        {move.quantity > 0 ? "+" : ""}{move.quantity}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {move.reference ?? <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[160px] truncate">
                      {move.notes ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <p className="text-sm text-muted-foreground">Página {meta.page} de {meta.totalPages}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={meta.page <= 1}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={meta.page >= meta.totalPages}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  )
}
