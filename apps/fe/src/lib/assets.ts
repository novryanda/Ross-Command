/**
 * Local asset path helpers. All demo images live under `public/`,
 * so the template works offline and has no third-party CDN dependency.
 */

export function avatarSrc(n: number): string {
  // Avatars are numbered 1..20 in public/avatars.
  const index = ((n - 1) % 20) + 1
  return `/avatars/avatar-${index}.png`
}

export const images = {
  zipcar: '/images/zipcar.png',
  bitbank: '/images/bitbank.png',
  productInsights: '/images/product-insights.png',
  logoSquare: '/images/logo-square.png',
  payment1: '/images/payment-1.png',
  payment2: '/images/payment-2.png'
} as const
