import React from "react";
import { X, Save, MousePointer2, FileText } from "lucide-react";
import { ProjectRegionData } from "../types";

interface RegionEditorProps {
  formData: Partial<ProjectRegionData>;
  onClose: () => void;
  onSave: () => void;
  onChange: (data: Partial<ProjectRegionData>) => void;
}

export const RegionEditor: React.FC<RegionEditorProps> = ({
  formData,
  onClose,
  onSave,
  onChange,
}) => {
  return (
    <div className="absolute right-6 top-6 w-[400px] bg-white rounded-3xl shadow-2xl border border-[#e2e8f0] p-0 z-20 animate-in slide-in-from-right duration-300 overflow-hidden">
      <div className="p-6 border-b border-[#f1f5f9] flex justify-between items-center bg-gradient-to-r from-[#f8faff] to-white">
        <div>
          <h2 className="text-xl font-bold text-[#1e293b]">新建项目区域</h2>
          <p className="text-xs text-[#64748b] mt-1">定义工作面的地理边界</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
          <X size={20} />
        </button>
      </div>

      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#475569] flex items-center gap-2">
            <FileText size={14} /> 区域名称
          </label>
          <input
            type="text"
            placeholder="例如：1号地块施工区"
            value={formData.name || ""}
            onChange={(e) => onChange({ name: e.target.value })}
            className="w-full px-4 py-3 bg-[#f8faff] border border-[#e2e8f0] rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#475569]">备注说明</label>
          <textarea
            placeholder="描述区域用途..."
            value={formData.remark || ""}
            onChange={(e) => onChange({ remark: e.target.value })}
            className="w-full px-4 py-3 bg-[#f8faff] border border-[#e2e8f0] rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm min-h-[100px] resize-none"
          />
        </div>

        <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
          <div className="p-2 bg-blue-600 text-white rounded-lg">
            <MousePointer2 size={16} />
          </div>
          <div>
            <div className="text-sm font-bold text-blue-900">绘制模式已开启</div>
            <p className="text-xs text-blue-700 mt-0.5">请在地图上依次点击，连接成多边形区域。</p>
          </div>
        </div>
      </div>

      <div className="p-6 bg-[#f8faff] border-t border-[#f1f5f9]">
        <button
          onClick={onSave}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-200 font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <Save size={18} />
          保存项目区域
        </button>
      </div>
    </div>
  );
};
