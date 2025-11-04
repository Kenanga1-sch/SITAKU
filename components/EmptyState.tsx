import React from 'react';

interface EmptyStateProps {
    message: string;
    icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message, icon }) => {
    return (
        <div className="text-center py-12 px-6 bg-gray-50 rounded-lg">
            {icon && <div className="flex justify-center text-gray-400 mb-4">{icon}</div>}
            <p className="text-gray-500">{message}</p>
        </div>
    );
};

export default EmptyState;