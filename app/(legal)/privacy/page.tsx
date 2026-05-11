import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy — IELTS4Life',
  description: 'Privacy Policy for IELTS4Life — AI-powered IELTS Writing coach.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
      <div className="mb-8">
        <Link href="/" className="text-ocean-600 hover:text-ocean-700 text-sm">← Back to IELTS4Life</Link>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
      <p className="text-slate-500 mb-10">Last updated: May 11, 2025</p>

      <div className="prose prose-slate max-w-none space-y-8">

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">1. Introduction</h2>
          <p className="text-slate-600 leading-relaxed">
            IELTS4Life (<strong>ielts4life.com</strong>) is an AI-powered IELTS Writing Task 2 coaching service
            operated by <strong>Chau Phuc Khang</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;).
            This Privacy Policy explains what information we collect, how we use it, and your rights regarding your data.
            By using IELTS4Life, you agree to the practices described in this policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">2. Information We Collect</h2>

          <h3 className="text-base font-semibold text-slate-700 mt-4 mb-2">Account Information</h3>
          <p className="text-slate-600 leading-relaxed">
            When you create an account — via email/password or Google Sign-In — we collect your
            <strong> email address</strong> and <strong>full name</strong>. This information is used to
            identify your account and personalize your experience.
          </p>

          <h3 className="text-base font-semibold text-slate-700 mt-4 mb-2">Essay Content</h3>
          <p className="text-slate-600 leading-relaxed">
            We store the essays you submit along with the AI-generated scores, band feedback, error analysis,
            and improvement suggestions produced for each essay. This data is essential to providing our core service.
          </p>

          <h3 className="text-base font-semibold text-slate-700 mt-4 mb-2">Usage Data</h3>
          <p className="text-slate-600 leading-relaxed">
            We track usage metrics including daily and total essay submission counts, vocabulary views,
            flashcard reviews, and quiz results in order to enforce fair-use quotas and display your progress.
          </p>

          <h3 className="text-base font-semibold text-slate-700 mt-4 mb-2">Payment Data</h3>
          <p className="text-slate-600 leading-relaxed">
            For paid subscriptions and Essay Packs, we store order codes, transaction status, and
            transaction IDs returned by our payment processor (SePay / MB Bank). We do <strong>not</strong> store
            credit card numbers or banking credentials — all payment processing is handled by SePay and MB Bank.
          </p>

          <h3 className="text-base font-semibold text-slate-700 mt-4 mb-2">Device Fingerprint (Guest Users)</h3>
          <p className="text-slate-600 leading-relaxed">
            Visitors who use the service without registering (guests) are identified by a device fingerprint
            generated via FingerprintJS. This fingerprint is used solely to enforce the one-free-essay limit
            for guest users and is not linked to any personal identity.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">3. How We Use Your Information</h2>
          <ul className="list-disc list-inside space-y-2 text-slate-600">
            <li>Provide AI essay scoring using Groq (Llama 3.3-70B) and vocabulary generation using OpenAI GPT-4o.</li>
            <li>Display your score history, vocabulary progress, and learning statistics on your dashboard.</li>
            <li>Enforce daily and total essay quotas based on your subscription tier.</li>
            <li>Process payments and activate Pro subscriptions or Essay Pack bonuses.</li>
            <li>Send in-app notifications about product updates and announcements.</li>
            <li>Prevent abuse of the free tier through rate limiting and device fingerprinting.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">4. Third-Party Services</h2>
          <p className="text-slate-600 leading-relaxed mb-3">
            We rely on the following third-party services to operate IELTS4Life. Each service has its own privacy policy:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-600 border border-slate-200 rounded-lg">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-slate-700">Service</th>
                  <th className="text-left px-4 py-2 font-medium text-slate-700">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr><td className="px-4 py-2">Supabase</td><td className="px-4 py-2">Database storage and user authentication</td></tr>
                <tr><td className="px-4 py-2">Google OAuth</td><td className="px-4 py-2">Sign-in with Google (optional)</td></tr>
                <tr><td className="px-4 py-2">Groq API</td><td className="px-4 py-2">AI essay scoring (Llama 3.3-70B)</td></tr>
                <tr><td className="px-4 py-2">OpenAI</td><td className="px-4 py-2">Vocabulary generation (GPT-4o)</td></tr>
                <tr><td className="px-4 py-2">SePay / MB Bank</td><td className="px-4 py-2">Payment processing</td></tr>
                <tr><td className="px-4 py-2">FingerprintJS</td><td className="px-4 py-2">Device fingerprinting for guest users</td></tr>
                <tr><td className="px-4 py-2">Upstash Redis</td><td className="px-4 py-2">Rate limiting</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-slate-600 leading-relaxed mt-3">
            Your essay content is transmitted to Groq and OpenAI APIs for processing. We do not sell this
            data to third parties or use it for advertising purposes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">5. Data Retention</h2>
          <p className="text-slate-600 leading-relaxed">
            We retain your account data, essays, vocabulary, and usage history for as long as your account
            remains active. If you wish to delete your account and associated data, please contact us at the
            email address below. Guest fingerprint records are retained for a limited period to enforce the
            free-essay limit.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">6. Your Rights</h2>
          <p className="text-slate-600 leading-relaxed">
            You have the right to access the personal data we hold about you and to request its deletion.
            To exercise these rights, please contact us at{' '}
            <a href="mailto:phuckhangtdn@gmail.com" className="text-ocean-600 hover:underline">phuckhangtdn@gmail.com</a>.
            We will respond to your request within a reasonable timeframe.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">7. Children&apos;s Privacy</h2>
          <p className="text-slate-600 leading-relaxed">
            IELTS4Life is not directed at children under the age of 13. We do not knowingly collect personal
            information from children under 13. If you believe a child under 13 has provided us with personal
            information, please contact us so we can delete it.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">8. Changes to This Policy</h2>
          <p className="text-slate-600 leading-relaxed">
            We may update this Privacy Policy from time to time. Material changes will be communicated
            via in-app notifications. The &ldquo;Last updated&rdquo; date at the top of this page will reflect
            the most recent revision.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">9. Contact</h2>
          <p className="text-slate-600 leading-relaxed">
            If you have any questions about this Privacy Policy, please contact us at:{' '}
            <a href="mailto:phuckhangtdn@gmail.com" className="text-ocean-600 hover:underline">
              phuckhangtdn@gmail.com
            </a>
          </p>
        </section>

      </div>
    </div>
  )
}
