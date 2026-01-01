import React from 'react';
import { Filter, AlertTriangle, Search } from 'lucide-react';
import { AlarmStatusFilter, AlarmLevelFilter } from '../types';

interface FilterBarProps {
  status: AlarmStatusFilter;
  level: AlarmLevelFilter;
  searchTerm: string;
  onStatusChange: (s: AlarmStatusFilter) => void;
  onLevelChange: (l: AlarmLevelFilter) => void;
  onSearchChange: (t: string) => void;
}

export const AlarmFilterBar: React.FC<FilterBarProps> = ({
  status,
  level,
  searchTerm,
  onStatusChange,
  onLevelChange,
  onSearchChange
}) => {
  return (
    <div className="flex justify-between items-center mb-6 gap-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200 shadow-sm">
          <Filter size={16} className="text-gray-400 ml-2" />
          <select 
            className="bg-transparent text-sm font-semibold text-gray-700 outline-none border-none pr-4"
            value={status}
            onChange={(e) => onStatusChange(e.target.value as AlarmStatusFilter)}
          >
            <option value="all">所有状态</option>
            <option value="pending">待处理</option>
            <option value="resolved">已处置</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200 shadow-sm">
          <AlertTriangle size={16} className="text-gray-400 ml-2" />
          <select 
            className="bg-transparent text-sm font-semibold text-gray-700 outline-none border-none pr-4"
            value={level}
            onChange={(e) => onLevelChange(e.target.value as AlarmLevelFilter)}
          >
            <option value="all">所有级别</option>
            <option value="high">高危</option>
            <option value="medium">警告</option>
            <option value="low">提示</option>
          </select>
        </div>
      </div>

      <div className="relative flex-1 max-w-md group">
        <input 
          type="text" 
          placeholder="搜索报警人、设备或位置..." 
          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
      </div>
    </div>
  );
};
