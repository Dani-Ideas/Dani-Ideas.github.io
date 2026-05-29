import { useEffect, useState, useMemo } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { POSProductCard } from "./POSProductCard"
import { getProducts, getCategories } from "@/api/pos"
import type { POSOrderItem } from "@/stores/pos-store"

interface Category {
  id: string
  name: string
  slug: string
}

interface POSProduct {
  id: string
  name: string
  slug: string
  price: number
  stock: number
  images: string[]
  isNew: boolean
  brand: string
  category: string
  trackingMode?: string
}

interface POSProductGridProps {
  searchQuery: string
  onAddItem: (item: POSOrderItem) => boolean | void
}

export function POSProductGrid({ searchQuery, onAddItem }: POSProductGridProps) {
  const [products, setProducts] = useState<POSProduct[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      const [prodData, catData] = await Promise.all([
        getProducts({ limit: 100 }),
        getCategories(),
      ])
      setProducts(prodData.products ?? [])
      setCategories(catData)
      setLoading(false)
    }
    fetchAll()
  }, [])

  const filtered = useMemo(() => {
    let list = products
    if (activeCategorySlug !== "all") {
      list = list.filter((p) => p.category === activeCategorySlug)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter((p) => p.name.toLowerCase().includes(q))
    }
    return list
  }, [products, activeCategorySlug, searchQuery])

  const activeCategories = useMemo(() => {
    const slugs = new Set(products.filter((p) => p.stock > 0).map((p) => p.category))
    return categories.filter((c) => slugs.has(c.slug))
  }, [categories, products])

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex gap-1.5 overflow-x-auto px-3 py-2 border-b shrink-0 scrollbar-hide">
        <button
          onClick={() => setActiveCategorySlug("all")}
          className={cn(
            "shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            activeCategorySlug === "all"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card hover:border-primary hover:text-primary"
          )}
        >
          Todos
        </button>
        {activeCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategorySlug(cat.slug)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              activeCategorySlug === cat.slug
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card hover:border-primary hover:text-primary"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-square rounded-lg" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No se encontraron productos
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {filtered.map((product) => (
              <POSProductCard
                key={product.id}
                product={product}
                onAdd={onAddItem}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
