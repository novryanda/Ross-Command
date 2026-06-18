import {
  ActivityIcon,
  Building2Icon,
  ChartNoAxesCombinedIcon,
  ClipboardCheckIcon,
  SendIcon,
  Share2Icon,
  UserCogIcon,
  UsersIcon
} from 'lucide-react'

import type { NavConfig } from '@/components/app-shell'
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
  const common = [{ title: 'Dashboard', url: '/dashboard', icon: ChartNoAxesCombinedIcon }]
  const accountItems = [{ title: 'Akun Sosmed', url: '/social-accounts', icon: Share2Icon }]

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

  const memberItems = hasSuperior(me)
    ? [{ title: 'Perintah Saya', url: '/assignments', icon: ClipboardCheckIcon }]
    : []
  const commanderItems = me.isCommander
    ? [
        { title: 'Perintah yang Dibuat', url: '/orders', icon: SendIcon },
        { title: 'Anggota Saya', url: '/members', icon: UsersIcon }
      ]
    : []
  const activityItems = me.isCommander
    ? [
        { title: 'Log Activity', url: '/activity', icon: ActivityIcon },
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
  fullName: 'Komando Center',
  nip: null,
  role: 'member',
  isCommander: false,
  unit: null,
  socialAccountCount: 0,
  lastLoginAt: null,
  createdAt: new Date().toISOString()
})
