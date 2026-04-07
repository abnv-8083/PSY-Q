import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Preloader from './components/Preloader';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Therapists from './pages/Therapists';
import TherapistProfile from './pages/TherapistProfile';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Soon from './pages/Soon';
import Individual from './pages/Individual';
import SexualWellness from './pages/SexualWellness';
import CoupleCounseling from './pages/CoupleCounseling';
import Psychospiritual from './pages/Psychospiritual';
import ChildRehabilitation from './pages/ChildRehabilitation';
import SportsMentalHealth from './pages/SportsMentalHealth';
import Academic from './pages/academic';
import Policies from './pages/Policies';

// Mock Test Pages
import MockTestHome from './pages/mocktest/MockTestHome';
import MockTestBundles from './pages/mocktest/MockTestBundles';
import MockTestDashboard from './pages/mocktest/MockTestDashboard';
import MockTestInterface from './pages/mocktest/MockTestInterface';
import MockTestRules from './pages/mocktest/MockTestRules';
import ResultAnalytics from './pages/mocktest/ResultAnalytics';
import GuestCheckout from './pages/mocktest/GuestCheckout';

// Student Sections
import StudentProfile from './pages/student/StudentProfile';
import StudentPayment from './pages/student/StudentPayment';
import StudentSignIn from './pages/StudentSignIn';
import StudentSignUp from './pages/StudentSignUp';
import StudentForgotPassword from './pages/student/StudentForgotPassword';

// Admin Sections
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminResetPassword from './pages/admin/AdminResetPassword';

// Components & Contexts
import ProtectedRoute from './components/ProtectedRoute';
import { SessionProvider } from './contexts/SessionContext';
import NotFound from './pages/NotFound';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/about" element={<Layout><About /></Layout>} />
        <Route path="/contact" element={<Layout><Contact /></Layout>} />
        <Route path="/therapists" element={<Layout><Therapists /></Layout>} />
        <Route path="/therapists/:id" element={<Layout><TherapistProfile /></Layout>} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/soon" element={<Layout><Soon /></Layout>} />
        <Route path="/individual" element={<Layout><Individual /></Layout>} />
        <Route path="/sexual-wellness" element={<Layout><SexualWellness /></Layout>} />
        <Route path="/couple-counseling" element={<Layout><CoupleCounseling /></Layout>} />
        <Route path="/psychospiritual" element={<Layout><Psychospiritual /></Layout>} />
        <Route path="/child-rehabilitation" element={<Layout><ChildRehabilitation /></Layout>} />
        <Route path="/sports-mental-health" element={<Layout><SportsMentalHealth /></Layout>} />
        <Route path="/academic-support" element={<Layout><Academic /></Layout>} />
        <Route path="/policies" element={<Layout><Policies /></Layout>} />

        {/* Mock Test Section */}
        <Route path="/academic/mocktest" element={<MockTestHome />} />
        <Route path="/academic/mocktest/bundles" element={<MockTestBundles />} />
        <Route path="/academic/mocktest/dashboard" element={
          <ProtectedRoute>
            <MockTestDashboard />
          </ProtectedRoute>
        } />
        <Route path="/academic/mocktest/tests" element={
          <ProtectedRoute>
            <MockTestInterface />
          </ProtectedRoute>
        } />
        <Route path="/academic/mocktest/rules/:id" element={
          <ProtectedRoute>
            <MockTestRules />
          </ProtectedRoute>
        } />
        <Route path="/academic/mocktest/checkout" element={
          <ProtectedRoute>
            <GuestCheckout />
          </ProtectedRoute>
        } />
        <Route path="/academic/mocktest/analytics/:id" element={
          <ProtectedRoute>
            <ResultAnalytics />
          </ProtectedRoute>
        } />

        {/* Student Section */}
        <Route path="/student/signin" element={<StudentSignIn />} />
        <Route path="/student/signup" element={<StudentSignUp />} />
        <Route path="/student/forgot-password" element={<StudentForgotPassword />} />
        <Route path="/student/profile" element={<Layout><StudentProfile /></Layout>} />
        <Route path="/student/payment" element={<Layout><StudentPayment /></Layout>} />

        {/* Admin Section */}
        <Route path="/admin/*" element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/reset-password" element={<AdminResetPassword />} />
        <Route path="/academic/mocktest/admin/*" element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Layout><NotFound /></Layout>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Artificial delay of 1.8 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isLoading && <Preloader />}
      </AnimatePresence>
      <SessionProvider>
        <Router>
          <AnimatedRoutes />
        </Router>
      </SessionProvider>
    </>
  );
}

export default App;
