'use client'

import * as React from 'react'

type Theme = 'dark' | 'light' | 'system'
type Attribute = 'class' | `data-${string}`

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
  enableColorScheme?: boolean
  storageKey?: string
  attribute?: Attribute | Attribute[]
  value?: Record<string, string>
}

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'dark' | 'light'
  systemTheme: 'dark' | 'light'
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined)
const THEME_VALUES = new Set<Theme>(['dark', 'light', 'system'])

function getSystemTheme() {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function applyThemeAttribute(
  root: HTMLElement,
  attribute: Attribute | Attribute[],
  theme: Theme,
  value?: Record<string, string>
) {
  const attributes = Array.isArray(attribute) ? attribute : [attribute]
  const resolvedValue = value?.[theme] ?? theme

  for (const attr of attributes) {
    if (attr === 'class') {
      root.classList.remove('light', 'dark')
      root.classList.add(resolvedValue)
      continue
    }

    root.setAttribute(attr, resolvedValue)
  }
}

function disableTransitionsTemporarily() {
  const style = document.createElement('style')
  style.appendChild(
    document.createTextNode(
      '*{-webkit-transition:none!important;transition:none!important}'
    )
  )
  document.head.appendChild(style)

  // Force a style flush before removing the temporary style element.
  window.getComputedStyle(document.body)
  requestAnimationFrame(() => {
    document.head.removeChild(style)
  })
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  enableSystem = true,
  disableTransitionOnChange = false,
  enableColorScheme = true,
  storageKey = 'theme',
  attribute = 'data-theme',
  value,
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme)
  const [systemTheme, setSystemTheme] = React.useState<'dark' | 'light'>('light')

  React.useEffect(() => {
    const saved = window.localStorage.getItem(storageKey)
    const nextTheme = saved && THEME_VALUES.has(saved as Theme) ? (saved as Theme) : defaultTheme
    setThemeState(nextTheme)
    setSystemTheme(getSystemTheme())
  }, [defaultTheme, storageKey])

  React.useEffect(() => {
    if (!enableSystem) return

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => setSystemTheme(media.matches ? 'dark' : 'light')
    handleChange()
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [enableSystem])

  React.useEffect(() => {
    const root = document.documentElement
    const resolvedTheme = theme === 'system' ? (enableSystem ? systemTheme : 'light') : theme

    if (disableTransitionOnChange) {
      disableTransitionsTemporarily()
    }

    applyThemeAttribute(root, attribute, resolvedTheme, value)

    if (enableColorScheme) {
      root.style.colorScheme = resolvedTheme
    }
  }, [
    theme,
    systemTheme,
    enableSystem,
    disableTransitionOnChange,
    attribute,
    value,
    enableColorScheme,
  ])

  const setTheme = React.useCallback(
    (nextTheme: Theme) => {
      setThemeState(nextTheme)
      window.localStorage.setItem(storageKey, nextTheme)
    },
    [storageKey]
  )

  const resolvedTheme = theme === 'system' ? (enableSystem ? systemTheme : 'light') : theme

  const contextValue = React.useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      resolvedTheme,
      systemTheme,
    }),
    [theme, setTheme, resolvedTheme, systemTheme]
  )

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }

  return context
}
