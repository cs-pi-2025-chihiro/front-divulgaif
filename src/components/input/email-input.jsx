import React from 'react';
import Input from './input';

const EmailInput = ({ name, value, onChange, placeholder, className }) => {
  return (
    <Input
      type="email"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder || 'Email'}
      className={className}
    />
  );
};

export default EmailInput;