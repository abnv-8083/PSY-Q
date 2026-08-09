import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, url, type, schema }) => {
  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{title ? `${title} | PSY-Q` : 'PSY-Q | No Mind Left Behind'}</title>
      {description && <meta name="description" content={description} />}

      {/* Open Graph Tags */}
      <meta property="og:title" content={title ? `${title} | PSY-Q` : 'PSY-Q | No Mind Left Behind'} />
      {description && <meta property="og:description" content={description} />}
      {url && <meta property="og:url" content={url} />}
      <meta property="og:type" content={type || 'website'} />
      <meta property="og:site_name" content="PSY-Q" />

      {/* Twitter Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title ? `${title} | PSY-Q` : 'PSY-Q | No Mind Left Behind'} />
      {description && <meta name="twitter:description" content={description} />}

      {/* Schema.org JSON-LD */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
