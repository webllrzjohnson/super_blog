import { describe, expect, it } from 'vitest'
import {
  insertAroundSelection,
  insertImageMarkdown,
  insertLinkMarkdown,
  insertSnippet,
  prefixSelectedLines,
  prefixSelectedLinesOrdered,
} from '@/lib/markdown-content-helpers'

describe('insertAroundSelection', () => {
  it('wraps selection', () => {
    const r = insertAroundSelection('hello world', { start: 6, end: 11 }, '**', '**', 'bold')
    expect(r.text).toBe('hello **world**')
    expect(r.text.slice(r.selStart, r.selEnd)).toBe('world')
  })

  it('inserts placeholder when empty selection', () => {
    const r = insertAroundSelection('ab', { start: 1, end: 1 }, '`', '`', 'code')
    expect(r.text).toBe('a`code`b')
    expect(r.text.slice(r.selStart, r.selEnd)).toBe('code')
  })
})

describe('insertLinkMarkdown', () => {
  it('wraps selected text and selects url', () => {
    const r = insertLinkMarkdown('see TEXT here', { start: 4, end: 8 })
    expect(r.text).toBe('see [TEXT](https://) here')
    expect(r.text.slice(r.selStart, r.selEnd)).toBe('https://')
  })

  it('inserts link template and selects label when empty', () => {
    const r = insertLinkMarkdown('x', { start: 1, end: 1 })
    expect(r.text).toBe('x[link text](https://)')
    expect(r.text.slice(r.selStart, r.selEnd)).toBe('link text')
  })
})

describe('insertImageMarkdown', () => {
  it('wraps selected text as alt and selects url', () => {
    const r = insertImageMarkdown('x ALT y', { start: 2, end: 5 })
    expect(r.text).toBe('x ![ALT](https://) y')
    expect(r.text.slice(r.selStart, r.selEnd)).toBe('https://')
  })

  it('inserts image template and selects alt when empty', () => {
    const r = insertImageMarkdown('ab', { start: 1, end: 1 })
    expect(r.text).toBe('a![Image description](https://)b')
    expect(r.text.slice(r.selStart, r.selEnd)).toBe('Image description')
  })
})

describe('prefixSelectedLines', () => {
  it('prefixes one line', () => {
    const r = prefixSelectedLines('aa\nbb\ncc', { start: 3, end: 3 }, '## ')
    expect(r.text).toBe('aa\n## bb\ncc')
  })

  it('prefixes multiple lines', () => {
    const r = prefixSelectedLines('a\nb\nc', { start: 0, end: 3 }, '- ')
    expect(r.text).toBe('- a\n- b\nc')
  })

  it('does not double-prefix', () => {
    const r = prefixSelectedLines('- x', { start: 0, end: 3 }, '- ')
    expect(r.text).toBe('- x')
  })
})

describe('prefixSelectedLinesOrdered', () => {
  it('numbers lines', () => {
    const r = prefixSelectedLinesOrdered('a\nb', { start: 0, end: 3 })
    expect(r.text).toBe('1. a\n2. b')
  })

  it('skips already numbered lines', () => {
    const r = prefixSelectedLinesOrdered('1. x\ny', { start: 0, end: 7 })
    expect(r.text).toBe('1. x\n2. y')
  })
})

describe('insertSnippet', () => {
  it('inserts at caret', () => {
    const r = insertSnippet('ab', { start: 1, end: 1 }, '---\n\n')
    expect(r.text).toBe('a---\n\nb')
  })
})
