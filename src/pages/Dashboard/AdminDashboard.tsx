import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import UserRegistrationForm from '@/components/UserRegistrationForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { toast } from 'sonner';
import { profileService } from '@/services/profileService';
import ProfileModal from '@/components/ProfileModal';
import { 
  Shield, 
  Users, 
  TrendingUp, 
  DollarSign,
  Settings,
  UserPlus,
  Save,
  Image as ImageIcon,
  Map as MapIcon,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Edit,
  ArrowUpCircle,
  Briefcase,
  GraduationCap,
  Heart,
  Award,
  CreditCard,
  RefreshCw,
  Search as SearchIcon,
  MessageSquare,
  History,
  LifeBuoy,
  Ban,
  Lock,
  Unlock,
  Eye,
  FileText,
  AlertTriangle
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, profile } = useAuth();
  const [settings, setSettings] = useState({
    homeBanners: [] as string[],
    aboutImageUrl: '',
    logoUrl: '',
    googleMapEmbed: ''
  });
  const [masterData, setMasterData] = useState({
    qualifications: [],
    professions: [],
    castes: [],
    subCastes: [],
    packages: []
  });
  const [users, setUsers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [logs, setLogs] = useState({ requests: [], chats: [], connectRequests: [] });
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState({ type: 'qualifications', value: '' });
  const [newManager, setNewManager] = useState({ fullName: '', email: '', password: '', photoUrl: '' });
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userLikes, setUserLikes] = useState<string[]>([]);
  const [sentInterests, setSentInterests] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
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

  const handleViewProfile = async (reportedName: string) => {
    try {
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

  const fetchData = async () => {
    try {
      const [settingsRes, masterRes, usersRes, reqLogsRes, chatLogsRes, ticketsRes, connectReqsRes, paymentsRes] = await Promise.all([
        fetch('/api/settings'),
        fetch('/api/master-data'),
        fetch('/api/admin/users'),
        fetch('/api/admin/logs/requests'),
        fetch('/api/admin/logs/chats'),
        fetch('/api/admin/support'),
        fetch('/api/admin/logs/connect-requests'),
        fetch('/api/admin/payments')
      ]);
      setSettings(await settingsRes.json());
      setMasterData(await masterRes.json());
      setUsers(await usersRes.json());
      setPayments(await paymentsRes.json());
      setLogs({
        requests: await reqLogsRes.json(),
        chats: await chatLogsRes.json(),
        connectRequests: await connectReqsRes.json()
      });
      setTickets(await ticketsRes.json());
    } catch (err) {
      console.error("Error fetching admin data:", err);
    }
  };

  const handleFileUpload = async (file: File, field: string, index?: number) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        if (field === 'homeBanners' && typeof index === 'number') {
          const newBanners = [...settings.homeBanners];
          newBanners[index] = data.url;
          setSettings(prev => ({ ...prev, homeBanners: newBanners }));
        } else {
          setSettings(prev => ({ ...prev, [field]: data.url }));
        }
        toast.success("File uploaded successfully!");
      }
    } catch (error) {
      toast.error("Error uploading file");
    }
  };

  const addBanner = () => {
    setSettings(prev => ({ ...prev, homeBanners: [...prev.homeBanners, ''] }));
  };

  const removeBanner = (index: number) => {
    setSettings(prev => ({ ...prev, homeBanners: prev.homeBanners.filter((_, i) => i !== index) }));
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) toast.success("Site settings updated!");
    } catch (error) {
      toast.error("Error updating settings");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMasterItem = async () => {
    if (!newItem.value) return;
    try {
      const res = await fetch(`/api/admin/master-data/${newItem.type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: newItem.value })
      });
      if (res.ok) {
        toast.success(`Added to ${newItem.type}`);
        setNewItem({ ...newItem, value: '' });
        fetchData();
      }
    } catch (error) {
      toast.error("Error adding item");
    }
  };

  const handleUserAction = async (userId: string, action: string, data?: any) => {
    try {
      let res;
      if (action === 'delete') {
        res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      } else {
        res = await fetch(`/api/admin/users/${userId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      }
      if (res.ok) {
        toast.success(`User ${action} successful`);
        fetchData();
      }
    } catch (error) {
      toast.error(`Error during user ${action}`);
    }
  };

  const stats = [
    { label: 'Total Users', value: users.length.toString(), icon: Users, color: 'text-primary' },
    { label: 'Active Managers', value: '104', icon: Shield, color: 'text-accent' },
    { label: 'Monthly Revenue', value: '₹4.2L', icon: DollarSign, color: 'text-secondary' },
    { label: 'Growth Rate', value: '+12%', icon: TrendingUp, color: 'text-primary' },
  ];

  const [editingUser, setEditingUser] = useState<any>(null);

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    await handleUserAction(editingUser.id, 'update', editingUser);
    setEditingUser(null);
  };

  const handleUserPhotoUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setEditingUser((prev: any) => ({
          ...prev,
          profile: { ...prev.profile, photoUrl: data.url }
        }));
        toast.success("Photo uploaded!");
      }
    } catch (error) {
      toast.error("Error uploading photo");
    }
  };

  const handleUserIdProofUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setEditingUser((prev: any) => ({
          ...prev,
          profile: { ...prev.profile, idProofUrl: data.url }
        }));
        toast.success("ID Proof uploaded!");
      }
    } catch (error) {
      toast.error("Error uploading ID proof");
    }
  };

  const handleSavePackages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packages: masterData.packages })
      });
      if (res.ok) toast.success("Packages updated successfully!");
    } catch (error) {
      toast.error("Error updating packages");
    } finally {
      setLoading(false);
    }
  };

  const handleAddManager = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/managers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newManager)
      });
      if (res.ok) {
        toast.success("Manager added successfully!");
        setNewManager({ fullName: '', email: '', password: '', photoUrl: '' });
        fetchData();
      }
    } catch (error) {
      toast.error("Error adding manager");
    }
  };

  const handleTicketAction = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/support/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success("Ticket updated");
        fetchData();
      }
    } catch (error) {
      toast.error("Error updating ticket");
    }
  };

  const updatePackageField = (id: string, field: string, value: any) => {
    const updatedPackages = masterData.packages.map((p: any) => 
      p.id === id ? { ...p, [field]: value } : p
    );
    setMasterData({ ...masterData, packages: updatedPackages });
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Add User Modal */}
      {isAddingUser && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Add New User</CardTitle>
                <CardDescription>Register a new user directly from the admin panel.</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsAddingUser(false)} className="rounded-full">
                <XCircle className="h-6 w-6" />
              </Button>
            </CardHeader>
            <CardContent>
              <UserRegistrationForm 
                isAdminMode={true} 
                onSuccess={() => {
                  setIsAddingUser(false);
                  fetchData();
                }} 
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Edit User: {editingUser.fullName}</CardTitle>
              <CardDescription>Update profile status, documents, and photos.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input value={editingUser.fullName} onChange={e => setEditingUser({...editingUser, fullName: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <select 
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={editingUser.status}
                      onChange={e => setEditingUser({...editingUser, status: e.target.value})}
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Profile Photo</Label>
                    <div className="flex items-center gap-4">
                      <Input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => e.target.files?.[0] && handleUserPhotoUpload(e.target.files[0])} 
                      />
                      {editingUser.profile?.photoUrl && (
                        <img src={editingUser.profile.photoUrl} className="w-10 h-10 rounded object-cover" />
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>ID Proof</Label>
                    <div className="flex items-center gap-4">
                      <Input 
                        type="file" 
                        accept="image/*,application/pdf" 
                        onChange={(e) => e.target.files?.[0] && handleUserIdProofUpload(e.target.files[0])} 
                      />
                      {editingUser.profile?.idProofUrl && (
                        <Badge variant="outline">Uploaded</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
                  <Button type="submit" className="bg-primary">Save Changes</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Administrator Panel</h1>
          <p className="text-muted-foreground">System-wide overview and management.</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setIsAddingUser(true)} className="bg-secondary text-secondary-foreground"><UserPlus className="mr-2 h-4 w-4" /> Add User</Button>
          <Button className="bg-primary text-white"><UserPlus className="mr-2 h-4 w-4" /> Add Manager</Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="bg-muted p-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="settings">Site Settings</TabsTrigger>
          <TabsTrigger value="master">Master Data</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="pricing">Pricing Plans</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="managers">Managers</TabsTrigger>
          <TabsTrigger value="connect-requests">Connect Requests</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <Card key={i} className="border-none shadow-sm">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-serif">Recent System Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    "New manager 'Ramesh P.' added to the system.",
                    "Premium subscription 'Gold Plan' updated.",
                    "System backup completed successfully.",
                    "Privacy policy updated by Admin.",
                  ].map((activity, i) => (
                    <div key={i} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50 text-sm">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span>{activity}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-serif">Manager Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Suresh M.', verified: 145, rating: 4.8 },
                    { name: 'Anjali R.', verified: 132, rating: 4.9 },
                    { name: 'Kiran K.', verified: 98, rating: 4.5 },
                  ].map((manager, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-bold">{manager.name}</p>
                        <p className="text-xs text-muted-foreground">{manager.verified} profiles verified</p>
                      </div>
                      <Badge variant="outline" className="text-secondary border-secondary">
                        ★ {manager.rating}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-serif text-primary flex items-center">
                <ImageIcon className="mr-2 h-6 w-6" /> Site Branding & Visuals
              </CardTitle>
              <CardDescription>Update logos, banners, and map integration.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Website Logo</Label>
                    <div className="flex items-center gap-4">
                      <Input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'logoUrl')} 
                      />
                      {settings.logoUrl && (
                        <img src={settings.logoUrl} className="h-10 w-auto object-contain" />
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Google Map Embed URL</Label>
                    <Input 
                      value={settings.googleMapEmbed} 
                      onChange={(e) => setSettings({...settings, googleMapEmbed: e.target.value})}
                      placeholder="https://www.google.com/maps/embed?..." 
                    />
                  </div>
                  <div className="space-y-4 md:col-span-2">
                    <div className="flex justify-between items-center">
                      <Label>Home Page Banners (Multiple)</Label>
                      <Button type="button" size="sm" variant="outline" onClick={addBanner}>
                        <Plus className="h-4 w-4 mr-2" /> Add Banner
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {settings.homeBanners?.map((banner, index) => (
                        <div key={index} className="p-4 border rounded-xl space-y-3 bg-muted/30">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold uppercase">Banner {index + 1}</span>
                            <Button type="button" size="icon" variant="ghost" className="text-destructive h-8 w-8" onClick={() => removeBanner(index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-4">
                            <Input 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'homeBanners', index)} 
                            />
                            {banner && (
                              <img src={banner} className="h-10 w-20 object-cover rounded" />
                            )}
                          </div>
                          <Input 
                            value={banner} 
                            onChange={(e) => {
                              const newBanners = [...settings.homeBanners];
                              newBanners[index] = e.target.value;
                              setSettings({...settings, homeBanners: newBanners});
                            }}
                            placeholder="Or enter image URL..."
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>About Us Page Image</Label>
                    <div className="flex items-center gap-4">
                      <Input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'aboutImageUrl')} 
                      />
                      {settings.aboutImageUrl && (
                        <img src={settings.aboutImageUrl} className="h-10 w-20 object-cover rounded" />
                      )}
                    </div>
                  </div>
                </div>
                <Button type="submit" className="bg-primary" disabled={loading}>
                  <Save className="mr-2 h-4 w-4" /> Save All Settings
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="master">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-serif">Add Master Data</CardTitle>
                <CardDescription>Manage dropdown options for profiles.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <select 
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newItem.type}
                    onChange={(e) => setNewItem({...newItem, type: e.target.value})}
                  >
                    <option value="qualifications">Qualification</option>
                    <option value="professions">Profession</option>
                    <option value="castes">Caste</option>
                    <option value="subCastes">Sub-Caste</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Value</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={newItem.value} 
                      onChange={(e) => setNewItem({...newItem, value: e.target.value})}
                      placeholder="Enter new value..." 
                    />
                    <Button onClick={handleAddMasterItem} className="bg-primary">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-serif">Current Master Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(masterData).filter(([k]) => k !== 'packages').map(([key, items]: [string, any]) => (
                  <div key={key}>
                    <h4 className="text-sm font-bold uppercase text-primary mb-2">{key}</h4>
                    <div className="flex flex-wrap gap-2">
                      {items.map((item: string, i: number) => (
                        <Badge key={i} variant="secondary" className="bg-muted text-foreground">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-serif text-primary">User Management</CardTitle>
              <CardDescription>Verify, edit, or manage user accounts.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Package/Payment</TableHead>
                    <TableHead>Reports</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {u.profile?.photoUrl && <img src={u.profile.photoUrl} className="w-8 h-8 rounded-full object-cover" />}
                          <div>
                            <div className="font-medium">{u.fullName}</div>
                            <div className="text-xs text-muted-foreground">{u.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.status === 'approved' ? 'default' : u.status === 'suspended' ? 'destructive' : 'outline'}>
                          {u.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1">
                            <Badge variant="secondary" className="capitalize">{u.package || 'free'}</Badge>
                            <Badge variant="outline" className={u.paymentStatus === 'paid' ? 'text-green-600 border-green-600' : ''}>
                              {u.paymentStatus || 'unpaid'}
                            </Badge>
                          </div>
                          <select 
                            className="text-[10px] border rounded px-1 py-0.5 bg-transparent"
                            value={u.package || 'free'}
                            onChange={(e) => handleUserAction(u.id, 'upgrade', { package: e.target.value, paymentStatus: 'paid' })}
                          >
                            <option value="free">Free</option>
                            <option value="gold">Gold</option>
                            <option value="diamond">Diamond</option>
                          </select>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.reports > 0 ? 'destructive' : 'outline'}>{u.reports || 0} Reports</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="icon" variant="ghost" title="View Details" onClick={() => setEditingUser(u)}>
                            <Eye className="h-4 w-4 text-blue-500" />
                          </Button>
                          {u.status === 'suspended' ? (
                            <Button size="icon" variant="ghost" title="Activate" onClick={() => handleUserAction(u.id, 'activate', { status: 'approved' })}>
                              <Unlock className="h-4 w-4 text-green-500" />
                            </Button>
                          ) : (
                            <Button size="icon" variant="ghost" title="Suspend" onClick={() => handleUserAction(u.id, 'suspend', { status: 'suspended' })}>
                              <Ban className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                          <Button size="icon" variant="ghost" onClick={() => handleUserAction(u.id, 'delete')} className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-serif text-primary">Manage Subscription Packages</h2>
            <Button onClick={handleSavePackages} disabled={loading} className="bg-primary">
              <Save className="mr-2 h-4 w-4" /> Save All Packages
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {masterData.packages.map((pkg: any) => (
              <Card key={pkg.id} className={`border-2 ${pkg.id === 'diamond' ? 'border-secondary' : 'border-transparent'} shadow-lg`}>
                <CardHeader className="text-center">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    {pkg.id === 'free' ? <Heart className="text-primary" /> : pkg.id === 'gold' ? <Shield className="text-secondary" /> : <Award className="text-accent" />}
                  </div>
                  <Input 
                    className="text-xl font-serif font-bold text-center mb-2"
                    value={pkg.name}
                    onChange={(e) => updatePackageField(pkg.id, 'name', e.target.value)}
                  />
                  <Input 
                    className="text-2xl font-bold text-primary text-center"
                    value={pkg.price}
                    onChange={(e) => updatePackageField(pkg.id, 'price', e.target.value)}
                  />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Features Description</Label>
                    <textarea 
                      className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={pkg.features}
                      onChange={(e) => updatePackageField(pkg.id, 'features', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Profile Visibility Limit (-1 for unlimited)</Label>
                    <Input 
                      type="number"
                      value={pkg.limit}
                      onChange={(e) => updatePackageField(pkg.id, 'limit', parseInt(e.target.value))}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="payments">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-serif text-primary flex items-center">
                <CreditCard className="mr-2 h-6 w-6" /> Payment Transactions
              </CardTitle>
              <CardDescription>Monitor payment status and handle refunds.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label>Check Transaction Status</Label>
                    <div className="flex gap-2 mt-1">
                      <Input placeholder="Enter Merchant Transaction ID..." id="txnId" />
                      <Button onClick={async () => {
                        const id = (document.getElementById('txnId') as HTMLInputElement).value;
                        if (!id) return toast.error("Please enter a transaction ID");
                        try {
                          const res = await fetch(`/api/payments/status/${id}`);
                          const data = await res.json();
                          toast.info(`Status: ${data.code || data.status || 'Unknown'}`);
                          console.log("Status Data:", data);
                        } catch (e) {
                          toast.error("Failed to fetch status");
                        }
                      }}>
                        <SearchIcon className="h-4 w-4 mr-2" /> Check
                      </Button>
                    </div>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="text-xs">{new Date(p.timestamp).toLocaleString()}</TableCell>
                        <TableCell className="font-mono text-xs">{p.id}</TableCell>
                        <TableCell>
                          <div className="font-medium">{p.userName}</div>
                          <div className="text-[10px] text-muted-foreground">{p.email}</div>
                        </TableCell>
                        <TableCell>₹{(p.amount / 100).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={p.status === 'COMPLETED' ? 'default' : 'outline'}>
                            {p.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={async () => {
                              if (confirm(`Initiate refund for ${p.id}?`)) {
                                try {
                                  const res = await fetch('/api/payments/refund', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      merchantOrderId: p.id,
                                      amount: p.amount / 100
                                    })
                                  });
                                  const result = await res.json();
                                  if (res.ok) {
                                    toast.success("Refund initiated!");
                                    fetchData();
                                  } else {
                                    toast.error(result.message || "Refund failed");
                                  }
                                } catch (e) {
                                  toast.error("Error initiating refund");
                                }
                              }
                            }}>
                              <RefreshCw className="h-3 w-3 mr-1" /> Refund
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {payments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                          No transactions found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="managers">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-1 border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-serif">Add New Manager</CardTitle>
                <CardDescription>Create a new administrative account.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddManager} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input value={newManager.fullName} onChange={e => setNewManager({...newManager, fullName: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={newManager.email} onChange={e => setNewManager({...newManager, email: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input type="password" value={newManager.password} onChange={e => setNewManager({...newManager, password: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Photo URL</Label>
                    <Input value={newManager.photoUrl} onChange={e => setNewManager({...newManager, photoUrl: e.target.value})} placeholder="https://..." />
                  </div>
                  <Button type="submit" className="w-full bg-primary">Create Manager</Button>
                </form>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-serif">Active Managers</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Manager</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.filter(u => u.role === 'manager').map(m => (
                      <TableRow key={m.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {m.photoUrl && <img src={m.photoUrl} className="w-8 h-8 rounded-full" />}
                            <span className="font-medium">{m.fullName}</span>
                          </div>
                        </TableCell>
                        <TableCell>{m.email}</TableCell>
                        <TableCell><Badge>Active</Badge></TableCell>
                        <TableCell>
                          <Button size="icon" variant="ghost" onClick={() => handleUserAction(m.id, 'delete')} className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="connect-requests">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-serif text-primary">Connection & Share Requests</CardTitle>
              <CardDescription>Track user interactions, chat requests, and profile sharing.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>From User</TableHead>
                    <TableHead>To User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested On</TableHead>
                    <TableHead>Updated On</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.connectRequests.map((req: any) => (
                    <TableRow key={req.id}>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {req.type === 'chat' ? <MessageSquare className="h-3 w-3 mr-1 inline" /> : <Users className="h-3 w-3 mr-1 inline" />}
                          {req.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{req.fromUserName || `User ${req.fromUserId}`}</div>
                        <div className="text-xs text-muted-foreground">ID: {req.fromUserId}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{req.toUserName || `User ${req.toUserId}`}</div>
                        <div className="text-xs text-muted-foreground">ID: {req.toUserId}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          req.status === 'approved' ? 'default' : 
                          req.status === 'declined' ? 'destructive' : 
                          'outline'
                        }>
                          {req.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{new Date(req.createdAt).toLocaleString()}</TableCell>
                      <TableCell className="text-xs">{req.updatedAt ? new Date(req.updatedAt).toLocaleString() : '-'}</TableCell>
                    </TableRow>
                  ))}
                  {logs.connectRequests.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                        No connection requests found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Tabs defaultValue="requests">
            <TabsList className="mb-4">
              <TabsTrigger value="requests">Request Logs</TabsTrigger>
              <TabsTrigger value="chats">Chat Logs</TabsTrigger>
            </TabsList>
            <TabsContent value="requests">
              <Card className="border-none shadow-sm">
                <CardContent className="pt-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Timestamp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.requests.map((log: any) => (
                        <TableRow key={log.id}>
                          <TableCell>{log.userId}</TableCell>
                          <TableCell><Badge variant="outline">{log.action}</Badge></TableCell>
                          <TableCell>{log.target}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="chats">
              <Card className="border-none shadow-sm">
                <CardContent className="pt-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>From</TableHead>
                        <TableHead>To</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Timestamp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.chats.map((chat: any) => (
                        <TableRow key={chat.id}>
                          <TableCell>{chat.from}</TableCell>
                          <TableCell>{chat.to}</TableCell>
                          <TableCell className="max-w-xs truncate">{chat.message}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{new Date(chat.timestamp).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="reports">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-serif text-primary flex items-center">
                <AlertTriangle className="mr-2 h-6 w-6" /> Profile Reports
              </CardTitle>
              <CardDescription>Manage and review reports submitted by users.</CardDescription>
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
                    {[
                      { id: 'r1', reporterName: 'Rahul P.', reportedName: 'Fake Profile 1', reason: 'Fake Photos', status: 'pending', date: '2026-04-09' },
                      { id: 'r2', reporterName: 'Sneha K.', reportedName: 'User 123', reason: 'Abusive Behavior', status: 'resolved', date: '2026-04-08' },
                      { id: 'r3', reporterName: 'Vijay S.', reportedName: 'Scammer X', reason: 'Asking for Money', status: 'pending', date: '2026-04-10' },
                    ].map((report) => (
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
                                  title="Resolve & Suspend"
                                >
                                  <Ban className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="text-destructive hover:bg-destructive/10"
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
        </TabsContent>

        <TabsContent value="support">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-serif">Support Tickets</CardTitle>
              <CardDescription>Respond to user issues and queries.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map(t => (
                    <TableRow key={t.id}>
                      <TableCell>{t.userId}</TableCell>
                      <TableCell className="font-medium">{t.subject}</TableCell>
                      <TableCell className="max-w-md text-sm">{t.message}</TableCell>
                      <TableCell>
                        <Badge variant={t.status === 'open' ? 'destructive' : 'default'}>{t.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {t.status === 'open' && (
                          <Button size="sm" onClick={() => handleTicketAction(t.id, 'closed')}>Resolve</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
