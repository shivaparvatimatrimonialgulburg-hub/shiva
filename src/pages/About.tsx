import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Award, Users, Heart, ShieldCheck } from 'lucide-react';

export default function About() {
  const [aboutImageUrl, setAboutImageUrl] = useState("https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1000&auto=format&fit=crop");

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.aboutImageUrl) setAboutImageUrl(data.aboutImageUrl);
      })
      .catch(err => console.error("Error fetching about settings:", err));
  }, []);

  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h1 className="text-5xl font-serif font-bold text-primary mb-6">Our Story & Vision</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Dedicated to creating sacred unions through compassion, service, and tradition.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-serif font-bold text-primary mb-8">The Founders' Vision</h2>
            <div className="prose prose-lg text-muted-foreground space-y-6 max-w-none">
              <p>
                Like the saying of Jainism "Damo nāsti dayāparaḥ", meaning “There is no religion higher than kindness,” 
                and "Dayā Mūlo Bhaved Dharma" from the ancient Purāṇa of Ajita Senacharya, which proclaims compassion 
                as the root of religion—Shri Chandrashekhar Kakkeri and his wife Smt. Basavarajeshwari Kakkari 
                have joined the ranks of the many great people who have shown society that they are dedicated servants.
              </p>
              <p>
                Shri Chandrashekhar Kakkeri, an engineering graduate, joined Government Service in 1984. 
                He lived by the Sarana principle that “Satya Shuddha Kayaka”—truthful and pure work—must never be abandoned. 
                He understood these principles deeply and practiced them sincerely.
              </p>
              <p>
                Even after retiring in 2018, his thirst for learning and service never diminished. 
                During the challenging times of the Covid crisis, he completed a law degree to help society more effectively. 
                Realizing that noble social activities enhance the dignity of the community, he played a significant role 
                in the Veerashaiva Bride and Groom Convention.
              </p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
              <img 
                src={aboutImageUrl} 
                alt="Founders Vision" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-10 -right-10 bg-secondary text-secondary-foreground p-8 rounded-2xl shadow-xl max-w-xs">
              <p className="font-serif text-lg italic mb-2">"Behind every achievement stands an unseen strength."</p>
              <p className="text-sm font-bold">— Prof. Venkanna Donne Gowda</p>
            </div>
          </motion.div>
        </div>

        <div className="bg-primary text-primary-foreground rounded-3xl p-12 md:p-20 mb-32 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl font-serif font-bold mb-8">Why Shiva Parvati?</h2>
              <p className="text-lg text-primary-foreground/80 leading-relaxed mb-8">
                Shiva Parvati Matrimonial Gulburga, a part of matrimony group, is a pioneer and leader in online matrimony services. 
                We bring over 15 years of expertise in pioneering the matchmaking service, and offer the most exclusive database 
                of truly Shiva Parvati matches for you!
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-3xl font-bold text-secondary">15+</h4>
                  <p className="text-sm opacity-70">Years of expertise</p>
                </div>
                <div>
                  <h4 className="text-3xl font-bold text-secondary">25,000+</h4>
                  <p className="text-sm opacity-70">Customers serviced</p>
                </div>
              </div>
            </div>
            <div className="space-y-8">
              {[
                { icon: ShieldCheck, title: "100% Confidential", desc: "Your privacy is our top priority. We ensure all data is handled with extreme care." },
                { icon: Users, title: "100+ Managers", desc: "Dedicated relationship managers to help you find the perfect match." },
                { icon: Heart, title: "Divine Matches", desc: "Focused on creating sacred unions that last a lifetime." }
              ].map((item, i) => (
                <div key={i} className="flex space-x-4">
                  <div className="bg-white/10 p-3 rounded-xl h-fit">
                    <item.icon className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                    <p className="text-sm text-primary-foreground/70">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
