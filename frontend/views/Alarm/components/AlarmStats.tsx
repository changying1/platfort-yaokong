import React from 'react';
import { AlertCircle, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface StatsProps {
  total: number;
  pending: number;
  resolved: number;
  high: number;
}

export const AlarmStats: React.FC<StatsProps> = ({ total, pending, resolved, high }) => {
  const statCards = [
    { label: '今日报警总数', value: total, icon: AlertCircle, color: 'text-gray-800', bg: 'bg-red-100', border: 'border-red-200', iconColor: 'text-red-600' },
    { label: '待处理', value: pending, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-100', border: 'border-orange-200', iconColor: 'text-orange-600' },
    { label: '已处置', value: resolved, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100', border: 'border-green-200', iconColor: 'text-green-600' },
    { label: '严重报警', value: high, icon: AlertTriangle, color: 'text-gray-800', bg: 'bg-blue-100', border: 'border-blue-200', iconColor: 'text-blue-600' },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {statCards.map((card, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className={`w-14 h-14 rounded-2xl ${card.bg} flex items-center justify-center border ${card.border} ${card.iconColor}`}>
            <card.icon size={28} />
          </div>
          <div>
            <div className="text-gray-500 text-xs font-medium mb-1">{card.label}</div>
            <div className={`text-3xl font-black ${card.color} font-mono tracking-tight`}>{card.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
