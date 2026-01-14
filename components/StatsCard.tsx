
import React from 'react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon, color }) => {
  return (
    <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex items-center space-x-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
        <i className={`fa-solid ${icon} text-xl text-white`}></i>
      </div>
      <div>
        <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-white leading-tight">{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;
