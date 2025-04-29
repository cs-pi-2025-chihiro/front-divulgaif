import React from 'react';
import Input from './input';

const PasswordInput = ({ name, value, onChange, placeholder, className }) => {
  return (
    <Input
      type="password"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder || 'Password'}
      className={className}
    />
  );
};

export default PasswordInput;