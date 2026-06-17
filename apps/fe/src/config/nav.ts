import {
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
        }
      ]
    }
  }

  const hasParent = (me.unit?.depthLevel ?? 0) > 0
  const memberItems = hasParent || !me.isCommander
    ? [{ title: 'Perintah Saya', url: '/assignments', icon: ClipboardCheckIcon }]
    : []
  const commanderItems = me.isCommander
    ? [
        { title: 'Perintah yang Dibuat', url: '/orders', icon: SendIcon },
        { title: 'Anggota Saya', url: '/members', icon: UsersIcon }
      ]
    : []

  return {
    groups: [
      { items: common },
      ...(memberItems.length ? [{ label: 'Tugas', items: memberItems }] : []),
      ...(commanderItems.length ? [{ label: 'Komando', items: commanderItems }] : []),
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
