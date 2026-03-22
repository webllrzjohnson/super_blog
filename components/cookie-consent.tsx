'use client'

import { useConsent } from '@/lib/consent-context'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { useState } from 'react'

export function CookieConsent() {
  const { status, accept, decline, isLoaded } = useConsent()
  const [showDetails, setShowDetails] = useState(false)

  // Don't render until we've checked localStorage
  if (!isLoaded) return null
  
  // Don't show if user has already made a choice
  if (status !== 'pending') return null

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-consent-title"
    >
      <div className="max-w-3xl mx-auto p-4 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 id="cookie-consent-title" className="text-sm font-medium text-foreground mb-1">
              Cookie Preferences
            </h2>
            <p className="text-sm text-muted-foreground">
              We use cookies to personalize ads and analyze traffic. 
              {!showDetails && (
                <button 
                  onClick={() => setShowDetails(true)}
                  className="text-foreground underline underline-offset-2 hover:no-underline ml-1"
                >
                  Learn more
                </button>
              )}
            </p>
            
            {showDetails && (
              <div className="mt-3 text-sm text-muted-foreground space-y-2 border-t border-border pt-3">
                <div>
                  <strong className="text-foreground">Essential cookies</strong>
                  <span className="ml-2 text-xs bg-secondary px-1.5 py-0.5 rounded">Always active</span>
                  <p className="mt-0.5">Required for the website to function properly.</p>
                </div>
                <div>
                  <strong className="text-foreground">Advertising cookies</strong>
                  <span className="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded">Optional</span>
                  <p className="mt-0.5">Used by Google AdSense to show personalized ads based on your browsing activity.</p>
                </div>
                <div>
                  <strong className="text-foreground">Analytics cookies</strong>
                  <span className="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded">Optional</span>
                  <p className="mt-0.5">Help us understand how visitors interact with our website.</p>
                </div>
                <p className="pt-1">
                  See our{' '}
                  <a 
                    href="/privacy" 
                    className="text-foreground underline underline-offset-2 hover:no-underline"
                  >
                    Privacy Policy
                  </a>{' '}
                  for more details.
                </p>
              </div>
            )}
          </div>
          
          <button 
            onClick={decline}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors md:hidden"
            aria-label="Decline cookies"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={decline}
            className="order-2 sm:order-1"
          >
            Decline optional cookies
          </Button>
          <Button 
            size="sm" 
            onClick={accept}
            className="order-1 sm:order-2"
          >
            Accept all cookies
          </Button>
        </div>
      </div>
    </div>
  )
}
