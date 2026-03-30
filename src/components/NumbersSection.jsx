import { useEffect, useRef } from 'react';
import { motion, useInView, animate } from 'framer-motion';

const CountUp = ({ to, suffix }) => {
  const nodeRef = useRef();
  const inView = useInView(nodeRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (inView) {
      const controls = animate(0, to, {
        duration: 2,
        ease: "easeOut",
        onUpdate(value) {
          if (nodeRef.current) {
            nodeRef.current.textContent = Math.floor(value) + suffix;
          }
        }
      });
      return () => controls.stop();
    }
  }, [inView, to, suffix]);

  return <span ref={nodeRef}>0{suffix}</span>;
};

const NumbersSection = () => {
  const stats = [
    {
      number: 1500,
      suffix: "+",
      label: "Happy Clients"
    },
    {
      number: 15,
      suffix: "+",
      label: "Expert Therapists"
    },
    {
      number: 5,
      suffix: "+",
      label: "Languages"
    },
    {
      number: 10,
      suffix: "+",
      label: "Countries Served"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <section
      style={{
        background: 'linear-gradient(135deg, #f7f8fb 20%, #e6f7ff 100%)',
        paddingTop: 'var(--space-10)',
        paddingBottom: 'var(--space-10)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          paddingLeft: 'var(--space-2)',
          paddingRight: 'var(--space-2)',
        }}
      >
        {/* Section Heading */}
        <h2
          style={{
            textAlign: 'center',
            fontSize: 'clamp(24px, 5vw, 32px)',
            fontWeight: '500',
            color: '#464545ff',
            marginBottom: 'var(--space-7)',
            fontStyle: 'italic',
          }}
        >
          A Safe Space for Our Community
        </h2>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-6)',
          }}
        >
          {stats.map((stat, index) => (
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -6, boxShadow: '0 8px 24px rgba(202, 0, 86, 0.18)' }}
              key={index}
              style={{
                background: 'linear-gradient(135deg, #ffd7ec 0%, #fad5e9 50%, #ffeef6 100%)',
                borderRadius: '12px',
                padding: 'var(--space-5) var(--space-3)',
                textAlign: 'center',
                transition: 'box-shadow 0.3s ease',
              }}
            >
              <div
                style={{
                  fontSize: 'clamp(32px, 8vw, 48px)',
                  fontWeight: '700',
                  color: '#ca0056',
                  marginBottom: 'var(--space-1)',
                }}
              >
                <CountUp to={stat.number} suffix={stat.suffix} />
              </div>
              <p
                style={{
                  fontSize: '14px',
                  color: '#38232fff',
                  fontWeight: '500',
                  margin: 0,
                }}
              >
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Quote */}
        <div
          style={{
            textAlign: 'center',
          }}
        >
        </div>
      </div>
    </section>
  );
};

export default NumbersSection;