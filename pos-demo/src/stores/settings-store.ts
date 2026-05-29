import { create } from "zustand"

interface StoreSettings {
  storeName: string
  storeEmail: string
  storePhone: string
  storeAddress: string
  description: string
  timezone: string
  currency: string
}

interface SettingsState {
  settings: StoreSettings
  loaded: boolean
  load: () => Promise<void>
  reload: () => Promise<void>
}

const DEMO_SETTINGS: StoreSettings = {
  storeName: "BasicTech POS Demo",
  storeEmail: "demo@basictech.pe",
  storePhone: "+51 999 000 111",
  storeAddress: "Av. Demo 123, Lima",
  description: "Demo del sistema POS de BasicTechShop",
  timezone: "America/Lima",
  currency: "PEN",
}

export const useSettingsStore = create<SettingsState>(() => ({
  settings: DEMO_SETTINGS,
  loaded: true,
  load: async () => {},
  reload: async () => {},
}))

export function currencySymbol(currency: string): string {
  const map: Record<string, string> = {
    MXN: "$",
    USD: "US$",
    PEN: "S/",
    EUR: "€",
    COP: "$",
  }
  return map[currency] ?? currency
}

export function formatPrice(amount: number, currency: string): string {
  const symbol = currencySymbol(currency)
  return `${symbol} ${amount.toFixed(2)}`
}
