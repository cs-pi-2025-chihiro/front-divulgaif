import React, { useState } from "react";
import styled from "styled-components";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const InputWrapper = styled.div`
  position: relative;
`;

const StyledInput = styled.input`
  width: 90%;
`;

const ShowPasswordButton = styled.button`
  position: absolute;

  top: 50%;

  right: 20px;

  transform: translateY(-50%);

  background: none;

  border: none;

  cursor: pointer;

  display: flex;

  align-items: center;

  justify-content: center;
`;

const PasswordInput = ({
  placeholder,

  name,

  id,

  value,

  onChange,

  className,

  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <InputWrapper>
      <StyledInput
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        name={name}
        id={id}
        value={value}
        onChange={onChange}
        className={className}
        {...props}
      />

      <ShowPasswordButton type="button" onClick={togglePasswordVisibility}>
        {showPassword ? <FaEyeSlash /> : <FaEye />}
      </ShowPasswordButton>
    </InputWrapper>
  );
};

export default PasswordInput;
