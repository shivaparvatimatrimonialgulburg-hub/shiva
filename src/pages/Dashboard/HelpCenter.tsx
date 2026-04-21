import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LifeBuoy, Send, MessageCircle, Phone, Mail, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function HelpCenter() {
  const { profile } = useAuth();
  const [support, setSupport] = useState({ subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...support, userId: profile?.id })
      });
      if (res.ok) {
        toast.success("Support ticket submitted! We will get back to you soon.");
        setSupport({ subject: '', message: '' });
      }
    } catch (error) {
      toast.error("Error submitting ticket");
    } finally {
      setLoading(false);
    }
  };

  const faqs = [
    { q: "How long does verification take?", a: "Usually within 24-48 hours after uploading ID proof." },
    { q: "Can I hide my photo?", a: "Yes, you can manage photo visibility in your profile settings." },
    { q: "How do I upgrade my plan?", a: "Go to the home page and select a premium package to upgrade." },
    { q: "Is my data safe?", a: "We use industry-standard encryption and strict verification to ensure your safety." },
    { q: "How do I report a profile?", a: "Click the 'Report' button on any profile to alert our moderation team." },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-primary">Help Center</h1>
        <p className="text-muted-foreground">Find answers to common questions or contact our support team.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Form */}
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-serif flex items-center">
              <LifeBuoy className="mr-2 h-5 w-5 text-primary" /> Submit a Ticket
            </CardTitle>
            <CardDescription>Our support team typically responds within 4-6 hours.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSupportSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Your Name</Label>
                  <Input value={profile?.fullName} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input value={profile?.email} disabled className="bg-muted" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input 
                  value={support.subject} 
                  onChange={e => setSupport({...support, subject: e.target.value})} 
                  placeholder="e.g., Payment Issue, Profile Verification"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <textarea 
                  className="w-full min-h-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={support.message}
                  onChange={e => setSupport({...support, message: e.target.value})}
                  placeholder="Describe your issue in detail..."
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-primary" disabled={loading}>
                <Send className="mr-2 h-4 w-4" /> Send Message
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Info & FAQs */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-lg font-serif">Direct Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-white/10">
                  <Phone className="h-4 w-4" />
                </div>
                <span className="text-sm">+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-white/10">
                  <Mail className="h-4 w-4" />
                </div>
                <span className="text-sm">support@shivaparvati.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-white/10">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <span className="text-sm">WhatsApp Support</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-serif flex items-center">
                <HelpCircle className="mr-2 h-5 w-5 text-primary" /> FAQs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="space-y-1">
                  <p className="font-bold text-sm">{faq.q}</p>
                  <p className="text-xs text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
