/**
 * Local asset path helpers. All demo images live under `public/`,
 * so the template works offline and has no third-party CDN dependency.
 */

export const brandAssets = {
  logo: "/images/logo%20pussiberad.png",
  logoTniAd: "/images/logo%20TNI%20AD.png",
  favicon: "/images/logo%20pussiberad.ico",
} as const;

export function avatarSrc(n: number): string {
  // Avatars are numbered 1..20 in public/avatars.
  const index = ((n - 1) % 20) + 1
  return `/avatars/avatar-${index}.png`
}

export const images = {
  zipcar: '/images/zipcar.png',
  bitbank: '/images/bitbank.png',
  productInsights: '/images/product-insights.png',
  logoSquare: brandAssets.logo,
  payment1: '/images/payment-1.png',
  payment2: '/images/payment-2.png'
} as const
