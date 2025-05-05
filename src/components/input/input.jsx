import React from "react";

const Input = ({
  type,
  name,
  value,
  onChange,
  placeholder,
  className,
  style,
  id,
  required,
  ariaLabel,
  ariaRequired,
  ariaInvalid,
  ariaDescribedby,
  ...props
}) => {
  const defaultStyle = {
    backgroundColor: "var(--primary-beige, #CDCEBE)",
    ...style,
  };

  const inputId = id || name;

  return (
    <input
      type={type || "text"}
      name={name}
      id={inputId}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      style={defaultStyle}
      required={required}
      aria-label={ariaLabel || placeholder}
      aria-required={ariaRequired || required || false}
      aria-invalid={ariaInvalid || false}
      aria-describedby={ariaDescribedby}
      {...props}
    />
  );
};

export default Input;
