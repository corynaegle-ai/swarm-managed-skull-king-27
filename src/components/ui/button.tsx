import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  className = '',
  ...props
}) => {
  const baseClasses =
    'px-4 py-2 rounded-md font-medium transition-colors duration-200';
  const variantClasses =
    variant === 'outline'
      ? 'border border-gray-300 text-gray-700 hover:bg-gray-50'
      : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400';

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${className}`}
      {...props}
    />
  );
};
