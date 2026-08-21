import type { Metadata } from "next";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { ContactForm } from "@/components/contact-form";
import { getSetting } from "@/lib/settings";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.maplehub.cloud";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact The Super's Logbook with feedback, corrections, resource questions, or reader notes.",
  alternates: {
    canonical: `${BASE_URL}/contact`,
  },
};

export default async function ContactPage() {
  const [pages, links] = await Promise.all([
    getSetting("pages"),
    getSetting("links"),
  ]);
  const customContact = pages.contact?.trim();
  const contactEmail =
    links.contactEmail || process.env.CONTACT_EMAIL || "webllrzjohnson@gmail.com";

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 md:py-20">
      <header className="surface-card mb-10 p-6 md:p-8">
        <p className="eyebrow mb-3">Contact</p>
        <h1 className="text-3xl font-semibold tracking-[-0.03em] text-foreground md:text-4xl">
          Contact me
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
          Have a question, comment, correction, or story to share? Send a note
          and I&apos;ll get back to you when I can.
        </p>
      </header>

      <section className="mb-10 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
        <div className="surface-card p-4">
          <p className="font-semibold text-foreground">Good reasons to write</p>
          <p className="mt-1 leading-6">
            Feedback, corrections, resource questions, or a story that connects
            with a post.
          </p>
        </div>
        <div className="surface-card p-4">
          <p className="font-semibold text-foreground">Private by default</p>
          <p className="mt-1 leading-6">
            Messages are used to reply, not published without permission.
          </p>
        </div>
        <div className="surface-card p-4">
          <p className="font-semibold text-foreground">No emergency channel</p>
          <p className="mt-1 leading-6">
            For urgent building, legal, or safety issues, use the proper local
            service.
          </p>
        </div>
      </section>

      <section className="mb-10 surface-card p-6 md:p-8">
        <p className="eyebrow mb-2">How to reach me</p>
        <h2 className="text-2xl font-semibold tracking-[-0.02em] text-foreground">
          Send a message through the form or by email
        </h2>
        <p className="mt-3 leading-7 text-muted-foreground">
          The form below is the easiest way to send feedback from the site. If
          the form is unavailable, you can also email me directly at{" "}
          <Link
            href={`mailto:${contactEmail}`}
            className="font-medium text-primary hover:underline"
          >
            {contactEmail}
          </Link>
          . I read messages personally and try to respond within a few days.
        </p>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Please do not send confidential resident details, emergency requests,
          legal documents, or private building records through this public
          contact page.
        </p>
      </section>

      {customContact && (
        <div className="prose prose-neutral dark:prose-invert max-w-none mb-10 rounded-3xl border border-border/60 bg-card/65 p-6 shadow-sm md:p-8">
          <ReactMarkdown>{customContact}</ReactMarkdown>
        </div>
      )}
      <section className="surface-card p-6 md:p-8">
        <div className="mb-6">
          <p className="eyebrow mb-2">Contact form</p>
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-foreground">
            Write a note
          </h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            Use this form for reader feedback, corrections, resource questions,
            or general messages about The Super&apos;s Logbook.
          </p>
        </div>
        <ContactForm />
      </section>
    </div>
  );
}
