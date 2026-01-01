import React from 'react';
import { AlarmStats } from './components/AlarmStats';
import { AlarmFilterBar } from './components/AlarmFilterBar';
import { AlarmTable } from './components/AlarmTable';
import { useAlarms } from './hooks/useAlarms';

export default function AlarmRecords() {
  const {
    alarms,
    stats,
    statusFilter,
    setStatusFilter,
    levelFilter,
    setLevelFilter,
    searchTerm,
    setSearchTerm,
    actions
  } = useAlarms();

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Statistics Section */}
      <AlarmStats 
        total={stats.total}
        pending={stats.pending}
        resolved={stats.resolved}
        high={stats.high}
      />

      {/* List Section */}
      <div className="flex-1 bg-white border border-gray-200 rounded-[2rem] p-8 flex flex-col overflow-hidden shadow-sm">
        <header className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-gray-800 tracking-tight">报警记录明细</h2>
          <div className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
            共 {alarms.length} 条符合条件
          </div>
        </header>

        <AlarmFilterBar 
          status={statusFilter}
          level={levelFilter}
          searchTerm={searchTerm}
          onStatusChange={setStatusFilter}
          onLevelChange={setLevelFilter}
          onSearchChange={setSearchTerm}
        />

        <AlarmTable 
          alarms={alarms}
          onResolve={actions.resolve}
          onDelete={actions.delete}
          onUpdateLevel={actions.updateLevel}
        />

        {/* Footer info */}
        <footer className="mt-6 pt-6 border-t border-gray-50 flex justify-between items-center text-[11px] font-bold text-gray-400">
          <div className="flex gap-4">
             <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500"/> 实时同步开启</div>
             <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"/> 每 30 秒自动刷新</div>
          </div>
          <div>智能安全预警平台 V2.0</div>
        </footer>
      </div>
    </div>
  );
}
