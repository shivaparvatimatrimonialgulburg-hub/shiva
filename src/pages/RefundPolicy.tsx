export default function RefundPolicy() {
  return (
    <div className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-serif font-bold text-primary mb-12">Refund Policy</h1>
        
        <div className="prose prose-primary max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">1. No Refunds for Free Services</h2>
            <p className="text-muted-foreground">
              Our basic matchmaking services are free and non-refundable.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">2. Refund for Premium Services</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Refunds will be considered only if the service has not been utilized within 5 days of payment.</li>
              <li>Any service fees already incurred are non-refundable.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">3. Cancellation Policy</h2>
            <p className="text-muted-foreground">
              Users can cancel their premium membership anytime, but no partial refunds will be issued for unused subscription periods.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">4. Refund Process</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Refund requests must be submitted via email or phone.</li>
              <li>Approved refunds will be processed within 7-10 business days.</li>
            </ul>
          </section>

          <div className="pt-8 border-t">
            <p className="text-sm font-bold text-primary">For refund requests, contact us at +91 94483 88711</p>
          </div>
        </div>
      </div>
    </div>
  );
}
