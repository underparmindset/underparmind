import LegalLayout, { LegalSection } from "@/components/LegalLayout";
import { FileText } from "lucide-react";

export default function TermsOfService() {
  return (
    <LegalLayout title="Terms of Service" icon={FileText} lastUpdated="July 10, 2026">
      <LegalSection title="1. Acceptance of Terms">
        <p>
          By creating an account or using Under Par Mindset, you agree to these Terms of Service.
          If you do not agree, please do not use the app. If you are under 18, your parent or
          guardian must agree to these terms on your behalf.
        </p>
      </LegalSection>

      <LegalSection title="2. Description of Service">
        <p>
          Under Par Mindset is a mental performance training application for junior golfers. The
          service provides tools for tracking golf performance, mental training exercises,
          journaling, goal-setting, and optional coaching sessions. We may update, add, or remove
          features at our discretion.
        </p>
      </LegalSection>

      <LegalSection title="3. Account Registration">
        <ul className="list-disc pl-5 space-y-1">
          <li>You must provide accurate and complete information when registering</li>
          <li>You are responsible for keeping your password secure and confidential</li>
          <li>One person per account — do not share your credentials with others</li>
          <li>You are responsible for all activity under your account</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Eligibility and Parental Consent">
        <p>
          This app is designed for junior golfers. Users under 18 must have parental or guardian
          permission to create an account and use the service. Parents or guardians are
          responsible for their child&rsquo;s use of the app, including any subscriptions
          purchased and data shared.
        </p>
      </LegalSection>

      <LegalSection title="5. Subscriptions and Billing">
        <ul className="list-disc pl-5 space-y-1">
          <li>Subscription plans are billed in advance on a monthly, quarterly, or annual basis</li>
          <li>Payments are processed securely by Stripe</li>
          <li>You can cancel your subscription at any time through the billing portal</li>
          <li>Cancellations take effect at the end of your current billing period</li>
          <li>Refunds are handled on a case-by-case basis — contact support for assistance</li>
          <li>Prices are subject to change with reasonable notice to existing subscribers</li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Coaching Sessions">
        <ul className="list-disc pl-5 space-y-1">
          <li>Coaching sessions are purchased separately from subscriptions</li>
          <li>Sessions are scheduled based on coach availability</li>
          <li>Cancellation and rescheduling policies are provided at the time of booking</li>
        </ul>
      </LegalSection>

      <LegalSection title="7. Acceptable Use">
        <p>You agree not to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Use the app for any unlawful purpose</li>
          <li>Attempt to access another user&rsquo;s data without their permission</li>
          <li>Share your account credentials or allow others to use your account</li>
          <li>Reverse engineer, decompile, or attempt to extract the app&rsquo;s source code</li>
          <li>Upload offensive, harmful, or fraudulent content</li>
          <li>Interfere with the proper functioning of the service</li>
        </ul>
      </LegalSection>

      <LegalSection title="8. User Content">
        <p>
          You own the content you create in the app, including journal entries, round data, and
          goal information. You grant us a limited license to use your content solely to provide
          and improve the service. You are responsible for the accuracy of the content you
          submit.
        </p>
      </LegalSection>

      <LegalSection title="9. Intellectual Property">
        <p>
          All app content — including the Mental Gym curriculum, design, branding, and software
          — is owned by Under Par Mindset and protected by intellectual property laws. You may not
          copy, distribute, or create derivative works from our content without written
          permission.
        </p>
      </LegalSection>

      <LegalSection title="10. Disclaimers">
        <p>
          The app is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties
          of any kind. Mental performance coaching and training tools are not a substitute for
          professional medical or psychological care. If you are experiencing mental health issues,
          please consult a qualified healthcare professional.
        </p>
      </LegalSection>

      <LegalSection title="11. Limitation of Liability">
        <p>
          To the maximum extent permitted by law, Under Par Mindset is not liable for any
          indirect, incidental, special, or consequential damages arising from your use of the
          app. Our total liability for any claim is limited to the amount you paid us in the 12
          months preceding the claim.
        </p>
      </LegalSection>

      <LegalSection title="12. Indemnification">
        <p>
          You agree to indemnify and hold harmless Under Par Mindset from claims, damages, or
          expenses arising from your misuse of the app or violation of these Terms.
        </p>
      </LegalSection>

      <LegalSection title="13. Termination">
        <p>
          We may suspend or terminate your account for violations of these Terms. You may delete
          your account at any time by contacting support. Upon termination, your right to use the
          app ceases immediately.
        </p>
      </LegalSection>

      <LegalSection title="14. Changes to Terms">
        <p>
          We may update these Terms from time to time. We will notify you of significant changes
          via email or in-app notification. Continued use of the app after changes constitutes
          acceptance of the updated Terms.
        </p>
      </LegalSection>

      <LegalSection title="15. Governing Law">
        <p>
          These Terms are governed by the laws of the United States, without regard to conflict of
          law principles. Any disputes will be resolved in the courts of competent jurisdiction.
        </p>
      </LegalSection>

      <LegalSection title="16. Contact Us">
        <p>
          Questions about these Terms? Contact us through the{" "}
          <strong className="text-foreground">Support</strong> page in the app.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}