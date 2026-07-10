import LegalLayout, { LegalSection } from "@/components/LegalLayout";
import { Shield } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy" icon={Shield} lastUpdated="July 10, 2026">
      <LegalSection title="1. Introduction">
        <p>
          Under Par Mindset (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates a
          mental performance training application for junior golfers. This Privacy Policy explains
          how we collect, use, and protect your personal information when you use our app.
        </p>
      </LegalSection>

      <LegalSection title="2. Information We Collect">
        <p>We collect the following types of information:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong className="text-foreground">Account Information:</strong> Name, email address,
            phone number, and date of birth.
          </li>
          <li>
            <strong className="text-foreground">Performance Data:</strong> Golf round scores,
            course information, fairways hit, greens in regulation, and putting statistics.
          </li>
          <li>
            <strong className="text-foreground">Mental Training Data:</strong> Journal entries, Win
            The Day focus reports, Mental Gym progress, and goals.
          </li>
          <li>
            <strong className="text-foreground">Billing Information:</strong> Processed through
            Stripe — we do not store your credit card details.
          </li>
          <li>
            <strong className="text-foreground">Usage Data:</strong> How you interact with the app,
            used to improve features and user experience.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. How We Use Your Information">
        <ul className="list-disc pl-5 space-y-1">
          <li>Provide and personalize your training experience</li>
          <li>Send SMS reminders for daily training (if you&rsquo;ve provided your phone number)</li>
          <li>Process subscription payments through Stripe</li>
          <li>Notify you about new features, badges, and achievements</li>
          <li>Respond to your support requests</li>
          <li>Improve our app and develop new features</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Information Sharing">
        <p>We share your data only in these circumstances:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            With <strong className="text-foreground">coaches or parents</strong> you explicitly
            invite through the app&rsquo;s Invite feature
          </li>
          <li>With <strong className="text-foreground">Stripe</strong> for payment processing</li>
          <li>
            With <strong className="text-foreground">service providers</strong> who help us operate
            (e.g., Twilio for SMS reminders)
          </li>
          <li>When required by law or to protect our legal rights</li>
        </ul>
        <p>We never sell your personal information to third parties.</p>
      </LegalSection>

      <LegalSection title="5. Children's Privacy">
        <p>
          Our app is designed for junior golfers, including users under 18. If you are under 13,
          you must use this app with parental or guardian consent. We collect only the minimal
          information necessary to provide the service. Parents or guardians may review, correct,
          or delete their child&rsquo;s data at any time by contacting us through the Support page.
        </p>
      </LegalSection>

      <LegalSection title="6. Data Security">
        <p>
          We use industry-standard security measures including encryption in transit and at rest,
          access controls, and regular security reviews. No method of transmission over the
          internet is 100% secure, but we work hard to protect your data using commercially
          acceptable means.
        </p>
      </LegalSection>

      <LegalSection title="7. Data Retention">
        <p>
          We retain your data for as long as your account is active. You can request deletion of
          your account and associated data at any time by contacting us through the Support page.
          Some data may be retained for a limited period for legal or accounting purposes after
          account closure.
        </p>
      </LegalSection>

      <LegalSection title="8. Your Rights">
        <p>You have the right to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Access your personal data</li>
          <li>Correct inaccurate information (via Settings)</li>
          <li>Delete your account and associated data</li>
          <li>Export your data</li>
          <li>Opt out of SMS reminders (via Settings &rarr; Profile)</li>
          <li>Withdraw consent for data sharing with coaches/parents (by removing the connection)</li>
        </ul>
      </LegalSection>

      <LegalSection title="9. Cookies">
        <p>
          We use minimal cookies necessary for authentication and basic app functionality. We do
          not use advertising or third-party tracking cookies.
        </p>
      </LegalSection>

      <LegalSection title="10. Changes to This Policy">
        <p>
          We may update this policy from time to time. We will notify you of significant changes
          via email or in-app notification. Continued use of the app after changes constitutes
          acceptance of the updated policy.
        </p>
      </LegalSection>

      <LegalSection title="11. Contact Us">
        <p>
          If you have questions about this Privacy Policy, contact us through the{" "}
          <strong className="text-foreground">Support</strong> page in the app, or send us a
          message directly from the Support page.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}