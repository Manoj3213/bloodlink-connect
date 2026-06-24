import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Siren, AlertCircle, MapPin, Phone, User, Droplets } from 'lucide-react';
import { BLOOD_GROUPS, type BloodGroup, type RequestUrgency } from '../types';

export default function NewRequestPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patientName, setPatientName] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup | ''>('');
  const [unitsRequired, setUnitsRequired] = useState('1');
  const [hospitalName, setHospitalName] = useState('');
  const [city, setCity] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('+91');
  const [urgency, setUrgency] = useState<RequestUrgency>('normal');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bloodGroup || !patientName || !hospitalName || !city || !contactPerson || !contactPhone) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    setLoading(true);
    const { error: dbError } = await supabase.from('blood_requests').insert({
      requester_id: user!.id,
      patient_name: patientName,
      blood_group: bloodGroup,
      units_required: parseInt(unitsRequired),
      hospital_name: hospitalName,
      city,
      contact_person: contactPerson,
      contact_phone: contactPhone,
      urgency,
      description: description || null,
    });
    if (dbError) { setError(dbError.message); setLoading(false); }
    else navigate('/requests');
  };

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <Siren className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Sign In Required</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">You need to be signed in to create a blood request.</p>
        <button onClick={() => navigate('/login')} className="btn-primary">Sign In</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="card p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <Siren className="w-7 h-7 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-extrabold">Create Blood Request</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Fill in the details to find matching donors</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-medium mb-2 block">Urgency Level</label>
            <div className="grid grid-cols-3 gap-3">
              {(['normal', 'urgent', 'critical'] as RequestUrgency[]).map(level => (
                <button key={level} type="button" onClick={() => setUrgency(level)} className={`py-3 rounded-xl text-sm font-semibold capitalize transition-all duration-200 border-2 ${urgency === level ? level === 'critical' ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/30 dark:border-red-400 dark:text-red-400' : level === 'urgent' ? 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:border-orange-400 dark:text-orange-400' : 'border-blood-500 bg-blood-50 text-blood-700 dark:bg-blood-900/30 dark:border-blood-400 dark:text-blood-400' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                  {level}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Patient Name *</label>
              <input type="text" value={patientName} onChange={e => setPatientName(e.target.value)} className="input-field" placeholder="Patient name" required />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block flex items-center gap-1.5"><Droplets className="w-3.5 h-3.5" /> Blood Group *</label>
              <select value={bloodGroup} onChange={e => setBloodGroup(e.target.value as BloodGroup)} className="input-field" required>
                <option value="">Select</option>
                {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Units Required *</label>
              <input type="number" value={unitsRequired} onChange={e => setUnitsRequired(e.target.value)} className="input-field" min="1" max="20" required />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> City *</label>
              <input type="text" value={city} onChange={e => setCity(e.target.value)} className="input-field" placeholder="City name" required />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Hospital Name *</label>
            <input type="text" value={hospitalName} onChange={e => setHospitalName(e.target.value)} className="input-field" placeholder="Hospital name and address" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Contact Person *</label>
              <input type="text" value={contactPerson} onChange={e => setContactPerson(e.target.value)} className="input-field" placeholder="Contact name" required />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Contact Phone *</label>
              <input type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)} className="input-field" placeholder="+91 98765 43210" required />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Additional Details</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="input-field min-h-[80px] resize-none" placeholder="Any additional information..." />
          </div>
          <button type="submit" disabled={loading} className="btn-danger w-full">
            <Siren className="w-4 h-4" /> {loading ? 'Creating Request...' : 'Submit Blood Request'}
          </button>
        </form>
      </div>
    </div>
  );
}
