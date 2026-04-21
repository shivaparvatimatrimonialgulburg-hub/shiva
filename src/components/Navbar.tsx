import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  User, 
  LogOut, 
  Menu, 
  X, 
  LayoutDashboard, 
  Search,
  Phone
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Navbar() {
  const { user, profile, isAdmin, isManager, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setLogoUrl(data.logoUrl))
      .catch(err => console.error("Error fetching logo:", err));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-primary text-primary-foreground shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-12 w-auto object-contain" />
              ) : (
                <div className="bg-secondary p-2 rounded-full">
                  <Heart className="h-6 w-6 text-primary fill-current" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-xl font-serif font-bold tracking-tight leading-none">SHIVA PARVATI</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-secondary font-bold">Matrimonial Gulbarga</span>
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-secondary transition-colors font-medium">Home</Link>
            <Link to="/profiles" className="hover:text-secondary transition-colors font-medium">Search</Link>
            <Link to="/about" className="hover:text-secondary transition-colors font-medium">About</Link>
            <Link to="/contact" className="hover:text-secondary transition-colors font-medium">Contact</Link>
            
            <div className="flex items-center space-x-4 ml-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <div className="relative h-10 w-10 rounded-full border-2 border-secondary/30 hover:border-secondary overflow-hidden cursor-pointer">
                      <Avatar className="h-full w-full">
                        <AvatarImage src={profile?.profileImageUrl} alt={profile?.fullName} />
                        <AvatarFallback className="bg-secondary text-primary font-bold">
                          {profile?.fullName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/dashboard/profile')}>
                        <User className="mr-2 h-4 w-4" />
                        <span>My Profile</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" className="text-primary-foreground hover:text-secondary hover:bg-white/10">Login</Button>
                  </Link>
                  <Link to="/register">
                    <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold">Register Free</Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-primary-foreground hover:text-secondary focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-primary-foreground/5 backdrop-blur-md border-t border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-white/10">Home</Link>
            <Link to="/profiles" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-white/10">Search</Link>
            <Link to="/about" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-white/10">About</Link>
            <Link to="/contact" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-white/10">Contact</Link>
            {!user && (
              <>
                <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-white/10">Login</Link>
                <Link to="/register" className="block px-3 py-2 rounded-md text-base font-medium bg-secondary text-secondary-foreground">Register Free</Link>
              </>
            )}
            {user && (
              <>
                <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-white/10">Dashboard</Link>
                <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-destructive hover:bg-white/10">Log out</button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
