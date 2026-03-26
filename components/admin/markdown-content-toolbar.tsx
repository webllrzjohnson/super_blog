'use client'

import type { RefObject } from 'react'
import { Button } from '@/components/ui/button'
import {
  insertAroundSelection,
  insertImageMarkdown,
  insertLinkMarkdown,
  insertSnippet,
  prefixSelectedLines,
  prefixSelectedLinesOrdered,
  type TextSelection,
} from '@/lib/markdown-content-helpers'
import {
  Bold,
  Code,
  Heading2,
  Image,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  TextQuote,
} from 'lucide-react'

export type MarkdownEditResult = {
  text: string
  selStart: number
  selEnd: number
}

type MarkdownContentToolbarProps = {
  textareaRef: RefObject<HTMLTextAreaElement | null>
  disabled?: boolean
  onEdit: (result: MarkdownEditResult) => void
}

function readSelection(ta: HTMLTextAreaElement): TextSelection {
  return { start: ta.selectionStart, end: ta.selectionEnd }
}

export function MarkdownContentToolbar({
  textareaRef,
  disabled,
  onEdit,
}: MarkdownContentToolbarProps) {
  const run = (
    fn: (value: string, sel: TextSelection) => MarkdownEditResult,
    focus: () => void
  ) => {
    const ta = textareaRef.current
    if (!ta || disabled) return
    focus()
    const r = fn(ta.value, readSelection(ta))
    onEdit(r)
  }

  return (
    <div
      className="flex flex-wrap items-center gap-1 rounded-md border border-border bg-muted/40 p-1"
      role="toolbar"
      aria-label="Markdown formatting"
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        disabled={disabled}
        title="Bold (Ctrl+B)"
        aria-label="Bold"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() =>
          run(
            (v, s) => insertAroundSelection(v, s, '**', '**', 'bold'),
            () => textareaRef.current?.focus()
          )
        }
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        disabled={disabled}
        title="Italic (Ctrl+I)"
        aria-label="Italic"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() =>
          run(
            (v, s) => insertAroundSelection(v, s, '*', '*', 'italic'),
            () => textareaRef.current?.focus()
          )
        }
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        disabled={disabled}
        title="Inline code (Ctrl+`)"
        aria-label="Inline code"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() =>
          run(
            (v, s) => insertAroundSelection(v, s, '`', '`', 'code'),
            () => textareaRef.current?.focus()
          )
        }
      >
        <Code className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        disabled={disabled}
        title="Link (Ctrl+K)"
        aria-label="Insert link"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() =>
          run(insertLinkMarkdown, () => textareaRef.current?.focus())
        }
      >
        <Link2 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        disabled={disabled}
        title="Image ![alt](url) (Ctrl+Shift+I)"
        aria-label="Insert image markdown"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() =>
          run(insertImageMarkdown, () => textareaRef.current?.focus())
        }
      >
        <Image className="h-4 w-4" />
      </Button>
      <span className="mx-0.5 h-5 w-px bg-border shrink-0" aria-hidden />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        disabled={disabled}
        title="Heading (##)"
        aria-label="Insert heading"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() =>
          run(
            (v, s) => prefixSelectedLines(v, s, '## '),
            () => textareaRef.current?.focus()
          )
        }
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        disabled={disabled}
        title="Bullet list"
        aria-label="Bullet list"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() =>
          run(
            (v, s) => prefixSelectedLines(v, s, '- '),
            () => textareaRef.current?.focus()
          )
        }
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        disabled={disabled}
        title="Numbered list"
        aria-label="Numbered list"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() =>
          run(prefixSelectedLinesOrdered, () => textareaRef.current?.focus())
        }
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        disabled={disabled}
        title="Blockquote"
        aria-label="Blockquote"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() =>
          run(
            (v, s) => prefixSelectedLines(v, s, '> '),
            () => textareaRef.current?.focus()
          )
        }
      >
        <TextQuote className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        disabled={disabled}
        title="Horizontal rule"
        aria-label="Horizontal rule"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() =>
          run(
            (v, s) => insertSnippet(v, s, '\n\n---\n\n'),
            () => textareaRef.current?.focus()
          )
        }
      >
        <Minus className="h-4 w-4" />
      </Button>
    </div>
  )
}
