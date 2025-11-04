import React from 'react';

const variants = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400 focus:ring-indigo-500',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 disabled:bg-rose-400 focus:ring-rose-500',
  secondary: 'bg-slate-200 text-slate-800 hover:bg-slate-300 disabled:opacity-50 focus:ring-indigo-500',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-400 focus:ring-emerald-500',
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  children: React.ReactNode;
};

const FormButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className = '', variant = 'primary', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

FormButton.displayName = 'FormButton';
export default FormButton;