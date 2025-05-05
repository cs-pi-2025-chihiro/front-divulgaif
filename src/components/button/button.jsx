import React, { forwardRef } from 'react';
import './button.css';

const Button = forwardRef(
  (
    {
      type = 'button',
      onClick,
      className = '',
      children,
      disabled,
      variant = 'default',
      size = 'md',
      width,
      fontSize,
      fontWeight,
      typeFormat = 'rounded',
      ariaLabel,
      role,
      tabIndex = 0,
      ...props
    },
    ref
  ) => {
    const baseClass = 'btn';
    const variantClass = `btn-${variant}`;
    const sizeClass = `btn-size-${size}`;
    const widthClass = width ? `btn-width-${width}` : '';
    const fontSizeClass = fontSize ? `btn-font-${fontSize}` : '';
    const fontWeightClass = fontWeight ? `btn-weight-${fontWeight}` : '';
    const typeFormatClass = `btn-${typeFormat}`;
    
    const buttonClass = [
      baseClass,
      variantClass,
      sizeClass,
      widthClass,
      fontSizeClass,
      fontWeightClass,
      typeFormatClass,
      className
    ].filter(Boolean).join(' ');

    const handleKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick && onClick(e);
      }
    };

    return (
      <button
        ref={ref}
        type={type}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        className={buttonClass}
        disabled={disabled}
        aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
        role={role || 'button'}
        tabIndex={disabled ? -1 : tabIndex}
        aria-disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;