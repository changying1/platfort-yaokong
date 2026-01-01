import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { Activity, Users, AlertCircle, Wifi } from 'lucide-react';

// Mock Data
const alarmData = [
  { name: '08-01', count: 120 },
  { name: '08-02', count: 132 },
  { name: '08-03', count: 101 },
  { name: '08-04', count: 134 },
  { name: '08-05', count: 90 },
  { name: '08-06', count: 230 },
  { name: '08-07', count: 210 },
];

const taskData = [
  { name: '08-01', completed: 0.6 },
  { name: '08-02', completed: 0.7 },
  { name: '08-03', completed: 0.8 },
  { name: '08-04', completed: 0.5 },
  { name: '08-05', completed: 0.9 },
  { name: '08-06', completed: 0.85 },
  { name: '08-07', completed: 0.92 },
];

export default function Dashboard() {
  return (
    <div className="h-full flex flex-col gap-4">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
         <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
            <div>
               <p className="text-gray-500 text-sm">帽子在线率</p>
               <h3 className="text-2xl font-bold text-blue-600 font-mono mt-1">92.5%</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200">
               <Wifi className="text-blue-600" />
            </div>
         </div>
         <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
            <div>
               <p className="text-gray-500 text-sm">设备总数</p>
               <h3 className="text-2xl font-bold text-gray-800 font-mono mt-1">452</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
               <Users className="text-gray-600" />
            </div>
         </div>
         <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
            <div>
               <p className="text-gray-500 text-sm">今日报警</p>
               <h3 className="text-2xl font-bold text-red-600 font-mono mt-1">12</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center border border-red-200">
               <AlertCircle className="text-red-600" />
            </div>
         </div>
         <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
            <div>
               <p className="text-gray-500 text-sm">正在作业</p>
               <h3 className="text-2xl font-bold text-green-600 font-mono mt-1">380</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center border border-green-200">
               <Activity className="text-green-600" />
            </div>
         </div>
      </div>

      {/* Main Map View Area (Mock) */}
      <div className="flex-1 border border-gray-200 rounded-lg relative bg-gray-100 overflow-hidden">
         {/* Simulate a map background */}
         <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/116.4074,39.9042,10,0/800x600?access_token=pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJja2xsY3d4b3MwMHVqMnV0Z3Q0b3ZqZ291In0.7b5S0Q-J_I1f8i8_5j6k3g')] bg-cover opacity-70"></div>
         
         <div className="absolute inset-0 pointer-events-none">
            {/* Overlay Grid */}
            <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
         </div>

         {/* Floating Alarm List */}
         <div className="absolute top-4 left-4 w-80 bg-white/80 border border-red-200 rounded-lg p-2 z-10 backdrop-blur-sm shadow-lg">
            <h4 className="text-red-600 font-bold text-sm mb-2 border-b border-red-200 pb-1 flex items-center gap-2">
               <AlertCircle size={14} /> 实时报警信息
            </h4>
            <div className="space-y-2 text-xs">
               <div className="flex justify-between text-gray-800">
                  <span>866844 (脱帽报警)</span>
                  <span className="text-gray-500">16:11:56</span>
               </div>
               <div className="text-gray-500 truncate">浙江省宁波市鄞州区大朱家</div>
               
               <div className="flex justify-between text-gray-800 mt-2">
                  <span>866830 (静止报警)</span>
                  <span className="text-gray-500">16:00:10</span>
               </div>
               <div className="text-gray-500 truncate">浙江省宁波市鄞州区火车站</div>
            </div>
         </div>

         {/* Central "Searching" Effect */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-blue-200 rounded-full flex items-center justify-center animate-pulse">
             <div className="w-48 h-48 border border-blue-300 rounded-full flex items-center justify-center">
                 <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_20px_#3b82f6]"></div>
             </div>
         </div>
      </div>

      {/* Bottom Charts */}
      <div className="h-48 grid grid-cols-2 gap-4">
         <div className="bg-white border border-gray-200 rounded-lg p-2 flex flex-col">
            <h4 className="text-blue-600 text-xs font-bold px-2 mb-2 border-l-2 border-blue-600">近七天报警数据</h4>
            <div className="flex-1 w-full text-xs">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={alarmData}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                     <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} tick={{fill: '#6b7280'}} />
                     <YAxis stroke="#9ca3af" fontSize={10} tick={{fill: '#6b7280'}} />
                     <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', fontSize: '12px', color: '#000' }} />
                     <Line type="monotone" dataKey="count" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="bg-white border border-gray-200 rounded-lg p-2 flex flex-col">
            <h4 className="text-blue-600 text-xs font-bold px-2 mb-2 border-l-2 border-blue-600">近七天任务数据</h4>
            <div className="flex-1 w-full text-xs">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={taskData}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                     <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} tick={{fill: '#6b7280'}} />
                     <YAxis stroke="#9ca3af" fontSize={10} tick={{fill: '#6b7280'}} />
                     <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', fontSize: '12px', color: '#000' }} />
                     <Bar dataKey="completed" fill="#3b82f6" barSize={20} radius={[2, 2, 0, 0]} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>
    </div>
  );
}
