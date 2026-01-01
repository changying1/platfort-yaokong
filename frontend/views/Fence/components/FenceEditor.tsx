import React from "react";
import { 
  X, 
  Save, 
  MousePointer2, 
  Shield, 
  Clock, 
  FileText,
  Users
} from "lucide-react";
import { FenceData, ProjectRegionData } from "../types";

interface EditorProps {
  formData: Partial<FenceData>;
  regions: ProjectRegionData[];
  onClose: () => void;
  onSave: () => void;
  onChange: (data: Partial<FenceData>) => void;
  onPickCenter: () => void;
  onShowDeviceModal: () => void;
  isEdit: boolean;
}

export const FenceEditor: React.FC<EditorProps> = ({
  formData,
  regions,
  onClose,
  onSave,
  onChange,
  onPickCenter,
  onShowDeviceModal,
  isEdit
}) => {
  return (
    <div className="absolute right-6 top-6 w-[420px] bg-white rounded-3xl shadow-2xl border border-[#e2e8f0] overflow-hidden z-20 animate-in slide-in-from-right duration-300">
      <div className="p-6 border-b border-[#f1f5f9] flex justify-between items-center bg-gradient-to-r from-[#f8faff] to-white">
        <div>
          <h2 className="text-xl font-bold text-[#1e293b]">{isEdit ? "编辑电子围栏" : "创建电子围栏"}</h2>
          <p className="text-xs text-[#64748b] mt-1">配置空间围栏及触发布置规则</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-all"><X size={20}/></button>
      </div>

      <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
        {/* 基本信息 */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-blue-600 mb-2">
            <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
            基本设置
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#475569] flex items-center gap-2">
              <FileText size={14}/> 围栏名称
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => onChange({ name: e.target.value })}
              className="w-full px-4 py-3 bg-[#f8faff] border border-[#e2e8f0] rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
              placeholder="请输入围栏名称"
            />
          </div>

          <div className="space-y-2">
              <label className="text-sm font-semibold text-[#475569] flex items-center gap-2">
                <Shield size={14}/> 所属项目区域 (可选)
              </label>
              <select
                value={formData.projectRegionId || ""}
                onChange={(e) => onChange({ projectRegionId: e.target.value || undefined })}
                className="w-full px-4 py-3 bg-[#f8faff] border border-[#e2e8f0] rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
              >
                <option value="">独立围栏 (不绑定区域)</option>
                {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
          </div>
        </section>

        {/* 空间与规则 */}
        <section className="space-y-4 pt-4 border-t border-[#f1f5f9]">
          <div className="flex items-center gap-2 text-sm font-bold text-blue-600 mb-2">
            <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
            空间与触发规则
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#475569]">围栏形状</label>
              <div className="flex p-1 bg-[#f1f5f9] rounded-xl">
                {(["Circle", "Polygon"] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => onChange({ type: t })}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      formData.type === t ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"
                    }`}
                  >
                    {t === "Circle" ? "圆形" : "多边形"}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#475569]">触发行为</label>
              <div className="flex p-1 bg-[#f1f5f9] rounded-xl">
                {(["No Entry", "No Exit"] as const).map(b => (
                  <button
                    key={b}
                    onClick={() => onChange({ behavior: b })}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      formData.behavior === b ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"
                    }`}
                  >
                    {b === "No Entry" ? "禁入" : "禁出"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {formData.type === "Circle" && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#475569]">围栏半径 (米)</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="10"
                  max="1000"
                  step="10"
                  value={formData.radius || 100}
                  onChange={(e) => onChange({ radius: parseInt(e.target.value) })}
                  className="flex-1 accent-blue-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <input
                  type="number"
                  value={formData.radius || 100}
                  onChange={(e) => onChange({ radius: parseInt(e.target.value) || 0 })}
                  className="w-20 px-2 py-1 text-center bg-[#f8faff] border border-[#e2e8f0] rounded-lg text-sm font-bold text-blue-600"
                />
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-[#475569]">
                {formData.type === "Circle" ? "围栏圆心" : `多边形顶点 (${formData.points?.length || 0})`}
              </label>
              {(formData.center || (formData.points && formData.points.length > 0)) && (
                <button 
                  onClick={() => onChange(formData.type === "Circle" ? { center: undefined } : { points: [] })}
                  className="text-[10px] text-red-500 hover:underline"
                >
                  重新绘制
                </button>
              )}
            </div>
            
            {!formData.center && formData.type === "Circle" && (
              <button
                onClick={onPickCenter}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-600 border border-blue-100 rounded-2xl hover:bg-blue-100 transition-all font-semibold active:scale-95"
              >
                <MousePointer2 size={18} />
                点击地图选择圆心
              </button>
            )}

            {formData.center && formData.type === "Circle" && (
              <div className="p-3 bg-[#f8faff] border border-[#e2e8f0] rounded-xl text-xs text-[#64748b] flex justify-between items-center">
                <span>纬度: {formData.center[0].toFixed(6)}, 经度: {formData.center[1].toFixed(6)}</span>
                <span className="text-green-500 font-bold">已就绪</span>
              </div>
            )}

            {formData.type === "Polygon" && (
              <button
                onClick={onPickCenter}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-600 border border-blue-100 rounded-2xl hover:bg-blue-100 transition-all font-semibold active:scale-95"
              >
                <MousePointer2 size={18} />
                {formData.points && formData.points.length > 0 ? "继续添加顶点" : "在地图上点击绘制"}
              </button>
            )}
          </div>
        </section>

        {/* 生效时间与报警等级 */}
        <section className="space-y-4 pt-4 border-t border-[#f1f5f9]">
          <div className="flex items-center gap-2 text-sm font-bold text-blue-600 mb-2">
            <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
            策略配置
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#475569] flex items-center gap-2">
                <Clock size={14}/> 开始时间
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => onChange({ startTime: e.target.value })}
                className="w-full px-4 py-2 bg-[#f8faff] border border-[#e2e8f0] rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#475569] flex items-center gap-2">
                <Clock size={14}/> 结束时间
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => onChange({ endTime: e.target.value })}
                className="w-full px-4 py-2 bg-[#f8faff] border border-[#e2e8f0] rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#475569]">报警严重程度</label>
            <div className="flex p-1 bg-[#f1f5f9] rounded-xl">
              {(["High", "Medium", "Low"] as const).map(l => (
                <button
                  key={l}
                  onClick={() => onChange({ level: l })}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                    formData.level === l 
                      ? l === "High" ? "bg-red-500 text-white shadow-lg" : 
                        l === "Medium" ? "bg-amber-500 text-white shadow-lg" : 
                        "bg-blue-500 text-white shadow-lg"
                      : "text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {l === "High" ? "紧急" : l === "Medium" ? "一般" : "低"}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
               onClick={onShowDeviceModal}
               className="w-full flex items-center justify-between gap-2 px-4 py-4 bg-[#f8faff] border border-dashed border-[#cbd5e1] text-[#475569] rounded-2xl hover:bg-white hover:border-blue-300 hover:text-blue-600 transition-all text-sm"
            >
              <div className="flex items-center gap-2 font-semibold">
                <Users size={18} />
                绑定受控人员
              </div>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold">
                已选 {formData.deviceIds?.length || 0}
              </span>
            </button>
          </div>
        </section>
      </div>

      <div className="p-6 bg-[#f8faff] border-t border-[#f1f5f9] flex gap-4">
        <button
          onClick={onClose}
          className="flex-1 py-3 text-sm font-bold text-[#64748b] hover:bg-[#f1f5f9] rounded-2xl transition-all"
        >
          取消
        </button>
        <button
          onClick={onSave}
          className="flex-[2] py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-200 font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <Save size={18} />
          {isEdit ? "更新围栏" : "保存围栏"}
        </button>
      </div>
    </div>
  );
};
