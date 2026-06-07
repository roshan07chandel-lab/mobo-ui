import React from 'react';

const Input = ({
  label,
  type = 'text',
  error,
  className = '',
  icon: Icon,
  options = [], // for type="select"
  ...props
}) => {
  const inputClass = `glass-input w-full ${Icon ? '!pl-10' : ''} ${
    error ? 'border-status-rose focus:border-status-rose focus:ring-status-rose/50' : ''
  } ${className}`;

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-1.5 font-heading">
          {label}
        </label>
      )}
      <div className="relative">
        {type === 'textarea' ? (
          <textarea className={inputClass} rows={4} {...props} />
        ) : type === 'select' ? (
          <select className={`${inputClass} appearance-none`} {...props}>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input type={type} className={inputClass} {...props} />
        )}

        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted z-10">
            <Icon size={18} />
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-status-rose font-medium">{error}</p>}
    </div>
  );
};

export default Input;
