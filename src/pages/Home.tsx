import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { paymentService } from '@/services/paymentService';
import { 
  Users, 
  ShieldCheck, 
  Award, 
  Heart, 
  ChevronRight,
  Search,
  CheckCircle2,
  UserPlus,
  CreditCard,
  Target
} from 'lucide-react';

export default function Home() {
  const [banners, setBanners] = useState<string[]>([
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1920&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1920&auto=format&fit=crop"
  ]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [packages, setPackages] = useState<any[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.homeBanners && data.homeBanners.length > 0) {
          setBanners(data.homeBanners);
        }
      })
      .catch(err => console.error("Error fetching home settings:", err));

    fetch('/api/master-data')
      .then(res => res.json())
      .then(data => setPackages(data.packages))
      .catch(err => console.error("Error fetching packages:", err));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const handleUpgrade = async (packageId: string) => {
    if (!user) {
      toast.error("Please login to upgrade your package");
      navigate('/login');
      return;
    }

    if (packageId === 'free') {
      navigate('/profiles');
      return;
    }

    try {
      toast.info("Preparing payment...");
      const paymentUrl = await paymentService.initiatePayment(packageId, user.id);
      toast.info("Redirecting to PhonePe...");
      window.location.href = paymentUrl;
    } catch (error: any) {
      toast.error(error.message || "Failed to initiate payment");
    }
  };

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.img 
              key={currentBanner}
              src={banners[currentBanner]} 
              alt="Traditional Indian Wedding" 
              className="w-full h-full object-cover absolute inset-0"
              referrerPolicy="no-referrer"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/60 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl text-primary-foreground"
          >
            <div className="inline-flex items-center space-x-2 bg-secondary/20 backdrop-blur-sm border border-secondary/30 px-4 py-2 rounded-full mb-6">
              <Award className="h-4 w-4 text-secondary" />
              <span className="text-xs font-bold uppercase tracking-widest text-secondary">15+ Years of Excellence</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight">
              Where <span className="text-secondary italic">Divine</span> Matches Begin
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 leading-relaxed font-light">
              Join the most exclusive database of truly Shiva Parvati Matrimonial matches. 
              Trusted by thousands of families for over a decade.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-lg px-8 py-7 font-bold h-auto">
                  Register Free Now
                </Button>
              </Link>
              <Link to="/profiles">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-primary text-lg px-8 py-7 font-bold h-auto">
                  Browse Profiles
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Banner Indicators */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentBanner(i)}
              className={`w-3 h-3 rounded-full transition-all ${
                currentBanner === i ? 'bg-secondary w-8' : 'bg-white/50 hover:bg-white'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Award, label: "15+ Years", sub: "of Expertise" },
              { icon: Users, label: "25,000+", sub: "Customers Serviced" },
              { icon: ShieldCheck, label: "100%", sub: "Confidential & Secure" },
              { icon: Heart, label: "100+", sub: "Relationship Managers" }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center p-8 rounded-2xl bg-accent/30 border border-primary/5"
              >
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <item.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-primary">{item.label}</h3>
                <p className="text-muted-foreground">{item.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section Summary */}
      <section className="py-24 bg-muted overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-5 pointer-events-none">
          <img src="https://picsum.photos/seed/mandala/800/800" alt="Mandala Pattern" className="w-full h-full object-contain" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-sm font-bold text-secondary uppercase tracking-[0.3em] mb-4">About Our Legacy</h2>
              <h3 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-8 leading-tight">
                Dedicated to Selfless Service & Sacred Unions
              </h3>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Shiva Parvati Matrimonial Gulburga is more than just a matchmaking service. 
                It is the realization of a vision by Shri Chandrashekhar Kakkeri and Smt. Basavarajeshwari Kakkari, 
                who believe that "There is no religion higher than kindness."
              </p>
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                With a background in engineering and a deep commitment to social work, 
                Shri Chandrashekhar Kakkeri has dedicated his life to helping the community find 
                meaningful connections through the Veerashaiva Bride and Groom Convention.
              </p>
              <Link to="/about">
                <Button variant="link" className="text-primary font-bold p-0 flex items-center group">
                  Read Our Full Story <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                <img 
                  src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1000&auto=format&fit=crop" 
                  alt="Traditional Ceremony" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-10 -left-10 bg-primary text-primary-foreground p-8 rounded-2xl shadow-xl max-w-xs hidden md:block">
                <p className="italic font-serif text-lg mb-4">"Behind a successful man, there is a woman."</p>
                <p className="text-sm font-bold text-secondary">— Smt. Basavarajeshwari Chandrashekhar Kakkeri</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <h2 className="text-4xl font-serif font-bold text-primary mb-4">Why Shiva Parvati?</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Providing specialized services for the Lingayat community and beyond with dedicated support.</p>
          <div className="w-24 h-1 bg-secondary mx-auto mt-4"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: "Exclusive Lingayat Database",
                desc: "We take pride in our separate, extensive records for the Lingayat community, ensuring precision in matchmaking.",
                icon: Target
              },
              {
                title: "Verified Profiles",
                desc: "Every profile is manually verified by our relationship managers for authenticity and trust.",
                icon: CheckCircle2
              },
              {
                title: "Personalized Support",
                desc: "Our 100+ relationship managers provide one-on-one assistance in your search journey.",
                icon: Users
              }
            ].map((feature, i) => (
              <div key={i} className="group p-8 rounded-2xl hover:bg-accent/30 transition-colors border border-transparent hover:border-primary/10">
                <div className="bg-primary text-primary-foreground w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-4">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Steps */}
      <section className="py-24 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <h2 className="text-4xl font-serif font-bold text-primary mb-4">How It Works</h2>
          <p className="text-muted-foreground text-lg">Follow these simple steps to find your divine match.</p>
          <div className="w-24 h-1 bg-secondary mx-auto mt-4"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { 
                step: "01", 
                title: "Register Free", 
                desc: "Create your profile for free by providing basic details and uploading photos.", 
                icon: UserPlus 
              },
              { 
                step: "02", 
                title: "Choose Package", 
                desc: "Select a plan that suits your needs - Free, Gold, or Diamond.", 
                icon: CreditCard 
              },
              { 
                step: "03", 
                title: "Send Interests", 
                desc: "Browse verified profiles and send interest to those you like.", 
                icon: Heart 
              },
              { 
                step: "04", 
                title: "Get Matched", 
                desc: "Connect with matches, chat, and find your life partner.", 
                icon: CheckCircle2 
              }
            ].map((item, i) => (
              <div key={i} className="relative bg-white p-8 rounded-2xl border border-primary/5 shadow-sm text-center group">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                  {item.step}
                </div>
                <div className="bg-accent/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-3">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-24 bg-accent/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">Choose Your Package</h2>
          <div className="w-24 h-1 bg-secondary mx-auto"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg, i) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative p-8 rounded-[2rem] text-white text-center shadow-xl flex flex-col items-center justify-between min-h-[400px] ${
                  pkg.id === 'free' ? 'bg-[#28a745]' : 
                  pkg.id === 'gold' ? 'bg-[#ffc107]' : 
                  'bg-[#17a2b8]'
                }`}
              >
                <div className="bg-white/20 p-6 rounded-full mb-6">
                  {pkg.id === 'free' ? <Heart className="h-10 w-10 text-white" /> : 
                   pkg.id === 'gold' ? <Award className="h-10 w-10 text-white" /> : 
                   <ShieldCheck className="h-10 w-10 text-white" />}
                </div>
                
                <div>
                  <h3 className="text-3xl font-bold mb-2">{pkg.name}</h3>
                  <p className="text-white/90 mb-6 text-lg">{pkg.features}</p>
                </div>

                <div className="mt-auto">
                  <p className="text-3xl font-bold mb-6">{pkg.price}</p>
                  <Button 
                    className="bg-white text-primary hover:bg-white/90 font-bold px-10 py-6 rounded-full h-auto text-lg"
                    onClick={() => handleUpgrade(pkg.id)}
                  >
                    {pkg.id === 'free' ? 'Get Started' : 'Buy Now'}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-secondary via-transparent to-transparent"></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-8">Ready to find your life partner?</h2>
          <p className="text-xl text-white/80 mb-12">Join thousands of happy couples who found their divine match with us.</p>
          <Link to="/register">
            <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-xl px-12 py-8 font-bold h-auto rounded-full shadow-2xl">
              Register Free Today
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
