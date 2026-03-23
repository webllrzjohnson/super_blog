import type { Config } from 'tailwindcss'

/**
 * Anthropic-inspired design tokens — mirrors the @theme inline block in
 * app/globals.css (the Tailwind v4 source of truth). To activate this file
 * as the primary config in v4, add `@config "./tailwind.config.ts"` directly
 * after the @import lines in app/globals.css.
 */
const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      // ── Typography ───────────────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Source Serif 4', 'Georgia', 'serif'],
        mono: ['ui-monospace', 'Cascadia Code', 'Source Code Pro', 'Menlo', 'monospace'],
      },
      fontSize: {
        xs:   ['var(--font-size-xs)',   { lineHeight: 'var(--leading-snug)' }],
        sm:   ['var(--font-size-sm)',   { lineHeight: 'var(--leading-normal)' }],
        base: ['var(--font-size-base)', { lineHeight: 'var(--leading-relaxed)' }],
        lg:   ['var(--font-size-lg)',   { lineHeight: 'var(--leading-relaxed)' }],
        xl:   ['var(--font-size-xl)',   { lineHeight: 'var(--leading-normal)' }],
        '2xl':['var(--font-size-2xl)',  { lineHeight: 'var(--leading-snug)' }],
        '3xl':['var(--font-size-3xl)',  { lineHeight: 'var(--leading-snug)' }],
        '4xl':['var(--font-size-4xl)',  { lineHeight: 'var(--leading-tight)' }],
        '5xl':['var(--font-size-5xl)',  { lineHeight: 'var(--leading-tight)' }],
      },
      lineHeight: {
        tight:   'var(--leading-tight)',    // 1.05 — hero / display
        snug:    'var(--leading-snug)',     // 1.20 — h2–h3
        normal:  'var(--leading-normal)',   // 1.50 — h1
        relaxed: 'var(--leading-relaxed)',  // 1.70 — body copy
      },
      letterSpacing: {
        display: 'var(--tracking-display)',  // −0.03 em
        heading: 'var(--tracking-heading)',  // −0.02 em
        body:    'var(--tracking-body)',     //  0.00 em
        label:   'var(--tracking-label)',   // +0.06 em (all-caps labels)
      },
      fontWeight: {
        regular:  'var(--weight-regular)',   // 400
        medium:   'var(--weight-medium)',    // 500
        semibold: 'var(--weight-semibold)',  // 600
      },

      // ── Colour System ─────────────────────────────────────────────────
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT:    'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT:    'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT:    'var(--primary)',   // terracotta
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT:    'var(--secondary)', // warm sand
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT:    'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT:    'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT:    'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        border: 'var(--border)',
        input:  'var(--input)',
        ring:   'var(--ring)',
        chart: {
          '1': 'var(--chart-1)',
          '2': 'var(--chart-2)',
          '3': 'var(--chart-3)',
          '4': 'var(--chart-4)',
          '5': 'var(--chart-5)',
        },
        sidebar: {
          DEFAULT:             'var(--sidebar)',
          foreground:          'var(--sidebar-foreground)',
          primary:             'var(--sidebar-primary)',
          'primary-foreground':'var(--sidebar-primary-foreground)',
          accent:              'var(--sidebar-accent)',
          'accent-foreground': 'var(--sidebar-accent-foreground)',
          border:              'var(--sidebar-border)',
          ring:                'var(--sidebar-ring)',
        },
      },

      // ── Border Radius ─────────────────────────────────────────────────
      borderRadius: {
        sm: 'calc(var(--radius) - 4px)',  // 2 px
        md: 'calc(var(--radius) - 2px)',  // 4 px
        lg: 'var(--radius)',              // 6 px
        xl: 'calc(var(--radius) + 4px)', // 10 px
      },

      // ── Spacing & Layout ──────────────────────────────────────────────
      maxWidth: {
        content: 'var(--max-w-content)', // 1 200 px
        prose:   'var(--max-w-prose)',   //   720 px
      },
      spacing: {
        'section':    'var(--section-y)',     //  96 px
        'section-lg': 'var(--section-y-lg)', // 144 px
        'page-x':     'var(--page-x)',       //  24 px
      },
    },
  },
  plugins: [],
}

export default config
