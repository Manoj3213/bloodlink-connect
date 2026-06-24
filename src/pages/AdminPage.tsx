import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Shield, Users, Siren, CheckCircle2, XCircle, UserCheck, UserX, Activity } from 'lucide-react';
import type { DonorWithProfile, BloodRequestWithRequester } from '../types';

export default function AdminPage() {
  const { profile } = useAuth();
  const [donors, setDonors] = useState<DonorWithProfile[]>([]);
  const [requests, setRequests] = useState<BloodRequestWithRequester[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'donors' | 'requests'>('donors');

  useEffect(() => { if (profile?.role === 'admin') loadData(); }, [profile]);

  const loadData = async () => {
    setLoading(true);
    const [donorRes, reqRes] = await Promise.all([
      supabase.from('donors').select('*, profile:profiles(*)').order('created_at', { ascending: false }),
      supabase.from('blood_requests').select('*, requester:profiles!blood_requests_requester_id_fkey(*)').order('created_at', { ascending: false }),
    ]);
    setDonors((donorRes.data as DonorWithProfile[]) ?? []);
    setRequests((reqRes.data as BloodRequestWithRequester[]) ?? []);
    setLoading(false);
  };

  const verifyDonor = async (id: string, verified: boolean) => {
    await supabase.from('donors').update({ verified, updated_at: new Date().toISOString() }).eq('id', id);
    setDonors(prev => prev.map(d => d.id === id ? { ...d, verified } : d));
  };

  const updateRequestStatus = async (id: string, status: string) => {
    const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
    if (status === 'fulfilled') updates.fulfilled_at = new Date().toISOString();
    await supabase.from('blood_requests').update(updates).eq('id', id);
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status, fulfilled_at: status === 'fulfilled' ? new Date().toISOString() : r.fulfilled_at } as BloodRequestWithRequester : r));
  };

  if (profile?.role !== 'admin') {
    return <div className="max-w-lg mx-auto px-4 py-20 text-center"><Shield className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" /><h2 className="text-xl font-bold mb-2">Access Denied</h2><p className="text-gray-500 dark:text-gray-400">Admin access required.</p></div>;
  }

  const totalDonors = donors.length;
  const verifiedDonors = donors.filter(d => d.verified).length;
  const openRequests = requests.filter(r => r.status === 'open').length;
  const criticalRequests = requests.filter(r => r.urgency === 'critical' && r.status === 'open').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-blood-50 dark:bg-blood-900/30 flex items-center justify-center"><Shield className="w-5 h-5 text-blood-600 dark:text-blood-400" /></div>
        <div><h1 className="text-2xl md:text-3xl font-extrabold">Admin Dashboard</h1><p className="text-sm text-gray-500 dark:text-gray-400">Manage donors, verify accounts, and handle blood requests</p></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-5 text-center"><Users className="w-6 h-6 text-blood-600 dark:text-blood-400 mx-auto mb-2" /><p className="text-2xl font-extrabold">{totalDonors}</p><p className="text-xs text-gray-500 dark:text-gray-400">Total Donors</p></div>
        <div className="card p-5 text-center"><UserCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" /><p className="text-2xl font-extrabold">{verifiedDonors}</p><p className="text-xs text-gray-500 dark:text-gray-400">Verified</p></div>
        <div className="card p-5 text-center"><Activity className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" /><p className="text-2xl font-extrabold">{openRequests}</p><p className="text-xs text-gray-500 dark:text-gray-400">Open Requests</p></div>
        <div className="card p-5 text-center"><Siren className="w-6 h-6 text-red-600 dark:text-red-400 mx-auto mb-2" /><p className="text-2xl font-extrabold">{criticalRequests}</p><p className="text-xs text-gray-500 dark:text-gray-400">Critical</p></div>
      </div>

      <div className="flex gap-1 mb-6 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
        <button onClick={() => setActiveTab('donors')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'donors' ? 'bg-white dark:bg-gray-900 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}><Users className="w-4 h-4 inline mr-1.5" />Donors</button>
        <button onClick={() => setActiveTab('requests')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'requests' ? 'bg-white dark:bg-gray-900 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}><Siren className="w-4 h-4 inline mr-1.5" />Requests</button>
      </div>

      {loading ? <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-blood-200 dark:border-blood-800 border-t-blood-600 dark:border-t-blood-400 rounded-full animate-spin" /></div> : activeTab === 'donors' ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">Name</th>
                <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">Blood Group</th>
                <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">City</th>
                <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">Available</th>
                <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">Verified</th>
                <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
              </tr></thead>
              <tbody>
                {donors.map(d => (
                  <tr key={d.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="p-4 font-medium">{d.profile?.full_name ?? 'Unknown'}</td>
                    <td className="p-4"><span className="font-semibold text-blood-600 dark:text-blood-400">{d.blood_group}</span></td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">{d.city}</td>
                    <td className="p-4"><span className={d.availability ? 'badge-available' : 'badge-unavailable'}>{d.availability ? 'Yes' : 'No'}</span></td>
                    <td className="p-4">{d.verified ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-gray-300 dark:text-gray-600" />}</td>
                    <td className="p-4">
                      {d.verified ? <button onClick={() => verifyDonor(d.id, false)} className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 font-medium"><UserX className="w-4 h-4 inline mr-1" />Unverify</button>
                        : <button onClick={() => verifyDonor(d.id, true)} className="text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium"><UserCheck className="w-4 h-4 inline mr-1" />Verify</button>}
                    </td>
                  </tr>
                ))}
                {donors.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-400">No donors registered yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => (
            <div key={req.id} className="card p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold ${req.urgency === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-blood-50 text-blood-700 dark:bg-blood-900/30 dark:text-blood-400'}`}>{req.blood_group}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{req.patient_name}</h3>
                    <span className={req.urgency === 'critical' ? 'badge-critical' : req.urgency === 'urgent' ? 'badge-urgent' : 'badge-normal'}>{req.urgency}</span>
                    <span className={`badge ${req.status === 'open' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>{req.status}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{req.hospital_name}, {req.city} · {req.units_required} unit{req.units_required !== 1 ? 's' : ''} · By: {req.requester?.full_name ?? 'Unknown'}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {req.status === 'open' && <>
                    <button onClick={() => updateRequestStatus(req.id, 'fulfilled')} className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors">Fulfill</button>
                    <button onClick={() => updateRequestStatus(req.id, 'closed')} className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Close</button>
                  </>}
                </div>
              </div>
            </div>
          ))}
          {requests.length === 0 && <div className="text-center py-12 text-gray-400">No requests found</div>}
        </div>
      )}
    </div>
  );
}
