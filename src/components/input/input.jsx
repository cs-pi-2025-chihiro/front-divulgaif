import React from 'react';

const Input = ({ type, name, value, onChange, placeholder, className, style }) => {
  const defaultStyle = {
    backgroundColor: 'var(--bone, #CDCEBE)',
    ...style
  };

  return (
    <input
      type={type || 'text'}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      style={defaultStyle}
    />
  );
};

export default Input;