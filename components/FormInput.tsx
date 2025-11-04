import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

const FormInput = React.forwardRef<HTMLInputElement, InputProps>(
    ({ id, label, error, type = 'text', ...props }, ref) => {
        return (
            <div>
                <label htmlFor={id} className="block text-sm font-medium text-slate-700">
                    {label}
                </label>
                <input
                    id={id}
                    ref={ref}
                    type={type}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 ${
                        error 
                        ? 'border-rose-500 focus:ring-rose-500' 
                        : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                    {...props}
                />
                {error && <p className="text-sm text-rose-600 mt-1">{error}</p>}
            </div>
        );
    }
);

FormInput.displayName = 'FormInput';
export default FormInput;
