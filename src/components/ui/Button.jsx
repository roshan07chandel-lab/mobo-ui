import React from 'react';

const Button = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-medium active:scale-95 transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-primary hover:bg-primary/95 text-white shadow-glow-primary hover:shadow-primary/50',
    secondary: 'bg-secondary hover:bg-secondary/95 text-white shadow-glow-secondary hover:shadow-secondary/50',
    glass: 'bg-white/5 hover:bg-white/10 text-foreground border border-border',
    danger: 'bg-status-rose hover:bg-status-rose/95 text-white shadow-glow-rose hover:shadow-status-rose/50',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-4 py-2.5 text-base rounded-xl',
    lg: 'px-6 py-3.5 text-lg rounded-2xl',
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            fillRule="evenodd"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : null}
      {children}
    </button>
  );
};

export default Button;
