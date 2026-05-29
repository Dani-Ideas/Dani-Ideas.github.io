import { useState, useRef, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { Package, ChevronDown, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

type NavLink = { label: string; href: string }
type NavGroup = { heading: string; links: NavLink[] }
type NavItem = { label: string; href: string } | { label: string; groups: NavGroup[] }

const NAV_ITEMS: NavItem[] = [
  { label: "Información general", href: "/" },
  {
    label: "Productos",
    groups: [
      { heading: "Catálogo", links: [
        { label: "Productos", href: "/productos" },
        { label: "Lotes / Series", href: "/lots" },
      ]},
    ],
  },
  {
    label: "Operaciones",
    groups: [
      { heading: "Traslados", links: [
        { label: "Recepciones", href: "/recepciones" },
        { label: "Salidas", href: "/salidas" },
        { label: "Interno", href: "/interno" },
      ]},
      { heading: "Ajustes", links: [{ label: "Inventario físico", href: "/inventario-fisico" }] },
      { heading: "Aprovisionamiento", links: [{ label: "Reabastecimiento", href: "/reabastecimiento" }] },
    ],
  },
  {
    label: "Reportes",
    groups: [
      { heading: "Inventario", links: [
        { label: "Existencias", href: "/existencias" },
        { label: "Historial de movimientos", href: "/movements" },
        { label: "Alertas", href: "/alerts" },
      ]},
    ],
  },
  {
    label: "Configuración",
    groups: [
      { heading: "Almacén", links: [
        { label: "Almacenes", href: "/warehouse" },
        { label: "Buscar QR", href: "/qr-search" },
      ]},
    ],
  },
]

function Dropdown({ label, groups }: { label: string; groups: NavGroup[] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const location = useLocation()

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const isActive = groups.some((g) => g.links.some((l) => location.hash === `#${l.href}` || location.pathname === l.href))

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1 px-3 py-2 text-sm rounded transition-colors select-none",
          isActive ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        )}
      >
        {label}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-popover border rounded-md shadow-lg min-w-[200px] py-2">
          {groups.map((group, gi) => (
            <div key={gi}>
              {gi > 0 && <div className="border-t my-1" />}
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {group.heading}
              </p>
              {group.links.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-1.5 text-sm hover:bg-muted transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function SGINavbar() {
  const location = useLocation()

  return (
    <header className="h-12 border-b bg-card flex items-center px-4 gap-1 shrink-0 z-10">
      <Link to="/" className="flex items-center gap-2 font-semibold text-sm mr-3 text-primary">
        <Package className="h-4 w-4" />
        Inventario
      </Link>

      {NAV_ITEMS.map((item) =>
        "href" in item ? (
          <Link
            key={item.label}
            to={item.href}
            className={cn(
              "px-3 py-2 text-sm rounded transition-colors",
              location.pathname === item.href || location.hash === `#${item.href}`
                ? "text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            {item.label}
          </Link>
        ) : (
          <Dropdown key={item.label} label={item.label} groups={item.groups} />
        )
      )}

      <div className="ml-auto flex items-center gap-2">
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-medium">DEMO</span>
        <a
          href="/pos-demo/"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-muted"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          POS Demo
        </a>
      </div>
    </header>
  )
}
