import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Activity, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Upload Receipt', path: '/upload' },
    { name: 'Chat with AI', path: '/chat' },
    { name: 'About', path: '/about' },
    { name: 'Contact Us', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
      window.location.replace('/');
    } catch (error) {}
  };

  return (
    <nav className="bg-background/90 backdrop-blur-md shadow-md fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="bg-primary rounded-xl p-1.5 md:p-2">
              <Activity className="h-4 w-5 md:h-4 md:w-4 text-primary-foreground" />
            </div>
            <span className="text-lg md:text-xl font-bold text-primary">Diagnosely</span>
          </Link>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex flex-1 justify-center items-center">
            <div className="flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive(link.path)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted hover:text-primary'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-2 flex-shrink-0">
            {user ? (
              <div className="flex items-center space-x-2">
                <Link to="/profile">
                  <Button 
                    variant={isActive('/profile') ? 'default' : 'outline'} 
                    size="sm"
                    className="rounded-lg"
                  >
                    <User className="h-3.5 w-3.5 mr-1.5" />
                    Profile
                  </Button>
                </Link>
                <Button 
                  onClick={handleSignOut}
                  variant="outline" 
                  size="sm"
                  className="rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                >
                  <LogOut className="h-3 w-3 mr-1.5" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Link to="/signin">
                  <Button variant="outline" size="sm" className="rounded-lg">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="rounded-lg bg-primary hover:bg-primary/90">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-lg p-1"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden animate-slide-up">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white rounded-lg mt-2 shadow-lg">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`block px-2 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-muted hover:text-primary'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              {user && (
                <Link
                  to="/profile"
                  className={`block px-2 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/profile')
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-muted hover:text-primary'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  My Profile
                </Link>
              )}
              <div className="flex space-x-2 pt-3">
                {user ? (
                  <Button 
                    onClick={() => {
                      handleSignOut();
                      setIsOpen(false);
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full rounded-lg text-rose-600 border-rose-200 hover:bg-rose-50"
                  >
                    <LogOut className="h-3 w-3 mr-1.5" />
                    Sign Out
                  </Button>
                ) : (
                  <>
                    <Link to="/signin" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full rounded-lg">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/signup" className="flex-1">
                      <Button size="sm" className="w-full rounded-lg bg-primary hover:bg-primary/90">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
