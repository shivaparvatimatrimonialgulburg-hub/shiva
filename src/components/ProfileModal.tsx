import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Heart, 
  Calendar, 
  User, 
  Info,
  MessageSquare,
  Share2,
  CheckCircle2
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ProfileModalProps {
  profile: any;
  isOpen: boolean;
  onClose: () => void;
  onSendInterest: (id: string) => void;
  onToggleLike: (id: string) => void;
  onRequestConnect?: (id: string, type: 'chat' | 'share') => void;
  isLiked: boolean;
  isInterestSent: boolean;
}

export default function ProfileModal({ 
  profile, 
  isOpen, 
  onClose, 
  onSendInterest, 
  onToggleLike,
  onRequestConnect,
  isLiked,
  isInterestSent
}: ProfileModalProps) {
  if (!profile) return null;

  const age = new Date().getFullYear() - new Date(profile.birthDate).getFullYear();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden border-none shadow-2xl">
        <div className="flex flex-col md:flex-row h-[80vh] md:h-auto">
          {/* Left Side: Photo */}
          <div className="w-full md:w-2/5 relative h-64 md:h-auto">
            <img 
              src={profile.profileImageUrl || `https://picsum.photos/seed/${profile.id}/600/800`} 
              alt={profile.fullName} 
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <Badge className="bg-primary/80 backdrop-blur-md border-none px-3 py-1">
                {profile.status === 'approved' ? 'Verified' : 'Pending'}
              </Badge>
            </div>
          </div>

          {/* Right Side: Details */}
          <div className="flex-1 flex flex-col bg-white">
            <DialogHeader className="p-6 pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <DialogTitle className="text-3xl font-serif font-bold text-primary mb-1">
                    {profile.fullName}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground flex items-center">
                    ID: {profile.id} • {profile.religion} • {profile.caste}
                  </DialogDescription>
                </div>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => onToggleLike(profile.id)}
                  className={`rounded-full ${isLiked ? 'text-pink-500 bg-pink-50' : 'text-muted-foreground'}`}
                >
                  <Heart className={`h-6 w-6 ${isLiked ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </DialogHeader>

            <ScrollArea className="flex-1 p-6 pt-2">
              <div className="space-y-6">
                {/* Basic Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 rounded-xl bg-muted/50">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Age / DOB</p>
                      <p className="text-sm font-bold">{age} Yrs • {new Date(profile.birthDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-xl bg-muted/50">
                    <User className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Gender</p>
                      <p className="text-sm font-bold">{profile.gender}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-xl bg-muted/50">
                    <Briefcase className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Profession</p>
                      <p className="text-sm font-bold">{profile.occupation || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-xl bg-muted/50">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Education</p>
                      <p className="text-sm font-bold">{profile.education || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Location & Income */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center">
                    <MapPin className="mr-2 h-4 w-4" /> Location & Background
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Native Place</span>
                      <span className="font-medium">{profile.nativePlace}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Current State</span>
                      <span className="font-medium">{profile.state}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Annual Income</span>
                      <span className="font-medium">{profile.annualIncome}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Sub-Caste</span>
                      <span className="font-medium">{profile.subCaste || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* About Section */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center">
                    <Info className="mr-2 h-4 w-4" /> About {profile.fullName.split(' ')[0]}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {profile.aboutMe || `A well-educated and family-oriented individual looking for a compatible life partner within the Shiva Parvati community. Believes in traditional values while maintaining a modern outlook on life.`}
                  </p>
                </div>
              </div>
            </ScrollArea>

            <div className="p-6 border-t bg-muted/20 flex flex-wrap gap-3">
              <Button 
                className={`flex-1 h-12 text-md font-bold ${isInterestSent ? 'bg-green-500 hover:bg-green-600' : 'bg-primary'}`}
                onClick={() => onSendInterest(profile.id)}
                disabled={isInterestSent}
              >
                {isInterestSent ? (
                  <><CheckCircle2 className="mr-2 h-5 w-5" /> Interest Sent</>
                ) : (
                  <><Heart className="mr-2 h-5 w-5" /> Send Interest</>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                className="h-12 flex-1 font-bold border-secondary text-secondary hover:bg-secondary/10"
                onClick={() => onRequestConnect?.(profile.id, 'chat')}
              >
                <MessageSquare className="mr-2 h-5 w-5" /> Chat
              </Button>

              <Button 
                variant="outline" 
                className="h-12 flex-1 font-bold border-accent text-accent hover:bg-accent/10"
                onClick={() => onRequestConnect?.(profile.id, 'share')}
              >
                <Share2 className="mr-2 h-5 w-5" /> Share Info
              </Button>

              <Button variant="ghost" className="h-12 px-6" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
