import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Search, Filter, MoreVertical, Edit, Trash2, Ban, CheckCircle, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { profileService } from '@/services/profileService';
import ProfileModal from '@/components/ProfileModal';
import { useAuth } from '@/hooks/useAuth';

export default function ManageUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userLikes, setUserLikes] = useState<string[]>([]);
  const [sentInterests, setSentInterests] = useState<string[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/admin/users');
        const data = await res.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
    if (user) {
      fetchUserActions();
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

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAction = async (id: string, action: string) => {
    toast.success(`User ${action} successful`);
    // In a real app, call the API here
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Manage Users</h1>
          <p className="text-muted-foreground">Search, filter, and manage all registered profiles.</p>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="p-4 border-b">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                className="pl-9" 
                placeholder="Search by name or email..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" /> Filter
              </Button>
              <Button variant="outline" size="sm">Export CSV</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">Loading users...</TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">No users found.</TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u) => (
                  <TableRow key={u.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                          {u.profile?.photoUrl ? (
                            <img src={u.profile.photoUrl} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold">{u.fullName[0]}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{u.fullName}</div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.status === 'approved' ? 'default' : u.status === 'suspended' ? 'destructive' : 'secondary'}>
                        {u.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{u.package || 'free'}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date().toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <Button size="icon" variant="ghost" onClick={() => handleViewProfile(u.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleAction(u.id, 'edit')}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleAction(u.id, 'delete')}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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
