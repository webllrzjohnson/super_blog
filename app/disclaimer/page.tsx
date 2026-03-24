import type { Metadata } from 'next'
import ReactMarkdown from 'react-markdown'
import { getSetting } from '@/lib/settings'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'

export const metadata: Metadata = {
  title: 'Affiliate Disclaimer',
  description: 'FTC-compliant disclosure about affiliate links and sponsored content.',
  alternates: {
    canonical: `${BASE_URL}/disclaimer`,
  },
}

export default async function DisclaimerPage() {
  const pages = await getSetting('pages')
  const customDisclaimer = pages.disclaimer?.trim()

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
      <header className="mb-12">
        <h1 className="text-3xl font-semibold text-foreground mb-4">
          Affiliate Disclaimer
        </h1>
        <p className="text-muted-foreground">
          Last updated: March 2026
        </p>
      </header>

      {customDisclaimer ? (
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <ReactMarkdown>{customDisclaimer}</ReactMarkdown>
        </div>
      ) : (
      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">FTC Disclosure</h2>
          <p className="text-muted-foreground leading-relaxed">
            In accordance with the Federal Trade Commission (FTC) guidelines concerning the use of endorsements 
            and testimonials in advertising, this website contains affiliate links and other forms of compensation.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Amazon Associates Disclosure</h2>
          <p className="text-muted-foreground leading-relaxed">
            As an Amazon Associate, I earn from qualifying purchases. This means that if you click on a link 
            to Amazon from this website and make a purchase, I may receive a small commission at no additional 
            cost to you.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-4">
            Amazon and the Amazon logo are trademarks of Amazon.com, Inc. or its affiliates.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Other Affiliate Programs</h2>
          <p className="text-muted-foreground leading-relaxed">
            In addition to Amazon, this website may participate in other affiliate programs. This means we may 
            receive commissions on purchases made through links to other retailers or service providers.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-4">
            Affiliate links on this site are typically marked with a small disclosure label or include a 
            &quot;tag&quot; parameter in the URL.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">My Promise to You</h2>
          <p className="text-muted-foreground leading-relaxed">
            While I do earn money through affiliate links, I want to be clear about my principles:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-4 ml-2">
            <li>I only recommend products and services that I genuinely believe in</li>
            <li>I will never let affiliate relationships influence my opinions or recommendations</li>
            <li>If I haven&apos;t personally used a product, I will clearly state that</li>
            <li>Your trust is more important to me than any commission</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Sponsored Content</h2>
          <p className="text-muted-foreground leading-relaxed">
            Occasionally, I may publish sponsored content on this website. Sponsored posts will always be 
            clearly disclosed at the beginning of the article. Even in sponsored content, I maintain editorial 
            independence and will only accept partnerships that align with my values and the interests of my readers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Advertising</h2>
          <p className="text-muted-foreground leading-relaxed">
            This website displays advertisements through Google AdSense and potentially other advertising networks. 
            These ads help support the operation of this website. I do not personally endorse the products or 
            services advertised through these networks unless explicitly stated.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Questions?</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have any questions about this disclaimer or our affiliate relationships, please{' '}
            <a href="/contact" className="underline hover:text-foreground">contact me</a>. 
            I&apos;m happy to provide more information about any specific product recommendation or partnership.
          </p>
        </section>
      </div>
      )}
    </div>
  )
}
