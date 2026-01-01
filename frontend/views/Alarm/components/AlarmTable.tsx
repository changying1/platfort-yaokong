import React from 'react';
import { MapPin, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import { AlarmRecord } from '../types';

interface TableProps {
  alarms: AlarmRecord[];
  onResolve: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdateLevel: (id: number, level: string) => void;
}

export const AlarmTable: React.FC<TableProps> = ({ alarms, onResolve, onDelete, onUpdateLevel }) => {
  const levelStyle = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const levelLabel = (level: string) => {
    switch (level) {
      case 'high': return '高危';
      case 'medium': return '警告';
      default: return '提示';
    }
  };

  return (
    <div className="flex-1 overflow-auto custom-scrollbar">
      <table className="w-full text-left border-separate border-spacing-0">
        <thead className="bg-[#f8faff] text-gray-500 text-[11px] uppercase tracking-wider sticky top-0 z-10">
          <tr>
            <th className="p-4 border-b border-gray-100 font-bold">报警编号</th>
            <th className="p-4 border-b border-gray-100 font-bold">报警类型</th>
            <th className="p-4 border-b border-gray-100 font-bold">人员/设备</th>
            <th className="p-4 border-b border-gray-100 font-bold">报警时间</th>
            <th className="p-4 border-b border-gray-100 font-bold">位置</th>
            <th className="p-4 border-b border-gray-100 font-bold">级别</th>
            <th className="p-4 border-b border-gray-100 font-bold">状态</th>
            <th className="p-4 border-b border-gray-100 font-bold text-right">操作</th>
          </tr>
        </thead>
        <tbody className="text-sm divide-y divide-gray-50 bg-white">
          {alarms.map(alarm => (
            <tr key={alarm.id} className="hover:bg-blue-50/30 transition-colors group">
              <td className="p-4 text-gray-400 font-mono text-[11px]">{alarm.id}</td>
              <td className="p-4 font-bold text-gray-800">{alarm.type}</td>
              <td className="p-4">
                <div className="flex flex-col">
                  <span className="text-gray-900 font-medium">{alarm.user}</span>
                  <span className="text-[10px] text-gray-400 font-mono italic">{alarm.device}</span>
                </div>
              </td>
              <td className="p-4 text-gray-600 text-xs">{alarm.time}</td>
              <td className="p-4 text-gray-600 text-xs">
                <div className="flex items-center gap-1.5">
                   <div className="p-1 bg-blue-50 text-blue-500 rounded-md"><MapPin size={12} /></div>
                  {alarm.location}
                </div>
              </td>
              <td className="p-4">
                {alarm.status === 'pending' ? (
                  <select 
                    value={alarm.level}
                    onChange={(e) => onUpdateLevel(alarm.rawId, e.target.value)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-bold border outline-none cursor-pointer transition-all ${levelStyle(alarm.level)}`}
                  >
                    <option value="high">高危</option>
                    <option value="medium">警告</option>
                    <option value="low">提示</option>
                  </select>
                ) : (
                  <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${levelStyle(alarm.level)}`}>
                    {levelLabel(alarm.level)}
                  </span>
                )}
              </td>
              <td className="p-4">
                {alarm.status === 'pending' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-[11px] font-bold border border-red-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> 待处理
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-600 text-[11px] font-bold border border-green-100">
                    <CheckCircle size={12} /> 已处置
                  </span>
                )}
              </td>
              <td className="p-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  {alarm.status === 'pending' && (
                    <button 
                      onClick={() => onResolve(alarm.rawId)}
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-xl font-bold transition-all shadow-md shadow-blue-100 active:scale-95"
                    >
                      处置
                    </button>
                  )}
                  <button 
                    onClick={() => onDelete(alarm.rawId)}
                    className="p-1.5 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 border border-gray-100 hover:border-red-100 rounded-xl transition-all"
                    title="删除记录"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {alarms.length === 0 && (
            <tr>
              <td colSpan={8} className="p-20 text-center">
                <div className="flex flex-col items-center gap-3">
                   <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                      <AlertCircle size={32} />
                   </div>
                   <span className="text-gray-400 text-sm font-medium">暂无相关报警记录</span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
