import React, { useState } from 'react';
import { Save, UserPlus, Image as ImageIcon, Trash2, Shield, Search, User, ChevronRight, ChevronDown, CornerDownRight } from 'lucide-react';

type AdminRole = 'HQ Manager' | 'Project Manager' | 'Safety Officer' | 'Worker';

interface AdminUser {
  id: string;
  username: string;
  dept: string;
  phone: string;
  role: AdminRole;
  addedDate: string;
  parentId: string | null; // ID of the supervisor
}

// Initial data representing a specific hierarchy
const initialAdmins: AdminUser[] = [
  // Level 1: HQ
  { id: '1', username: '总负责人', dept: '总部', phone: '13800000000', role: 'HQ Manager', addedDate: '2024-01-01', parentId: null },
  
  // Level 2: Project Managers (Children of HQ)
  { id: '2', username: '项目负责人1', dept: '项目一部', phone: '13912345678', role: 'Project Manager', addedDate: '2024-03-15', parentId: '1' },
  { id: '3', username: '项目负责人2', dept: '项目二部', phone: '13987654321', role: 'Project Manager', addedDate: '2024-03-16', parentId: '1' },
  
  // Level 3: Safety Officers (Children of PMs)
  { id: '4', username: '安全员1', dept: '项目一部', phone: '13788889999', role: 'Safety Officer', addedDate: '2024-06-20', parentId: '2' },
  { id: '5', username: '安全员2', dept: '项目一部', phone: '13766665555', role: 'Safety Officer', addedDate: '2024-06-21', parentId: '2' },
  { id: '6', username: '安全员3', dept: '项目二部', phone: '13744443333', role: 'Safety Officer', addedDate: '2024-06-22', parentId: '3' },
  
  // Level 4: Workers (Children of Safety Officers)
  { id: '7', username: '作业人员1', dept: '施工队A', phone: '13500001111', role: 'Worker', addedDate: '2024-07-01', parentId: '4' },
  { id: '8', username: '作业人员2', dept: '施工队A', phone: '13500002222', role: 'Worker', addedDate: '2024-07-02', parentId: '4' },
  { id: '9', username: '作业人员3', dept: '施工队B', phone: '13500003333', role: 'Worker', addedDate: '2024-07-03', parentId: '5' },
  { id: '10', username: '作业人员4', dept: '施工队C', phone: '13500004444', role: 'Worker', addedDate: '2024-07-04', parentId: '6' },
  { id: '11', username: '作业人员5', dept: '施工队C', phone: '13500005555', role: 'Worker', addedDate: '2024-07-05', parentId: '6' },
];

