
import React from 'react';
import { DocumentData } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

interface AnalyticsProps {
  docs: DocumentData[];
}

const Analytics: React.FC<AnalyticsProps> = ({ docs }) => {
  const categoryData = Array.from(new Set(docs.map(d => d.category || 'غير مصنف'))).map(cat => ({
    name: cat,
    count: docs.filter(d => (d.category || 'غير مصنف') === cat).length
  }));

  const velocityData = [
    { time: '08:00', val: 45 },
    { time: '10:00', val: 82 },
    { time: '12:00', val: 68 },
    { time: '14:00', val: 94 },
    { time: '16:00', val: 75 },
    { time: '18:00', val: 40 },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

  return (
    <div className="space-y-12 pb-20 animate-in fade-in duration-700" dir="rtl">
      {/* Strategic Header */}
      <div className="flex justify-between items-end">
         <div className="space-y-2">
            <h2 className="text-5xl font-black dark:text-white text-slate-900 tracking-tight leading-tight">مركز الذكاء الاستراتيجي</h2>
            <p className="dark:text-slate-400 text-slate-500 font-bold text-lg max-w-2xl leading-relaxed italic">
               "تحليل معمق لكفاءة الأرشفة الوطنية ومؤشرات التحول الرقمي بمديرية تكنولوجيا المعلومات."
            </p>
         </div>
         <div className="flex gap-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 px-8 py-4 rounded-3xl text-center">
               <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">دقة المحرك الذكي</p>
               <h4 className="text-2xl font-black text-emerald-600">٩٩.٨٪</h4>
            </div>
         </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
         {[
           { label: 'إجمالي الوثائق المستخرجة', val: docs.length, icon: '📄', color: 'text-blue-500' },
           { label: 'متوسط زمن الاستجابة', val: '٠.٩ ث', icon: '⚡', color: 'text-amber-500' },
           { label: 'البيانات الموثوقة', val: '٩٤٪', icon: '🛡️', color: 'text-emerald-500' },
           { label: 'التصنيفات الإدارية', val: categoryData.length, icon: '📂', color: 'text-purple-500' }
         ].map((kpi, i) => (
           <div key={i} className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border dark:border-slate-800 border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500">
              <div className="text-3xl mb-4">{kpi.icon}</div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
              <h4 className={`text-4xl font-black ${kpi.color}`}>{kpi.val}</h4>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Distribution Chart */}
        <div className="lg:col-span-2 dark:bg-slate-900 bg-white p-12 rounded-[4rem] shadow-sm border dark:border-slate-800 border-slate-100">
          <div className="flex justify-between items-center mb-12">
            <h3 className="text-2xl font-black dark:text-white text-slate-800 border-r-6 border-blue-600 pr-5">توزيع الحمولة الإدارية</h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">إحصائيات الجلسة الحالية</span>
          </div>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(100, 116, 139, 0.1)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} orientation="right" tick={{fill: '#64748b', fontSize: 11}} />
                <Tooltip 
                  cursor={{fill: 'rgba(59, 130, 246, 0.05)'}}
                  contentStyle={{borderRadius: '2rem', border: 'none', boxShadow: '0 30px 60px -15px rgba(0,0,0,0.5)', textAlign: 'right', background: '#0f172a', color: '#fff', padding: '1.5rem'}}
                  labelStyle={{fontWeight: 'black', marginBottom: '0.5rem', fontSize: '14px'}}
                />
                <Bar dataKey="count" radius={[15, 15, 0, 0]} name="عدد المستندات">
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="dark:bg-slate-900 bg-white p-12 rounded-[4rem] shadow-sm border dark:border-slate-800 border-slate-100 flex flex-col">
          <h3 className="text-2xl font-black dark:text-white text-slate-800 mb-12 border-r-6 border-emerald-500 pr-5">جودة التحقق الرقمي</h3>
          <div className="h-64 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'مطابقة تامة', value: 85 },
                    { name: 'مراجعة ثانوية', value: 10 },
                    { name: 'تصحيح آلي', value: 5 },
                  ]}
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={10}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#3b82f6" />
                  <Cell fill="#f59e0b" />
                </Pie>
                <Tooltip 
                  contentStyle={{borderRadius: '2rem', border: 'none', textAlign: 'right', background: '#0f172a', color: '#fff'}}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-10 space-y-4">
             <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-400">معدل الخطأ الهامشي</span>
                <span className="text-emerald-500">٠.٠٢٪</span>
             </div>
             <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[99%]" />
             </div>
          </div>
        </div>
      </div>

      {/* Processing Velocity */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-[4rem] p-16 text-white shadow-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none">
           <div className="w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent"></div>
        </div>
        <div className="relative z-10">
           <div className="flex justify-between items-center mb-16">
              <div>
                 <h3 className="text-3xl font-black tracking-tight mb-2">تسارع المعالجة اللحظي</h3>
                 <p className="text-blue-200 font-bold opacity-60 uppercase text-[10px] tracking-[0.4em]">Processing Velocity Real-time Index</p>
              </div>
              <div className="text-center">
                 <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-1">الذروة الحالية</p>
                 <span className="text-4xl font-black text-emerald-400">٩٤٪</span>
              </div>
           </div>
           
           <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={velocityData}>
                    <defs>
                       <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                    <Tooltip 
                      contentStyle={{borderRadius: '1.5rem', border: 'none', background: '#fff', color: '#000', textAlign: 'right'}}
                    />
                    <Area type="monotone" dataKey="val" stroke="#60a5fa" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
