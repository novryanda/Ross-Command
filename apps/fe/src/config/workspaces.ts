import { BriefcaseIcon, RocketIcon, SparklesIcon } from 'lucide-react'

import type { Workspace } from '@/components/app-shell/workspace-switcher'

export const workspaces: Workspace[] = [
  { id: 'mocci', name: 'Moccilabs', plan: 'Enterprise', logo: SparklesIcon },
  { id: 'acme', name: 'Acme Inc.', plan: 'Pro', logo: RocketIcon },
  { id: 'studio', name: 'Studio', plan: 'Free', logo: BriefcaseIcon }
]
