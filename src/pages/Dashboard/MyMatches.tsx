import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, User, MapPin, Briefcase, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { profileService } from '@/services/profileService';
import ProfileModal from '@/components/ProfileModal';
import { toast } from 'sonner';

export default function MyMatches() {
  const { user, profile } = useAuth();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userLikes, setUserLikes] = useState<string[]>([]);
  const [sentInterests, setSentInterests] = useState<string[]>([]);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await fetch('/api/profiles');
        const allProfiles = await res.json();
        
        // Simple matching logic based on religion and caste
        const filtered = allProfiles.filter((p: any) => {
          if (p.uid === profile?.id) return false;
          if (p.gender === profile?.gender) return false;
          
          let score = 0;
          if (p.religion === profile?.religion) score += 2;
          if (p.caste === profile?.caste) score += 3;
          if (p.state === profile?.state) score += 1;
          
          return score >= 2; // Show profiles with at least some commonality
        });

        setMatches(filtered);
      } catch (error) {
        console.error("Error fetching matches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
    fetchUserActions();
  }, [profile]);

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

  const handleViewProfile = (profile: any) => {
    setSelectedProfile(profile);
    setIsModalOpen(true);
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

  if (loading) return <div className="flex justify-center p-12">Loading matches...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-primary">My Matches</h1>
        <p className="text-muted-foreground">Profiles that match your preferences and background.</p>
      </div>

      {matches.length === 0 ? (
        <Card className="border-none shadow-sm p-12 text-center">
          <CardContent>
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-xl font-medium mb-2">No matches found yet</h3>
            <p className="text-muted-foreground mb-6">Try updating your partner expectations in your profile.</p>
            <Link to="/dashboard/profile">
              <Button>Update Profile</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <Card 
              key={match.id} 
              className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
              onClick={() => handleViewProfile(match)}
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={match.photoUrl || `https://picsum.photos/seed/${match.id}/400/600`} 
                  alt={match.fullName}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-bold">{match.fullName}</h3>
                  <p className="text-sm opacity-90">{match.religion} • {match.caste}</p>
                </div>
                <Button 
                  size="icon" 
                  className={`absolute top-4 right-4 rounded-full backdrop-blur-md border-none ${userLikes.includes(match.id) ? 'text-pink-500 bg-white' : 'text-white bg-white/20 hover:bg-white/40'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleLike(match.id);
                  }}
                >
                  <Heart className={`h-5 w-5 ${userLikes.includes(match.id) ? 'fill-current' : ''}`} />
                </Button>
              </div>
              <CardContent className="p-4 space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-[10px]">{match.occupation}</Badge>
                  <Badge variant="secondary" className="text-[10px]">{match.education}</Badge>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {match.nativePlace}, {match.state}
                  </div>
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-2" />
                    {match.occupation}
                  </div>
                  <div className="flex items-center">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    {match.education}
                  </div>
                </div>
                <Button 
                  className="w-full mt-2 bg-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewProfile(match);
                  }}
                >
                  View Full Profile
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
