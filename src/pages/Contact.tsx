import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

export default function Contact() {
  const [mapUrl, setMapUrl] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setMapUrl(data.googleMapEmbed))
      .catch(err => console.error("Error fetching map:", err));
  }, []);

  return (
    <div className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-serif font-bold text-primary mb-4">Contact Us</h1>
          <p className="text-xl text-muted-foreground">We're here to help you on your journey to finding a life partner.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <Card className="border-none shadow-sm">
              <CardContent className="p-8 flex items-start space-x-6">
                <div className="bg-primary/10 p-4 rounded-2xl">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Our Address</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Ashwini Nivas, Plot No. 213/1, NGO'S Colony, New Jewargi Road, Opp. Old Venkatagiri Hotel & Kalmeshwar Kalyan Mantap, Kalaburagi-585102
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardContent className="p-8 flex items-start space-x-6">
                <div className="bg-primary/10 p-4 rounded-2xl">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Phone Numbers</h3>
                  <p className="text-muted-foreground text-sm">+91 9632592555</p>
                  <p className="text-muted-foreground text-sm">+91 9448388711</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardContent className="p-8 flex items-start space-x-6">
                <div className="bg-primary/10 p-4 rounded-2xl">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Email Support</h3>
                  <p className="text-muted-foreground text-sm">support@shivaparvatimatrimonialgulburga.com</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="border-none shadow-xl">
              <CardContent className="p-10">
                <h2 className="text-3xl font-serif font-bold text-primary mb-8">Send us a Message</h2>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" placeholder="Your name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" placeholder="email@example.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="How can we help?" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <textarea 
                      id="message" 
                      className="w-full min-h-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Your message..."
                    />
                  </div>
                  <Button className="w-full bg-primary hover:bg-primary/90 py-6 text-lg font-bold">
                    <Send className="mr-2 h-5 w-5" /> Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map Section */}
        {mapUrl && (
          <div className="mt-20 rounded-3xl overflow-hidden shadow-2xl h-[450px] border-8 border-white">
            <iframe 
              src={mapUrl}
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        )}
      </div>
    </div>
  );
}
