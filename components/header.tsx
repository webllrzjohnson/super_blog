'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import type { BrandingSettings } from '@/lib/settings'

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Blog', href: '/blog' },
  { label: 'Newsletter', href: '/#newsletter' },
  { label: 'About', href: '/about' },
]

interface HeaderProps {
  branding?: BrandingSettings
}

export function Header({ branding }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const siteName = branding?.siteName || 'Lester J.'
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => { setMounted(true) }, [])

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border/60">
      <nav className="max-w-2xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center gap-3 text-lg font-medium text-foreground hover:text-muted-foreground transition-colors"
          >
            {branding?.logoUrl ? (
              <Image
                src={branding.logoUrl}
                alt={siteName}
                width={32}
                height={32}
                className="h-8 w-8 rounded object-contain"
              />
            ) : null}
            <span>{siteName}</span>
          </Link>

          <div className="flex items-center gap-1">
            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded"
              aria-label="Toggle theme"
            >
              {mounted && theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden pt-3 pb-2 border-t border-border/60 mt-3">
            <div className="flex flex-col gap-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
