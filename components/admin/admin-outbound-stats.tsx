'use client'

import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { OutboundClickStatsSummary } from '@/lib/outbound-click-stats'

type ApiOk = { configured: true; summary: OutboundClickStatsSummary }
type ApiUnconfigured = { configured: false; message: string; summary: null }
type ApiResponse = ApiOk | ApiUnconfigured

export function AdminOutboundStats() {
  const [days, setDays] = useState(30)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ApiResponse | null>(null)

  const load = useCallback(async (d: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/outbound-stats?days=${d}`, { credentials: 'include' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Request failed (${res.status})`)
      }
      setData(await res.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load(days)
  }, [days, load])

  const summary = data?.configured ? data.summary : null

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Link clicks</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Outbound and affiliate link clicks from post bodies (beacon). Totals are capped
          by the newest 12,000 events in the selected window.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-2">
          <Label htmlFor="outbound-days">Time range</Label>
          <select
            id="outbound-days"
            value={String(days)}
            onChange={(e) => setDays(Number(e.target.value))}
            className="h-10 px-3 rounded-md border border-input bg-background text-foreground min-w-[10rem]"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={() => load(days)}
        >
          Refresh
        </Button>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {data && !data.configured && (
        <p className="text-sm text-amber-700 dark:text-amber-500 border border-border rounded-md p-4 bg-muted/40">
          {data.message}
        </p>
      )}

      {summary && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border p-4 bg-card">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Total clicks
              </p>
              <p className="text-2xl font-semibold tabular-nums">{summary.totalClicks}</p>
            </div>
            <div className="rounded-lg border border-border p-4 bg-card">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Affiliate (detected)
              </p>
              <p className="text-2xl font-semibold tabular-nums">
                {summary.affiliateClicks}
              </p>
            </div>
            <div className="rounded-lg border border-border p-4 bg-card">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Other outbound
              </p>
              <p className="text-2xl font-semibold tabular-nums">
                {summary.externalClicks}
              </p>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium mb-2">By post</h3>
              <div className="rounded-md border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left">
                    <tr>
                      <th className="p-2 font-medium">Slug</th>
                      <th className="p-2 font-medium text-right">Total</th>
                      <th className="p-2 font-medium text-right">Aff.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.byPost.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-4 text-muted-foreground">
                          No events in this range.
                        </td>
                      </tr>
                    ) : (
                      summary.byPost.map((row) => (
                        <tr key={row.postSlug} className="border-t border-border">
                          <td className="p-2 font-mono text-xs break-all">{row.postSlug}</td>
                          <td className="p-2 text-right tabular-nums">{row.total}</td>
                          <td className="p-2 text-right tabular-nums text-muted-foreground">
                            {row.affiliate}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">By host</h3>
              <div className="rounded-md border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left">
                    <tr>
                      <th className="p-2 font-medium">Host</th>
                      <th className="p-2 font-medium text-right">Total</th>
                      <th className="p-2 font-medium text-right">Aff.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.byHost.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-4 text-muted-foreground">
                          No events in this range.
                        </td>
                      </tr>
                    ) : (
                      summary.byHost.map((row) => (
                        <tr key={row.host} className="border-t border-border">
                          <td className="p-2 font-mono text-xs break-all">{row.host}</td>
                          <td className="p-2 text-right tabular-nums">{row.total}</td>
                          <td className="p-2 text-right tabular-nums text-muted-foreground">
                            {row.affiliate}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Recent events</h3>
            <ul className="text-xs font-mono space-y-1 text-muted-foreground max-h-48 overflow-y-auto border border-border rounded-md p-3 bg-muted/20">
              {summary.recent.length === 0 ? (
                <li>No recent events.</li>
              ) : (
                summary.recent.map((r, i) => (
                  <li key={`${r.createdAt}-${i}`}>
                    <span className="text-foreground/80">
                      {new Date(r.createdAt).toLocaleString()}
                    </span>{' '}
                    · {r.postSlug} · {r.host}
                    {r.isAffiliate ? ' · affiliate' : ''}
                  </li>
                ))
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
