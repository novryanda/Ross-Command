'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { MoonIcon, SunIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const toggle = () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')

  return (
    <Button variant='ghost' size='icon' aria-label='Toggle theme' onClick={toggle}>
      {mounted && resolvedTheme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </Button>
  )
}
