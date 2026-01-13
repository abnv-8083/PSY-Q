import React from 'react';

// Utility to optimize image loading across the app

export const getOptimizedImageUrl = (imagePath, size = 'medium') => {
  // This can be extended to use image CDN services like Cloudinary
  // For now, it returns the original path
  // You can implement image resizing/compression logic here later
  return imagePath;
};

export const preloadImage = (src) => {
  const img = new Image();
  img.src = src;
};

export const imageLoadingProps = {
  loading: 'lazy',
  decoding: 'async',
};

// Blur hash placeholders for critical images
export const blurPlaceholders = {
  '/images/hero-2.jpg': 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAADAAYDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8VAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=',
  '/images/welcome.png': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
};

export const OptimizedImage = ({ src, alt, className, ...props }) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const placeholder = blurPlaceholders[src];

  return (
    <div className={`relative ${className}`}>
      {isLoading && placeholder && (
        <img
          src={placeholder}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover blur-md ${className}`}
          aria-hidden="true"
        />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`w-full h-full object-cover ${!isLoading ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        onLoad={() => setIsLoading(false)}
        {...props}
      />
    </div>
  );
};
