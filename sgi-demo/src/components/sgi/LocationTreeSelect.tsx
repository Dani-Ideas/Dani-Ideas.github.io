import { useMemo, useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronRight } from "lucide-react"

interface LocationNode {
  id: string
  name: string
  type: string
  parentId: string | null
}

interface LocationTreeSelectProps {
  locations: LocationNode[]
  value: string
  onChange: (value: string) => void
  allValue?: string
  allLabel?: string
}

export function LocationTreeSelect({
  locations,
  value,
  onChange,
  allValue = "_all",
  allLabel = "Todos los almacenes",
}: LocationTreeSelectProps) {
  const childrenOf = useMemo(() => {
    const map = new Map<string | null, LocationNode[]>()
    for (const loc of locations) {
      const key = loc.parentId ?? null
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(loc)
    }
    return map
  }, [locations])

  const buildPath = (id: string): string[] => {
    if (id === allValue) return []
    const byId = new Map(locations.map((l) => [l.id, l]))
    const path: string[] = []
    let current = byId.get(id)
    while (current) {
      path.unshift(current.id)
      current = current.parentId ? byId.get(current.parentId) : undefined
    }
    return path
  }

  const [selections, setSelections] = useState<string[]>(() => buildPath(value))

  useEffect(() => {
    setSelections(buildPath(value))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const handleLevelChange = (level: number, newVal: string) => {
    const next = newVal === allValue ? selections.slice(0, level) : [...selections.slice(0, level), newVal]
    setSelections(next)
    onChange(next[next.length - 1] ?? allValue)
  }

  const levels: { items: LocationNode[]; selected: string; level: number }[] = []
  const roots = (childrenOf.get(null) ?? []).filter((l) => l.type === "INTERNAL")
  if (roots.length > 0) levels.push({ items: roots, selected: selections[0] ?? allValue, level: 0 })

  for (let i = 0; i < selections.length; i++) {
    const children = (childrenOf.get(selections[i]) ?? []).filter((l) => l.type === "INTERNAL")
    if (children.length > 0) {
      levels.push({ items: children, selected: selections[i + 1] ?? allValue, level: i + 1 })
    } else {
      break
    }
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {levels.map(({ items, selected, level }, idx) => (
        <div key={level} className="flex items-center gap-1">
          {idx > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />}
          <Select value={selected} onValueChange={(v) => handleLevelChange(level, v)}>
            <SelectTrigger className="h-8 text-sm w-44">
              <SelectValue placeholder={level === 0 ? allLabel : "Sub-ubicación…"} />
            </SelectTrigger>
            <SelectContent>
              {level === 0 ? (
                <SelectItem value={allValue}>{allLabel}</SelectItem>
              ) : (
                <SelectItem value={allValue}><span className="text-muted-foreground">Sin filtro</span></SelectItem>
              )}
              {items.map((loc) => (
                <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  )
}
