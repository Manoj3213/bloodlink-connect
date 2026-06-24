import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Droplets, UserPlus, Eye, EyeOff, AlertCircle } from 'lucide-react';
import type { UserRole } from '../types';

export default function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>('donor');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await signUp(email, password, fullName, role, phone || undefined);
    if (err) {
      setError(err);
      setLoading(false);
    } else {
      navigate(role === 'donor' ? '/donor/onboarding' : '/dashboard');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl gradient-blood flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blood-600/25">
              <Droplets className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold">Join BloodLink</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Choose your role and create an account</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <button type="button" onClick={() => setRole('donor')} className={`p-4 rounded-xl border-2 text-center transition-all duration-200 ${role === 'donor' ? 'border-blood-500 bg-blood-50 dark:bg-blood-900/20 dark:border-blood-400' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
              <Droplets className={`w-6 h-6 mx-auto mb-2 ${role === 'donor' ? 'text-blood-600 dark:text-blood-400' : 'text-gray-400'}`} />
              <p className={`text-sm font-semibold ${role === 'donor' ? 'text-blood-700 dark:text-blood-400' : 'text-gray-600 dark:text-gray-400'}`}>Blood Donor</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">I want to donate blood</p>
            </button>
            <button type="button" onClick={() => setRole('recipient')} className={`p-4 rounded-xl border-2 text-center transition-all duration-200 ${role === 'recipient' ? 'border-blood-500 bg-blood-50 dark:bg-blood-900/20 dark:border-blood-400' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
              <UserPlus className={`w-6 h-6 mx-auto mb-2 ${role === 'recipient' ? 'text-blood-600 dark:text-blood-400' : 'text-gray-400'}`} />
              <p className={`text-sm font-semibold ${role === 'recipient' ? 'text-blood-700 dark:text-blood-400' : 'text-gray-600 dark:text-gray-400'}`}>Recipient</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">I need blood</p>
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Full Name</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="input-field" placeholder="John Doe" required />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Phone Number</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="input-field" placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="input-field !pr-10" placeholder="Min. 6 characters" minLength={6} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              <UserPlus className="w-4 h-4" />
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blood-600 dark:text-blood-400 font-medium hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
