const NumbersSection = () => {
  const stats = [
    {
      number: "1500+",
      label: "Happy Clients"
    },
    {
      number: "15+",
      label: "Expert Therapists"
    },
    {
      number: "5+",
      label: "Languages"
    },
    {
      number: "10+",
      label: "Countries Served"
    }
  ];

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
          A Safe Space for Our Psymates
        </h2>

        {/* Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-6)',
          }}
        >
          {stats.map((stat, index) => (
            <div
              key={index}
              style={{
                background: 'linear-gradient(135deg, #ffd7ec 0%, #fad5e9 50%, #ffeef6 100%)',
                borderRadius: '12px',
                padding: 'var(--space-5) var(--space-3)',
                textAlign: 'center',
                transition: 'box-shadow 0.3s ease, transform 0.25s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(202, 0, 86, 0.18)';
                e.currentTarget.style.transform = 'translateY(-6px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'none';
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
                {stat.number}
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
            </div>
          ))}
        </div>

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