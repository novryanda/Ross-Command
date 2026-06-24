import {
  ActivityIcon,
  Building2Icon,
  ChartNoAxesCombinedIcon,
  ClipboardCheckIcon,
  LayoutListIcon,
  PenLineIcon,
  Share2Icon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  UserCogIcon,
  UsersIcon
} from 'lucide-react'

import type { NavConfig, NavItem } from '@/components/app-shell'
import type { Me } from '@/lib/api/types'

function hasSuperior(me: Me): boolean {
  if (!me.isCommander) {
    return true
  }

  const membershipDepth = me.unit?.depthLevel ?? 0
  const commandingDepths = me.commandingUnits?.map((unit) => unit.depthLevel ?? 0) ?? []

  return membershipDepth > 0 || commandingDepths.some((depth) => depth > 0)
}

export function getNavItems(me: Me): NavConfig {
  const common: NavItem[] = [{ title: 'Dashboard', url: '/dashboard', icon: ChartNoAxesCombinedIcon }]
  const accountItems: NavItem[] = [{ title: 'Akun Sosmed', url: '/social-accounts', icon: Share2Icon }]

  if (me.role === 'super_admin') {
    return {
      groups: [
        { items: common },
        {
          label: 'Admin',
          items: [
            { title: 'Manajemen Organisasi', url: '/admin/units', icon: Building2Icon },
            { title: 'Manajemen User', url: '/admin/users', icon: UserCogIcon }
          ]
        },
        {
          label: 'Activity',
          items: [
            { title: 'Log Activity', url: '/activity', icon: ActivityIcon },
            ]
        }
      ]
    }
  }

  const memberItems: NavItem[] = hasSuperior(me)
    ? [{ title: 'Perintah Saya', url: '/assignments', icon: ClipboardCheckIcon }]
    : []
  const commanderItems: NavItem[] = me.isCommander
    ? [
        { title: 'Overview', url: '/orders', icon: LayoutListIcon },
        { title: 'Posting', url: '/orders/posting', icon: PenLineIcon },
        {
          title: 'Pro',
          icon: ThumbsUpIcon,
          items: [{ title: 'Blasting', url: '/orders/blasting' }]
        },
        {
          title: 'Kontra',
          icon: ThumbsDownIcon,
          items: [
            { title: 'Counter', url: '/orders/counter' },
            { title: 'Report', url: '/orders/report' }
          ]
        },
        { title: 'Personil Satuan', url: '/members', icon: UsersIcon }
      ]
    : []
  const activityItems: NavItem[] = me.isCommander
    ? [
        { title: 'Log Aktivitas', url: '/activity', icon: ActivityIcon },
      ]
    : []


  return {
    groups: [
      { items: common },
      ...(memberItems.length ? [{ label: 'Tugas', items: memberItems }] : []),
      ...(commanderItems.length ? [{ label: 'Komando', items: commanderItems }] : []),
      ...(activityItems.length ? [{ label: 'Log Activity', items: activityItems }] : []),
      { label: 'Akun', items: accountItems }
    ]
  }
}

export const dashboardNav: NavConfig = getNavItems({
  id: 'preview',
  username: 'preview',
  fullName: 'Command Center',
  identityNumber: null,
  gender: null,
  employmentType: null,
  rank: null,
  grade: null,
  religion: null,
  phoneNumber: null,
  role: 'member',
  isCommander: false,
  unit: null,
  socialAccountCount: 0,
  lastLoginAt: null,
  createdAt: new Date().toISOString()
})
