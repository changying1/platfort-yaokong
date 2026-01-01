import React from "react";
import { 
  Plus, 
  Trash2, 
  Edit, 
  Search, 
  Shield, 
  Users, 
  Clock, 
  FileText,
  MousePointer2
} from "lucide-react";
import { FenceData, ProjectRegionData } from "../types";
import { ViewMode } from "../hooks/useFenceLogic";

interface SidebarProps {
  fences: FenceData[];
  regions: ProjectRegionData[];
  selectedFence: FenceData | null;
  selectedRegion: ProjectRegionData | null;
  viewMode: ViewMode;
  onSelectFence: (f: FenceData) => void;
  onSelectRegion: (r: ProjectRegionData) => void;
  onCreateNew: () => void;
  onCreateRegion: () => void;
  onEdit: (f: FenceData) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onDeleteRegion: (id: string, e: React.MouseEvent) => void;
  onSwitchView: (mode: ViewMode) => void;
}

export const FenceSidebar: React.FC<SidebarProps> = ({
  fences,
  regions,
  selectedFence,
  selectedRegion,
  viewMode,
  onSelectFence,
  onSelectRegion,
  onCreateNew,
  onCreateRegion,
  onEdit,
  onDelete,
  onDeleteRegion,
  onSwitchView
}) => {
  return (
    <div className="w-[400px] h-full bg-white border-r border-[#e2e8f0] flex flex-col shadow-xl z-10">
      <div className="p-6 border-b border-[#f1f5f9] bg-gradient-to-br from-white to-[#f8faff]">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            电子围栏管理
          </h1>
          <button
            onClick={viewMode === "region_list" ? onCreateRegion : onCreateNew}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg shadow-blue-200 active:scale-95"
          >
            <Plus size={18} />
            <span className="font-semibold">{viewMode === "region_list" ? "新建区域" : "新建围栏"}</span>
          </button>
        </div>

        <div className="flex p-1 bg-[#f1f5f9] rounded-xl mb-4">
          <button
            onClick={() => onSwitchView("list")}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              viewMode === "list" || viewMode === "create" || viewMode === "edit"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            围栏列表
          </button>
          <button
            onClick={() => onSwitchView("region_list")}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              viewMode === "region_list" || viewMode === "region_create"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            项目区域
          </button>
        </div>

        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] group-focus-within:text-blue-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="搜索名称 / 备注..."
            className="w-full pl-10 pr-4 py-3 bg-[#f8faff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {viewMode === "region_list" ? (
          regions.map(region => (
            <div
              key={region.id}
              onClick={() => onSelectRegion(region)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
                selectedRegion?.id === region.id
                  ? "bg-blue-50 border-blue-200 shadow-md ring-1 ring-blue-100"
                  : "bg-white border-[#f1f5f9] hover:border-blue-200 hover:shadow-sm"
              }`}
            >
               <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${selectedRegion?.id === region.id ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'}`}>
                    <Shield size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1e293b]">{region.name}</h3>
                    <p className="text-xs text-[#64748b]">项目区域</p>
                  </div>
                </div>
                <button
                  onClick={(e) => onDeleteRegion(region.id, e)}
                  className="p-2 text-[#94a3b8] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="text-xs text-[#64748b] line-clamp-2">{region.remark || "暂无描述"}</p>
            </div>
          ))
        ) : (
          fences.map(fence => (
            <div
              key={fence.id}
              onClick={() => onSelectFence(fence)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
                selectedFence?.id === fence.id
                  ? "bg-blue-50 border-blue-200 shadow-md ring-1 ring-blue-100"
                  : "bg-white border-[#f1f5f9] hover:border-blue-200 hover:shadow-sm"
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${selectedFence?.id === fence.id ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'}`}>
                    <Shield size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1e293b]">{fence.name}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      fence.behavior === "No Entry" ? "bg-red-100 text-red-600" : "bg-cyan-100 text-cyan-600"
                    }`}>
                      {fence.behavior === "No Entry" ? "禁止进入" : "禁止离开"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); onEdit(fence); }}
                    className="p-2 text-[#94a3b8] hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={(e) => onDelete(fence.id, e)}
                    className="p-2 text-[#94a3b8] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="flex items-center gap-2 text-[#64748b]">
                  <Users size={14} className="text-blue-500" />
                  <span className="text-xs">{fence.deviceIds.length} 位人员</span>
                </div>
                <div className="flex items-center gap-2 text-[#64748b]">
                  <Clock size={14} className="text-blue-500" />
                  <span className="text-xs">{fence.startTime}-{fence.endTime}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 bg-[#f8faff] rounded-xl border border-[#f1f5f9]">
                <div className="text-xs text-[#64748b]">实时违规</div>
                <div className={`text-sm font-bold ${fence.workerCount > 0 ? 'text-red-500 animate-pulse' : 'text-[#22c55e]'}`}>
                  {fence.workerCount} 人
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
