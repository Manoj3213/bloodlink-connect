import { Droplets, ArrowRight } from 'lucide-react';
import { BLOOD_GROUP_INFO, COMPATIBLE_DONORS, COMPATIBLE_RECIPIENTS, type BloodGroup } from '../types';

export default function BloodGroupsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <Droplets className="w-12 h-12 text-blood-600 dark:text-blood-400 mx-auto mb-4" />
        <h1 className="text-2xl md:text-3xl font-extrabold">Blood Group Information</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-lg mx-auto">Understanding blood group compatibility is crucial for safe transfusions and efficient donor-recipient matching.</p>
      </div>

      <div className="card overflow-hidden mb-8">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800"><h2 className="font-bold text-lg">Compatibility Chart</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <th className="p-4 text-left font-semibold">Blood Group</th>
                <th className="p-4 text-left font-semibold">Population %</th>
                <th className="p-4 text-left font-semibold">Can Donate To</th>
                <th className="p-4 text-left font-semibold">Can Receive From</th>
              </tr>
            </thead>
            <tbody>
              {(Object.entries(BLOOD_GROUP_INFO) as [BloodGroup, typeof BLOOD_GROUP_INFO[BloodGroup]][]).map(([group, info]) => (
                <tr key={group} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="p-4"><span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blood-50 dark:bg-blood-900/30 text-blood-700 dark:text-blood-400 font-bold"><Droplets className="w-3.5 h-3.5" />{group}</span></td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">{info.percentage}</td>
                  <td className="p-4"><div className="flex flex-wrap gap-1">{COMPATIBLE_RECIPIENTS[group].map(g => <span key={g} className="badge bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">{g}</span>)}</div></td>
                  <td className="p-4"><div className="flex flex-wrap gap-1">{COMPATIBLE_DONORS[group].map(g => <span key={g} className="badge bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{g}</span>)}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2"><ArrowRight className="w-5 h-5 text-emerald-500" /> Universal Donor</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed"><strong>O-</strong> is the universal donor blood type. Red blood cells from O- donors can be given to patients of any blood type. This makes O- blood especially valuable in emergencies when the patient's blood type is unknown.</p>
        </div>
        <div className="card p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2"><ArrowRight className="w-5 h-5 text-blue-500" /> Universal Recipient</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed"><strong>AB+</strong> is the universal recipient blood type. Patients with AB+ can receive red blood cells from donors of any blood type. This is because AB+ red blood cells have both A and B antigens, making all other antigens familiar.</p>
        </div>
      </div>

      <div className="card p-6 mt-6">
        <h3 className="font-bold mb-3">The Rh Factor (+/-)</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">The Rh factor is another antigen on red blood cells. If you have it, you're Rh positive (+); if not, Rh negative (-). Rh-negative patients can only receive Rh-negative blood, while Rh-positive patients can receive both. This is why O- (O negative) is the universal donor — it has no A, B, or Rh antigens to cause a reaction.</p>
      </div>
    </div>
  );
}
