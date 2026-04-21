import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Filter, 
  MapPin, 
  Briefcase, 
  GraduationCap,
  Heart,
  User,
  X,
  ChevronDown,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { profileService } from '@/services/profileService';
import ProfileModal from '@/components/ProfileModal';
import { toast } from 'sonner';

export default function Profiles() {
  const { user, profile: currentUserProfile } = useAuth();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [masterData, setMasterData] = useState<any>(null);
  
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userLikes, setUserLikes] = useState<string[]>([]);
  const [sentInterests, setSentInterests] = useState<string[]>([]);
  
  const [filters, setFilters] = useState({
    caste: '',
    religion: '',
    profession: '',
    qualification: '',
    incomeRange: '',
    state: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profilesRes, masterRes] = await Promise.all([
          fetch('/api/profiles'),
          fetch('/api/master-data')
        ]);
        setProfiles(await profilesRes.json());
        setMasterData(await masterRes.json());
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
      fetchUserActions();
    } else {
      setLoading(false);
    }
  }, [user]);

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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="max-w-md w-full text-center p-8 border-none shadow-xl">
          <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-primary mb-4">Login Required</h2>
          <p className="text-muted-foreground mb-8">
            To protect the privacy of our members, profile browsing is restricted to registered users only.
          </p>
          <div className="space-y-4">
            <Link to="/login">
              <Button className="w-full bg-primary h-12 text-lg">Login to Continue</Button>
            </Link>
            <p className="text-sm">
              Don't have an account? <Link to="/register" className="text-secondary font-bold hover:underline">Register Now</Link>
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const filteredProfiles = profiles.filter(p => {
    const matchesSearch = p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.occupation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.nativePlace?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCaste = !filters.caste || p.caste === filters.caste;
    const matchesReligion = !filters.religion || p.religion === filters.religion;
    const matchesProfession = !filters.profession || p.occupation === filters.profession;
    const matchesQualification = !filters.qualification || p.education === filters.qualification;
    const matchesIncome = !filters.incomeRange || p.annualIncome === filters.incomeRange;
    const matchesState = !filters.state || p.state === filters.state;

    return matchesSearch && matchesCaste && matchesReligion && matchesProfession && matchesQualification && matchesIncome && matchesState;
  });

  const getVisibleCount = () => {
    const pkg = (user as any)?.package || 'free';
    if (pkg === 'diamond') return filteredProfiles.length;
    if (pkg === 'gold') return Math.min(50, filteredProfiles.length);
    return Math.min(20, filteredProfiles.length);
  };

  const visibleProfiles = filteredProfiles.slice(0, getVisibleCount());
  const isLimited = visibleProfiles.length < filteredProfiles.length;

  const resetFilters = () => {
    setFilters({
      caste: '',
      religion: '',
      profession: '',
      qualification: '',
      incomeRange: '',
      state: ''
    });
  };

  return (
    <div className="py-12 bg-muted/30 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-serif font-bold text-primary mb-2">Find Your Match</h1>
            <p className="text-muted-foreground">Browse verified profiles from the Shiva Parvati community.</p>
          </div>
          
          <div className="flex items-center space-x-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name, profession..." 
                className="pl-10 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              variant={showFilters ? "secondary" : "outline"} 
              className="bg-white"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-8"
            >
              <Card className="border-none shadow-sm p-6 bg-white">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg flex items-center">
                    <Filter className="mr-2 h-5 w-5 text-primary" /> Advanced Filters
                  </h3>
                  <Button variant="ghost" size="sm" onClick={resetFilters} className="text-muted-foreground">
                    <X className="mr-1 h-4 w-4" /> Reset All
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Religion</Label>
                    <select 
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={filters.religion}
                      onChange={e => setFilters({...filters, religion: e.target.value})}
                    >
                      <option value="">All Religions</option>
                      {masterData?.religions?.map((r: string) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Caste</Label>
                    <select 
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={filters.caste}
                      onChange={e => setFilters({...filters, caste: e.target.value})}
                    >
                      <option value="">All Castes</option>
                      {masterData?.castes?.map((c: string) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Profession</Label>
                    <select 
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={filters.profession}
                      onChange={e => setFilters({...filters, profession: e.target.value})}
                    >
                      <option value="">All Professions</option>
                      {masterData?.professions?.map((p: string) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Qualification</Label>
                    <select 
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={filters.qualification}
                      onChange={e => setFilters({...filters, qualification: e.target.value})}
                    >
                      <option value="">All Qualifications</option>
                      {masterData?.qualifications?.map((q: string) => <option key={q} value={q}>{q}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Annual Income</Label>
                    <select 
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={filters.incomeRange}
                      onChange={e => setFilters({...filters, incomeRange: e.target.value})}
                    >
                      <option value="">All Income Ranges</option>
                      {masterData?.incomeRanges?.map((i: string) => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">State</Label>
                    <select 
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={filters.state}
                      onChange={e => setFilters({...filters, state: e.target.value})}
                    >
                      <option value="">All States</option>
                      {masterData?.states?.map((s: string) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {visibleProfiles.map((profile, i) => (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card 
                    className="overflow-hidden border-none shadow-sm hover:shadow-xl transition-all group cursor-pointer h-full flex flex-col"
                    onClick={() => handleViewProfile(profile)}
                  >
                    <div className="aspect-[4/5] relative overflow-hidden">
                      <img 
                        src={profile.profileImageUrl || `https://picsum.photos/seed/${profile.id}/400/500`} 
                        alt={profile.fullName} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center translate-y-4 group-hover:translate-y-0 transition-transform opacity-0 group-hover:opacity-100">
                        <Button 
                          size="sm" 
                          className="bg-secondary text-secondary-foreground font-bold"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewProfile(profile);
                          }}
                        >
                          View Profile
                        </Button>
                        <Button 
                          size="icon" 
                          variant="secondary" 
                          className={`rounded-full backdrop-blur-md border-none ${userLikes.includes(profile.id) ? 'text-pink-500 bg-white' : 'text-white bg-white/20 hover:bg-white/40'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleLike(profile.id);
                          }}
                        >
                          <Heart className={`h-4 w-4 ${userLikes.includes(profile.id) ? 'fill-current' : ''}`} />
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-5 flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-serif font-bold text-lg text-primary">{profile.fullName}</h3>
                        <Badge variant="secondary" className="text-[10px] uppercase tracking-tighter">
                          {profile.birthDate ? new Date().getFullYear() - new Date(profile.birthDate).getFullYear() : '??'} Yrs
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p className="flex items-center"><Briefcase className="h-3.5 w-3.5 mr-2" /> {profile.occupation || 'Not specified'}</p>
                        <p className="flex items-center"><GraduationCap className="h-3.5 w-3.5 mr-2" /> {profile.education || 'Not specified'}</p>
                        <p className="flex items-center"><MapPin className="h-3.5 w-3.5 mr-2" /> {profile.nativePlace || 'Gulbarga'}, {profile.state || 'KA'}</p>
                      </div>
                    </CardContent>
                    <CardFooter className="px-5 pb-5 pt-0">
                      <Button 
                        variant="ghost" 
                        className={`w-full font-bold border ${sentInterests.includes(profile.id) ? 'bg-green-50 text-green-600 border-green-200' : 'text-primary hover:bg-primary/5 border-primary/10'}`}
                        disabled={sentInterests.includes(profile.id)}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendInterest(profile.id);
                        }}
                      >
                        {sentInterests.includes(profile.id) ? 'Interest Sent' : 'Send Interest'}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>

            {isLimited && (
              <div className="mt-12 p-8 rounded-2xl bg-secondary/10 border-2 border-dashed border-secondary text-center">
                <Lock className="h-8 w-8 text-secondary mx-auto mb-4" />
                <h3 className="text-xl font-bold text-primary mb-2">Upgrade to See More</h3>
                <p className="text-muted-foreground mb-6">You've reached the visibility limit for your current plan ({(user as any)?.package || 'free'}).</p>
                <Link to="/">
                  <Button className="bg-secondary text-secondary-foreground font-bold h-12 px-8">Upgrade Your Account</Button>
                </Link>
              </div>
            )}
          </>
        )}
        
        {!loading && filteredProfiles.length === 0 && (
          <div className="text-center py-20">
            <User className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-xl font-bold text-muted-foreground">No profiles found matching your search.</h3>
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
    </div>
  );
}
