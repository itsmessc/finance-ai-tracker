import React from 'react';

const Input = ({ type = 'text', placeholder, value, onChange, className = '', icon: Icon, ...props }) => (
    <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />}
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${className}`}
            {...props}
        />
    </div>
);

const Select = ({ value, onChange, children, className = '', icon: Icon, ...props }) => (
    <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />}
        <select
            value={value}
            onChange={onChange}
            className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${className}`}
            {...props}
        >
            {children}
        </select>
    </div>
);

export { Input, Select };
