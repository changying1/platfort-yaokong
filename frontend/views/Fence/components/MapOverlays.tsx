import React from "react";
import { AlertTriangle } from "lucide-react";
import { AlarmRecord } from "../types";

export const AlarmOverlay: React.FC<{ alarms: AlarmRecord[] }> = ({ alarms }) => {
  return (
    <div className="absolute bottom-6 right-6 w-80 space-y-3 z-30 pointer-events-none">
      {alarms.map((alarm) => (
        <div 
          key={alarm.id} 
          className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border-l-4 border-red-500 animate-in slide-in-from-bottom-5 pointer-events-auto"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
              <AlertTriangle size={18} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-red-600 uppercase tracking-wider">电子围栏报警</span>
                <span className="text-[10px] text-gray-400">{alarm.time}</span>
              </div>
              <p className="text-sm font-bold text-gray-800 mt-1">{alarm.msg}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const MapControls: React.FC<{ mapReady: boolean }> = ({ mapReady }) => {
  return (
    <div className="absolute left-6 top-6 flex flex-col gap-3 pointer-events-none">
      <div className="p-3 bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-white flex gap-4 items-center pointer-events-auto">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${mapReady ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
          <div className={`w-2 h-2 rounded-full ${mapReady ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
          <span className="text-sm font-bold">{mapReady ? '地图已就绪' : '地图加载中'}</span>
        </div>
        <div className="h-4 w-px bg-gray-200" />
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" /> 禁止进入
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <div className="w-2.5 h-2.5 rounded-full bg-[#06b6d4]" /> 禁止离开
          </div>
        </div>
      </div>
    </div>
  );
};
