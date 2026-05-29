import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getDashboardData } from "@/api/sgi"

function MiniBarChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1)
  const W = 120, H = 40, barW = 12, gap = 4
  const startX = W - data.length * (barW + gap) + gap
  return (
    <svg width={W} height={H} className="overflow-visible">
      {data.map((v, i) => {
        const h = Math.max(2, Math.round((v / max) * H))
        return <rect key={i} x={startX + i * (barW + gap)} y={H - h} width={barW} height={h} rx={2} fill={color} opacity={0.7} />
      })}
    </svg>
  )
}

function OperationCard({ title, count, footer, accentColor, chartData, href }: {
  title: string; count: number; footer: string; accentColor: string; chartData: number[]; href: string
}) {
  const navigate = useNavigate()
  return (
    <div
      className="bg-card border rounded-sm flex flex-col cursor-pointer hover:shadow-md transition-shadow"
      style={{ borderLeft: `5px solid ${accentColor}` }}
      onClick={() => navigate(href)}
    >
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: accentColor }}>{title}</span>
      </div>
      <div className="px-4 pb-3 flex items-end justify-between">
        <span className="text-4xl font-light" style={{ color: accentColor }}>{count}</span>
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(href) }}
            className="text-xs font-bold text-white px-3 py-1 rounded"
            style={{ backgroundColor: accentColor }}
          >
            Abrir
          </button>
          <MiniBarChart data={chartData} color={accentColor} />
        </div>
      </div>
      <div className="px-4 py-2 text-[11px] uppercase tracking-wider border-t" style={{ backgroundColor: "oklch(var(--muted)/0.4)", color: "oklch(var(--muted-foreground))" }}>
        {footer}
      </div>
    </div>
  )
}

export function DashboardPage() {
  const [data, setData] = useState({
    receptions: 0, receptionChart: Array(7).fill(0),
    deliveries: 0, deliveryChart: Array(7).fill(0),
    adjustments: 0, adjustmentChart: Array(7).fill(0),
    loading: true,
  })

  useEffect(() => {
    getDashboardData().then((d) => setData({ ...d, loading: false }))
  }, [])

  if (data.loading) {
    return <div className="flex items-center justify-center py-32 text-muted-foreground text-sm">Cargando...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sistema de Gestión de Inventario</h1>
        <p className="text-muted-foreground">Vista general de operaciones de inventario</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <OperationCard
          title="Recepciones"
          count={data.receptions}
          footer="Lotes registrados"
          accentColor="#00A09D"
          chartData={data.receptionChart}
          href="/recepciones"
        />
        <OperationCard
          title="Ajustes de inventario"
          count={data.adjustments}
          footer="Movimientos de ajuste"
          accentColor="#714B67"
          chartData={data.adjustmentChart}
          href="/inventario-fisico"
        />
        <OperationCard
          title="Salidas"
          count={data.deliveries}
          footer="Movimientos de salida"
          accentColor="#E9A13E"
          chartData={data.deliveryChart}
          href="/movements"
        />
      </div>
    </div>
  )
}
