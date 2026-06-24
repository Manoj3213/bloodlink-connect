import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Droplets, Menu, X, Moon, Sun, Home, Search, Heart, User,
  LogIn, UserPlus, LogOut, Shield, LayoutDashboard, Siren
} from 'lucide-react';

export default function Layout() {
  const { user, profile, signOut } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/search', label: 'Find Donors', icon: Search },
    { path: '/requests', label: 'Blood Requests', icon: Siren },
  ];

  const authLinks = user && profile
    ? profile.role === 'admin'
      ? [
          { path: '/admin', label: 'Admin', icon: Shield },
          { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        ]
      : [
          { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { path: '/profile', label: 'My Profile', icon: User },
        ]
    : [];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 glass border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 group" onClick={() => setMobileOpen(false)}>
              <div className="w-9 h-9 rounded-xl gradient-blood flex items-center justify-center shadow-lg shadow-blood-600/25 group-hover:shadow-blood-600/40 transition-shadow">
                <Droplets className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">
                Blood<span className="text-blood-600 dark:text-blood-400">Link</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive(path)
                      ? 'bg-blood-50 text-blood-700 dark:bg-blood-900/30 dark:text-blood-400'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
              {authLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive(path)
                      ? 'bg-blood-50 text-blood-700 dark:bg-blood-900/30 dark:text-blood-400'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={toggle}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle theme"
              >
                {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              {user && profile ? (
                <div className="flex items-center gap-3">
                  <Link to="/request/new" className="btn-danger text-sm !py-2 !px-4">
                    <Siren className="w-4 h-4" />
                    Emergency
                  </Link>
                  <div className="flex items-center gap-2 pl-3 border-l border-gray-200 dark:border-gray-700">
                    <div className="w-8 h-8 rounded-full bg-blood-100 dark:bg-blood-900/40 flex items-center justify-center">
                      <span className="text-sm font-semibold text-blood-700 dark:text-blood-400">
                        {profile.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="hidden lg:block">
                      <p className="text-sm font-medium leading-none">{profile.full_name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{profile.role}</p>
                    </div>
                    <button onClick={handleSignOut} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" title="Sign out">
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="btn-secondary text-sm !py-2 !px-4">
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </Link>
                  <Link to="/register" className="btn-primary text-sm !py-2 !px-4">
                    <UserPlus className="w-4 h-4" />
                    Join Now
                  </Link>
                </div>
              )}
            </div>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
            <nav className="px-4 py-3 space-y-1">
              {navLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${isActive(path)
                      ? 'bg-blood-50 text-blood-700 dark:bg-blood-900/30 dark:text-blood-400'
                      : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
              {authLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${isActive(path)
                      ? 'bg-blood-50 text-blood-700 dark:bg-blood-900/30 dark:text-blood-400'
                      : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={toggle}
                  className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                >
                  {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {dark ? 'Light Mode' : 'Dark Mode'}
                </button>
                {user && profile ? (
                  <>
                    <Link
                      to="/request/new"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-blood-600 hover:bg-blood-50 dark:text-blood-400 dark:hover:bg-blood-900/30 transition-colors"
                    >
                      <Siren className="w-4 h-4" />
                      Emergency Request
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2 pt-2">
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary text-sm !py-2 flex-1">
                      <LogIn className="w-4 h-4" /> Sign In
                    </Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary text-sm !py-2 flex-1">
                      <UserPlus className="w-4 h-4" /> Join
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg gradient-blood flex items-center justify-center">
                  <Droplets className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold">Blood<span className="text-blood-600 dark:text-blood-400">Link</span></span>
              </Link>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Connecting donors with recipients. Every drop counts, every donor matters.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-3">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/search" className="text-sm text-gray-500 hover:text-blood-600 dark:text-gray-400 dark:hover:text-blood-400 transition-colors">Find Donors</Link></li>
                <li><Link to="/requests" className="text-sm text-gray-500 hover:text-blood-600 dark:text-gray-400 dark:hover:text-blood-400 transition-colors">Blood Requests</Link></li>
                <li><Link to="/register" className="text-sm text-gray-500 hover:text-blood-600 dark:text-gray-400 dark:hover:text-blood-400 transition-colors">Become a Donor</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-3">Resources</h3>
              <ul className="space-y-2">
                <li><Link to="/eligibility" className="text-sm text-gray-500 hover:text-blood-600 dark:text-gray-400 dark:hover:text-blood-400 transition-colors">Eligibility Checker</Link></li>
                <li><Link to="/blood-groups" className="text-sm text-gray-500 hover:text-blood-600 dark:text-gray-400 dark:hover:text-blood-400 transition-colors">Blood Group Info</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-3">Contact</h3>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li className="flex items-center gap-2"><Heart className="w-4 h-4 text-blood-500" /> Emergency: 911</li>
                <li>support@bloodlink.org</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-400">
            BloodLink &copy; {new Date().getFullYear()} – Connecting Donors, Saving Lives
          </div>
        </div>
      </footer>
    </div>
  );
}
