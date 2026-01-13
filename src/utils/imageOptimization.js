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
