import type { Metadata } from 'next'
import { ContactForm } from '@/components/contact-form'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with me. I\'d love to hear from you.',
}

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
      <header className="mb-12">
        <h1 className="text-3xl font-semibold text-foreground mb-4">
          Contact me
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          Have a question, comment, or just want to say hi? I&apos;d love to hear from you. 
          Fill out the form below and I&apos;ll get back to you as soon as I can.
        </p>
      </header>

      <ContactForm />
    </div>
  )
}
