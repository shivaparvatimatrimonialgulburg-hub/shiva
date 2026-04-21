import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="bg-secondary p-2 rounded-full">
                <Heart className="h-5 w-5 text-primary fill-current" />
              </div>
              <span className="text-xl font-serif font-bold tracking-tight">SHIVA PARVATI</span>
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Pioneering matrimonial services for the Shiva Parvati community worldwide. 
              Over 15 years of expertise in creating divine matches.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-secondary transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="hover:text-secondary transition-colors"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="hover:text-secondary transition-colors"><Twitter className="h-5 w-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-secondary font-bold uppercase tracking-wider text-sm mb-6">Quick Links</h3>
            <ul className="space-y-4 text-sm">
              <li><Link to="/profiles" className="hover:text-secondary transition-colors">Search Profiles</Link></li>
              <li><Link to="/register" className="hover:text-secondary transition-colors">Register Free</Link></li>
              <li><Link to="/about" className="hover:text-secondary transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-secondary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-secondary font-bold uppercase tracking-wider text-sm mb-6">Support & Policy</h3>
            <ul className="space-y-4 text-sm">
              <li><Link to="/privacy" className="hover:text-secondary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-secondary transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/refund" className="hover:text-secondary transition-colors">Refund Policy</Link></li>
              <li><Link to="/faq" className="hover:text-secondary transition-colors">FAQs</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-secondary font-bold uppercase tracking-wider text-sm mb-6">Contact Us</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-secondary shrink-0" />
                <span className="text-primary-foreground/70">
                  Ashwini Nivas, Plot No. 213/1, NGO'S Colony, New Jewargi Road, Kalaburagi-585102
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-secondary shrink-0" />
                <span className="text-primary-foreground/70">+91 9632592555, 9448388711</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-secondary shrink-0" />
                <span className="text-primary-foreground/70">support@shivaparvatimatrimonialgulburga.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 text-center text-sm text-primary-foreground/50">
          <p>© {new Date().getFullYear()} Digital Communique Private Limited. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
