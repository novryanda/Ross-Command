export type Permission =
  | 'users.read'
  | 'users.write'
  | 'users.delete'
  | 'billing.read'
  | 'billing.write'
  | 'content.read'
  | 'content.write'
  | 'content.publish'
  | 'settings.read'
  | 'settings.write'

export type Role = {
  id: string
  name: string
  description: string
  color: string
  memberCount: number
  permissions: Permission[]
  isSystem: boolean
}

export type Member = {
  id: string
  name: string
  email: string
  avatar?: string
  fallback: string
  roleId: string
  status: 'active' | 'invited' | 'suspended'
  lastActive: string
}

export const permissionGroups: Array<{
  group: string
  permissions: Array<{ id: Permission; label: string }>
}> = [
  {
    group: 'Users',
    permissions: [
      { id: 'users.read', label: 'View users' },
      { id: 'users.write', label: 'Create & edit users' },
      { id: 'users.delete', label: 'Delete users' }
    ]
  },
  {
    group: 'Billing',
    permissions: [
      { id: 'billing.read', label: 'View billing' },
      { id: 'billing.write', label: 'Manage billing' }
    ]
  },
  {
    group: 'Content',
    permissions: [
      { id: 'content.read', label: 'View content' },
      { id: 'content.write', label: 'Create & edit content' },
      { id: 'content.publish', label: 'Publish content' }
    ]
  },
  {
    group: 'Settings',
    permissions: [
      { id: 'settings.read', label: 'View settings' },
      { id: 'settings.write', label: 'Manage settings' }
    ]
  }
]

export const allPermissions: Permission[] = permissionGroups.flatMap((g) =>
  g.permissions.map((p) => p.id)
)

import { avatarSrc as avatar } from '@/lib/assets'

export const roles: Role[] = [
  {
    id: 'role-owner',
    name: 'Owner',
    description: 'Full access to everything, including billing and danger zone.',
    color: 'bg-violet-500',
    memberCount: 2,
    permissions: allPermissions,
    isSystem: true
  },
  {
    id: 'role-admin',
    name: 'Admin',
    description: 'Manage users, content, and settings. No billing control.',
    color: 'bg-blue-500',
    memberCount: 4,
    permissions: [
      'users.read',
      'users.write',
      'users.delete',
      'content.read',
      'content.write',
      'content.publish',
      'settings.read',
      'settings.write'
    ],
    isSystem: true
  },
  {
    id: 'role-editor',
    name: 'Editor',
    description: 'Create, edit, and publish content. Limited user visibility.',
    color: 'bg-emerald-500',
    memberCount: 8,
    permissions: ['users.read', 'content.read', 'content.write', 'content.publish', 'settings.read'],
    isSystem: false
  },
  {
    id: 'role-viewer',
    name: 'Viewer',
    description: 'Read-only access across the workspace.',
    color: 'bg-amber-500',
    memberCount: 12,
    permissions: ['users.read', 'content.read', 'billing.read', 'settings.read'],
    isSystem: false
  }
]

export const members: Member[] = [
  { id: 'm1', name: 'Jane Cooper', email: 'jane.cooper@example.com', avatar: avatar(1), fallback: 'JC', roleId: 'role-owner', status: 'active', lastActive: '2 min ago' },
  { id: 'm2', name: 'Wade Warren', email: 'wade.warren@example.com', avatar: avatar(2), fallback: 'WW', roleId: 'role-admin', status: 'active', lastActive: '1 hour ago' },
  { id: 'm3', name: 'Esther Howard', email: 'esther.howard@example.com', avatar: avatar(3), fallback: 'EH', roleId: 'role-editor', status: 'active', lastActive: '3 hours ago' },
  { id: 'm4', name: 'Cameron Williamson', email: 'cameron.w@example.com', avatar: avatar(4), fallback: 'CW', roleId: 'role-editor', status: 'invited', lastActive: 'Never' },
  { id: 'm5', name: 'Brooklyn Simmons', email: 'brooklyn.s@example.com', avatar: avatar(5), fallback: 'BS', roleId: 'role-viewer', status: 'active', lastActive: '1 day ago' },
  { id: 'm6', name: 'Leslie Alexander', email: 'leslie.a@example.com', avatar: avatar(6), fallback: 'LA', roleId: 'role-admin', status: 'active', lastActive: '5 min ago' },
  { id: 'm7', name: 'Jenny Wilson', email: 'jenny.wilson@example.com', avatar: avatar(7), fallback: 'JW', roleId: 'role-viewer', status: 'suspended', lastActive: '2 weeks ago' },
  { id: 'm8', name: 'Robert Fox', email: 'robert.fox@example.com', avatar: avatar(8), fallback: 'RF', roleId: 'role-editor', status: 'active', lastActive: '4 hours ago' },
  { id: 'm9', name: 'Kristin Watson', email: 'kristin.w@example.com', avatar: avatar(9), fallback: 'KW', roleId: 'role-viewer', status: 'invited', lastActive: 'Never' },
  { id: 'm10', name: 'Cody Fisher', email: 'cody.fisher@example.com', avatar: avatar(10), fallback: 'CF', roleId: 'role-owner', status: 'active', lastActive: '30 min ago' }
]
