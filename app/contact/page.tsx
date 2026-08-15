import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import { ContactForm } from "@/components/contact-form";
import { getSetting } from "@/lib/settings";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with me. I'd love to hear from you.",
  alternates: {
    canonical: `${BASE_URL}/contact`,
  },
};

export default async function ContactPage() {
  const pages = await getSetting("pages");
  const customContact = pages.contact?.trim();

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

      {customContact && (
        <div className="prose prose-neutral dark:prose-invert max-w-none mb-10 rounded-3xl border border-border/60 bg-card/65 p-6 shadow-sm md:p-8">
          <ReactMarkdown>{customContact}</ReactMarkdown>
        </div>
      )}
      <section className="surface-card p-6 md:p-8">
        <ContactForm />
      </section>
    </div>
  );
}
