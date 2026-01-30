import { Link } from 'react-router-dom';
import FeatureCard from './FeatureCard';

const FeatureCards = () => {
  const features = [
    {
      title: "Mock Test",
      description: "Practice with premium UGC NET Psychology mock tests and get instant results.",
      link: "/academic/mocktest",
      image: "/images/mocktest_card.png"
    },
    {
      title: "Counselling",
      description: "Professional Counselling service to support your mental and emotional health",
      link: "/therapists",
      image: "/images/counselling.webp"
    },
    {
      title: "Webinars",
      description: "Interactive webinars on career guidance and psychological wellness.",
      link: "/soon",
      image: "/images/webinar.webp"
    },
    {
      title: "Academic",
      description: "Comprehensive academic support and competitive exam preparation.",
      link: "/academic-support",
      image: "/images/academic.webp"
    }
  ];

  return (
    <section
      className="bg-gradient-to-br from-[#ece9e6] via-[#f5f5f5] to-[#ffffff]"
      style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}
    >
      <div className="container">
        <div className="text-center space-y-6 lg:space-y-8 mb-12 lg:mb-16">
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed italic">
            Discover the essential aspects of Psy-Q that help you succeed.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Link key={index} to={feature.link} className="block" style={{ textDecoration: 'none', color: 'inherit' }}>
              <FeatureCard
                title={feature.title}
                description={feature.description}
                image={feature.image}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;