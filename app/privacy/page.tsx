import type { Metadata } from 'next'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { getSetting } from '@/lib/settings'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Our GDPR-compliant privacy policy explains how we collect, use, and protect your personal information when using Google AdSense and Amazon affiliate links.',
}

export default async function PrivacyPage() {
  const [pages, links] = await Promise.all([
    getSetting('pages'),
    getSetting('links'),
  ])
  const customPrivacy = pages.privacy?.trim()
  const contactEmail =
    links.contactEmail || process.env.CONTACT_EMAIL || 'privacy@example.com'

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
      <header className="mb-12">
        <h1 className="text-3xl font-semibold text-foreground mb-4">
          Privacy Policy
        </h1>
        <p className="text-muted-foreground">
          Last updated: March 22, 2026
        </p>
      </header>

      {customPrivacy ? (
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <ReactMarkdown>{customPrivacy}</ReactMarkdown>
        </div>
      ) : (
      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-10">
        
        {/* Introduction */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">1. Introduction</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Welcome to Lester J.&apos;s blog (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). This Privacy Policy 
            explains how we collect, use, disclose, and safeguard your information when you visit our website 
            (the &quot;Site&quot;), including any other media form, media channel, mobile website, or mobile 
            application related or connected thereto.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We are committed to protecting your personal data and respecting your privacy. This policy complies with 
            the General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA), and other 
            applicable data protection laws.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Please read this Privacy Policy carefully. If you do not agree with the terms of this Privacy Policy, 
            please do not access the Site.
          </p>
        </section>

        {/* Data Controller */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">2. Data Controller</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            For the purposes of GDPR, the data controller is:
          </p>
          <div className="bg-muted/50 p-4 rounded-lg text-muted-foreground">
            <p><strong className="text-foreground">Lester J.</strong></p>
            <p>Email: {contactEmail}</p>
            <p>Contact: <Link href="/contact" className="underline hover:text-foreground">Contact Form</Link></p>
          </div>
        </section>

        {/* Information We Collect */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">3. Information We Collect</h2>
          
          <h3 className="text-lg font-medium text-foreground mt-6 mb-3">3.1 Information Automatically Collected</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            When you visit our Site, we may automatically collect certain information about your device and your 
            visit, including:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2 mb-4">
            <li><strong className="text-foreground">Device Information:</strong> Browser type and version, operating system, device type, screen resolution</li>
            <li><strong className="text-foreground">Usage Data:</strong> Pages visited, time spent on pages, click patterns, scroll depth</li>
            <li><strong className="text-foreground">Connection Data:</strong> IP address (which may be anonymized), internet service provider, referring/exit pages</li>
            <li><strong className="text-foreground">Location Data:</strong> Approximate geographic location based on IP address (country/region level only)</li>
            <li><strong className="text-foreground">Temporal Data:</strong> Date and time of your visit, time zone</li>
          </ul>

          <h3 className="text-lg font-medium text-foreground mt-6 mb-3">3.2 Information You Provide Voluntarily</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We may collect information that you voluntarily provide when you:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2 mb-4">
            <li>Subscribe to our newsletter (email address, name)</li>
            <li>Submit a contact form (name, email address, message content)</li>
            <li>Leave comments on blog posts (name, email address, comment content)</li>
            <li>Participate in surveys or promotions</li>
          </ul>

          <h3 className="text-lg font-medium text-foreground mt-6 mb-3">3.3 Information from Third Parties</h3>
          <p className="text-muted-foreground leading-relaxed">
            We may receive information about you from third-party services such as Google Analytics, Google AdSense, 
            and Amazon Associates when you interact with advertisements or affiliate links on our Site.
          </p>
        </section>

        {/* Legal Basis for Processing */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">4. Legal Basis for Processing (GDPR)</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Under GDPR, we must have a lawful basis for processing your personal data. We rely on the following 
            legal bases:
          </p>
          <ul className="list-disc list-inside space-y-3 text-muted-foreground ml-2">
            <li>
              <strong className="text-foreground">Consent (Article 6(1)(a)):</strong> For non-essential cookies 
              (advertising, analytics), newsletter subscriptions, and personalized advertising. You can withdraw 
              consent at any time.
            </li>
            <li>
              <strong className="text-foreground">Legitimate Interests (Article 6(1)(f)):</strong> For website 
              security, fraud prevention, site functionality improvements, and understanding how visitors use our Site.
            </li>
            <li>
              <strong className="text-foreground">Contract Performance (Article 6(1)(b)):</strong> When you request 
              us to perform a specific service, such as responding to your inquiries.
            </li>
            <li>
              <strong className="text-foreground">Legal Obligation (Article 6(1)(c)):</strong> When we must comply 
              with legal requirements.
            </li>
          </ul>
        </section>

        {/* How We Use Your Information */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">5. How We Use Your Information</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We use the information we collect for the following purposes:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
            <li>To operate, maintain, and improve our Site</li>
            <li>To personalize your experience and deliver content relevant to your interests</li>
            <li>To serve advertisements through Google AdSense (with your consent)</li>
            <li>To track affiliate purchases through Amazon Associates</li>
            <li>To analyze Site traffic and usage patterns via Google Analytics</li>
            <li>To respond to your inquiries and provide customer support</li>
            <li>To send you our newsletter (if you have subscribed)</li>
            <li>To detect, prevent, and address technical issues and security threats</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        {/* Cookies and Tracking */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">6. Cookies and Tracking Technologies</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Cookies are small text files stored on your device when you visit a website. We use cookies and similar 
            technologies for the following purposes:
          </p>

          <h3 className="text-lg font-medium text-foreground mt-6 mb-3">6.1 Essential Cookies</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            These cookies are strictly necessary for the Site to function and cannot be disabled. They include:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2 mb-4">
            <li>Session management cookies</li>
            <li>Cookie consent preferences</li>
            <li>Security cookies</li>
            <li>Theme preference (dark/light mode)</li>
          </ul>

          <h3 className="text-lg font-medium text-foreground mt-6 mb-3">6.2 Analytics Cookies (Consent Required)</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            With your consent, we use Google Analytics to understand how visitors interact with our Site. These 
            cookies collect information in an anonymous form, including:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2 mb-4">
            <li>Number of visitors</li>
            <li>Pages visited and time spent</li>
            <li>Traffic sources</li>
            <li>User journey through the Site</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            Google Analytics cookies: _ga, _ga_*, _gid, _gat
          </p>

          <h3 className="text-lg font-medium text-foreground mt-6 mb-3">6.3 Advertising Cookies (Consent Required)</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            With your consent, we display advertisements through Google AdSense. Google and its partners use cookies to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2 mb-4">
            <li>Serve ads based on your prior visits to this Site or other websites</li>
            <li>Measure ad performance and effectiveness</li>
            <li>Prevent the same ad from being shown repeatedly</li>
            <li>Detect and prevent fraudulent ad clicks</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Google AdSense may set cookies including: IDE, DSID, FLC, AID, TAID, __gads, __gpi
          </p>
          <p className="text-muted-foreground leading-relaxed">
            You can opt out of personalized advertising by visiting{' '}
            <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
              Google Ads Settings
            </a>{' '}
            or{' '}
            <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
              www.aboutads.info/choices
            </a>.
          </p>

          <h3 className="text-lg font-medium text-foreground mt-6 mb-3">6.4 Managing Your Cookie Preferences</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            When you first visit our Site, you will see a cookie consent banner where you can:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2 mb-4">
            <li>Accept all cookies</li>
            <li>Reject non-essential cookies</li>
            <li>Customize your preferences by category</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            You can change your cookie preferences at any time by clearing your browser cookies and revisiting the 
            Site, or by adjusting your browser settings. Note that blocking certain cookies may impact your 
            experience on the Site.
          </p>
        </section>

        {/* Google AdSense */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">7. Google AdSense</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We use Google AdSense to display advertisements on our Site. Google AdSense is provided by Google LLC 
            (for users outside the EEA) or Google Ireland Limited (for users in the EEA).
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            <strong className="text-foreground">How it works:</strong> Google uses cookies and web beacons to serve 
            ads based on your prior visits to our Site or other websites on the Internet. This is called 
            &quot;interest-based advertising&quot; or &quot;personalized advertising.&quot;
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            <strong className="text-foreground">Your choices:</strong>
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2 mb-4">
            <li>Reject advertising cookies via our cookie consent banner (ads will still appear but will not be personalized)</li>
            <li>Opt out at <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Google Ads Settings</a></li>
            <li>Install the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Google Analytics Opt-out Browser Add-on</a></li>
            <li>Visit <a href="https://www.networkadvertising.org/choices/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Network Advertising Initiative opt-out page</a></li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            For more information, see{' '}
            <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
              How Google Uses Information from Sites That Use Our Services
            </a>.
          </p>
        </section>

        {/* Amazon Associates */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">8. Amazon Associates Program</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We are a participant in the Amazon Services LLC Associates Program, an affiliate advertising program 
            designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com 
            and affiliated sites.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            <strong className="text-foreground">How it works:</strong> When you click on an Amazon affiliate link 
            on our Site and make a purchase, we may earn a small commission at no additional cost to you. Amazon 
            uses cookies to track these referrals.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            <strong className="text-foreground">Data collected by Amazon:</strong>
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2 mb-4">
            <li>Click data (which links you clicked)</li>
            <li>Purchase information (if you buy something)</li>
            <li>Device and browser information</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            For more information, see{' '}
            <a href="https://www.amazon.com/gp/help/customer/display.html?nodeId=201909010" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
              Amazon&apos;s Privacy Notice
            </a>.
          </p>
        </section>

        {/* Data Sharing */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">9. Data Sharing and Disclosure</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We may share your information in the following circumstances:
          </p>
          <ul className="list-disc list-inside space-y-3 text-muted-foreground ml-2">
            <li>
              <strong className="text-foreground">Service Providers:</strong> We share data with third-party 
              service providers who assist us in operating the Site (e.g., hosting providers, analytics services, 
              email service providers). These providers are contractually obligated to protect your data.
            </li>
            <li>
              <strong className="text-foreground">Advertising Partners:</strong> With your consent, we share data 
              with Google AdSense for the purpose of serving advertisements.
            </li>
            <li>
              <strong className="text-foreground">Legal Requirements:</strong> We may disclose your information 
              if required by law, regulation, legal process, or governmental request.
            </li>
            <li>
              <strong className="text-foreground">Protection of Rights:</strong> We may disclose information to 
              protect our rights, privacy, safety, or property, or that of our users or the public.
            </li>
            <li>
              <strong className="text-foreground">Business Transfers:</strong> In the event of a merger, 
              acquisition, or sale of assets, your information may be transferred as part of that transaction.
            </li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-4">
            <strong className="text-foreground">We do not sell your personal information.</strong>
          </p>
        </section>

        {/* International Transfers */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">10. International Data Transfers</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Your information may be transferred to and processed in countries other than your country of residence, 
            including the United States. These countries may have data protection laws that are different from those 
            in your country.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            When we transfer data outside the European Economic Area (EEA), we ensure appropriate safeguards are 
            in place, such as:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
            <li>Standard Contractual Clauses approved by the European Commission</li>
            <li>Data Processing Agreements with our service providers</li>
            <li>Adequacy decisions by the European Commission (where applicable)</li>
          </ul>
        </section>

        {/* Data Retention */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">11. Data Retention</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We retain your personal data only for as long as necessary to fulfill the purposes for which it was 
            collected, including:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2 mb-4">
            <li><strong className="text-foreground">Analytics data:</strong> 26 months (Google Analytics default)</li>
            <li><strong className="text-foreground">Contact form submissions:</strong> 3 years or until you request deletion</li>
            <li><strong className="text-foreground">Newsletter subscriptions:</strong> Until you unsubscribe</li>
            <li><strong className="text-foreground">Cookie consent records:</strong> 12 months</li>
            <li><strong className="text-foreground">Comments:</strong> Indefinitely, unless you request deletion</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            After the retention period, we will securely delete or anonymize your personal data.
          </p>
        </section>

        {/* Your Rights (GDPR) */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">12. Your Rights Under GDPR</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            If you are located in the European Economic Area (EEA), United Kingdom, or Switzerland, you have the 
            following rights regarding your personal data:
          </p>
          <ul className="list-disc list-inside space-y-3 text-muted-foreground ml-2">
            <li>
              <strong className="text-foreground">Right of Access (Article 15):</strong> You can request a copy 
              of the personal data we hold about you.
            </li>
            <li>
              <strong className="text-foreground">Right to Rectification (Article 16):</strong> You can request 
              that we correct any inaccurate or incomplete personal data.
            </li>
            <li>
              <strong className="text-foreground">Right to Erasure (Article 17):</strong> You can request that 
              we delete your personal data (&quot;right to be forgotten&quot;).
            </li>
            <li>
              <strong className="text-foreground">Right to Restrict Processing (Article 18):</strong> You can 
              request that we limit how we use your data.
            </li>
            <li>
              <strong className="text-foreground">Right to Data Portability (Article 20):</strong> You can 
              request a copy of your data in a structured, machine-readable format.
            </li>
            <li>
              <strong className="text-foreground">Right to Object (Article 21):</strong> You can object to our 
              processing of your data for direct marketing or based on legitimate interests.
            </li>
            <li>
              <strong className="text-foreground">Right to Withdraw Consent (Article 7):</strong> Where we rely 
              on consent, you can withdraw it at any time without affecting prior processing.
            </li>
            <li>
              <strong className="text-foreground">Right to Lodge a Complaint:</strong> You can file a complaint 
              with your local data protection authority.
            </li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-4">
            To exercise any of these rights, please contact us at {contactEmail}. We will respond within 
            30 days.
          </p>
        </section>

        {/* Your Rights (CCPA) */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">13. Your Rights Under CCPA (California Residents)</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            If you are a California resident, you have the following rights under the California Consumer Privacy 
            Act (CCPA):
          </p>
          <ul className="list-disc list-inside space-y-3 text-muted-foreground ml-2">
            <li>
              <strong className="text-foreground">Right to Know:</strong> You can request disclosure of the 
              categories and specific pieces of personal information we have collected about you.
            </li>
            <li>
              <strong className="text-foreground">Right to Delete:</strong> You can request deletion of your 
              personal information (subject to certain exceptions).
            </li>
            <li>
              <strong className="text-foreground">Right to Opt-Out of Sale:</strong> We do not sell personal 
              information as defined by CCPA.
            </li>
            <li>
              <strong className="text-foreground">Right to Non-Discrimination:</strong> We will not discriminate 
              against you for exercising your privacy rights.
            </li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-4">
            To exercise these rights, contact us at {contactEmail} or use our{' '}
            <Link href="/contact" className="underline hover:text-foreground">contact form</Link>.
          </p>
        </section>

        {/* Data Security */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">14. Data Security</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We implement appropriate technical and organizational measures to protect your personal data against 
            unauthorized access, alteration, disclosure, or destruction, including:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2 mb-4">
            <li>SSL/TLS encryption for data in transit</li>
            <li>Secure hosting infrastructure</li>
            <li>Regular security assessments</li>
            <li>Access controls and authentication measures</li>
            <li>Data minimization practices</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            However, no method of transmission over the Internet or electronic storage is 100% secure. While we 
            strive to protect your personal data, we cannot guarantee its absolute security.
          </p>
        </section>

        {/* Children's Privacy */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">15. Children&apos;s Privacy</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Our Site is not intended for children under the age of 16 (or 13 in the United States). We do not 
            knowingly collect personal information from children. If you are a parent or guardian and believe 
            your child has provided us with personal information, please contact us immediately at{' '}
            {contactEmail}.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            If we become aware that we have collected personal information from a child without parental consent, 
            we will take steps to delete that information.
          </p>
        </section>

        {/* Do Not Track */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">16. Do Not Track Signals</h2>
          <p className="text-muted-foreground leading-relaxed">
            Some browsers have a &quot;Do Not Track&quot; (DNT) feature that signals to websites that you do not 
            want to be tracked. There is no uniform standard for responding to DNT signals. Currently, we do not 
            respond to DNT browser signals. However, you can manage your cookie preferences through our consent 
            banner.
          </p>
        </section>

        {/* Third-Party Links */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">17. Third-Party Links</h2>
          <p className="text-muted-foreground leading-relaxed">
            Our Site may contain links to third-party websites, including Amazon.com and other affiliate sites. 
            We are not responsible for the privacy practices of these external sites. We encourage you to read 
            the privacy policies of any third-party sites you visit.
          </p>
        </section>

        {/* Changes to Policy */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">18. Changes to This Privacy Policy</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We may update this Privacy Policy from time to time to reflect changes in our practices, technology, 
            legal requirements, or other factors. When we make material changes:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2 mb-4">
            <li>We will update the &quot;Last updated&quot; date at the top of this page</li>
            <li>We may notify you by email (if you have provided one)</li>
            <li>We may display a prominent notice on our Site</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            We encourage you to review this Privacy Policy periodically to stay informed about how we protect 
            your information.
          </p>
        </section>

        {/* Contact Information */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">19. Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, 
            please contact us:
          </p>
          <div className="bg-muted/50 p-4 rounded-lg text-muted-foreground space-y-2">
            <p><strong className="text-foreground">Email:</strong> {contactEmail}</p>
            <p><strong className="text-foreground">Contact Form:</strong>{' '}
              <Link href="/contact" className="underline hover:text-foreground">Submit a Request</Link>
            </p>
            <p><strong className="text-foreground">Response Time:</strong> We aim to respond within 30 days</p>
          </div>
        </section>

        {/* Supervisory Authority */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">20. Supervisory Authority</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            If you are located in the EEA and believe we have not adequately addressed your concerns, you have 
            the right to lodge a complaint with your local data protection supervisory authority. A list of EEA 
            data protection authorities is available at:{' '}
            <a 
              href="https://edpb.europa.eu/about-edpb/about-edpb/members_en" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="underline hover:text-foreground"
            >
              European Data Protection Board
            </a>
          </p>
        </section>

      </div>
      )}
    </div>
  )
}
