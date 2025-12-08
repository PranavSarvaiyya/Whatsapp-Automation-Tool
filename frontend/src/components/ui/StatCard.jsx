import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const StatCard = ({ label, value, icon, trend, trendValue, color = 'orange' }) => {
    const colors = {
        orange: 'bg-orange-50 text-orange-600',
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-emerald-50 text-emerald-600',
        red: 'bg-red-50 text-red-600',
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className={twMerge("p-2 rounded-lg", colors[color])}>
                    {React.cloneElement(icon, { size: 20 })}
                </div>
                {trend && (
                    <div className={clsx("flex items-center text-xs font-medium px-2 py-1 rounded-full", 
                        trend === 'up' ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'
                    )}>
                        {trend === 'up' ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                        {trendValue}
                    </div>
                )}
            </div>
            <div>
                <h3 className="text-slate-500 text-sm font-medium mb-1">{label}</h3>
                <div className="text-2xl font-bold text-slate-900">{value}</div>
            </div>
        </div>
    );
};
