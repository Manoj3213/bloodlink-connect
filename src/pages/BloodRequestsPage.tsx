import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Siren, MapPin, Droplets, Clock, Plus, AlertTriangle, Filter } from 'lucide-react';
import { BLOOD_GROUPS, type BloodGroup, type BloodRequestWithRequester, type RequestUrgency } from '../types';

export default function BloodRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<BloodRequestWithRequester[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterGroup, setFilterGroup] = useState<BloodGroup | ''>('');
  const [filterUrgency, setFilterUrgency] = useState<RequestUrgency | ''>('');
  const [showOpenOnly, setShowOpenOnly] = useState(true);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('blood_requests').select('*, requester:profiles!blood_requests_requester_id_fkey(*)').order('created_at', { ascending: false });
    if (filterGroup) query = query.eq('blood_group', filterGroup);
    if (filterUrgency) query = query.eq('urgency', filterUrgency);
    if (showOpenOnly) query = query.eq('status', 'open');
    const { data } = await query;
    setRequests((data as BloodRequestWithRequester[]) ?? []);
    setLoading(false);
  }, [filterGroup, filterUrgency, showOpenOnly]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const urgencyConfig: Record<RequestUrgency, { class: string; icon: typeof AlertTriangle; label: string }> = {
    normal: { class: 'badge-normal', icon: Clock, label: 'Normal' },
    urgent: { class: 'badge-urgent', icon: AlertTriangle, label: 'Urgent' },
    critical: { class: 'badge-critical', icon: Siren, label: 'Critical' },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold">Blood Requests</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View and respond to blood requests in your area</p>
        </div>
        {user && (
          <Link to="/request/new" className="btn-danger !py-2 !px-4 text-sm whitespace-nowrap">
            <Plus className="w-4 h-4" /> New Request
          </Link>
        )}
      </div>

      <div className="card p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="w-4 h-4 text-gray-400" />
          <select value={filterGroup} onChange={e => setFilterGroup(e.target.value as BloodGroup | '')} className="input-field !w-auto !py-2 text-sm">
            <option value="">All Blood Groups</option>
            {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
          </select>
          <select value={filterUrgency} onChange={e => setFilterUrgency(e.target.value as RequestUrgency | '')} className="input-field !w-auto !py-2 text-sm">
            <option value="">All Urgencies</option>
            <option value="normal">Normal</option>
            <option value="urgent">Urgent</option>
            <option value="critical">Critical</option>
          </select>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={showOpenOnly} onChange={e => setShowOpenOnly(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-blood-600 focus:ring-blood-500" />
            Open only
          </label>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-blood-200 dark:border-blood-800 border-t-blood-600 dark:border-t-blood-400 rounded-full animate-spin" /></div>
      ) : requests.length === 0 ? (
        <div className="text-center py-20">
          <Siren className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">No requests found</h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{user ? 'Create a new blood request to get started' : 'Sign in to create a blood request'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => {
            const urg = urgencyConfig[req.urgency];
            const UrgIcon = urg.icon;
            return (
              <div key={req.id} className="card p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 font-extrabold text-lg ${req.urgency === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 animate-pulse-slow' : 'bg-blood-50 text-blood-700 dark:bg-blood-900/30 dark:text-blood-400'}`}>
                    {req.blood_group}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold">{req.patient_name}</h3>
                      <span className={urg.class}><UrgIcon className="w-3 h-3 mr-1" />{urg.label}</span>
                      <span className={`badge ${req.status === 'open' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : req.status === 'fulfilled' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>{req.status}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1"><Droplets className="w-3.5 h-3.5" />{req.units_required} unit{req.units_required !== 1 ? 's' : ''} needed</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{req.hospital_name}, {req.city}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{new Date(req.created_at).toLocaleDateString()}</span>
                    </div>
                    {req.description && <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">{req.description}</p>}
                    <div className="flex items-center gap-4 mt-3 text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Contact: {req.contact_person}</span>
                      <a href={`tel:${req.contact_phone}`} className="text-blood-600 dark:text-blood-400 font-medium hover:underline">{req.contact_phone}</a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
