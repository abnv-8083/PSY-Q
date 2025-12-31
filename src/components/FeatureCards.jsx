import { Link } from 'react-router-dom';
import FeatureCard from './FeatureCard';

const FeatureCards = () => {
  const features = [
    {
      title: "Counselling",
      description: "Professional counseling services to support your mental health and academic journey.",
      link: "/therapists",
      image: "/images/counselling.jpg"
    },
    {
      title: "Webinars",
      description: "Interactive webinars on career guidance and psychological wellness.",
      link: "/soon",
      image: "/images/webinar.jpg"
    },
    {
      title: "Academic Support",
      description: "Comprehensive academic support and competitive exam preparation.",
      link: "/soon",
      image: "/images/academic.jpg"
    }
  ];

  return (
    <section className="bg-gradient-to-br from-[#ece9e6] via-[#f5f5f5] to-[#ffffff] py-16 sm:py-16 lg:py-20">
      <div className="container">
        <div className="text-center space-y-6 lg:space-y-8 mb-12 lg:mb-16">
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover the essential aspects of Psy-Q that help students succeed.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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