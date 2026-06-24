import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DonorOnboardingPage from './pages/DonorOnboardingPage';
import SearchPage from './pages/SearchPage';
import BloodRequestsPage from './pages/BloodRequestsPage';
import NewRequestPage from './pages/NewRequestPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import EligibilityPage from './pages/EligibilityPage';
import BloodGroupsPage from './pages/BloodGroupsPage';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/donor/onboarding" element={<DonorOnboardingPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/requests" element={<BloodRequestsPage />} />
              <Route path="/request/new" element={<NewRequestPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/eligibility" element={<EligibilityPage />} />
              <Route path="/blood-groups" element={<BloodGroupsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
