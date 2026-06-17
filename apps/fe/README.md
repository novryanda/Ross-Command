# Mocci Admin Template

A modern admin dashboard template built with Next.js 16, React 19, Tailwind CSS v4, and shadcn-style components.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it.

## Tech Stack

- **Next.js 16** (App Router) + **React 19**
- **Tailwind CSS v4** with `tw-animate-css` for animations
- **shadcn-style UI** components (Radix UI primitives)
- **TanStack Table** for data tables
- **Recharts** for charts
- **react-hook-form + zod** for form validation
- **@dnd-kit** for drag and drop (Kanban)
- **TipTap** for rich text editing
- **next-themes** for dark mode
- **Sonner** for toasts
- **Lucide** for icons

## Project Structure

```
src/
├── app/
│   ├── components/       # UI component showcase pages
│   ├── charts/           # Chart examples
│   ├── dashboard-shell-01/  # Commerce dashboard
│   ├── dashboard-saas/   # SaaS metrics dashboard
│   ├── auth/             # Login, register, forgot password
│   ├── pages/            # App pages (settings, profile, kanban, etc.)
│   ├── icons/            # Icon browser
│   └── layout.tsx        # Root layout (theme provider, toaster)
├── components/
│   ├── ui/               # Base UI primitives (button, card, dialog...)
│   ├── app-shell/        # Sidebar, header, shell layout
│   ├── data-table/       # Reusable DataTable component
│   ├── theme-customizer.tsx
│   ├── command-palette.tsx
│   ├── notification-panel.tsx
│   ├── skeletons.tsx     # Loading skeleton components
│   └── ...
├── config/
│   ├── nav.ts            # Sidebar navigation config
│   ├── workspaces.ts     # Workspace switcher data
│   └── theme-presets.ts  # Theme color presets
├── hooks/                # Custom hooks
└── lib/                  # Utilities (cn, etc.)
```

## Pages Included

**Dashboards**
- Commerce dashboard (`/dashboard-shell-01`)
- SaaS dashboard with MRR/ARR/churn metrics (`/dashboard-saas`)

**Auth** (`/auth/*`) — login, register, forgot password (validated with zod)

**App pages** (`/pages/*`)
- Settings (profile / notifications / security tabs)
- Profile, Pricing, Onboarding wizard
- Calendar, Inbox, Chat
- Files (grid/list view), Activity feed
- Kanban (drag-drop + rich text task details)
- Team, Invoice, Help Center
- Empty States, Data Table, Form Examples

**Showcase**
- Components gallery (`/components/*`)
- Charts (`/charts`)
- Icons browser (`/icons`)

## Key Features

### Theming
Theme customizer in the header lets you switch color presets, border radius, and light/dark/system mode. Presets live in `src/config/theme-presets.ts` — add a preset there and a matching CSS block in `src/app/globals.css`.

### Navigation
Sidebar navigation is config-driven via `src/config/nav.ts`. Add a `NavItem` to any group and it appears automatically. The active state is derived from the current pathname.

### Reusable DataTable
`src/components/data-table/data-table.tsx` is a generic table with search, column filters, sorting, column visibility, row selection, and pagination. Pass `columns`, `data`, and optional `filters`, `toolbarActions`, `bulkActions`.

```tsx
<DataTable
  columns={columns}
  data={data}
  searchPlaceholder="Search..."
  filters={[{ columnId: 'status', label: 'Status', options: [...] }]}
  toolbarActions={<Button>Add</Button>}
/>
```

### Forms
Forms use `react-hook-form` + `zod` with the `Form` wrapper in `src/components/ui/form.tsx`. See `/auth/login` or `/pages/settings` for the pattern.

### Loading States
Skeleton components in `src/components/skeletons.tsx` (`StatCardsSkeleton`, `ChartSkeleton`, `TableSkeleton`, `ListSkeleton`, `DashboardSkeleton`). Used via Next.js `loading.tsx` files for route-level loading UI.

### Command Palette
Press `Cmd/Ctrl + K` anywhere to open the command palette. It auto-indexes the sidebar nav plus theme actions.

## Scripts

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## License

Use freely for your projects.
