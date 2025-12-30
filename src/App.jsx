import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Therapists from './pages/Therapists';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Soon from './pages/Soon';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/about" element={<Layout><About /></Layout>} />
        <Route path="/services" element={<Layout><Services /></Layout>} />
        <Route path="/contact" element={<Layout><Contact /></Layout>} />
        <Route path="/therapists" element={<Layout><Therapists /></Layout>} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/soon" element={<Layout><Soon /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
