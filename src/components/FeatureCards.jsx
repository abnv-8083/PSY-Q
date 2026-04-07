import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import FeatureCard from './FeatureCard';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const FeatureCards = () => {
  const features = [
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
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6 lg:space-y-8 mb-12 lg:mb-16"
        >
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed italic">
            Discover the essential aspects of Psy-Q that help you succeed.
          </p>
        </motion.div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div variants={cardVariants} key={index}>
              <Link to={feature.link} className="block" style={{ textDecoration: 'none', color: 'inherit' }}>
                <motion.div whileHover={{ scale: 1.03, y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                  <FeatureCard
                    title={feature.title}
                    description={feature.description}
                    image={feature.image}
                  />
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureCards;