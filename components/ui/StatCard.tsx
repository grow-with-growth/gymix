import React from 'react';
import './stat-card.css';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  trend: string;
  trendColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, trendColor }) => {
  return (
    <div className="stat-card-bordered bg-white/5 backdrop-blur-2xl rounded-3xl p-[clamp(8px,2vw,16px)] flex flex-col justify-between min-w-0 shadow-2xl shadow-black/40 transition-all duration-300 hover:bg-white/10">
      <div className="flex justify-between items-start gap-2">
        <span className="text-gray-300 text-[clamp(10px,2vw,14px)] leading-tight">{title}</span>
        <div className="text-purple-400 shrink-0">
            <Icon className="w-[clamp(20px,5vw,32px)] h-[clamp(20px,5vw,32px)]" />
        </div>
      </div>
      <div>
        <p className="font-orbitron font-bold text-white text-[clamp(20px,6vw,36px)] leading-tight">{value}</p>
        <p className={`${trendColor} text-[clamp(10px,2vw,14px)] leading-tight`}>{trend}</p>
      </div>
    </div>
  );
};

export default StatCard;