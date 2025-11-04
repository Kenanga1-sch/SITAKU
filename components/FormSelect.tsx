import React from 'react';

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  children: React.ReactNode;
};

const FormSelect = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ id, label, error, children, ...props }, ref) => {
        return (
            <div>
                <label htmlFor={id} className="block text-sm font-medium text-slate-700">
                    {label}
                </label>
                <select
                    id={id}
                    ref={ref}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
                        error 
                        ? 'border-rose-500 focus:ring-rose-500' 
                        : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                    {...props}
                >
                    {children}
                </select>
                {error && <p className="text-sm text-rose-600 mt-1">{error}</p>}
            </div>
        );
    }
);

FormSelect.displayName = 'FormSelect';
export default FormSelect;
