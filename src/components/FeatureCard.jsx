const FeatureCard = ({ icon, title, description, image }) => {
  return (
    <div
      style={{
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        border: '1px solid #f0f0f0',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow 0.3s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
      }}
    >
      {/* Image Section */}
      <div
        style={{
          height: '280px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9f9f9',
          overflow: 'hidden',
        }}
      >
        {image && (
          <img
            src={image}
            alt={title}
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
              objectFit: 'cover',
            }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        )}
      </div>

      {/* Content Section */}
      <div
        style={{
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          textAlign: 'center',
          flex: 1,
        }}
      >
        <h3
          style={{
            fontSize: '14px',
            fontWeight: '700',
            color: '#1a1a1a',
            margin: 0,
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: '14px',
            color: '#555555',
            lineHeight: '1.6',
            margin: 0,
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
};

export default FeatureCard;
