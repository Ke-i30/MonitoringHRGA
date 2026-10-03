import React from 'react';

export const Button = ({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  disabled = false,
  style = {},
  className = ''
}) => {
  const variantClass = {
    primary: 'btn-lavanila btn-lavanila-primary',
    secondary: 'btn-lavanila btn-lavanila-secondary',
    success: 'btn-lavanila btn-lavanila-success',
    danger: 'btn-lavanila btn-lavanila-danger'
  }[variant] || 'btn-lavanila btn-lavanila-primary';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${variantClass} ${className}`}
      style={style}
    >
      {children}
    </button>
  );
};
