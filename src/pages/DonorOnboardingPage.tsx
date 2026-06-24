import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Droplets, ArrowRight, AlertCircle } from 'lucide-react';
import { BLOOD_GROUPS, type BloodGroup } from '../types';

export default function DonorOnboardingPage() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [bloodGroup, setBloodGroup] = useState<BloodGroup | ''>('');
  const [city, setCity] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [weight, setWeight] = useState('');
  const [medicalConditions, setMedicalConditions] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bloodGroup || !city) {
      setError('Blood group and city are required.');
      return;
    }
    setError('');
    setLoading(true);

    const { error: dbError } = await supabase.from('donors').insert({
      id: user!.id,
      blood_group: bloodGroup,
      city,
      date_of_birth: dateOfBirth || null,
      weight_kg: weight ? parseFloat(weight) : null,
      medical_conditions: medicalConditions || null,
      availability: true,
    });

    if (dbError) {
      setError(dbError.message);
      setLoading(false);
    } else {
      await refreshProfile();
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-lg">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl gradient-blood flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blood-600/25">
              <Droplets className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold">Donor Profile</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Complete your donor profile to start saving lives</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium mb-2 block">Blood Group *</label>
              <div className="grid grid-cols-4 gap-2">
                {BLOOD_GROUPS.map(bg => (
                  <button key={bg} type="button" onClick={() => setBloodGroup(bg)} className={`py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border-2 ${bloodGroup === bg ? 'border-blood-500 bg-blood-50 text-blood-700 dark:bg-blood-900/30 dark:border-blood-400 dark:text-blood-400' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                    {bg}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">City *</label>
              <input type="text" value={city} onChange={e => setCity(e.target.value)} className="input-field" placeholder="e.g. New York, London, Mumbai" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Date of Birth</label>
                <input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Weight (kg)</label>
                <input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="input-field" placeholder="e.g. 70" min="40" step="0.1" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Medical Conditions (if any)</label>
              <textarea value={medicalConditions} onChange={e => setMedicalConditions(e.target.value)} className="input-field min-h-[80px] resize-none" placeholder="List any medical conditions that might affect your eligibility..." />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              <ArrowRight className="w-4 h-4" />
              {loading ? 'Saving...' : 'Complete Registration'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