export default function SettingsView() {
  const [admins, setAdmins] = useState<AdminUser[]>(initialAdmins);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Expanded states for tree nodes (key = userId)
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    '1': true, // Auto expand HQ
    '2': true, // Auto expand PM1
    '3': true, // Auto expand PM2
  });

  // Form State
  const [form, setForm] = useState({
    username: '',
    dept: '',
    phone: '',
    password: '',
    role: 'Worker' as AdminRole,
    parentId: ''
  });

  const toggleNode = (userId: string) => {
    setExpandedNodes(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const handleDeleteAdmin = (id: string) => {
    if (confirm("确定要删除该人员吗？其下属人员将失去关联。")) {
      setAdmins(prev => prev.filter(a => a.id !== id));
      // Optional: Handle orphaned children logic here (e.g., set their parentId to null)
    }
  };

  // Get potential supervisors based on selected role
  const getPotentialSupervisors = (currentRole: AdminRole) => {
    switch (currentRole) {
        case 'HQ Manager': return []; // Top level has no supervisor
        case 'Project Manager': return admins.filter(a => a.role === 'HQ Manager');
        case 'Safety Officer': return admins.filter(a => a.role === 'Project Manager');
        case 'Worker': return admins.filter(a => a.role === 'Safety Officer');
        default: return [];
    }
  };

  const handleAddAdmin = () => {
    if (!form.username || !form.password || !form.dept) {
      alert("请填写完整的必要信息");
      return;
    }

    if (form.role !== 'HQ Manager' && !form.parentId) {
      alert("请选择直属上级负责人");
      return;
    }

    const newAdmin: AdminUser = {
      id: Date.now().toString(),
      username: form.username,
      dept: form.dept,
      phone: form.phone,
      role: form.role,
      addedDate: new Date().toLocaleDateString(),
      parentId: form.role === 'HQ Manager' ? null : form.parentId
    };

    setAdmins([...admins, newAdmin]);
    
    // Reset form, keep parent selection if convenient or reset
    setForm({
      username: '',
      dept: '',
      phone: '',
      password: '',
      role: 'Worker',
      parentId: ''
    });
    
    // Auto expand the parent to show new child
    if (newAdmin.parentId) {
        setExpandedNodes(prev => ({ ...prev, [newAdmin.parentId!]: true }));
    }
    
    alert("人员添加成功！");
  };

  const getRoleColor = (r: AdminRole) => {
    if (r === 'HQ Manager') return 'text-red-600 border-red-200 bg-red-50';
    if (r === 'Project Manager') return 'text-orange-600 border-orange-200 bg-orange-50';
    if (r === 'Safety Officer') return 'text-blue-600 border-blue-200 bg-blue-50';
    return 'text-green-600 border-green-200 bg-green-50';
  };

  const getRoleName = (r: AdminRole) => {
    if (r === 'HQ Manager') return '总部负责人';
    if (r === 'Project Manager') return '项目经理';
    if (r === 'Safety Officer') return '安全员';
    return '作业人员';
  };

  // Recursive Tree Node Component
  const TreeNode: React.FC<{ user: AdminUser, depth: number }> = ({ user, depth }) => {
    // Find children
    const children = admins.filter(a => a.parentId === user.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedNodes[user.id];
    
    // Search filtering: If search term exists, only show matching nodes or nodes with matching children
    // Simple logic: if search term exists, expand all matches
    const match = user.username.includes(searchTerm) || user.dept.includes(searchTerm);
    if (searchTerm && !match && !hasChildren) return null; // Simplified filtering for demo

    const roleStyle = getRoleColor(user.role);

    return (
        <div className="select-none">
            <div 
                className={`flex items-center gap-2 p-2 rounded hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200 group ${depth > 0 ? 'ml-6 relative' : ''}`}
            >
                {/* Visual connectors for tree */}
                {depth > 0 && (
                    <div className="absolute -left-4 top-1/2 w-4 h-[1px] bg-gray-300"></div>
                )}
                {depth > 0 && (
                    <div className="absolute -left-4 -top-3 bottom-1/2 w-[1px] bg-gray-300"></div>
                )}

                <div className="flex-1 flex items-center gap-3">
                    {/* Expand/Collapse Toggle */}
                    <button 
                        onClick={() => toggleNode(user.id)}
                        className={`p-0.5 rounded hover:bg-gray-200 ${hasChildren ? 'opacity-100' : 'opacity-20 pointer-events-none'}`}
                    >
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>

                    {/* Avatar/Icon */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${roleStyle.split(' ')[1]} ${roleStyle.split(' ')[2]}`}>
                        <User size={14} className={roleStyle.split(' ')[0]} />
                    </div>

                    {/* Info */}
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-800">{user.username}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${roleStyle}`}>{getRoleName(user.role)}</span>
                        </div>
                        <div className="text-[10px] text-gray-500">{user.dept} | {user.phone}</div>
                    </div>
                </div>

                <button 
                    onClick={() => handleDeleteAdmin(user.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
                    title="删除"
                >
                    <Trash2 size={14} />
                </button>
            </div>

            {/* Render Children Recursively */}
            {isExpanded && hasChildren && (
                <div className="relative">
                    {/* Vertical line connector for children container */}
                    {/* <div className="absolute left-[2.25rem] top-0 bottom-0 w-[1px] bg-slate-800"></div> */}
                    {children.map(child => (
                        <TreeNode key={child.id} user={child} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
  };

  // Find root nodes (HQ Managers)
  const rootUsers = admins.filter(a => a.parentId === null);

  return (
    <div className="h-full flex gap-4">
      {/* Left Column: Admin Tree List */}
      <div className="w-1/3 bg-white border border-gray-200 rounded-lg flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Shield className="text-blue-600" size={20} /> 人员架构管理
          </h2>
          <div className="relative">
            <input 
              type="text" 
              placeholder="搜索人员..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-100 border border-gray-300 rounded p-2 pl-9 text-sm text-gray-800 focus:border-blue-500 focus:outline-none"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 relative">
           {rootUsers.length > 0 ? (
               rootUsers.map(root => (
                   <TreeNode key={root.id} user={root} depth={0} />
               ))
           ) : (
               <div className="text-center text-gray-500 py-10">暂无架构数据</div>
           )}
        </div>
        
        <div className="p-3 border-t border-gray-200 bg-gray-50 text-center text-xs text-gray-500">
           总计 {admins.length} 人员
        </div>
      </div>

      {/* Right Column: Add Form */}
      <div className="flex-1 bg-white border border-gray-200 rounded-lg p-8 flex flex-col overflow-y-auto">
         <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-4 flex items-center gap-2">
            <UserPlus className="text-blue-600" /> 添加新人员
         </h2>
         
         <div className="flex gap-8">
            {/* Form Fields */}
            <div className="w-1/2 space-y-5">
               <div className="flex gap-4 items-center">
                  <div className="w-20 h-20 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-gray-200/80 transition-all group flex-shrink-0 flex flex-col items-center justify-center">
                      <ImageIcon size={24} className="text-gray-400 group-hover:text-blue-500" />
                      <span className="text-[10px] text-gray-500 mt-1">上传头像</span>
                  </div>
                  <div className="text-sm text-gray-500">
                     支持 JPG, PNG 格式<br/>建议尺寸 200x200
                  </div>
               </div>

               <div className="space-y-4">
                  <div>
                     <label className="block text-sm text-gray-600 mb-1">* 人员级别</label>
                     <select 
                       value={form.role}
                       onChange={(e) => {
                           setForm({
                               ...form, 
                               role: e.target.value as AdminRole,
                               parentId: '' // Reset parent when role changes
                           });
                       }}
                       className="w-full bg-white border border-gray-300 rounded p-2.5 text-gray-800 focus:border-blue-500 focus:outline-none"
                     >
                        <option value="HQ Manager">总部负责人 (最高权限)</option>
                        <option value="Project Manager">项目部负责人 (管理权限)</option>
                        <option value="Safety Officer">安全员 (监督权限)</option>
                        <option value="Worker">作业人员 (基础权限)</option>
                     </select>
                  </div>

                  {/* Dynamic Parent Selector */}
                  {form.role !== 'HQ Manager' && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="block text-sm text-blue-600 mb-1 font-bold flex items-center gap-1">
                            <CornerDownRight size={14} /> 
                            直属上级 <span className="text-red-500">*</span>
                        </label>
                        <select 
                            value={form.parentId}
                            onChange={(e) => setForm({...form, parentId: e.target.value})}
                            className="w-full bg-white border border-blue-500/50 rounded p-2.5 text-gray-800 focus:border-blue-500 focus:outline-none shadow-[0_0_10px_rgba(59,130,246,0.1)]"
                        >
                            <option value="">-- 请选择上级负责人 --</option>
                            {getPotentialSupervisors(form.role).map(u => (
                                <option key={u.id} value={u.id}>
                                    {u.username} ({u.dept})
                                </option>
                            ))}
                        </select>
                        <p className="text-[10px] text-gray-500 mt-1">
                            {form.role === 'Project Manager' && '项目负责人需归属于总部负责人'}
                            {form.role === 'Safety Officer' && '安全员需归属于项目负责人'}
                            {form.role === 'Worker' && '作业人员需归属于安全员'}
                        </p>
                      </div>
                  )}

                  <div>
                     <label className="block text-sm text-gray-600 mb-1">* 姓名/账号</label>
                     <input 
                       type="text" 
                       value={form.username}
                       onChange={(e) => setForm({...form, username: e.target.value})}
                       className="w-full bg-white border border-gray-300 rounded p-2.5 text-gray-800 focus:border-blue-500 focus:outline-none" 
                       placeholder="请输入姓名"
                     />
                  </div>
                  <div>
                     <label className="block text-sm text-gray-600 mb-1">* 归属部门</label>
                     <input 
                       type="text" 
                       value={form.dept}
                       onChange={(e) => setForm({...form, dept: e.target.value})}
                       className="w-full bg-white border border-gray-300 rounded p-2.5 text-gray-800 focus:border-blue-500 focus:outline-none" 
                       placeholder="例如：安保部"
                     />
                  </div>
                  <div>
                     <label className="block text-sm text-gray-600 mb-1">手机号码</label>
                     <input 
                       type="text" 
                       value={form.phone}
                       onChange={(e) => setForm({...form, phone: e.target.value})}
                       className="w-full bg-white border border-gray-300 rounded p-2.5 text-gray-800 focus:border-blue-500 focus:outline-none" 
                       placeholder="请输入联系方式"
                     />
                  </div>
                  <div>
                     <label className="block text-sm text-gray-600 mb-1">* 初始密码</label>
                     <input 
                       type="password" 
                       value={form.password}
                       onChange={(e) => setForm({...form, password: e.target.value})}
                       className="w-full bg-white border border-gray-300 rounded p-2.5 text-gray-800 focus:border-blue-500 focus:outline-none" 
                       placeholder="设置初始密码"
                     />
                  </div>
               </div>
            </div>

            {/* Info / Permissions Preview */}
            <div className="flex-1">
               <h3 className="text-lg font-medium text-blue-600 mb-4">架构预览</h3>
               <div className="bg-gray-50 p-6 rounded border border-gray-200 space-y-4">
                  <div className="flex items-start gap-3">
                     <div className="mt-1 w-2 h-2 rounded-full bg-blue-500"></div>
                     <div>
                        <h4 className="text-sm font-bold text-gray-800">当前级别: {getRoleName(form.role)}</h4>
                        <p className="text-xs text-gray-600 mt-1">
                           {form.role === 'HQ Manager' && '拥有系统所有模块的完全控制权限，可管理所有项目部。'}
                           {form.role === 'Project Manager' && '拥有本项目部下辖区域的管理权限，可管理安全员和作业人员。'}
                           {form.role === 'Safety Officer' && '负责现场安全监督，处理报警信息，查看监控和轨迹。'}
                           {form.role === 'Worker' && '仅可查看个人信息及相关通知，佩戴智能设备。'}
                        </p>
                     </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 mt-4">
                     <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">层级关系图谱</h4>
                     <div className="flex flex-col gap-2 text-xs relative pl-2">
                        <div className="absolute left-[1.1rem] top-3 bottom-8 w-[1px] bg-gray-300"></div>
                        
                        <div className={`p-2 rounded border flex items-center gap-2 ${form.role === 'HQ Manager' ? 'bg-blue-100 border-blue-500 text-gray-800 font-bold' : 'border-gray-200 text-gray-400 opacity-70'}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> 1. 总部负责人
                        </div>
                        
                        <div className={`p-2 rounded border ml-4 flex items-center gap-2 relative ${form.role === 'Project Manager' ? 'bg-blue-100 border-blue-500 text-gray-800 font-bold' : 'border-gray-200 text-gray-400 opacity-70'}`}>
                            <div className="absolute -left-4 top-1/2 w-4 h-[1px] bg-gray-300"></div>
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> 2. 项目部负责人
                        </div>
                        
                        <div className={`p-2 rounded border ml-8 flex items-center gap-2 relative ${form.role === 'Safety Officer' ? 'bg-blue-100 border-blue-500 text-gray-800 font-bold' : 'border-gray-200 text-gray-400 opacity-70'}`}>
                             <div className="absolute -left-4 top-1/2 w-4 h-[1px] bg-gray-300"></div>
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> 3. 安全员
                        </div>
                        
                        <div className={`p-2 rounded border ml-12 flex items-center gap-2 relative ${form.role === 'Worker' ? 'bg-blue-100 border-blue-500 text-gray-800 font-bold' : 'border-gray-200 text-gray-400 opacity-70'}`}>
                             <div className="absolute -left-4 top-1/2 w-4 h-[1px] bg-gray-300"></div>
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> 4. 作业人员
                        </div>
                     </div>
                  </div>
               </div>

               <div className="mt-8 flex gap-4">
                  <button onClick={handleAddAdmin} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-95">
                     <Save size={20} /> 保存人员
                  </button>
                  <button onClick={() => setForm({username: '', dept: '', phone: '', password: '', role: 'Worker', parentId: ''})} className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded font-medium transition-all">
                     重置
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}