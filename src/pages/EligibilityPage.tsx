import { useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Heart } from 'lucide-react';

interface CheckItem { label: string; required: boolean }

const checks: CheckItem[] = [
  { label: 'Are you between 18 and 65 years of age?', required: true },
  { label: 'Do you weigh at least 50 kg (110 lbs)?', required: true },
  { label: 'Is your hemoglobin level adequate (12.5 g/dL+ for women, 13 g/dL+ for men)?', required: true },
  { label: 'Have you not donated blood in the last 56 days (8 weeks)?', required: true },
  { label: 'Are you free from any infectious diseases (HIV, Hepatitis B/C, Syphilis, Malaria)?', required: true },
  { label: 'Are you not currently taking antibiotics or blood thinners?', required: true },
  { label: 'Have you not had a tattoo or piercing in the last 6 months?', required: false },
  { label: 'Have you not had a major surgery in the last 6 months?', required: false },
  { label: 'Are you not pregnant or nursing?', required: true },
  { label: 'Have you not consumed alcohol in the last 24 hours?', required: false },
];

export default function EligibilityPage() {
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [showResult, setShowResult] = useState(false);

  const handleCheck = (index: number, value: boolean) => {
    setAnswers(prev => ({ ...prev, [index]: value }));
    setShowResult(false);
  };

  const allAnswered = Object.keys(answers).length === checks.length;
  const eligible = checks.every((c, i) => !c.required || answers[i] === true);
  const hasFailedRequired = checks.some((c, i) => c.required && answers[i] === false);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <Heart className="w-12 h-12 text-blood-600 dark:text-blood-400 mx-auto mb-4" />
        <h1 className="text-2xl md:text-3xl font-extrabold">Donation Eligibility Checker</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-lg mx-auto">Answer the questions below to check if you're eligible to donate blood. This is a general guide.</p>
      </div>
      <div className="space-y-3">
        {checks.map((check, i) => (
          <div key={i} className={`card p-4 flex items-center gap-4 transition-all duration-200 ${answers[i] === true ? 'border-emerald-200 dark:border-emerald-800' : answers[i] === false && check.required ? 'border-red-200 dark:border-red-800' : ''}`}>
            <div className="flex-1">
              <p className="text-sm font-medium">{check.required && <span className="text-blood-500">*</span>} {check.label}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => handleCheck(i, true)} className={`p-2 rounded-lg transition-colors ${answers[i] === true ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`}><CheckCircle2 className="w-5 h-5" /></button>
              <button onClick={() => handleCheck(i, false)} className={`p-2 rounded-lg transition-colors ${answers[i] === false ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 hover:bg-red-50 dark:hover:bg-red-900/20'}`}><XCircle className="w-5 h-5" /></button>
            </div>
          </div>
        ))}
      </div>
      {allAnswered && <div className="mt-6"><button onClick={() => setShowResult(true)} className="btn-primary w-full">Check Eligibility</button></div>}
      {showResult && (
        <div className={`mt-6 card p-6 border-2 ${eligible ? 'border-emerald-200 dark:border-emerald-800' : hasFailedRequired ? 'border-red-200 dark:border-red-800' : 'border-amber-200 dark:border-amber-800'}`}>
          {eligible ? (
            <div className="text-center"><CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" /><h2 className="text-xl font-bold text-emerald-700 dark:text-emerald-400">You May Be Eligible!</h2><p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Based on your answers, you appear to be eligible to donate blood. Please visit a blood donation center for a final assessment.</p></div>
          ) : hasFailedRequired ? (
            <div className="text-center"><XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" /><h2 className="text-xl font-bold text-red-700 dark:text-red-400">Not Eligible at This Time</h2><p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Based on your answers, you may not be eligible to donate blood at this time. Please consult a healthcare provider.</p></div>
          ) : (
            <div className="text-center"><AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" /><h2 className="text-xl font-bold text-amber-700 dark:text-amber-400">Possibly Eligible</h2><p className="text-sm text-gray-500 dark:text-gray-400 mt-2">You meet the core requirements but have some conditions that may affect eligibility. Check with a donation center.</p></div>
          )}
        </div>
      )}
    </div>
  );
}
