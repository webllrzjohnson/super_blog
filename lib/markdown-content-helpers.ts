/**
 * Selection-based Markdown helpers for plain textarea editing.
 */

export type TextSelection = {
  start: number
  end: number
}

export function insertAroundSelection(
  content: string,
  { start, end }: TextSelection,
  prefix: string,
  suffix: string,
  placeholder: string
): { text: string; selStart: number; selEnd: number } {
  const s = Math.max(0, Math.min(start, content.length))
  const e = Math.max(s, Math.min(end, content.length))
  const chunk = content.slice(s, e)
  const inner = chunk.length > 0 ? chunk : placeholder
  const inserted = prefix + inner + suffix
  const text = content.slice(0, s) + inserted + content.slice(e)
  const selStart = s + prefix.length
  const selEnd = selStart + inner.length
  return { text, selStart, selEnd }
}

export function insertLinkMarkdown(
  content: string,
  { start, end }: TextSelection
): { text: string; selStart: number; selEnd: number } {
  const s = Math.max(0, Math.min(start, content.length))
  const e = Math.max(s, Math.min(end, content.length))
  const chunk = content.slice(s, e)
  const label = chunk.length > 0 ? chunk : 'link text'
  const inserted = `[${label}](https://)`
  const text = content.slice(0, s) + inserted + content.slice(e)
  if (chunk.length === 0) {
    const selStart = s + 1
    const selEnd = s + 1 + label.length
    return { text, selStart, selEnd }
  }
  const urlStart = s + 1 + label.length + 2
  const urlEnd = urlStart + 'https://'.length
  return { text, selStart: urlStart, selEnd: urlEnd }
}

export function insertImageMarkdown(
  content: string,
  { start, end }: TextSelection
): { text: string; selStart: number; selEnd: number } {
  const s = Math.max(0, Math.min(start, content.length))
  const e = Math.max(s, Math.min(end, content.length))
  const chunk = content.slice(s, e)
  const alt = chunk.length > 0 ? chunk : 'Image description'
  const inserted = `![${alt}](https://)`
  const text = content.slice(0, s) + inserted + content.slice(e)
  if (chunk.length === 0) {
    const selStart = s + 2
    const selEnd = s + 2 + alt.length
    return { text, selStart, selEnd }
  }
  const urlStart = s + 2 + alt.length + 2
  const urlEnd = urlStart + 'https://'.length
  return { text, selStart: urlStart, selEnd: urlEnd }
}

function lineBlockBounds(content: string, start: number, end: number): [number, number] {
  const lo = Math.min(start, end)
  const hi = Math.max(start, end)
  const blockStart = content.lastIndexOf('\n', lo - 1) + 1
  let blockEnd = content.indexOf('\n', hi)
  if (blockEnd === -1) {
    blockEnd = content.length
  }
  return [blockStart, blockEnd]
}

/**
 * Prefix each non-empty line in the current line or multi-line selection.
 * Skips lines that already start with the prefix.
 */
export function prefixSelectedLines(
  content: string,
  { start, end }: TextSelection,
  linePrefix: string
): { text: string; selStart: number; selEnd: number } {
  const [blockStart, blockEnd] = lineBlockBounds(content, start, end)
  const block = content.slice(blockStart, blockEnd)
  const lines = block.split('\n')
  const nextLines = lines.map((line) =>
    line.length === 0 || line.startsWith(linePrefix) ? line : `${linePrefix}${line}`
  )
  const nextBlock = nextLines.join('\n')
  const text = content.slice(0, blockStart) + nextBlock + content.slice(blockEnd)
  const delta = nextBlock.length - block.length
  return {
    text,
    selStart: blockStart,
    selEnd: blockEnd + delta,
  }
}

/** Prefixes each line with `1. `, `2. `, …; leaves already-numbered lines unchanged and continues the sequence. */
export function prefixSelectedLinesOrdered(
  content: string,
  { start, end }: TextSelection
): { text: string; selStart: number; selEnd: number } {
  const [blockStart, blockEnd] = lineBlockBounds(content, start, end)
  const block = content.slice(blockStart, blockEnd)
  const lines = block.split('\n')
  let n = 1
  const nextLines = lines.map((line) => {
    if (line.length === 0) return line
    const numbered = line.match(/^(\d+)\.\s(.*)$/)
    if (numbered) {
      n = Math.max(n, parseInt(numbered[1], 10) + 1)
      return line
    }
    return `${n++}. ${line}`
  })
  const nextBlock = nextLines.join('\n')
  const text = content.slice(0, blockStart) + nextBlock + content.slice(blockEnd)
  const delta = nextBlock.length - block.length
  return { text, selStart: blockStart, selEnd: blockEnd + delta }
}

export function insertSnippet(
  content: string,
  { start, end }: TextSelection,
  snippet: string
): { text: string; selStart: number; selEnd: number } {
  const s = Math.max(0, Math.min(start, content.length))
  const e = Math.max(s, Math.min(end, content.length))
  const text = content.slice(0, s) + snippet + content.slice(e)
  const pos = s + snippet.length
  return { text, selStart: pos, selEnd: pos }
}
