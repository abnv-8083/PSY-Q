import React, { useState } from 'react';

/**
 * ResponsiveImage Component
 * Automatically uses WebP with JPG/PNG fallback
 * Includes lazy loading and blur placeholders
 */

const blurPlaceholders = {
  'hero-2': 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAADAAYDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8VAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=',
  'welcome': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
};

const ResponsiveImage = ({ 
  src, 
  alt, 
  className = '', 
  width, 
  height,
  priority = false,
  ...props 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Extract base name for blur placeholder
  const baseName = src.split('/').pop().split('.')[0];
  const placeholder = blurPlaceholders[baseName];

  const handleLoad = () => setIsLoading(false);
  const handleError = () => {
    setError(true);
    setIsLoading(false);
  };

  const loadingAttr = priority ? { fetchPriority: 'high' } : { loading: 'lazy' };

  return (
    <picture>
      {/* WebP format (modern browsers) */}
      <source 
        srcSet={src.replace(/\.(jpg|jpeg|png)$/i, '.webp')} 
        type="image/webp" 
      />
      {/* JPG/PNG fallback */}
      <source srcSet={src} type={`image/${src.split('.').pop().toLowerCase()}`} />
      
      {/* Main image with loading states */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${!isLoading ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        onLoad={handleLoad}
        onError={handleError}
        decoding="async"
        {...loadingAttr}
        {...props}
      />

      {/* Blur placeholder while loading */}
      {isLoading && placeholder && (
        <div
          className={`absolute inset-0 ${className}`}
          style={{
            backgroundImage: `url('${placeholder}')`,
            backgroundSize: 'cover',
            filter: 'blur(8px)',
            zIndex: -1,
          }}
          aria-hidden="true"
        />
      )}
    </picture>
  );
};

export default ResponsiveImage;
