import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { User, MapPin, Droplets, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { BLOOD_GROUPS, type BloodGroup } from '../types';
import type { Donor } from '../types';

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [donor, setDonor] = useState<Donor | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [city, setCity] = useState('');
  const [availability, setAvailability] = useState(true);
  const [weight, setWeight] = useState('');
  const [medicalConditions, setMedicalConditions] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadDonor = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('donors').select('*').eq('id', user.id).single();
    if (data) {
      setDonor(data);
      setBloodGroup(data.blood_group);
      setCity(data.city);
      setAvailability(data.availability);
      setWeight(data.weight_kg?.toString() ?? '');
      setMedicalConditions(data.medical_conditions ?? '');
    }
  }, [user]);

  useEffect(() => {
    if (profile) { setFullName(profile.full_name); setPhone(profile.phone ?? ''); }
    loadDonor();
  }, [profile, loadDonor]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(false); setLoading(true);
    const { error: profileErr } = await supabase.from('profiles').update({ full_name: fullName, phone: phone || null, updated_at: new Date().toISOString() }).eq('id', user!.id);
    if (profileErr) { setError(profileErr.message); setLoading(false); return; }
    if (donor) {
      const { error: donorErr } = await supabase.from('donors').update({ blood_group: bloodGroup, city, availability, weight_kg: weight ? parseFloat(weight) : null, medical_conditions: medicalConditions || null, updated_at: new Date().toISOString() }).eq('id', user!.id);
      if (donorErr) { setError(donorErr.message); setLoading(false); return; }
    }
    await refreshProfile(); await loadDonor(); setSuccess(true); setLoading(false);
  };

  if (!user || !profile) {
    return <div className="max-w-lg mx-auto px-4 py-20 text-center"><User className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" /><h2 className="text-xl font-bold mb-2">Sign In Required</h2><p className="text-gray-500 dark:text-gray-400">Please sign in to view your profile.</p></div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl md:text-3xl font-extrabold mb-2">My Profile</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Manage your personal information and donor details</p>
      <form onSubmit={handleSave} className="space-y-6">
        <div className="card p-6">
          <h2 className="font-bold mb-4 flex items-center gap-2"><User className="w-5 h-5 text-blood-600 dark:text-blood-400" /> Basic Information</h2>
          <div className="space-y-4">
            <div><label className="text-sm font-medium mb-1.5 block">Full Name</label><input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="input-field" required /></div>
            <div><label className="text-sm font-medium mb-1.5 block">Email</label><input type="email" value={profile.email} className="input-field bg-gray-50 dark:bg-gray-800/50" disabled /></div>
            <div><label className="text-sm font-medium mb-1.5 block">Phone</label><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="input-field" placeholder="+91 98765 43210" /></div>
            <div><label className="text-sm font-medium mb-1.5 block">Role</label><input type="text" value={profile.role} className="input-field bg-gray-50 dark:bg-gray-800/50 capitalize" disabled /></div>
          </div>
        </div>
        {profile.role === 'donor' && (
          <div className="card p-6">
            <h2 className="font-bold mb-4 flex items-center gap-2"><Droplets className="w-5 h-5 text-blood-600 dark:text-blood-400" /> Donor Details {donor?.verified && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Blood Group</label>
                <div className="grid grid-cols-4 gap-2">
                  {BLOOD_GROUPS.map(bg => (
                    <button key={bg} type="button" onClick={() => setBloodGroup(bg)} className={`py-2 rounded-xl text-sm font-semibold transition-all duration-200 border-2 ${bloodGroup === bg ? 'border-blood-500 bg-blood-50 text-blood-700 dark:bg-blood-900/30 dark:border-blood-400 dark:text-blood-400' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'}`}>{bg}</button>
                  ))}
                </div>
              </div>
              <div><label className="text-sm font-medium mb-1.5 block flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> City</label><input type="text" value={city} onChange={e => setCity(e.target.value)} className="input-field" required /></div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <div><p className="text-sm font-medium">Available for Donation</p><p className="text-xs text-gray-500 dark:text-gray-400">Toggle your availability status</p></div>
                <button type="button" onClick={() => setAvailability(!availability)} className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${availability ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                  <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200" style={{ transform: availability ? 'translateX(26px)' : 'translateX(2px)', left: 0 }} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium mb-1.5 block">Weight (kg)</label><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="input-field" min="40" step="0.1" /></div>
                <div><label className="text-sm font-medium mb-1.5 block">Last Donation Date</label><input type="date" value={donor?.last_donation_date ?? ''} className="input-field bg-gray-50 dark:bg-gray-800/50" disabled /></div>
              </div>
              <div><label className="text-sm font-medium mb-1.5 block">Medical Conditions</label><textarea value={medicalConditions} onChange={e => setMedicalConditions(e.target.value)} className="input-field min-h-[80px] resize-none" /></div>
            </div>
          </div>
        )}
        {error && <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm"><AlertCircle className="w-4 h-4 shrink-0" /> {error}</div>}
        {success && <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-sm"><CheckCircle2 className="w-4 h-4 shrink-0" /> Profile updated successfully!</div>}
        <button type="submit" disabled={loading} className="btn-primary w-full"><Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Changes'}</button>
      </form>
    </div>
  );
}
