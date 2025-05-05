import React from "react";
import Input from "./input";

const SearchInput = ({
  name,
  value,
  onChange,
  placeholder = "Pesquisar...",
  className,
  style,
  id,
  required,
  ariaLabel = "Pesquisar",
  ...props
}) => {
  const searchStyle = {
    paddingLeft: "2rem",
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'/%3E%3C/svg%3E\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "0.5rem center",
    backgroundSize: "1rem",
    ...style,
  };

  return (
    <Input
      type="search"
      name={name}
      id={id || name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      style={searchStyle}
      required={required}
      ariaLabel={ariaLabel}
      {...props}
    />
  );
};

export default SearchInput;
