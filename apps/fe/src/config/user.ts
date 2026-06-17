import { avatarSrc } from '@/lib/assets'

/**
 * Single source of truth for the signed-in user. Wire this up to your
 * auth/session layer; the UI (greeting, profile menu, header) reads from here.
 */
export type CurrentUser = {
  name: string
  firstName: string
  email: string
  avatar: string
  initials: string
}

export const currentUser: CurrentUser = {
  name: 'Fatmuh',
  firstName: 'Fatmuh',
  email: 'fatmuh@moccilabs.com',
  avatar: avatarSrc(1),
  initials: 'FM'
}
