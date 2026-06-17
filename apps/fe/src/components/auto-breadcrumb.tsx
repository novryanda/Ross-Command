'use client'

import { Fragment } from 'react'
import { usePathname } from 'next/navigation'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'

import type { NavConfig, NavItem } from '@/components/app-shell'

type Crumb = { title: string; url: string }

function findTitle(config: NavConfig, url: string): string | null {
  for (const group of config.groups) {
    for (const item of group.items) {
      if (item.url === url) return item.title
      if (item.items) {
        for (const sub of item.items) {
          if (sub.url === url) return sub.title
        }
      }
    }
  }
  return null
}

function findGroupForChild(config: NavConfig, url: string): NavItem | null {
  for (const group of config.groups) {
    for (const item of group.items) {
      if (item.items?.some((sub) => sub.url === url)) return item
    }
  }
  return null
}

function humanize(segment: string) {
  return segment
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function buildCrumbs(pathname: string, config: NavConfig): Crumb[] {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return []

  const crumbs: Crumb[] = []

  // Try to attach a parent group (e.g. "Form" for /components/button)
  const parent = findGroupForChild(config, pathname)
  if (parent) {
    crumbs.push({ title: parent.title, url: '#' })
  }

  let currentPath = ''
  segments.forEach((segment) => {
    currentPath += `/${segment}`
    const title = findTitle(config, currentPath) ?? humanize(segment)
    crumbs.push({ title, url: currentPath })
  })

  return crumbs
}

export function AutoBreadcrumb({ config }: { config: NavConfig }) {
  const pathname = usePathname()
  const crumbs = buildCrumbs(pathname, config)

  if (crumbs.length === 0) return null

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1
          return (
            <Fragment key={`${crumb.url}-${index}`}>
              <BreadcrumbItem>
                {isLast || crumb.url === '#' ? (
                  <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={crumb.url}>{crumb.title}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast ? <BreadcrumbSeparator /> : null}
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
