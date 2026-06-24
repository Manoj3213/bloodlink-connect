import { createContext, useContext, useState, type ReactNode } from 'react';

export type Language = 'en' | 'hi' | 'te';

interface Translations {
  welcomeBack: string;
  signInSubtitle: string;
  emailAddress: string;
  emailPlaceholder: string;
  password: string;
  passwordPlaceholder: string;
  signIn: string;
  signingIn: string;
  noAccount: string;
  joinBloodLink: string;
  selectLanguage: string;
}

const translations: Record<Language, Translations> = {
  en: {
    welcomeBack: 'Welcome Back',
    signInSubtitle: 'Sign in to your BloodLink account',
    emailAddress: 'Email Address',
    emailPlaceholder: 'you@example.com',
    password: 'Password',
    passwordPlaceholder: 'Enter your password',
    signIn: 'Sign In',
    signingIn: 'Signing In...',
    noAccount: "Don't have an account?",
    joinBloodLink: 'Join BloodLink',
    selectLanguage: 'Select Language',
  },
  hi: {
    welcomeBack: 'वापस स्वागत है',
    signInSubtitle: 'अपने BloodLink खाते में साइन इन करें',
    emailAddress: 'ईमेल पता',
    emailPlaceholder: 'आप@उदाहरण.com',
    password: 'पासवर्ड',
    passwordPlaceholder: 'अपना पासवर्ड दर्ज करें',
    signIn: 'साइन इन करें',
    signingIn: 'साइन इन हो रहा है...',
    noAccount: 'खाता नहीं है?',
    joinBloodLink: 'BloodLink से जुड़ें',
    selectLanguage: 'भाषा चुनें',
  },
  te: {
    welcomeBack: 'తిరిగి స్వాగతం',
    signInSubtitle: 'మీ BloodLink ఖాతాలోకి సైన్ ఇన్ చేయండి',
    emailAddress: 'ఇమెయిల్ చిరునామా',
    emailPlaceholder: 'మీరు@ఉదాహరణ.com',
    password: 'పాస్‌వర్డ్',
    passwordPlaceholder: 'మీ పాస్‌వర్డ్ నమోదు చేయండి',
    signIn: 'సైన్ ఇన్ చేయండి',
    signingIn: 'సైన్ ఇన్ అవుతోంది...',
    noAccount: 'ఖాతా లేదా?',
    joinBloodLink: 'BloodLinkలో చేరండి',
    selectLanguage: 'భాష ఎంచుకోండి',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}

export const LANGUAGES: { code: Language; label: string; nativeLabel: string; flag: string }[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', flag: '🇮🇳' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు', flag: '🇮🇳' },
];
