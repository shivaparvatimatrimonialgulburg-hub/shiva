import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import UserRegistrationForm from '@/components/UserRegistrationForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  UserCheck, 
  Clock, 
  MessageSquare,
  CheckCircle2,
  XCircle,
  UserPlus
} from 'lucide-react';

export default function ManagerDashboard() {
  const { profile } = useAuth();
  const [isAddingUser, setIsAddingUser] = useState(false);

  const stats = [
    { label: 'Assigned Users', value: '45', icon: Users, color: 'text-blue-500' },
    { label: 'Pending Approval', value: '12', icon: Clock, color: 'text-amber-500' },
    { label: 'Verified Today', value: '5', icon: UserCheck, color: 'text-green-500' },
    { label: 'Active Chats', value: '18', icon: MessageSquare, color: 'text-pink-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Add User Modal */}
      {isAddingUser && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Add New User</CardTitle>
                <CardDescription>Register a new user directly from the manager panel.</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsAddingUser(false)} className="rounded-full">
                <XCircle className="h-6 w-6" />
              </Button>
            </CardHeader>
            <CardContent>
              <UserRegistrationForm 
                isAdminMode={true} 
                onSuccess={() => setIsAddingUser(false)} 
              />
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Manager Panel</h1>
          <p className="text-muted-foreground">Welcome back, {profile?.fullName}. Manage your assigned profiles here.</p>
        </div>
        <Button onClick={() => setIsAddingUser(true)} className="bg-secondary text-secondary-foreground">
          <UserPlus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

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

      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-serif">Recent Registrations</CardTitle>
          <Button variant="outline" size="sm">View All</Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-6 py-3 rounded-l-lg">Name</th>
                  <th className="px-6 py-3">Gender</th>
                  <th className="px-6 py-3">Location</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 rounded-r-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  { name: 'Rahul Kumar', gender: 'Male', location: 'Gulbarga', status: 'pending' },
                  { name: 'Sneha Patil', gender: 'Female', location: 'Bangalore', status: 'pending' },
                  { name: 'Vijay Singh', gender: 'Male', location: 'Hubli', status: 'approved' },
                ].map((user, i) => (
                  <tr key={i} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{user.name}</td>
                    <td className="px-6 py-4">{user.gender}</td>
                    <td className="px-6 py-4">{user.location}</td>
                    <td className="px-6 py-4">
                      <Badge variant={user.status === 'approved' ? 'default' : 'secondary'}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <Button size="icon" variant="ghost" className="text-green-600 hover:text-green-700 hover:bg-green-50">
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10">
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
