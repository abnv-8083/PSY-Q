import Hero from '../components/Hero'
import FeatureCards from '../components/FeatureCards'
import NumbersSection from '../components/NumbersSection'
import FacultySection from '../components/FacultySection'
import FAQSection from '../components/FAQSection'
import CTABanner from '../components/CTABanner'


const Home = () => {
  return (
    <main>
      <Hero />
      <FeatureCards />
      {/* <NumbersSection /> */}
      <FacultySection />
      <FAQSection />
      <CTABanner />
    </main>
  );
};

export default Home;
