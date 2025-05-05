import React from 'react';

const Image = ({ src, alt, size, className, style }) => {
  const sizeStyles = {
    small: { maxWidth: '100px', maxHeight: '100px' },
    medium: { maxWidth: '200px', maxHeight: '200px' },
    large: { maxWidth: '400px', maxHeight: '400px' },
    icon: { width: '24px', height: '24px' },
    logo: { width: '120px', height: 'auto' },
    thumbnail: { width: '80px', height: '80px', objectFit: 'cover' },
  };

  const combinedStyle = {
    ...(size && sizeStyles[size]),
    ...style
  };

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={combinedStyle}
    />
  );
};

export default Image;