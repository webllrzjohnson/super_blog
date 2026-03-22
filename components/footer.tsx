import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-border/60 mt-12">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <p className="text-sm text-muted-foreground mb-4">
          Subscribe <Link href="/#newsletter" className="underline decoration-2 underline-offset-2 hover:text-foreground transition-colors">with email</Link> or{' '}
          <a href="/feed" className="underline decoration-2 underline-offset-2 hover:text-foreground transition-colors">with RSS</a>!
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
          <Link href="/blog/tags" className="hover:text-foreground transition-colors">Tags</Link>
          <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
          <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          <Link href="/disclaimer" className="hover:text-foreground transition-colors">Disclaimer</Link>
        </div>
        <p className="text-sm text-muted-foreground mt-8">
          &copy; {new Date().getFullYear()} Lester J.
        </p>
      </div>
    </footer>
  )
}
