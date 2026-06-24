import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';
import { Droplets, LogIn, Eye, EyeOff, AlertCircle, Globe, Check } from 'lucide-react';

export default function LoginPage() {
  const { signIn } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await signIn(email, password);
    if (err) {
      setError(err);
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  const currentLang = LANGUAGES.find(l => l.code === language)!;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md">
        {/* Language Selector */}
        <div className="flex justify-end mb-4 relative">
          <button
            type="button"
            onClick={() => setLangOpen(v => !v)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:border-blood-400 hover:text-blood-600 dark:hover:text-blood-400 transition-all shadow-sm"
          >
            <Globe className="w-4 h-4 text-blood-500" />
            <span>{currentLang.flag}</span>
            <span>{currentLang.nativeLabel}</span>
            <svg className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {langOpen && (
            <div className="absolute top-full mt-1 right-0 z-50 w-48 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg overflow-hidden">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => { setLanguage(lang.code); setLangOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                    language === lang.code
                      ? 'text-blood-600 dark:text-blood-400 bg-blood-50 dark:bg-blood-900/20 font-medium'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="text-base">{lang.flag}</span>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{lang.nativeLabel}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">{lang.label}</div>
                  </div>
                  {language === lang.code && <Check className="w-3.5 h-3.5 text-blood-500" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl gradient-blood flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blood-600/25">
              <Droplets className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold">{t.welcomeBack}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.signInSubtitle}</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t.emailAddress}</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-field"
                placeholder={t.emailPlaceholder}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t.password}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field !pr-10"
                  placeholder={t.passwordPlaceholder}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              <LogIn className="w-4 h-4" />
              {loading ? t.signingIn : t.signIn}
            </button>
          </form>

          <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-6">
            {t.noAccount}{' '}
            <Link to="/register" className="text-blood-600 dark:text-blood-400 font-medium hover:underline">
              {t.joinBloodLink}
            </Link>
          </p>
        </div>

        {/* Language pill strip */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLanguage(lang.code)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                language === lang.code
                  ? 'bg-blood-600 text-white shadow shadow-blood-600/30'
                  : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-blood-400 hover:text-blood-600'
              }`}
            >
              {lang.nativeLabel}
            </button>
          ))}
        </div>
      </div>

      {/* Close dropdown on outside click */}
      {langOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
      )}
    </div>
  );
}
