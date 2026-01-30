import React from 'react';

const Soon = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '5rem',
      fontWeight: 'bold',
      color: '#333',
      textAlign: 'center'
    }}>
      Coming Soon
      <img src="/images/soon.webp" alt="Coming Soon Image" style={{ marginTop: '4rem', maxWidth: '25%', height: 'auto' }} />
    </div>
  );
};

export default Soon;