import Hero from '../components/Hero'
import FeatureCards from '../components/FeatureCards'
import NumbersSection from '../components/NumbersSection'
import FAQSection from '../components/FAQSection'
import Therapists from './Therapists'


const Home = () => {
  return (
    <main>
      <Hero />
      <FeatureCards />
      <NumbersSection />
      <Therapists />
      <FAQSection />
    </main>
  );
};

export default Home;
