
import React from 'react';
import { AppView } from '../types.ts';

interface SidebarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  darkMode: boolean;
}

const Sidebar: React.FC<SidebarProps> = React.memo(({ currentView, setView, darkMode }) => {
  const menuItems = [
    { id: AppView.DASHBOARD, label: 'لوحة التحكم المركزية', icon: '🏛️' },
    { id: AppView.DATABASE, label: 'المستودع الرقمي الآمن', icon: '🛡️' },
    { id: AppView.PROCESSING, label: 'مركز مراجعة البيانات', icon: '🔍' },
    { id: AppView.CLEANING, label: 'وحدة جودة البيانات', icon: '✨' },
    { id: AppView.SEARCH, label: 'البحث الدلالي العميق', icon: '🌐' },
    { id: AppView.CLASSIFICATION, label: 'الهيكلية التنظيمية', icon: '📂' },
    { id: AppView.ANALYTICS, label: 'الذكاء الاستراتيجي', icon: '📊' },
    { id: AppView.SETTINGS, label: 'إعدادات النظام السيادي', icon: '⚙️' },
    { id: AppView.TECHNICAL_SPEC, label: 'المعايير التقنية', icon: '📜' },
  ];

  return (
    <aside className={`w-85 flex flex-col h-full shrink-0 border-l relative z-20 transition-all duration-500 shadow-2xl ${darkMode ? 'bg-slate-900 border-white/5' : 'bg-[#0f172a] border-black/5'}`} dir="rtl">
      {/* Header Branding */}
      <div className={`p-10 flex flex-col border-b transition-colors duration-500 ${darkMode ? 'border-white/5 bg-slate-950/30' : 'border-white/5 bg-slate-900/20'}`}>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-blue-600/20">🇮🇶</div>
             <div>
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">جمهورية العراق</p>
                <p className="text-[11px] font-bold text-slate-400 uppercase leading-tight">وزارة الاتصالات</p>
             </div>
          </div>
          <h2 className="text-white text-lg font-black tracking-tight leading-tight text-right mt-4">نظام IntelliOCR الوطني</h2>
          <div className="flex items-center gap-2 mt-2">
             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
             <p className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-md ${darkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-white/5 text-blue-300'}`}>
               ITPC - مديرية المعلوماتية
             </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6 py-10 space-y-2 overflow-y-auto scrollbar-hide">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center px-6 py-4 text-sm font-bold rounded-[1.5rem] transition-all duration-300 gap-4 group relative overflow-hidden ${
              currentView === item.id 
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/40 translate-x-1' 
                : 'hover:bg-white/5 hover:text-white text-slate-400'
            }`}
          >
            {currentView === item.id && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/50 to-transparent pointer-events-none"></div>
            )}
            <span className={`text-xl transition-transform duration-300 ${currentView === item.id ? 'scale-110' : 'group-hover:scale-110 opacity-70 group-hover:opacity-100'}`}>
              {item.icon}
            </span>
            <span className="flex-1 text-right relative z-10">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* User & Security Footer */}
      <div className={`p-8 border-t transition-colors duration-500 ${darkMode ? 'border-white/5 bg-slate-950/20' : 'border-white/5 bg-slate-900/10'}`}>
        <div className={`rounded-2xl p-5 mb-4 flex flex-col gap-1 ${darkMode ? 'bg-white/5' : 'bg-white/5'}`}>
           <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">التشفير النشط: AES-256</span>
           <p className="text-[10px] text-blue-500 font-bold">Secure Gateway Active</p>
        </div>

        <div className="flex items-center gap-4 p-2">
           <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-600 flex items-center justify-center text-white font-black shadow-lg">
              IT
           </div>
           <div className="flex-1 overflow-hidden">
              <p className="text-white text-xs font-black truncate">المسؤول التقني</p>
              <p className="text-slate-500 text-[9px] uppercase tracking-tighter">ITPC Iraq</p>
           </div>
        </div>
      </div>
    </aside>
  );
});

export default Sidebar;
