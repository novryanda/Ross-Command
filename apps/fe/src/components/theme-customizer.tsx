'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { CheckIcon, MoonIcon, PaletteIcon, SunIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

import {
  STORAGE_KEYS,
  defaultPreset,
  defaultRadius,
  radiusOptions,
  themePresets
} from '@/config/theme-presets'

export function ThemeCustomizer() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [preset, setPreset] = useState<string>(defaultPreset)
  const [radius, setRadius] = useState<number>(defaultRadius)

  useEffect(() => {
    setMounted(true)
    const savedPreset = localStorage.getItem(STORAGE_KEYS.preset) ?? defaultPreset
    const savedRadius = Number(localStorage.getItem(STORAGE_KEYS.radius) ?? defaultRadius)
    setPreset(savedPreset)
    setRadius(savedRadius)
  }, [])

  const handlePreset = (name: string) => {
    setPreset(name)
    localStorage.setItem(STORAGE_KEYS.preset, name)
    document.documentElement.dataset.themePreset = name
  }

  const handleRadius = (value: number) => {
    setRadius(value)
    localStorage.setItem(STORAGE_KEYS.radius, String(value))
    document.documentElement.style.setProperty('--radius', `${value}rem`)
  }

  const reset = () => {
    handlePreset(defaultPreset)
    handleRadius(defaultRadius)
    setTheme('system')
  }

  if (!mounted) {
    return (
      <Button variant='ghost' size='icon' aria-label='Theme customizer' disabled>
        <PaletteIcon />
      </Button>
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='ghost' size='icon' aria-label='Theme customizer'>
          <PaletteIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent align='end' className='w-72 p-4'>
        <div className='space-y-4'>
          <div className='space-y-1'>
            <p className='text-sm font-semibold'>Customize</p>
            <p className='text-muted-foreground text-xs'>Pick colors and tweak the look.</p>
          </div>

          <Separator />

          <div className='space-y-2'>
            <Label className='text-xs'>Color</Label>
            <div className='grid grid-cols-3 gap-2'>
              {themePresets.map((p) => {
                const swatch = resolvedTheme === 'dark' ? p.dark.primary : p.light.primary
                const active = preset === p.name
                return (
                  <button
                    key={p.name}
                    type='button'
                    onClick={() => handlePreset(p.name)}
                    className={cn(
                      'flex h-8 items-center gap-2 rounded-md border px-2 text-xs transition-colors',
                      active ? 'border-foreground' : 'border-border hover:bg-accent'
                    )}
                  >
                    <span
                      className='size-4 shrink-0 rounded-full'
                      style={{ backgroundColor: swatch }}
                      aria-hidden
                    />
                    <span className='truncate'>{p.label}</span>
                    {active ? <CheckIcon className='ml-auto size-3' /> : null}
                  </button>
                )
              })}
            </div>
          </div>

          <div className='space-y-2'>
            <Label className='text-xs'>Radius</Label>
            <div className='grid grid-cols-6 gap-2'>
              {radiusOptions.map((value) => {
                const active = radius === value
                return (
                  <button
                    key={value}
                    type='button'
                    onClick={() => handleRadius(value)}
                    className={cn(
                      'h-8 rounded-md border text-xs transition-colors',
                      active ? 'border-foreground' : 'border-border hover:bg-accent'
                    )}
                  >
                    {value}
                  </button>
                )
              })}
            </div>
          </div>

          <div className='space-y-2'>
            <Label className='text-xs'>Mode</Label>
            <div className='grid grid-cols-3 gap-2'>
              {[
                { value: 'light', label: 'Light', icon: SunIcon },
                { value: 'dark', label: 'Dark', icon: MoonIcon },
                { value: 'system', label: 'System', icon: PaletteIcon }
              ].map((option) => {
                const active = theme === option.value
                const Icon = option.icon
                return (
                  <button
                    key={option.value}
                    type='button'
                    onClick={() => setTheme(option.value)}
                    className={cn(
                      'flex h-8 items-center justify-center gap-1.5 rounded-md border text-xs transition-colors',
                      active ? 'border-foreground' : 'border-border hover:bg-accent'
                    )}
                  >
                    <Icon className='size-3.5' />
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>

          <Separator />

          <Button variant='outline' size='sm' className='w-full' onClick={reset}>
            Reset
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
