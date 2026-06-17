'use client'

import { useState } from 'react'
import {
  ChevronRightIcon,
  DownloadIcon,
  FileArchiveIcon,
  FileIcon,
  FileImageIcon,
  FileTextIcon,
  FileVideoIcon,
  FolderIcon,
  Grid2x2Icon,
  ListIcon,
  MoreVerticalIcon,
  PencilIcon,
  Trash2Icon,
  UploadCloudIcon
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { PageHeader } from '@/components/showcase'
import { cn } from '@/lib/utils'

type FileType = 'folder' | 'image' | 'video' | 'document' | 'archive' | 'other'

type FileNode = {
  id: string
  name: string
  type: FileType
  size?: string
  modified: string
  items?: number
}

const files: FileNode[] = [
  { id: 'f1', name: 'Design Assets', type: 'folder', modified: '2 days ago', items: 48 },
  { id: 'f2', name: 'Marketing', type: 'folder', modified: '5 days ago', items: 23 },
  { id: 'f3', name: 'Engineering', type: 'folder', modified: '1 week ago', items: 112 },
  { id: 'f4', name: 'brand-guidelines.pdf', type: 'document', size: '4.2 MB', modified: '3 hours ago' },
  { id: 'f5', name: 'hero-banner.png', type: 'image', size: '1.8 MB', modified: '1 day ago' },
  { id: 'f6', name: 'product-demo.mp4', type: 'video', size: '124 MB', modified: '2 days ago' },
  { id: 'f7', name: 'q3-report.pdf', type: 'document', size: '892 KB', modified: '4 days ago' },
  { id: 'f8', name: 'source-backup.zip', type: 'archive', size: '256 MB', modified: '1 week ago' },
  { id: 'f9', name: 'logo-variations.png', type: 'image', size: '3.1 MB', modified: '1 week ago' },
  { id: 'f10', name: 'onboarding-flow.mp4', type: 'video', size: '88 MB', modified: '2 weeks ago' }
]

const typeConfig: Record<FileType, { icon: typeof FileIcon; color: string }> = {
  folder: { icon: FolderIcon, color: 'text-blue-500' },
  image: { icon: FileImageIcon, color: 'text-violet-500' },
  video: { icon: FileVideoIcon, color: 'text-rose-500' },
  document: { icon: FileTextIcon, color: 'text-amber-500' },
  archive: { icon: FileArchiveIcon, color: 'text-emerald-500' },
  other: { icon: FileIcon, color: 'text-muted-foreground' }
}

function FileActions() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='size-7' aria-label='File actions'>
          <MoreVerticalIcon className='size-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={() => toast.success('Download started')}>
          <DownloadIcon className='size-3.5' /> Download
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast.info('Rename dialog (demo)')}>
          <PencilIcon className='size-3.5' /> Rename
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant='destructive' onClick={() => toast.success('Moved to trash')}>
          <Trash2Icon className='size-3.5' /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function FilesPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid')

  return (
    <div className='space-y-6'>
      <PageHeader title='Files' description='Browse and manage your files and folders.' />

      <div className='flex flex-wrap items-center justify-between gap-3'>
        <nav className='text-muted-foreground flex items-center gap-1 text-sm'>
          <button type='button' className='hover:text-foreground'>
            Home
          </button>
          <ChevronRightIcon className='size-3.5' />
          <button type='button' className='hover:text-foreground'>
            Workspace
          </button>
          <ChevronRightIcon className='size-3.5' />
          <span className='text-foreground font-medium'>All files</span>
        </nav>

        <div className='flex items-center gap-2'>
          <div className='border-input flex items-center rounded-md border'>
            <Button
              variant='ghost'
              size='icon'
              className={cn('size-7 rounded-r-none', view === 'grid' && 'bg-accent')}
              onClick={() => setView('grid')}
              aria-label='Grid view'
            >
              <Grid2x2Icon className='size-3.5' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className={cn('size-7 rounded-l-none', view === 'list' && 'bg-accent')}
              onClick={() => setView('list')}
              aria-label='List view'
            >
              <ListIcon className='size-3.5' />
            </Button>
          </div>
          <Button size='sm' className='h-8'>
            <UploadCloudIcon className='size-3.5' /> Upload
          </Button>
        </div>
      </div>

      <Card className='border-dashed'>
        <CardContent className='flex flex-col items-center justify-center gap-2 py-8 text-center'>
          <div className='bg-primary/10 text-primary flex size-10 items-center justify-center rounded-full'>
            <UploadCloudIcon className='size-5' />
          </div>
          <p className='text-sm font-medium'>Drag and drop files here</p>
          <p className='text-muted-foreground text-xs'>or click to browse. Max 500MB per file.</p>
          <Button variant='outline' size='sm' className='mt-1'>
            Choose files
          </Button>
        </CardContent>
      </Card>

      <div className='grid gap-3 sm:grid-cols-3'>
        <Card>
          <CardContent className='space-y-2'>
            <div className='flex items-center justify-between text-sm'>
              <span className='font-medium'>Storage used</span>
              <span className='text-muted-foreground text-xs'>68.4 GB / 100 GB</span>
            </div>
            <Progress value={68} className='h-1.5' />
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className='text-muted-foreground text-xs'>Total files</p>
            <p className='text-xl font-semibold'>1,284</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className='text-muted-foreground text-xs'>Shared with you</p>
            <p className='text-xl font-semibold'>36</p>
          </CardContent>
        </Card>
      </div>

      {view === 'grid' ? (
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
          {files.map((file) => {
            const { icon: Icon, color } = typeConfig[file.type]
            return (
              <Card key={file.id} className='group cursor-pointer transition-shadow hover:shadow-sm'>
                <CardContent className='space-y-3 p-3'>
                  <div className='flex items-start justify-between'>
                    <div className={cn('bg-muted flex size-10 items-center justify-center rounded-lg', color)}>
                      <Icon className='size-5' />
                    </div>
                    <FileActions />
                  </div>
                  <div className='space-y-0.5'>
                    <p className='truncate text-sm font-medium'>{file.name}</p>
                    <p className='text-muted-foreground text-xs'>
                      {file.type === 'folder' ? `${file.items} items` : file.size} · {file.modified}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className='py-0'>
          <Table>
            <TableHeader>
              <TableRow className='hover:bg-transparent'>
                <TableHead className='text-muted-foreground h-10 text-xs first:pl-4'>Name</TableHead>
                <TableHead className='text-muted-foreground h-10 text-xs'>Size</TableHead>
                <TableHead className='text-muted-foreground h-10 text-xs'>Modified</TableHead>
                <TableHead className='text-muted-foreground h-10 w-10 text-xs' />
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((file) => {
                const { icon: Icon, color } = typeConfig[file.type]
                return (
                  <TableRow key={file.id} className='cursor-pointer'>
                    <TableCell className='py-2.5 first:pl-4'>
                      <div className='flex items-center gap-2'>
                        <Icon className={cn('size-4', color)} />
                        <span className='text-sm font-medium'>{file.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className='text-muted-foreground py-2.5 text-sm'>
                      {file.type === 'folder' ? `${file.items} items` : file.size}
                    </TableCell>
                    <TableCell className='text-muted-foreground py-2.5 text-sm'>{file.modified}</TableCell>
                    <TableCell className='py-2.5'>
                      <FileActions />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
