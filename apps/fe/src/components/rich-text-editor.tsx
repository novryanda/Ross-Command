'use client'

import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  BoldIcon,
  CodeIcon,
  ItalicIcon,
  ListIcon,
  ListOrderedIcon,
  QuoteIcon,
  Redo2Icon,
  StrikethroughIcon,
  Undo2Icon
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

type RichTextEditorProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  minHeight?: string
}

function ToolbarButton({
  active,
  disabled,
  onClick,
  icon: Icon,
  label
}: {
  active?: boolean
  disabled?: boolean
  onClick: () => void
  icon: React.ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <Button
      type='button'
      variant='ghost'
      size='icon'
      className={cn('size-7', active && 'bg-accent text-accent-foreground')}
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      <Icon className='size-3.5' />
    </Button>
  )
}

function Toolbar({ editor }: { editor: Editor }) {
  return (
    <div className='flex flex-wrap items-center gap-0.5 border-b p-1'>
      <ToolbarButton
        icon={BoldIcon}
        label='Bold'
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <ToolbarButton
        icon={ItalicIcon}
        label='Italic'
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />
      <ToolbarButton
        icon={StrikethroughIcon}
        label='Strikethrough'
        active={editor.isActive('strike')}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      />
      <ToolbarButton
        icon={CodeIcon}
        label='Code'
        active={editor.isActive('code')}
        onClick={() => editor.chain().focus().toggleCode().run()}
      />

      <Separator orientation='vertical' className='mx-1 h-5!' />

      <ToolbarButton
        icon={ListIcon}
        label='Bullet list'
        active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      />
      <ToolbarButton
        icon={ListOrderedIcon}
        label='Ordered list'
        active={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      />
      <ToolbarButton
        icon={QuoteIcon}
        label='Quote'
        active={editor.isActive('blockquote')}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      />

      <Separator orientation='vertical' className='mx-1 h-5!' />

      <ToolbarButton
        icon={Undo2Icon}
        label='Undo'
        disabled={!editor.can().undo()}
        onClick={() => editor.chain().focus().undo().run()}
      />
      <ToolbarButton
        icon={Redo2Icon}
        label='Redo'
        disabled={!editor.can().redo()}
        onClick={() => editor.chain().focus().redo().run()}
      />
    </div>
  )
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write something...',
  className,
  minHeight = '120px'
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [1, 2, 3] } })],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm dark:prose-invert max-w-none focus:outline-none px-3 py-2 text-sm',
          '[&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_blockquote]:my-1 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm'
        ),
        style: `min-height: ${minHeight}`,
        'data-placeholder': placeholder
      }
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    }
  })

  if (!editor) return null

  return (
    <div className={cn('border-input bg-background overflow-hidden rounded-md border', className)}>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
