import Hero from '../components/Hero'
import FeatureCards from '../components/FeatureCards'
import NumbersSection from '../components/NumbersSection'
import ExpertGuidance from '../components/ExpertGuidance'
import FAQSection from '../components/FAQSection'
import Therapists from './Therapists'
import SEO from '../components/SEO'

const Home = () => {
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "PSY-Q",
    "url": "https://www.psyqlearning.com",
    "logo": "https://www.psyqlearning.com/logo.png",
    "description": "PSY-Q is a dual-vertical platform offering UGC NET Psychology Exam Preparation and Clinical Therapy Services. No Mind Left Behind."
  };

  return (
    <main>
      <SEO 
        title="Home"
        description="PSY-Q: Your partner in UGC NET Psychology Exam Prep & Online Therapy. No Mind Left Behind."
        url="https://www.psyqlearning.com"
        schema={orgSchema}
      />
      <Hero />
      <FeatureCards />
      <NumbersSection />
      <Therapists />
      <ExpertGuidance />
      <FAQSection />
    </main>
  );
};

export default Home;
