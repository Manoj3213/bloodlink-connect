import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Search, MapPin, Droplets, Phone, X, Siren, CheckCircle2 } from 'lucide-react';
import { BLOOD_GROUPS, type BloodGroup, type DonorWithProfile } from '../types';

export default function SearchPage() {
  const { user } = useAuth();
  const [bloodGroup, setBloodGroup] = useState<BloodGroup | ''>('');
  const [city, setCity] = useState('');
  const [donors, setDonors] = useState<DonorWithProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const searchDonors = useCallback(async () => {
    if (!bloodGroup && !city) return;
    setLoading(true);
    let query = supabase.from('donors').select('*, profile:profiles(*)').eq('availability', true);
    if (bloodGroup) query = query.eq('blood_group', bloodGroup);
    if (city) query = query.ilike('city', `%${city}%`);
    const { data } = await query.order('created_at', { ascending: false });
    setDonors((data as DonorWithProfile[]) ?? []);
    setLoading(false);
    setSearched(true);
  }, [bloodGroup, city]);

  useEffect(() => {
    if (bloodGroup || city) {
      const timer = setTimeout(searchDonors, 300);
      return () => clearTimeout(timer);
    }
  }, [bloodGroup, city, searchDonors]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold">Find Blood Donors</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Search for available donors by blood group and location</p>
        </div>
        {user && (
          <Link to="/request/new" className="btn-danger !py-2 !px-4 text-sm whitespace-nowrap">
            <Siren className="w-4 h-4" /> Emergency
          </Link>
        )}
      </div>

      <div className="card p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select value={bloodGroup} onChange={e => setBloodGroup(e.target.value as BloodGroup | '')} className="input-field !pl-10 appearance-none cursor-pointer">
                <option value="">All Blood Groups</option>
                {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
          </div>
          <div className="flex-1">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" value={city} onChange={e => setCity(e.target.value)} className="input-field !pl-10" placeholder="Search by city..." />
              {city && <button onClick={() => setCity('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}
            </div>
          </div>
          <button onClick={searchDonors} disabled={loading} className="btn-primary !py-3 whitespace-nowrap">
            <Search className="w-4 h-4" /> {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {BLOOD_GROUPS.map(bg => (
            <button key={bg} onClick={() => setBloodGroup(bloodGroup === bg ? '' : bg)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border ${bloodGroup === bg ? 'border-blood-500 bg-blood-50 text-blood-700 dark:bg-blood-900/30 dark:border-blood-400 dark:text-blood-400' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'}`}>
              {bg}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-blood-200 dark:border-blood-800 border-t-blood-600 dark:border-t-blood-400 rounded-full animate-spin" />
        </div>
      )}

      {!loading && searched && donors.length === 0 && (
        <div className="text-center py-20">
          <Droplets className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">No donors found</h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try adjusting your search criteria</p>
        </div>
      )}

      {!loading && searched && donors.length > 0 && (
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{donors.length} donor{donors.length !== 1 ? 's' : ''} found</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {donors.map(donor => (
              <div key={donor.id} className="card p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blood-50 dark:bg-blood-900/30 flex items-center justify-center shrink-0">
                    <span className="text-sm font-extrabold text-blood-700 dark:text-blood-400">{donor.blood_group}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{donor.profile?.full_name ?? 'Anonymous'}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <MapPin className="w-3 h-3" /> {donor.city}
                    </div>
                  </div>
                  {donor.verified && <span className="tooltip" data-tooltip="Verified donor"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /></span>}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className={donor.availability ? 'badge-available' : 'badge-unavailable'}>{donor.availability ? 'Available' : 'Unavailable'}</span>
                  {donor.last_donation_date && <span className="text-xs text-gray-400 dark:text-gray-500">Last: {new Date(donor.last_donation_date).toLocaleDateString()}</span>}
                </div>
                {donor.profile?.phone && (
                  <a href={`tel:${donor.profile.phone}`} className="mt-3 flex items-center gap-2 text-xs text-blood-600 dark:text-blood-400 hover:underline">
                    <Phone className="w-3 h-3" /> {donor.profile.phone}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!searched && !loading && (
        <div className="text-center py-20">
          <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Search for Donors</h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Select a blood group or enter a city to find available donors</p>
        </div>
      )}
    </div>
  );
}
