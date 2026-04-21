import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, XCircle, Eye, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { profileService } from '@/services/profileService';
import ProfileModal from '@/components/ProfileModal';
import { useAuth } from '@/hooks/useAuth';

export default function Reports() {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userLikes, setUserLikes] = useState<string[]>([]);
  const [sentInterests, setSentInterests] = useState<string[]>([]);

  useEffect(() => {
    // Mock fetching reports
    const mockReports = [
      { id: 'r1', reporterName: 'Rahul P.', reportedName: 'Fake Profile 1', reason: 'Fake Photos', status: 'pending', date: '2026-04-09' },
      { id: 'r2', reporterName: 'Sneha K.', reportedName: 'User 123', reason: 'Abusive Behavior', status: 'resolved', date: '2026-04-08' },
      { id: 'r3', reporterName: 'Vijay S.', reportedName: 'Scammer X', reason: 'Asking for Money', status: 'pending', date: '2026-04-10' },
    ];
    setReports(mockReports);
    setLoading(false);
    fetchUserActions();
  }, []);

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

  const handleViewProfile = async (reportedName: string) => {
    // In a real app, we'd have the profile ID. For now, we'll try to find it by name or just use a mock ID.
    try {
      // Mocking profile fetch for reports
      const p = await profileService.getProfile('1'); 
      setSelectedProfile({ ...p, fullName: reportedName });
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

  const handleAction = (id: string, action: string) => {
    toast.success(`Report ${id} ${action} successfully`);
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: action === 'resolve' ? 'resolved' : 'dismissed' } : r));
  };

  if (loading) return <div className="p-12 text-center">Loading reports...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-primary">Profile Reports</h1>
        <p className="text-muted-foreground">Manage and review reports submitted by users.</p>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>Review reports and take necessary actions to keep the community safe.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-6 py-3 rounded-l-lg">Date</th>
                  <th className="px-6 py-3">Reporter</th>
                  <th className="px-6 py-3">Reported Profile</th>
                  <th className="px-6 py-3">Reason</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 rounded-r-lg text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">{report.date}</td>
                    <td className="px-6 py-4 font-medium">{report.reporterName}</td>
                    <td className="px-6 py-4 font-medium text-primary">{report.reportedName}</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                        {report.reason}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={report.status === 'resolved' ? 'default' : report.status === 'dismissed' ? 'secondary' : 'outline'}>
                        {report.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          title="View Profile"
                          onClick={() => handleViewProfile(report.reportedName)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {report.status === 'pending' && (
                          <>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="text-green-600 hover:bg-green-50"
                              onClick={() => handleAction(report.id, 'resolve')}
                              title="Resolve & Suspend"
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => handleAction(report.id, 'dismiss')}
                              title="Dismiss"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <ProfileModal 
        profile={selectedProfile}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSendInterest={handleSendInterest}
        onToggleLike={handleToggleLike}
        isLiked={selectedProfile ? userLikes.includes(selectedProfile.id) : false}
        isInterestSent={selectedProfile ? sentInterests.includes(selectedProfile.id) : false}
      />
    </div>
  );
}
