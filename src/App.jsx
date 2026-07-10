import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import Layout from '@/components/Layout';
import CoachLayout from '@/components/CoachLayout';
import Dashboard from '@/pages/Dashboard';
import Setup from '@/pages/Setup';
import DailyFocus from '@/pages/DailyFocus';
import Goals from '@/pages/Goals';
import LogRound from '@/pages/LogRound';
import MentalGym from '@/pages/MentalGym';
import Journal from '@/pages/Journal';
import Coaching from '@/pages/Coaching';
import Booking from '@/pages/Booking';
import InviteCoachParent from '@/pages/InviteCoachParent';
import Roster from '@/pages/parent-coach/Roster';
import PlayerDashboard from '@/pages/parent-coach/PlayerDashboard';
import GymEditor from '@/pages/admin/GymEditor';
import Pricing from '@/pages/Pricing';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Support from '@/pages/Support';
import AccountSettings from '@/pages/AccountSettings';

const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const location = useLocation();
  const isAuthRoute = AUTH_ROUTES.some(route => location.pathname.startsWith(route));

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors — but allow access to auth pages (login, register, etc.)
  if (authError && !isAuthRoute) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/setup" element={<Setup />} />
      <Route path="/pricing" element={<Pricing />} />
      {/* Support & Settings — accessible to all authenticated users */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route path="/support" element={<Support />} />
        <Route path="/settings" element={<AccountSettings />} />
      </Route>
      {/* Player routes */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/focus" element={<DailyFocus />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/log-round" element={<LogRound />} />
          <Route path="/mental-gym" element={<MentalGym />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/coaching" element={<Coaching />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/invite" element={<InviteCoachParent />} />
        </Route>
      </Route>
      {/* Coach / Parent routes */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<CoachLayout />}>
          <Route path="/roster" element={<Roster />} />
          <Route path="/player/:playerId" element={<PlayerDashboard />} />
        </Route>
      </Route>
      {/* Admin-only routes */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<Layout />}>
          <Route path="/gym-editor" element={<GymEditor />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App