import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Eye, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Search,
  UserCheck,
  LifeBuoy,
  Send,
  MessageSquare,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { profileService } from '@/services/profileService';
import ProfileModal from '@/components/ProfileModal';

export default function UserDashboard() {
  const { user, profile } = useAuth();
  const [support, setSupport] = useState({ subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userLikes, setUserLikes] = useState<string[]>([]);
  const [sentInterests, setSentInterests] = useState<string[]>([]);
  const [connectRequests, setConnectRequests] = useState({ sent: [], received: [] });

  useEffect(() => {
    if (user) {
      fetchUserActions();
      fetchConnectRequests();
    }
  }, [user]);

  const fetchConnectRequests = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/connect-requests/user/${user.id}`);
      const data = await res.json();
      setConnectRequests(data);
    } catch (error) {
      console.error("Error fetching connect requests:", error);
    }
  };

  const handleConnectAction = async (requestId: string, status: 'approved' | 'declined') => {
    try {
      const res = await fetch(`/api/connect-request/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success(`Request ${status} successfully`);
        fetchConnectRequests();
      }
    } catch (error) {
      toast.error("Failed to update request");
    }
  };

  const fetchUserActions = async () => {
    if (!user) return;
    try {
      const [likes, interests] = await Promise.all([
        profileService.getLikes(user.id),
        profileService.getSentInterests(user.id)
      ]);
      setUserLikes(likes.map((l: any) => l.targetProfileId));
      setSentInterests(interests.map((i: any) => i.toUserId));
    } catch (error) {
      console.error("Error fetching user actions:", error);
    }
  };

  const handleViewProfile = async (id: string) => {
    try {
      const p = await profileService.getProfile(id);
      setSelectedProfile(p);
      setIsModalOpen(true);
    } catch (error) {
      toast.error("Failed to load profile");
    }
  };

  const handleToggleLike = async (profileId: string) => {
    if (!user) return toast.error("Please login to like profiles");
    try {
      const { liked } = await profileService.toggleLike(user.id, profileId);
      if (liked) {
        setUserLikes([...userLikes, profileId]);
        toast.success("Profile added to shortlist");
      } else {
        setUserLikes(userLikes.filter(id => id !== profileId));
        toast.info("Profile removed from shortlist");
      }
    } catch (error) {
      toast.error("Failed to update shortlist");
    }
  };

  const handleSendInterest = async (profileId: string) => {
    if (!user) return toast.error("Please login to send interest");
    try {
      await profileService.sendInterest(user.id, profileId);
      setSentInterests([...sentInterests, profileId]);
      toast.success("Interest sent successfully!");
    } catch (error) {
      toast.error("Failed to send interest");
    }
  };

  const handleRequestConnect = async (profileId: string, type: 'chat' | 'share') => {
    if (!user) return toast.error("Please login to connect");
    try {
      const res = await fetch('/api/connect-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromUserId: user.id, toUserId: profileId, type })
      });
      if (res.ok) {
        toast.success(`${type === 'chat' ? 'Chat' : 'Share'} request sent successfully!`);
      }
    } catch (error) {
      toast.error("Failed to send request");
    }
  };

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
        toast.success("Support ticket submitted!");
        setSupport({ subject: '', message: '' });
      }
    } catch (error) {
      toast.error("Error submitting ticket");
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Profile Views', value: '124', icon: Eye, color: 'text-blue-500' },
    { label: 'Interests Sent', value: '12', icon: Heart, color: 'text-pink-500' },
    { label: 'Interests Received', value: '8', icon: UserCheck, color: 'text-green-500' },
    { label: 'Shortlisted', value: '45', icon: Search, color: 'text-amber-500' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Namaste, {profile?.fullName}!</h1>
          <p className="text-muted-foreground">Here's what's happening with your profile today.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant={profile?.status === 'approved' ? 'default' : 'secondary'} className="px-4 py-1 text-sm">
            {profile?.status === 'approved' ? (
              <span className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4" /> Verified Profile</span>
            ) : (
              <span className="flex items-center"><Clock className="mr-2 h-4 w-4" /> Pending Verification</span>
            )}
          </Badge>
          {!profile?.isPremium && (
            <Link to="/dashboard/upgrade">
              <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold">
                Upgrade to Premium
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-bold">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-xl bg-muted ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Completion */}
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-serif">Connection Requests</CardTitle>
            <CardDescription>People interested in chatting or sharing profiles with you.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="received">
              <TabsList className="mb-4">
                <TabsTrigger value="received">Received ({connectRequests.received.length})</TabsTrigger>
                <TabsTrigger value="sent">Sent ({connectRequests.sent.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="received">
                <div className="space-y-4">
                  {connectRequests.received.map((req: any) => (
                    <div key={req.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border bg-muted/30 gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                          {req.type === 'chat' ? <MessageSquare className="h-6 w-6" /> : <Users className="h-6 w-6" />}
                        </div>
                        <div>
                          <p className="font-bold">Request to {req.type === 'chat' ? 'Chat' : 'View Profile Details'}</p>
                          <p className="text-xs text-muted-foreground">From User ID: {req.fromUserId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        {req.status === 'pending' ? (
                          <>
                            <Button 
                              size="sm" 
                              variant="default" 
                              className="flex-1 sm:flex-none"
                              onClick={() => handleConnectAction(req.id, 'approved')}
                            >
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1 sm:flex-none"
                              onClick={() => handleConnectAction(req.id, 'declined')}
                            >
                              Decline
                            </Button>
                          </>
                        ) : (
                          <Badge variant={req.status === 'approved' ? 'default' : 'destructive'}>
                            {req.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  {connectRequests.received.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">No pending requests received.</div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="sent">
                <div className="space-y-4">
                  {connectRequests.sent.map((req: any) => (
                    <div key={req.id} className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                          {req.type === 'chat' ? <MessageSquare className="h-6 w-6" /> : <Users className="h-6 w-6" />}
                        </div>
                        <div>
                          <p className="font-bold">{req.type === 'chat' ? 'Chat Request' : 'Profile Share Request'}</p>
                          <p className="text-xs text-muted-foreground">To User ID: {req.toUserId}</p>
                        </div>
                      </div>
                      <Badge variant={
                        req.status === 'approved' ? 'default' : 
                        req.status === 'declined' ? 'destructive' : 
                        'outline'
                      }>
                        {req.status}
                      </Badge>
                    </div>
                  ))}
                  {connectRequests.sent.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">You haven't sent any requests yet.</div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Quick Actions */}
            <Card className="border-none shadow-sm bg-primary text-primary-foreground">
              <CardHeader>
                <CardTitle className="text-xl font-serif">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link to="/profiles">
                  <Button className="w-full bg-white text-primary hover:bg-white/90 font-bold mb-4">
                    Find Matches
                  </Button>
                </Link>
                <div className="space-y-2">
                  <p className="text-xs text-primary-foreground/70 uppercase tracking-widest font-bold">Recommended</p>
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div 
                        key={i} 
                        className="flex items-center space-x-3 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                        onClick={() => handleViewProfile(i.toString())}
                      >
                        <div className="w-12 h-12 rounded-full bg-secondary/30 overflow-hidden">
                          <img src={`https://picsum.photos/seed/${i+10}/100/100`} alt="Match" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">{i === 1 ? 'Priya S.' : 'Rahul P.'}</p>
                          <p className="text-[10px] opacity-70">{i === 1 ? '24 yrs • 5\'4" • Engineer' : '28 yrs • 5\'10" • Business'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
      </div>

      <ProfileModal 
        profile={selectedProfile}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSendInterest={handleSendInterest}
        onToggleLike={handleToggleLike}
        onRequestConnect={handleRequestConnect}
        isLiked={selectedProfile ? userLikes.includes(selectedProfile.id) : false}
        isInterestSent={selectedProfile ? sentInterests.includes(selectedProfile.id) : false}
      />
    </div>
  );
}
