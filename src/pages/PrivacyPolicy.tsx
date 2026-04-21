export default function PrivacyPolicy() {
  return (
    <div className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-serif font-bold text-primary mb-8">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-12">Effective Date: 08-02-2025</p>
        
        <div className="prose prose-primary max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">1. Information We Collect</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Personal details such as name, age, gender, contact number, email, address, and photographs.</li>
              <li>Demographic information including religion, caste, education, and professional details.</li>
              <li>Payment information for premium services.</li>
              <li>Browsing history, IP address, and device information.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>To create and manage user profiles for matchmaking.</li>
              <li>To facilitate communication between registered members.</li>
              <li>To improve our services and user experience.</li>
              <li>To comply with legal and regulatory requirements.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">3. Data Security</h2>
            <p className="text-muted-foreground">
              We implement appropriate security measures to protect your personal data. However, we cannot guarantee absolute security due to inherent risks associated with online platforms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">4. Data Sharing & Disclosure</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>We do not sell or share your personal data with third parties without consent.</li>
              <li>Information may be disclosed in case of legal obligations or fraud prevention.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">5. User Rights</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>You can update or delete your profile anytime.</li>
              <li>You may request access to your personal data.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">6. Changes to Privacy Policy</h2>
            <p className="text-muted-foreground">
              We may update this policy periodically. Continued use of our services constitutes acceptance of the updated policy.
            </p>
          </section>

          <div className="pt-8 border-t">
            <p className="text-sm font-bold text-primary">For queries, contact us at +91 94483 88711</p>
          </div>
        </div>
      </div>
    </div>
  );
}
