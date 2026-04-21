import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import EditProfileModal from '@/components/EditProfileModal';
import { 
  User, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Calendar,
  Clock,
  Edit3,
  CheckCircle2
} from 'lucide-react';

export default function MyProfile() {
  const { profile } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentProfile, setCurrentProfile] = useState(profile);

  useEffect(() => {
    if (profile) setCurrentProfile(profile);
  }, [profile]);

  const handleProfileUpdate = (updated: any) => {
    setCurrentProfile(updated);
  };

  if (!currentProfile) return <div>Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white shadow-xl">
              <img 
                src={currentProfile.profileImageUrl || `https://picsum.photos/seed/${currentProfile.uid}/200/200`} 
                alt={currentProfile.fullName} 
                className="w-full h-full object-cover"
              />
            </div>
            {currentProfile.status === 'approved' && (
              <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1.5 rounded-full border-4 border-white">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-primary">{currentProfile.fullName}</h1>
            <p className="text-muted-foreground flex items-center mt-1">
              <MapPin className="h-4 w-4 mr-1" /> {currentProfile.nativePlace || 'Gulbarga'}, {currentProfile.state || 'Karnataka'}
            </p>
            <div className="flex space-x-2 mt-3">
              <Badge variant="outline" className="bg-white">{currentProfile.gender}</Badge>
              <Badge variant="outline" className="bg-white">{currentProfile.maritalStatus}</Badge>
            </div>
          </div>
        </div>
        <Button onClick={() => setIsEditModalOpen(true)} className="bg-primary text-white">
          <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Basic Info */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-serif flex items-center">
                <User className="mr-2 h-5 w-5 text-secondary" /> Personal Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Birth Date</p>
                <p className="font-medium flex items-center"><Calendar className="h-4 w-4 mr-2 text-muted-foreground" /> {currentProfile.birthDate}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Birth Time</p>
                <p className="font-medium flex items-center"><Clock className="h-4 w-4 mr-2 text-muted-foreground" /> {currentProfile.birthTime || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Education</p>
                <p className="font-medium flex items-center"><GraduationCap className="h-4 w-4 mr-2 text-muted-foreground" /> {currentProfile.education || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Occupation</p>
                <p className="font-medium flex items-center"><Briefcase className="h-4 w-4 mr-2 text-muted-foreground" /> {currentProfile.occupation || 'Not specified'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Family Background */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-serif">Family Background</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Father's Name</p>
                <p className="font-medium">{currentProfile.fatherName || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Mother's Name</p>
                <p className="font-medium">{currentProfile.motherName || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Brothers</p>
                <p className="font-medium">{currentProfile.brothers || '0'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Sisters</p>
                <p className="font-medium">{currentProfile.sisters || '0'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          {/* Expectations */}
          <Card className="border-none shadow-sm bg-secondary/10">
            <CardHeader>
              <CardTitle className="text-xl font-serif">Expectations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground italic">
                "{currentProfile.expectations || 'No expectations specified yet.'}"
              </p>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-serif">Contact Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Mobile</p>
                <p className="font-medium">{currentProfile.contactNo}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Address</p>
                <p className="text-sm">{currentProfile.address || 'Not specified'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <EditProfileModal 
        profile={currentProfile}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={handleProfileUpdate}
      />
    </div>
  );
}
