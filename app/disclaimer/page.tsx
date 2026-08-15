import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

export const metadata: Metadata = {
  title: "Affiliate Disclaimer",
  description:
    "FTC-compliant disclosure about affiliate links and sponsored content.",
  alternates: {
    canonical: `${BASE_URL}/disclaimer`,
  },
};

export default async function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 md:py-20">
      <header className="surface-card mb-10 p-6 md:p-8">
        <p className="eyebrow mb-3">Disclosure</p>
        <h1 className="text-3xl font-semibold tracking-[-0.03em] text-foreground md:text-4xl">
          Affiliate Disclaimer
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
          Some links and ads may help support the site. This page explains what
          that means and how I separate support from editorial judgment.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Last updated: March 2026
        </p>
      </header>

      <section className="mb-10 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
        <div className="surface-card p-4">
          <p className="font-semibold text-foreground">No extra cost</p>
          <p className="mt-1 leading-6">
            Affiliate commissions, when they apply, do not add to your purchase
            price.
          </p>
        </div>
        <div className="surface-card p-4">
          <p className="font-semibold text-foreground">Clear labels</p>
          <p className="mt-1 leading-6">
            Affiliate or sponsored relationships should be disclosed near the
            relevant content.
          </p>
        </div>
        <div className="surface-card p-4">
          <p className="font-semibold text-foreground">Reader trust first</p>
          <p className="mt-1 leading-6">
            Recommendations should stay grounded in usefulness, not commission
            size.
          </p>
        </div>
      </section>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 rounded-3xl border border-border/60 bg-card/65 p-6 shadow-sm md:p-8">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            FTC Disclosure
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            In accordance with the Federal Trade Commission (FTC) guidelines
            concerning the use of endorsements and testimonials in advertising,
            this website contains affiliate links and other forms of
            compensation.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Amazon Associates Disclosure
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            As an Amazon Associate, I earn from qualifying purchases. This means
            that if you click on a link to Amazon from this website and make a
            purchase, I may receive a small commission at no additional cost to
            you.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-4">
            Amazon and the Amazon logo are trademarks of Amazon.com, Inc. or its
            affiliates.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Other Affiliate Programs
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            In addition to Amazon, this website may participate in other
            affiliate programs. This means we may receive commissions on
            purchases made through links to other retailers or service
            providers.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-4">
            Affiliate links on this site are typically marked with a small
            disclosure label or include a &quot;tag&quot; parameter in the URL.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            My Promise to You
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            While I do earn money through affiliate links, I want to be clear
            about my principles:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-4 ml-2">
            <li>
              I only recommend products and services that I genuinely believe in
            </li>
            <li>
              I will never let affiliate relationships influence my opinions or
              recommendations
            </li>
            <li>
              If I haven&apos;t personally used a product, I will clearly state
              that
            </li>
            <li>Your trust is more important to me than any commission</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Sponsored Content
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Occasionally, I may publish sponsored content on this website.
            Sponsored posts will always be clearly disclosed at the beginning of
            the article. Even in sponsored content, I maintain editorial
            independence and will only accept partnerships that align with my
            values and the interests of my readers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Advertising
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            This website displays advertisements through Google AdSense and
            potentially other advertising networks. These ads help support the
            operation of this website. Advertising partners may use cookies or
            similar technologies to serve and measure ads, subject to your
            cookie choices and the details in the Privacy Policy. I do not
            personally endorse the products or services advertised through these
            networks unless explicitly stated.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Questions?
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have any questions about this disclaimer or our affiliate
            relationships, please{" "}
            <a href="/contact" className="underline hover:text-foreground">
              contact me
            </a>
            . I&apos;m happy to provide more information about any specific
            product recommendation or partnership.
          </p>
        </section>
      </div>
    </div>
  );
}
