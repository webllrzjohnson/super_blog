import type { Metadata } from "next";
import Link from "next/link";
import { getSetting } from "@/lib/settings";
import { SITE_NAME } from "@/lib/site-identity";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE_NAME} handles information, browser storage, submissions, and third-party services.`,
  alternates: {
    canonical: `${BASE_URL}/privacy`,
  },
};

export default async function PrivacyPage() {
  const links = await getSetting("links");
  const contactEmail =
    links.contactEmail || process.env.CONTACT_EMAIL || "privacy@example.com";

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 md:py-20">
      <header className="surface-card mb-10 p-6 md:p-8">
        <p className="eyebrow mb-3">Privacy and data</p>
        <h1 className="text-3xl font-semibold tracking-[-0.03em] text-foreground md:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
          This policy explains how {SITE_NAME} handles information when you
          read, subscribe, contact me, comment, react, or save a bookmark.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Last updated: August 15, 2026
        </p>
      </header>

      <section className="mb-10 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
        <div className="surface-card p-4">
          <p className="font-semibold text-foreground">
            Information you choose
          </p>
          <p className="mt-1 leading-6">
            Contact, newsletter, and comment details are collected only when you
            submit them.
          </p>
        </div>
        <div className="surface-card p-4">
          <p className="font-semibold text-foreground">Local preferences</p>
          <p className="mt-1 leading-6">
            Theme, bookmarks, and an anonymous browser identifier may be stored
            in your browser.
          </p>
        </div>
        <div className="surface-card p-4">
          <p className="font-semibold text-foreground">No ads or affiliates</p>
          <p className="mt-1 leading-6">
            The site does not currently display advertising or use affiliate
            links.
          </p>
        </div>
      </section>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-10 rounded-3xl border border-border/60 bg-card/65 p-6 shadow-sm md:p-8">
        <section>
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            1. About this policy
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            This policy applies to {SITE_NAME} at www.maplehub.cloud. The site
            is operated by Lester J. Questions or privacy requests can be sent
            through the <Link href="/contact">contact form</Link> or to{" "}
            {contactEmail}.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            2. Information handled by the site
          </h2>
          <ul className="ml-2 list-inside list-disc space-y-3 text-muted-foreground">
            <li>
              <strong className="text-foreground">Contact messages:</strong>{" "}
              your name, email address, and message are sent so I can reply.
            </li>
            <li>
              <strong className="text-foreground">Newsletter signups:</strong>{" "}
              your email address is sent to the email service used to manage the
              subscriber list.
            </li>
            <li>
              <strong className="text-foreground">Comments:</strong> your chosen
              display name and comment are stored for moderation and
              publication. An anonymous hashed browser identifier may be
              retained for abuse prevention.
            </li>
            <li>
              <strong className="text-foreground">
                Reactions and bookmarks:
              </strong>{" "}
              selections may be associated with an anonymous browser identifier
              so the feature works consistently.
            </li>
            <li>
              <strong className="text-foreground">Technical requests:</strong>{" "}
              hosting and security systems may process standard request data
              such as IP address, browser information, requested page, and
              timestamps.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            3. Browser storage and cookies
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            The public site uses browser storage for practical features such as
            theme preference, saved bookmarks, and an anonymous identifier used
            by reactions, comments, and optional bookmark synchronization. You
            can clear this information through your browser settings.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            No ad placements or audience analytics are currently enabled. Google
            publisher verification code may make a technical request while the
            site&apos;s application is reviewed. Administrative sign-in uses a
            secure session cookie, but that area is not part of the public
            reader experience.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            4. How information is used
          </h2>
          <ul className="ml-2 list-inside list-disc space-y-2 text-muted-foreground">
            <li>Respond to messages and correction requests</li>
            <li>Manage newsletter subscriptions</li>
            <li>Moderate and publish approved comments</li>
            <li>Provide reactions, bookmarks, and reader preferences</li>
            <li>Protect the site from spam, abuse, and technical failures</li>
            <li>Comply with applicable legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            5. Service providers and sharing
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            Information is shared only with service providers needed to host the
            site, store site data, deliver contact or newsletter email, and
            monitor security or technical errors. Google may also process a
            technical request when publisher verification code loads. These
            providers process information under their own terms and privacy
            commitments. Personal information is not sold.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            6. Advertising and affiliate status
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            {SITE_NAME} does not currently display advertisements, participate
            in Amazon Associates, or use affiliate links. Google publisher
            verification may be present while an application is reviewed, but no
            ad placements are enabled. If advertising, sponsorships, affiliate
            links, or audience analytics are introduced later, this policy and
            the relevant on-page disclosures will be updated before those
            features are used.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            7. Retention and deletion
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            Information is kept only as long as reasonably needed for the
            purpose for which it was submitted, site security, moderation,
            recordkeeping, or legal requirements. You may request correction or
            deletion of information associated with you by contacting me. Some
            anonymous or legally required records may need to be retained.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            8. External links
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            Posts may link to independent websites for reference. Their privacy
            practices are controlled by their operators. An external link does
            not mean that {SITE_NAME} receives compensation from it.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            9. Children&apos;s privacy
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            The site is intended for a general audience and is not directed to
            children. If you believe a child submitted personal information,
            contact me so it can be reviewed and removed where appropriate.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            10. Changes and contact
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            This policy may be updated when site features or service providers
            change. The revision date above will be updated when material
            changes are made. For questions, corrections, access requests, or
            deletion requests, email {contactEmail} or use the{" "}
            <Link href="/contact">contact form</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
