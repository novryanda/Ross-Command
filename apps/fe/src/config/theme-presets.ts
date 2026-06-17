export type ThemePreset = {
  name: string
  label: string
  /** Used for the swatch and as `--primary` in light mode. */
  light: {
    primary: string
    primaryForeground: string
  }
  /** Used as `--primary` in dark mode. */
  dark: {
    primary: string
    primaryForeground: string
  }
}

/**
 * Preset palettes shown in the theme customizer.
 * Add or remove entries here to change available swatches across the app.
 */
export const themePresets: ThemePreset[] = [
  {
    name: 'neutral',
    label: 'Neutral',
    light: { primary: 'oklch(0.205 0 0)', primaryForeground: 'oklch(0.985 0 0)' },
    dark: { primary: 'oklch(0.922 0 0)', primaryForeground: 'oklch(0.205 0 0)' }
  },
  {
    name: 'blue',
    label: 'Blue',
    light: { primary: 'oklch(0.546 0.215 262.881)', primaryForeground: 'oklch(0.985 0 0)' },
    dark: { primary: 'oklch(0.707 0.165 254.624)', primaryForeground: 'oklch(0.205 0 0)' }
  },
  {
    name: 'violet',
    label: 'Violet',
    light: { primary: 'oklch(0.541 0.281 293.009)', primaryForeground: 'oklch(0.985 0 0)' },
    dark: { primary: 'oklch(0.702 0.183 293.541)', primaryForeground: 'oklch(0.205 0 0)' }
  },
  {
    name: 'emerald',
    label: 'Emerald',
    light: { primary: 'oklch(0.596 0.145 163.225)', primaryForeground: 'oklch(0.985 0 0)' },
    dark: { primary: 'oklch(0.723 0.158 162.48)', primaryForeground: 'oklch(0.205 0 0)' }
  },
  {
    name: 'rose',
    label: 'Rose',
    light: { primary: 'oklch(0.594 0.227 17.585)', primaryForeground: 'oklch(0.985 0 0)' },
    dark: { primary: 'oklch(0.704 0.205 16.439)', primaryForeground: 'oklch(0.205 0 0)' }
  },
  {
    name: 'orange',
    label: 'Orange',
    light: { primary: 'oklch(0.646 0.222 41.116)', primaryForeground: 'oklch(0.985 0 0)' },
    dark: { primary: 'oklch(0.769 0.188 70.08)', primaryForeground: 'oklch(0.205 0 0)' }
  }
]

export const defaultPreset = 'neutral'
export const defaultRadius = 0.625
export const radiusOptions = [0, 0.3, 0.5, 0.625, 0.75, 1] as const

export const STORAGE_KEYS = {
  preset: 'theme-preset',
  radius: 'theme-radius'
}
