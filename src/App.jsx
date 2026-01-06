import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/about" element={<Layout><About /></Layout>} />
        <Route path="/services" element={<Layout><Services /></Layout>} />
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
      </Routes>
    </Router>
  );
}

export default App;
