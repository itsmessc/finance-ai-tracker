import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', ...props }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}
        {...props}
    >
        {children}
    </motion.div>
);

const CardHeader = ({ children, className = '' }) => (
    <div className={`p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 ${className}`}>
        {children}
    </div>
);

const CardContent = ({ children, className = '' }) => (
    <div className={`p-4 sm:p-6 ${className}`}>
        {children}
    </div>
);

const CardTitle = ({ children, className = '' }) => (
    <h2 className={`text-lg font-semibold text-gray-900 dark:text-white ${className}`}>
        {children}
    </h2>
);

export { Card, CardHeader, CardContent, CardTitle };
