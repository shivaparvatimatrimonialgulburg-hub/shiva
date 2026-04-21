import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, 
  User, 
  Heart, 
  Users, 
  Settings, 
  Shield, 
  MessageSquare,
  FileText
} from 'lucide-react';
import UserDashboard from './UserDashboard';
import ManagerDashboard from './ManagerDashboard';
import AdminDashboard from './AdminDashboard';
import MyProfile from './MyProfile';
import MyMatches from './MyMatches';
import Messages from './Messages';
import Reports from './Reports';
import HelpCenter from './HelpCenter';
import ManageUsers from './ManageUsers';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Placeholder = ({ title }: { title: string }) => (
  <Card className="border-none shadow-sm">
    <CardHeader>
      <CardTitle className="text-2xl font-serif">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">This section is currently under development.</p>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const { profile, isAdmin, isManager, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  const sidebarItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
    { icon: User, label: 'My Profile', path: '/dashboard/profile' },
    { icon: Heart, label: 'My Matches', path: '/dashboard/matches' },
    { icon: MessageSquare, label: 'Messages', path: '/dashboard/messages' },
  ];

  if (isManager || isAdmin) {
    sidebarItems.push({ icon: Users, label: 'Manage Users', path: '/dashboard/manage-users' });
  }

  if (isAdmin) {
    sidebarItems.push({ icon: Shield, label: 'Admin Panel', path: '/dashboard/admin' });
    sidebarItems.push({ icon: FileText, label: 'Reports', path: '/dashboard/reports' });
  }

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r hidden md:block">
        <ScrollArea className="h-full py-6">
          <div className="px-4 mb-8">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Menu</h2>
            <nav className="space-y-1">
              {sidebarItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    location.pathname === item.path
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:bg-accent hover:text-primary'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="px-4">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Support</h2>
            <Link to="/dashboard/help" className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
              location.pathname === '/dashboard/help'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:bg-accent hover:text-primary'
            }`}>
              <MessageSquare className="h-5 w-5" />
              <span className="font-medium">Help Center</span>
            </Link>
          </div>
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-muted/30 p-4 md:p-8">
        <Routes>
          <Route path="/" element={
            isAdmin ? <AdminDashboard /> : isManager ? <ManagerDashboard /> : <UserDashboard />
          } />
          <Route path="/profile" element={<MyProfile />} />
          <Route path="/matches" element={<MyMatches />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/manage-users" element={<ManageUsers />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/help" element={<HelpCenter />} />
        </Routes>
      </main>
    </div>
  );
}
