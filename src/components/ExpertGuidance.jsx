const ExpertGuidance = () => {
  const handleWhatsAppClick = () => {
    // Replace with your WhatsApp number
    window.open('https://wa.me/+919207010098', '_blank');
  };

  return (
    <section
      style={{
        backgroundColor: '#f3e8eeff',
        padding: 'var(--space-8) var(--space-3)',
        marginTop: 'var(--space-8)',
        marginBottom: 'var(--space-8)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-5)',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: '300px' }}>
          <p
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: 'var(--space-2)',
            }}
          >
            EXPERT GUIDANCE
          </p>
          <h2
            style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#1e3a5f',
              lineHeight: '1.3',
              marginBottom: 'var(--space-2)',
            }}
          >
            Feeling stuck? Let’s help you find the right psychologist! Find your therapist on WhatsApp
          </h2>
          <p
            style={{
              fontSize: '14px',
              color: '#4b5563',
              lineHeight: '1.5',
            }}
          >
            Our team is ready to assist you in connecting with a qualified psychologist who can support your mental well-being.
          </p>
        </div>

        <div style={{ flexShrink: 0 }}>
          <button
            onClick={handleWhatsAppClick}
            style={{
              backgroundColor: '#ca0056',
              color: 'white',
              padding: 'var(--space-2) var(--space-4)',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-1)',
              transition: 'background-color 0.3s ease, transform 0.2s ease',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ca336e';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ca0056';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              style={{ flexShrink: 0 }}
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            Talk With Our Team
          </button>
        </div>
      </div>
    </section>
  );
};

export default ExpertGuidance;
