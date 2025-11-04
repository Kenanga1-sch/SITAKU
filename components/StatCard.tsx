import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color?: 'blue' | 'green' | 'purple' | 'yellow' | 'red';
}

const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
};

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color = 'blue' }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-6">
            <div className={`flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-full ${colorClasses[color]}`}>
                {icon}
            </div>
            <div>
                <p className="text-slate-500 text-sm font-medium">{title}</p>
                <p className="text-3xl font-bold text-slate-800">{value}</p>
            </div>
        </div>
    );
};

export default React.memo(StatCard);