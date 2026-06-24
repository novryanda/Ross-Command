import type { LucideIcon } from 'lucide-react'

export type NavItem = {
  kind?: 'item' | 'label'
  title: string
  url?: string
  icon?: LucideIcon
  badge?: string | number
  disabled?: boolean
  external?: boolean
  items?: NavItem[]
}

export type NavGroup = {
  label?: string
  items: NavItem[]
}

export type NavConfig = {
  groups: NavGroup[]
}
