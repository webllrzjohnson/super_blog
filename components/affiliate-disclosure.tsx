import Link from 'next/link'

export function AffiliateDisclosure() {
  return (
    <div className="bg-secondary/50 border border-border rounded-lg p-4 mb-8">
      <p className="text-sm text-muted-foreground">
        <strong className="text-foreground">Disclosure:</strong> This post may contain affiliate links. 
        If you make a purchase through these links, I may earn a small commission at no extra cost to you. 
        See my{' '}
        <Link href="/disclaimer" className="underline hover:text-foreground transition-colors">
          full disclosure
        </Link>
        .
      </p>
    </div>
  )
}
