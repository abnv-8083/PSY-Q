const NumbersSection = () => {
  const stats = [
    {
      number: "3000+",
      label: "Happy Clients"
    },
    {
      number: "15+",
      label: "Expert Therapists"
    },
    {
      number: "4+",
      label: "Languages"
    }
  ];

  return (
    <section
      style={{
        background: 'linear-gradient(135deg, #f7f8fb 20%, #e6f7ff 100%)',
        paddingTop: '80px',
        paddingBottom: '80px',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          paddingLeft: '20px',
          paddingRight: '20px',
        }}
      >
        {/* Section Heading */}
        <h2
          style={{
            textAlign: 'center',
            fontSize: '32px',
            fontWeight: '500',
            color: '#464545ff',
            marginBottom: '60px',
            fontStyle: 'italic',
          }}
        >
          A Safe Space for Our Psymates
        </h2>

        {/* Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            marginBottom: '48px',
          }}
        >
          {stats.map((stat, index) => (
            <div
              key={index}
              style={{
                background: 'linear-gradient(135deg, #ffd7ec 0%, #fad5e9 50%, #ffeef6 100%)',
                borderRadius: '12px',
                padding: '40px 24px',
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
                  fontSize: '48px',
                  fontWeight: '700',
                  color: '#ca0056',
                  marginBottom: '8px',
                }}
              >
                {stat.number}
              </div>
              <p
                style={{
                  fontSize: '16px',
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