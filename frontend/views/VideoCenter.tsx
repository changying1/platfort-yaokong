import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, MonitorPlay, Maximize2, X, Video as VideoIcon, Camera, AlertCircle, ChevronLeft, ChevronRight, Grid3x3, Grid2x2, LayoutGrid, Loader, Settings } from 'lucide-react';
// 假设 types 定义在 api/videoApi 中，需确保与后端 schema 一致
import VideoPlayer from '../src/components/VideoPlayer';
import { getAllVideos, deleteVideo, getVideoStreamUrl, addCameraViaRTSP, Video, VideoCreate, API_BASE_URL } from '../src/api/videoApi';

export default function VideoCenter() {
  // --- 状态管理 ---
  const [devices, setDevices] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [maximizedVideo, setMaximizedVideo] = useState<Video | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Video | null>(null);
  
  // 表单状态更新：补全后端 VideoCreate schema 中的所有字段
  const [newDeviceForm, setNewDeviceForm] = useState<VideoCreate>({
    name: '',
    ip_address: '',
    port: 80,            // 后端默认 80
    username: '',        // 新增
    password: '',        // 新增
    stream_url: '',
    status: 'offline',   // 修复：使用英文枚举值
    remark: ''           // 新增
  });

  // --- 初始化加载 ---
  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const data = await getAllVideos();
      setDevices(data);
      setError(null);
    } catch (e: any) {
      setError('无法加载设备。请确认后端服务已启动。');
    } finally {
      setLoading(false);
    }
  };

  // --- 逻辑处理 ---
  const handleSearch = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1); 
  };

  const filteredDevices = devices.filter(h =>
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) || String(h.id).includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredDevices.length / itemsPerPage) || 1;
  const currentVideos = filteredDevices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleShowStream = async (device: Video) => {
    try {
      const data = await getVideoStreamUrl(device.id);
      setStreamUrl(data.url);
      setMaximizedVideo(device);
    } catch (err: any) {
      alert(`获取视频流失败: ${err.message}`);
    }
  };

  const handleAddDevice = async () => {
    // 必填校验：名称 + RTSP 流地址
    if (!newDeviceForm.name || !newDeviceForm.stream_url) {
      alert("请填写必填字段：设备名称和流地址");
      return;
    }

    const payload = {
      name: newDeviceForm.name,
      rtsp_url: newDeviceForm.stream_url,
      ip_address: newDeviceForm.ip_address || undefined,
      port: newDeviceForm.port,
      username: newDeviceForm.username,
      password: newDeviceForm.password,
      remark: newDeviceForm.remark,
    };
    
    try {
      const newDevice = await addCameraViaRTSP(payload);
      setDevices([newDevice, ...devices]);
      setShowAddModal(false);
      // 重置表单
      setNewDeviceForm({ 
        name: '', 
        ip_address: '', 
        port: 80, 
        username: '', 
        password: '', 
        stream_url: '', 
        status: 'offline',  // 修复：使用英文枚举值
        remark: '' 
      });
    } catch (err: any) {
      console.error('添加失败详情:', err);
      const errorMsg = err.message || JSON.stringify(err);
      alert(`添加失败: ${errorMsg}`);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`确定删除设备 ID: ${id} 吗？`)) {
      try {
        await deleteVideo(id);
        setDevices(prev => prev.filter(d => d.id !== id));
      } catch (err: any) {
        alert(`删除失败: ${err.message}`);
      }
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center text-blue-500"><Loader className="animate-spin" size={48} /></div>;

  return (
    <div className="h-full flex gap-4 p-4 bg-gradient-to-br from-white via-gray-50 to-gray-100 text-gray-900">
      {/* 左侧列表 */}
      <div className="w-80 flex flex-col gap-3 bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-center">
          <h3 className="font-bold flex items-center gap-2 text-gray-900"><MonitorPlay size={18} className="text-blue-600" /> 设备管理</h3>
          <button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1 shadow-md"><Plus size={14} />新增</button>
        </div>
        <input 
          type="text" 
          placeholder="搜索设备..." 
          className="bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 text-gray-900 placeholder-gray-500"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <div className="flex-1 overflow-y-auto space-y-2">
          {filteredDevices.map(device => (
            <div 
              key={device.id} 
              onClick={() => setSelectedDevice(device)}
              className={`p-3 rounded border cursor-pointer transition-all flex justify-between items-center ${selectedDevice?.id === device.id ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'}`}
            >
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate text-gray-900">{device.name}</p>
                <div className="flex items-center gap-2 text-[10px] text-gray-600 font-mono">
                  <span>{device.ip_address}:{device.port}</span>
                  {device.remark && <span className="bg-gray-200 px-1 rounded truncate max-w-[80px]">{device.remark}</span>}
                </div>
              </div>
              <button onClick={(e) => handleDelete(device.id, e)} className="text-gray-400 hover:text-red-500 flex-shrink-0 transition-colors"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>

      {/* 右侧网格 */}
      <div className="flex-1 flex flex-col gap-4">
        <div className={`flex-1 grid gap-4 ${itemsPerPage === 4 ? 'grid-cols-2' : itemsPerPage === 16 ? 'grid-cols-4' : 'grid-cols-3'}`}>
          {Array.from({ length: itemsPerPage }).map((_, i) => {
            const device = currentVideos[i];
            return (
              <div key={device?.id || i} className="bg-white rounded border border-gray-200 relative group overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {device ? (
                  <>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 gap-2 bg-gray-50">
                       <VideoIcon size={32} opacity={0.3} />
                       <span className="text-xs text-gray-500">无实时预览</span>
                    </div>
                    
                    {/* 状态指示器 */}
                    <div className="absolute top-2 left-2 flex items-center gap-2 z-10">
                      <span className={`w-2 h-2 rounded-full ${device.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                      <span className="text-[10px] bg-white/80 backdrop-blur px-2 py-0.5 rounded text-gray-900 border border-gray-200 shadow-sm">
                        {device.name}
                      </span>
                    </div>

                    {/* 悬浮操作栏 */}
                    <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button 
                        onClick={() => handleShowStream(device)} 
                        className="p-1.5 bg-blue-600 hover:bg-blue-500 rounded text-white shadow-lg transition-all"
                        title="全屏播放"
                        >
                        <Maximize2 size={14} />
                        </button>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-200"><Plus size={32} opacity={0.2} /></div>
                )}
              </div>
            );
          })}
        </div>

        {/* 分页与布局控制 */}
        <div className="h-12 bg-white border border-gray-200 rounded-lg flex items-center justify-between px-4 shadow-sm">
          <div className="text-xs text-gray-600">共 {filteredDevices.length} 个设备</div>
          <div className="flex gap-2">
            {[4, 9, 16].map(num => (
              <button key={num} onClick={() => { setItemsPerPage(num); setCurrentPage(1); }} className={`px-3 py-1 rounded text-xs transition-all ${itemsPerPage === num ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>{num}屏</button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-1 disabled:opacity-30 hover:bg-gray-100 rounded transition-colors text-gray-600"><ChevronLeft /></button>
            <span className="text-xs font-mono w-10 text-center text-gray-700">{currentPage} / {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-1 disabled:opacity-30 hover:bg-gray-100 rounded transition-colors text-gray-600"><ChevronRight /></button>
          </div>
        </div>
      </div>

      {/* 添加设备弹窗 - 已更新以匹配后端 schema */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white border border-gray-200 rounded-lg w-[500px] p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900"><Settings size={18} className="text-blue-600"/> 添加监控设备</h3>
                 <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={20} /></button>
            </div>
           
            <div className="grid grid-cols-2 gap-4">
              {/* 基础信息 */}
              <div className="col-span-2">
                <label className="text-xs font-semibold text-gray-700 block mb-1">设备名称 <span className="text-red-500">*</span></label>
                <input className="w-full bg-gray-50 border border-gray-300 rounded p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-none text-gray-900" 
                  value={newDeviceForm.name} 
                  onChange={e => setNewDeviceForm({...newDeviceForm, name: e.target.value})} 
                  placeholder="例如：北门入口摄像头" 
                />
              </div>

              {/* 网络信息 */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">IP 地址（可选）</label>
                <input className="w-full bg-gray-50 border border-gray-300 rounded p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-none text-gray-900"
                  value={newDeviceForm.ip_address} 
                  onChange={e => setNewDeviceForm({...newDeviceForm, ip_address: e.target.value})} 
                  placeholder="192.168.1.100" 
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">端口</label>
                <input type="number" className="w-full bg-gray-50 border border-gray-300 rounded p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-none text-gray-900"
                  value={newDeviceForm.port} 
                  onChange={e => setNewDeviceForm({...newDeviceForm, port: parseInt(e.target.value) || 80})} 
                  placeholder="80" 
                />
              </div>

              {/* 认证信息 */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">用户名</label>
                <input className="w-full bg-gray-50 border border-gray-300 rounded p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-none text-gray-900"
                  value={newDeviceForm.username || ''} 
                  onChange={e => setNewDeviceForm({...newDeviceForm, username: e.target.value})} 
                  placeholder="请输入登录账号" 
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">密码</label>
                <input type="password" className="w-full bg-gray-50 border border-gray-300 rounded p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-none text-gray-900"
                  value={newDeviceForm.password || ''} 
                  onChange={e => setNewDeviceForm({...newDeviceForm, password: e.target.value})} 
                  placeholder="******" 
                />
              </div>

              {/* 流地址 & 备注 */}
              <div className="col-span-2">
                <label className="text-xs font-semibold text-gray-700 block mb-1">流地址（RTSP/HLS）</label>
                <input className="w-full bg-gray-50 border border-gray-300 rounded p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-none text-gray-900"
                  value={newDeviceForm.stream_url || ''} 
                  onChange={e => setNewDeviceForm({...newDeviceForm, stream_url: e.target.value})} 
                  placeholder="示例：rtsp://账号:密码@192.168.1.100:554/..." 
                />
                 <p className="text-[10px] text-gray-500 mt-1">留空则系统可能尝试根据 IP 和账号自动生成</p>
              </div>

              <div className="col-span-2">
                <label className="text-xs font-semibold text-gray-700 block mb-1">备注</label>
                <input className="w-full bg-gray-50 border border-gray-300 rounded p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-none text-gray-900"
                  value={newDeviceForm.remark || ''} 
                  onChange={e => setNewDeviceForm({...newDeviceForm, remark: e.target.value})} 
                  placeholder="位置描述或其他信息" 
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={handleAddDevice} className="flex-1 bg-blue-600 hover:bg-blue-500 py-2 rounded text-sm font-bold text-white transition-colors shadow-md">保存配置</button>
              <button onClick={() => setShowAddModal(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded text-sm text-gray-700 transition-colors">取消</button>
            </div>
          </div>
        </div>
      )}

      {/* 播放弹窗 */}
      {maximizedVideo && (
        <div className="fixed inset-0 z-[200] bg-white flex flex-col p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-3 text-gray-900">
                {maximizedVideo.name} 
                <span className="text-sm font-mono font-normal text-gray-600 bg-gray-100 px-2 rounded border border-gray-300">
                    {maximizedVideo.ip_address}
                </span>
            </h2>
            <button onClick={() => { setMaximizedVideo(null); setStreamUrl(null); }} className="p-2 text-gray-500 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors"><X size={24} /></button>
          </div>
          <div className="flex-1 bg-gray-50 rounded-lg flex flex-col items-center justify-center border border-gray-200 relative overflow-hidden">
              {streamUrl ? (
                <div className="w-full h-full flex flex-col">
                  <div className="p-3 bg-blue-50 border-b border-blue-200 text-sm text-blue-800">
                    <div className="flex items-center gap-2 font-semibold"><MonitorPlay size={18}/> 播放信息</div>
                    <code className="mt-2 block text-xs bg-white p-2 rounded border border-gray-300 break-all text-gray-800">{streamUrl}</code>
                  </div>
                  <div className="flex-1 flex items-center justify-center bg-black">
                    {streamUrl ? (
                      <VideoPlayer src={streamUrl} />
                    ) : (
                      <div className="text-gray-400">正在准备 HLS 预览...</div>
                    )}
                  </div>
                  <div className="p-3 text-center text-xs text-gray-600 bg-white border-t border-gray-200">
                    说明：当前使用 HLS(hls.js) 进行播放。
                  </div>
                </div>
              ) : <Loader className="animate-spin text-blue-500" size={48} />}
          </div>
        </div>
      )}
    </div>
  );
}
