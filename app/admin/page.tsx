'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLogin } from '@/components/admin/admin-login'
import { AdminDashboard } from '@/components/admin/admin-dashboard'

export default function AdminPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    fetch('/api/auth/session', { credentials: 'include', signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        setIsAuthenticated(data.authenticated === true)
      })
      .catch(() => setIsAuthenticated(false))
      .finally(() => {
        clearTimeout(timeout)
        setIsLoading(false)
      })
  }, [])

  const handleLogin = (success: boolean) => {
    setIsAuthenticated(success)
    if (success) router.refresh()
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    setIsAuthenticated(false)
    router.refresh()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />
  }

  return <AdminDashboard onLogout={handleLogout} />
}
