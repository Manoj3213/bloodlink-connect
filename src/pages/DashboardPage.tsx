import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Droplets, Heart, Siren, Clock, MapPin, CheckCircle2, AlertTriangle, User, Activity, Plus } from 'lucide-react';
import type { Donor, BloodRequestWithRequester, Donation } from '../types';

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [donor, setDonor] = useState<Donor | null>(null);
  const [myRequests, setMyRequests] = useState<BloodRequestWithRequester[]>([]);
  const [openRequests, setOpenRequests] = useState<BloodRequestWithRequester[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    if (profile?.role === 'donor') {
      const { data: donorData } = await supabase.from('donors').select('*').eq('id', user.id).single();
      setDonor(donorData);
      const { data: donationData } = await supabase.from('donations').select('*').eq('donor_id', user.id).order('donated_at', { ascending: false }).limit(5);
      setDonations(donationData ?? []);
    }
    const { data: reqData } = await supabase.from('blood_requests').select('*, requester:profiles!blood_requests_requester_id_fkey(*)').eq('requester_id', user.id).order('created_at', { ascending: false });
    setMyRequests((reqData as BloodRequestWithRequester[]) ?? []);
    const { data: openData } = await supabase.from('blood_requests').select('*, requester:profiles!blood_requests_requester_id_fkey(*)').eq('status', 'open').order('created_at', { ascending: false }).limit(5);
    setOpenRequests((openData as BloodRequestWithRequester[]) ?? []);
    setLoading(false);
  }, [user, profile?.role]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  if (!user || !profile) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <User className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Sign In Required</h2>
        <p className="text-gray-500 dark:text-gray-400">Please sign in to access your dashboard.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-blood-200 dark:border-blood-800 border-t-blood-600 dark:border-t-blood-400 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold">Welcome, {profile.full_name}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 capitalize">{profile.role} dashboard</p>
        </div>
        {profile.role === 'recipient' && (
          <Link to="/request/new" className="btn-danger !py-2 !px-4 text-sm whitespace-nowrap">
            <Plus className="w-4 h-4" /> New Blood Request
          </Link>
        )}
      </div>

      {profile.role === 'donor' && donor && (
        <div className="card p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blood-50 dark:bg-blood-900/30 flex items-center justify-center">
                <span className="text-xl font-extrabold text-blood-700 dark:text-blood-400">{donor.blood_group}</span>
              </div>
              <div>
                <h3 className="font-bold flex items-center gap-2">Donor Profile {donor.verified && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1"><MapPin className="w-3.5 h-3.5" /> {donor.city}</p>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                <p className="text-2xl font-extrabold text-blood-600 dark:text-blood-400">{donations.length}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Donations</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                <p className={`text-2xl font-extrabold ${donor.availability ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>{donor.availability ? 'Yes' : 'No'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Available</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{donor.last_donation_date ? Math.floor((Date.now() - new Date(donor.last_donation_date).getTime()) / (1000 * 60 * 60 * 24)) : '-'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Days Since</p>
              </div>
            </div>
            <Link to="/profile" className="btn-secondary !py-2 !px-4 text-sm whitespace-nowrap">Edit Profile</Link>
          </div>
        </div>
      )}

      {profile.role === 'donor' && !donor && (
        <Link to="/donor/onboarding" className="card p-6 mb-6 flex items-center gap-4 hover:shadow-md transition-shadow group">
          <div className="w-12 h-12 rounded-xl bg-blood-50 dark:bg-blood-900/30 flex items-center justify-center">
            <Droplets className="w-6 h-6 text-blood-600 dark:text-blood-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold group-hover:text-blood-600 dark:group-hover:text-blood-400 transition-colors">Complete Your Donor Profile</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Add your blood group and location to start receiving requests</p>
          </div>
          <AlertTriangle className="w-5 h-5 text-amber-500" />
        </Link>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-5 text-center"><Siren className="w-6 h-6 text-blood-600 dark:text-blood-400 mx-auto mb-2" /><p className="text-2xl font-extrabold">{myRequests.length}</p><p className="text-xs text-gray-500 dark:text-gray-400">Your Requests</p></div>
        <div className="card p-5 text-center"><Activity className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" /><p className="text-2xl font-extrabold">{myRequests.filter(r => r.status === 'open').length}</p><p className="text-xs text-gray-500 dark:text-gray-400">Active Requests</p></div>
        <div className="card p-5 text-center"><CheckCircle2 className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" /><p className="text-2xl font-extrabold">{myRequests.filter(r => r.status === 'fulfilled').length}</p><p className="text-xs text-gray-500 dark:text-gray-400">Fulfilled</p></div>
        <div className="card p-5 text-center"><Heart className="w-6 h-6 text-rose-600 dark:text-rose-400 mx-auto mb-2" /><p className="text-2xl font-extrabold">{donations.length * 3}</p><p className="text-xs text-gray-500 dark:text-gray-400">Lives Impacted</p></div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="p-5 border-b border-gray-100 dark:border-gray-800"><h2 className="font-bold flex items-center gap-2"><Siren className="w-5 h-5 text-blood-600 dark:text-blood-400" /> Your Blood Requests</h2></div>
          <div className="p-5">
            {myRequests.length === 0 ? <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No requests yet.</p> : (
              <div className="space-y-3">
                {myRequests.slice(0, 5).map(req => (
                  <div key={req.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <div className="w-10 h-10 rounded-lg bg-blood-50 dark:bg-blood-900/30 flex items-center justify-center shrink-0"><span className="text-xs font-bold text-blood-700 dark:text-blood-400">{req.blood_group}</span></div>
                    <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{req.patient_name}</p><p className="text-xs text-gray-500 dark:text-gray-400">{req.hospital_name}</p></div>
                    <span className={`badge ${req.status === 'open' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : req.status === 'fulfilled' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>{req.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h2 className="font-bold flex items-center gap-2"><Clock className="w-5 h-5 text-blood-600 dark:text-blood-400" /> Recent Open Requests</h2>
            <Link to="/requests" className="text-xs text-blood-600 dark:text-blood-400 font-medium hover:underline">View All</Link>
          </div>
          <div className="p-5">
            {openRequests.length === 0 ? <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No open requests right now</p> : (
              <div className="space-y-3">
                {openRequests.map(req => (
                  <div key={req.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${req.urgency === 'critical' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blood-50 dark:bg-blood-900/30'}`}>
                      <span className={`text-xs font-bold ${req.urgency === 'critical' ? 'text-red-700 dark:text-red-400' : 'text-blood-700 dark:text-blood-400'}`}>{req.blood_group}</span>
                    </div>
                    <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{req.patient_name}</p><p className="text-xs text-gray-500 dark:text-gray-400">{req.city} · {req.units_required} unit{req.units_required !== 1 ? 's' : ''}</p></div>
                    <span className={req.urgency === 'critical' ? 'badge-critical' : req.urgency === 'urgent' ? 'badge-urgent' : 'badge-normal'}>{req.urgency}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {profile.role === 'donor' && donations.length > 0 && (
        <div className="card mt-6">
          <div className="p-5 border-b border-gray-100 dark:border-gray-800"><h2 className="font-bold flex items-center gap-2"><Heart className="w-5 h-5 text-blood-600 dark:text-blood-400" /> Your Donation History</h2></div>
          <div className="p-5">
            <div className="space-y-3">
              {donations.map(d => (
                <div key={d.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <Heart className="w-5 h-5 text-rose-500 shrink-0" />
                  <div className="flex-1"><p className="text-sm font-medium">Donation</p><p className="text-xs text-gray-500 dark:text-gray-400">{new Date(d.donated_at).toLocaleDateString()}{d.notes && ` - ${d.notes}`}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
