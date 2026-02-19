import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Therapists from './pages/Therapists';
import TherapistProfile from './pages/TherapistProfile';
import SignIn from './pages/SignIn';
import StudentSignIn from './pages/StudentSignIn';
import StudentSignUp from './pages/StudentSignUp';
import Soon from './pages/Soon';
import Individual from './pages/Individual';
import SexualWellness from './pages/SexualWellness';
import CoupleCounseling from './pages/CoupleCounseling';
import Psychospiritual from './pages/Psychospiritual';
import ChildRehabilitation from './pages/ChildRehabilitation';
import SportsMentalHealth from './pages/SportsMentalHealth';
import Academic from './pages/academic';
import MockTestDashboard from './pages/mocktest/MockTestDashboard';
import MockTestHome from './pages/mocktest/MockTestHome';
import MockTestFeatures from './pages/mocktest/MockTestFeatures';
import MockTestContact from './pages/mocktest/MockTestContact';
import GeneralInstructions from './pages/mocktest/GeneralInstructions';
import MockTestInterface from './pages/mocktest/MockTestInterface';
import ResultAnalytics from './pages/mocktest/ResultAnalytics';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminResetPassword from './pages/admin/AdminResetPassword';
import GuestCheckout from './pages/mocktest/GuestCheckout';
import MockTestBundles from './pages/mocktest/MockTestBundles';
import StudentProfile from './pages/student/StudentProfile';
import StudentPayment from './pages/student/StudentPayment';
import StudentForgotPassword from './pages/student/StudentForgotPassword';
import Policies from './pages/Policies';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import { SessionProvider } from './contexts/SessionContext';
import SessionWarning from './components/SessionWarning';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <SessionProvider>
      <Router>
        <ScrollToTop />
        <SessionWarning />
        <Routes>
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/about" element={<Layout><About /></Layout>} />
          <Route path="/contact" element={<Layout><Contact /></Layout>} />
          <Route path="/therapists" element={<Layout><Therapists /></Layout>} />
          <Route path="/therapists/:id" element={<Layout><TherapistProfile /></Layout>} />
          {/* Admin / internal auth */}
          <Route path="/signin" element={<SignIn />} />

          {/* Student auth */}
          <Route path="/student/signin" element={<StudentSignIn />} />
          <Route path="/student/signup" element={<StudentSignUp />} />
          <Route path="/student/forgot-password" element={<StudentForgotPassword />} />
          <Route path="/soon" element={<Layout><Soon /></Layout>} />
          <Route path="/individual" element={<Layout><Individual /></Layout>} />
          <Route path="/sexual-wellness" element={<Layout><SexualWellness /></Layout>} />
          <Route path="/couple-counseling" element={<Layout><CoupleCounseling /></Layout>} />
          <Route path="/psychospiritual" element={<Layout><Psychospiritual /></Layout>} />
          <Route path="/child-rehabilitation" element={<Layout><ChildRehabilitation /></Layout>} />
          <Route path="/sports-mental-health" element={<Layout><SportsMentalHealth /></Layout>} />
          <Route path="/academic-support" element={<Layout><Academic /></Layout>} />
          <Route path="/academic/mocktest" element={<MockTestHome />} />
          <Route path="/academic/mocktest/tests" element={<MockTestDashboard />} />
          <Route path="/academic/mocktest/features" element={<MockTestFeatures />} />
          <Route path="/academic/mocktest/contact" element={<MockTestContact />} />
          <Route path="/academic/mocktest/:subjectId/:testId/rules" element={<GeneralInstructions />} />
          <Route path="/academic/mocktest/:subjectId/:testId/exam" element={<MockTestInterface />} />
          <Route path="/academic/mocktest/:subjectId/:testId/results" element={<ResultAnalytics />} />
          <Route path="/academic/mocktest/bundles" element={<MockTestBundles />} />
          <Route path="/academic/mocktest/checkout" element={<GuestCheckout />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/student/payment" element={<StudentPayment />} />
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
          <Route path="/policies" element={<Layout><Policies /></Layout>} />
          <Route path="/profile" element={<Layout><Soon /></Layout>} />
          <Route path="/payment" element={<Layout><Soon /></Layout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </SessionProvider>
  );
}

export default App;
