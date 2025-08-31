import React from 'react';
import { Loader2 } from 'lucide-react';

const Spinner = ({ size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
    };

    return (
        <Loader2 className={`animate-spin text-blue-600 dark:text-blue-400 ${sizeClasses[size]}`} />
    );
};

const FullPageSpinner = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-900/50 z-50">
        <Spinner size="lg" />
    </div>
);

export { Spinner, FullPageSpinner };
