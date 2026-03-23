'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

type ConsentStatus = 'pending' | 'accepted' | 'declined'

interface ConsentContextType {
  status: ConsentStatus
  hasConsented: boolean
  accept: () => void
  decline: () => void
  isLoaded: boolean
}

const ConsentContext = createContext<ConsentContextType | undefined>(undefined)

const CONSENT_KEY = 'cookie_consent'

interface ConsentProviderProps {
  children: ReactNode
  adsenseClientId?: string
}

export function ConsentProvider({ children, adsenseClientId }: ConsentProviderProps) {
  const [status, setStatus] = useState<ConsentStatus>('pending')
  const [isLoaded, setIsLoaded] = useState(false)
  const [adsenseLoaded, setAdsenseLoaded] = useState(false)

  const loadAdsenseScript = useCallback(() => {
    if (!adsenseClientId) {
      return
    }

    // Check if script already exists
    if (document.querySelector('script[src*="adsbygoogle"]')) {
      setAdsenseLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`
    script.async = true
    script.crossOrigin = 'anonymous'
    
    script.onload = () => {
      setAdsenseLoaded(true)
    }
    
    script.onerror = () => {
      console.error('Failed to load AdSense script')
    }
    
    document.head.appendChild(script)
  }, [adsenseClientId])

  // Load consent from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY)
    if (stored === 'accepted' || stored === 'declined') {
      setStatus(stored)
    }
    setIsLoaded(true)
  }, [])

  // Load AdSense script when consent is accepted
  useEffect(() => {
    if (status === 'accepted' && adsenseClientId && !adsenseLoaded && typeof window !== 'undefined') {
      loadAdsenseScript()
    }
  }, [status, adsenseClientId, adsenseLoaded, loadAdsenseScript])

  const accept = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, 'accepted')
    setStatus('accepted')
    
    // Dispatch custom event for any listeners
    window.dispatchEvent(new CustomEvent('cookie-consent-change', { 
      detail: { status: 'accepted' } 
    }))
  }, [])

  const decline = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, 'declined')
    setStatus('declined')
    
    // Dispatch custom event for any listeners
    window.dispatchEvent(new CustomEvent('cookie-consent-change', { 
      detail: { status: 'declined' } 
    }))
  }, [])

  return (
    <ConsentContext.Provider 
      value={{ 
        status, 
        hasConsented: status === 'accepted',
        accept, 
        decline,
        isLoaded
      }}
    >
      {children}
    </ConsentContext.Provider>
  )
}

export function useConsent() {
  const context = useContext(ConsentContext)
  if (context === undefined) {
    throw new Error('useConsent must be used within a ConsentProvider')
  }
  return context
}
