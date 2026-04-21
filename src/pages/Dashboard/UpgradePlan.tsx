import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Crown, Zap, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function UpgradePlan() {
  const { user, profile } = useAuth();
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/master-data')
      .then(res => res.json())
      .then(data => setPackages(data.packages))
      .catch(err => console.error("Error fetching packages:", err));
  }, []);

  const handleUpgrade = async (packageId: string, amount: number) => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          amount,
          packageId,
          purpose: `Upgrade to ${packageId} package`
        })
      });
      const data = await res.json();
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        throw new Error("Failed to initiate payment");
      }
    } catch (error) {
      toast.error("Process failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-4xl font-serif font-bold text-primary">Elevate Your Search</h1>
        <p className="text-muted-foreground text-lg">
          Choose a premium plan to unlock exclusive features and find your perfect life partner faster.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {packages.map((pkg) => (
          <Card key={pkg.id} className={`relative flex flex-col border-2 ${pkg.id === 'diamond' ? 'border-secondary shadow-xl scale-105 z-10' : 'border-muted shadow-sm hover:shadow-md'} transition-all`}>
            {pkg.id === 'diamond' && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center">
                <Crown className="h-3 w-3 mr-1" /> Best Value
              </div>
            )}
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-serif">{pkg.name}</CardTitle>
              <CardDescription>{pkg.duration} Validity</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-6 text-center">
              <div className="py-4">
                <span className="text-4xl font-bold">₹{pkg.price}</span>
              </div>
              <ul className="text-left space-y-3">
                <li className="flex items-start text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span>View UNLIMITED verified profiles</span>
                </li>
                <li className="flex items-start text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span>Send UNLIMITED interests</span>
                </li>
                <li className="flex items-start text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span>Direct Chat with matches</span>
                </li>
                <li className="flex items-start text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span>Dedicated Relationship Manager</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className={`w-full py-6 font-bold text-lg ${pkg.id === 'diamond' ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
                disabled={loading || profile?.package === pkg.id}
                onClick={() => handleUpgrade(pkg.id, parseInt(pkg.price))}
              >
                {profile?.package === pkg.id ? 'Current Plan' : `Upgrade to ${pkg.name}`}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
        <div className="flex items-center space-x-4 p-4 rounded-xl bg-white shadow-sm">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-bold">Instant Access</h4>
            <p className="text-xs text-muted-foreground">Unlock features immediately after payment.</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 p-4 rounded-xl bg-white shadow-sm">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-bold">Secure Payment</h4>
            <p className="text-xs text-muted-foreground">100% secure PhonePe payment gateway.</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 p-4 rounded-xl bg-white shadow-sm">
          <div className="p-3 bg-secondary/20 text-secondary rounded-lg">
            <Check className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-bold">Verified Leads</h4>
            <p className="text-xs text-muted-foreground">Get high-quality hand-picked matches.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
