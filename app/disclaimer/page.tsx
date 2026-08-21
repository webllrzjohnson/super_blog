import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME } from "@/lib/site-identity";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

export const metadata: Metadata = {
  title: "Site Disclaimer",
  description: `Important context about the personal stories, practical information, and external links published by ${SITE_NAME}.`,
  alternates: {
    canonical: `${BASE_URL}/disclaimer`,
  },
};

export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 md:py-20">
      <header className="surface-card mb-10 p-6 md:p-8">
        <p className="eyebrow mb-3">Important context</p>
        <h1 className="text-3xl font-semibold tracking-[-0.03em] text-foreground md:text-4xl">
          Site Disclaimer
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
          {SITE_NAME} shares personal stories and practical observations. This
          page explains their limits and the site&apos;s current support status.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Last updated: August 15, 2026
        </p>
      </header>

      <section className="mb-10 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
        <div className="surface-card p-4">
          <p className="font-semibold text-foreground">Personal perspective</p>
          <p className="mt-1 leading-6">
            Posts reflect lived experience and opinion, with sensitive details
            generalized.
          </p>
        </div>
        <div className="surface-card p-4">
          <p className="font-semibold text-foreground">
            Check official sources
          </p>
          <p className="mt-1 leading-6">
            Legal, medical, safety, employment, and technical decisions require
            qualified guidance.
          </p>
        </div>
        <div className="surface-card p-4">
          <p className="font-semibold text-foreground">No paid relationships</p>
          <p className="mt-1 leading-6">
            The site currently has no ads, affiliate links, or sponsored posts.
          </p>
        </div>
      </section>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 rounded-3xl border border-border/60 bg-card/65 p-6 shadow-sm md:p-8">
        <section>
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            About the content
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            Posts on {SITE_NAME} are written from personal experience and
            general observation. Resident, staff, workplace, and property
            details may be anonymized or combined to protect privacy. The site
            is independent and does not speak for an employer, landlord, public
            agency, contractor, or professional association.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            Not professional advice
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            Nothing on this site is legal, medical, mental-health, employment,
            financial, engineering, fire-safety, or other professional advice.
            Rules and best practices vary by location, building, equipment, and
            individual circumstances. Use current official sources and qualified
            professionals before acting on information that could affect rights,
            health, safety, or property.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            Accuracy and updates
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            I aim to publish useful and accurate information, but errors or
            outdated details are possible. Publication and update dates provide
            context; they do not guarantee that every external rule, product
            detail, or procedure remains current. Corrections are welcome
            through the <Link href="/contact">contact page</Link>.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            External links
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            External links may be included as references or useful next steps.
            Third-party websites control their own content, availability, and
            privacy practices. Linking to a site does not imply endorsement or a
            paid relationship.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            Advertising, affiliates, and sponsorships
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            {SITE_NAME} does not currently display advertisements, participate
            in Amazon Associates or another affiliate program, publish sponsored
            posts, or earn commissions from links. Google publisher verification
            may be present while an application is reviewed, but no ad
            placements are enabled. If any commercial relationship is introduced
            later, it will be disclosed clearly and this page will be updated
            before the relationship is used.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            Reader contributions
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            Comments represent the views of their authors. Comments may be
            reviewed, approved, or rejected. Do not submit confidential,
            identifying, or emergency information through comments or the
            contact form.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            Questions or corrections
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            If you have a question about this disclaimer, spot an error, or want
            to request a correction, please{" "}
            <Link href="/contact">contact me</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
