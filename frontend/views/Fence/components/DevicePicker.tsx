import React from "react";
import { X, User, Check, Users } from "lucide-react";
import { FenceDevice } from "../types";

interface DevicePickerProps {
  devices: FenceDevice[];
  selectedIds: string[];
  onClose: () => void;
  onConfirm: (ids: string[]) => void;
}

export const DevicePicker: React.FC<DevicePickerProps> = ({
  devices,
  selectedIds,
  onClose,
  onConfirm,
}) => {
  const [tempIds, setTempIds] = React.useState<string[]>(selectedIds);

  const toggleDevice = (id: string) => {
    setTempIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-sm bg-black/40 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50/50 to-white">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">绑定受控人员</h3>
            <p className="text-sm text-gray-500 mt-1">选择需要受到此围栏监控的移动端设备或人员</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-2xl transition-all">
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-3 p-4 bg-blue-50 text-blue-700 rounded-2xl mb-6 shadow-inner">
            <Users size={20} />
            <span className="font-semibold">已选人员: {tempIds.length} 位</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {devices.map((device) => {
              const isSelected = tempIds.includes(device.id);
              return (
                <div
                  key={device.id}
                  onClick={() => toggleDevice(device.id)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group ${
                    isSelected
                      ? "bg-blue-50 border-blue-500 shadow-md ring-1 ring-blue-200"
                      : "border-gray-100 hover:border-blue-200 hover:bg-gray-50/50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                        isSelected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <User size={24} />
                    </div>
                    <div>
                      <div className="font-bold text-gray-800">{device.name}</div>
                      <div className="text-xs text-gray-400">{device.dept}</div>
                    </div>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? "bg-blue-600 border-blue-600 text-white scale-110"
                        : "border-gray-200 group-hover:border-blue-300"
                    }`}
                  >
                    {isSelected && <Check size={14} strokeWidth={3} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-8 bg-gray-50 border-t border-gray-100 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-4 font-bold text-gray-500 hover:bg-gray-100 rounded-2xl transition-all"
          >
            取消
          </button>
          <button
            onClick={() => onConfirm(tempIds)}
            className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            确认选择
          </button>
        </div>
      </div>
    </div>
  );
};
