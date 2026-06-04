import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service — IELTS4Life',
  description: 'Terms of Service for IELTS4Life — AI-powered IELTS Writing coach.',
}

export default function TermsOfServicePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
      <div className="mb-8">
        <Link href="/" className="text-ocean-600 hover:text-ocean-700 text-sm">← Back to IELTS4Life</Link>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Terms of Service</h1>
      <p className="text-slate-500 mb-10">Last updated: May 11, 2025</p>

      <div className="prose prose-slate max-w-none space-y-8">

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">1. Acceptance of Terms</h2>
          <p className="text-slate-600 leading-relaxed">
            By accessing or using IELTS4Life (<strong>ielts4life.com</strong>), you agree to be bound by
            these Terms of Service. If you do not agree to these terms, please do not use the service.
            IELTS4Life is operated by <strong>Chau Phuc Khang</strong>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">2. Description of Service</h2>
          <p className="text-slate-600 leading-relaxed">
            IELTS4Life is an AI-powered IELTS Writing Task 2 coaching platform. It provides automated essay
            scoring, detailed band score feedback, vocabulary suggestions, flashcards, and writing prompts
            to help students prepare for the IELTS examination.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">3. User Accounts</h2>
          <ul className="list-disc list-inside space-y-2 text-slate-600">
            <li>You must provide accurate and complete information when creating an account.</li>
            <li>You are responsible for maintaining the security of your account credentials.</li>
            <li>You must not share your account with others or create multiple accounts to circumvent usage limits.</li>
            <li>You must be at least 13 years old to create an account.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">4. Acceptable Use</h2>
          <p className="text-slate-600 leading-relaxed mb-3">You agree not to:</p>
          <ul className="list-disc list-inside space-y-2 text-slate-600">
            <li>Create multiple accounts or use automated scripts to bypass free-tier quotas.</li>
            <li>Submit content that is abusive, illegal, or violates the rights of others.</li>
            <li>Attempt to reverse-engineer the AI scoring system, prompts, or any part of the platform.</li>
            <li>Interfere with the operation of the service or its infrastructure.</li>
            <li>Resell or redistribute IELTS4Life&apos;s AI-generated feedback without permission.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">5. Subscription &amp; Payment</h2>

          <h3 className="text-base font-semibold text-slate-700 mt-4 mb-2">Plans</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-600 border border-slate-200 rounded-lg">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-slate-700">Plan</th>
                  <th className="text-left px-4 py-2 font-medium text-slate-700">Price</th>
                  <th className="text-left px-4 py-2 font-medium text-slate-700">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-4 py-2 font-medium">Free</td>
                  <td className="px-4 py-2">Free</td>
                  <td className="px-4 py-2">3 essays/day, 4 total</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium">Pro</td>
                  <td className="px-4 py-2">75,000 VND/month</td>
                  <td className="px-4 py-2">5 essays/day, unlimited total</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium">Essay Pack</td>
                  <td className="px-4 py-2">50,000 VND (one-time)</td>
                  <td className="px-4 py-2">+15 bonus essays added to your account</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-base font-semibold text-slate-700 mt-4 mb-2">PTNK Students</h3>
          <p className="text-slate-600 leading-relaxed">
            Users with a verified <strong>@ptnk.edu.vn</strong> email address receive Pro-tier features
            at no charge for as long as they use that email address.
          </p>

          <h3 className="text-base font-semibold text-slate-700 mt-4 mb-2">Payment &amp; Refunds</h3>
          <p className="text-slate-600 leading-relaxed">
            Payments are processed via SePay and MB Bank transfer. Because IELTS4Life provides a digital
            service that is consumed immediately upon activation, <strong>all payments are non-refundable</strong> once
            a subscription or Essay Pack has been activated. If you experience a technical issue with payment
            processing, please contact us within 48 hours at{' '}
            <a href="mailto:phuckhangtdn@gmail.com" className="text-ocean-600 hover:underline">phuckhangtdn@gmail.com</a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">6. AI Disclaimer</h2>
          <p className="text-slate-600 leading-relaxed">
            Scores and feedback generated by IELTS4Life are produced by AI models and are provided for
            <strong> practice and learning purposes only</strong>. They are not official IELTS results and
            should not be relied upon as a guarantee of performance in an actual IELTS examination.
            Band score estimates may differ from scores awarded by certified IELTS examiners.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">7. Intellectual Property</h2>
          <p className="text-slate-600 leading-relaxed">
            The IELTS4Life platform, including its design, AI prompts, scoring logic, and all generated content,
            is owned by Chau Phuc Khang. You retain ownership of the essays you submit. By submitting essays,
            you grant us a limited, non-exclusive licence to process your content solely for the purpose of
            providing the service (AI scoring, feedback generation).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">8. Termination</h2>
          <p className="text-slate-600 leading-relaxed">
            We reserve the right to suspend or terminate accounts that violate these Terms of Service,
            abuse the free quota, or engage in any activity that harms the platform or other users.
            You may discontinue use of the service at any time.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">9. Limitation of Liability</h2>
          <p className="text-slate-600 leading-relaxed">
            To the maximum extent permitted by law, IELTS4Life and its operator shall not be liable for
            any indirect, incidental, or consequential damages arising from your use of the service,
            including but not limited to loss of data, inaccurate AI scores, or service interruptions.
            The service is provided &ldquo;as is&rdquo; without warranties of any kind.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">10. Changes to These Terms</h2>
          <p className="text-slate-600 leading-relaxed">
            We may update these Terms of Service from time to time. Continued use of the service after
            changes are posted constitutes your acceptance of the revised terms. The &ldquo;Last updated&rdquo; date
            at the top of this page indicates when the terms were last revised.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">11. Contact</h2>
          <p className="text-slate-600 leading-relaxed">
            For any questions about these Terms of Service, please contact us at:{' '}
            <a href="mailto:phuckhangtdn@gmail.com" className="text-ocean-600 hover:underline">
              phuckhangtdn@gmail.com
            </a>
          </p>
        </section>

      </div>
    </div>
  )
}
