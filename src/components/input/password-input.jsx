import React from 'react';
import Input from './input';

const PasswordInput = ({ name, value, onChange, placeholder, className, id, ariaInvalid, ariaDescribedby, ...props }) => {
  return (
    <Input
      type="password"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder || 'Password'}
      className={className}
      id={id}
      aria-invalid={ariaInvalid}
      aria-describedby={ariaDescribedby}
      {...props}
    />
  );
};

export default PasswordInput;