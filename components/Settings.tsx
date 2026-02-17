
import React, { useState } from 'react';

interface SettingsProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

const Settings: React.FC<SettingsProps> = ({ darkMode, setDarkMode }) => {
  const [model, setModel] = useState('gemini-3-pro-preview');
  const [backupFreq, setBackupFreq] = useState('daily');
  const [encryptionLevel, setEncryptionLevel] = useState('AES-256-GCM');

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20" dir="rtl">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">إعدادات النظام السيادي</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium italic">تكوين بروتوكولات الذكاء الاصطناعي ومعايير الأمان الوطنية.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* AI Engine Settings */}
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border dark:border-slate-800 border-slate-100 shadow-sm space-y-8">
           <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-2xl">🤖</div>
              <h3 className="text-xl font-black dark:text-white">محرك الذكاء الاصطناعي</h3>
           </div>
           
           <div className="space-y-4">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">إصدار النموذج النشط</label>
              <select 
                value={model} 
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-xl font-bold text-sm outline-none border-none cursor-pointer"
              >
                <option value="gemini-3-pro-preview">Gemini 3 Pro (أعلى دقة للمستندات المعقدة)</option>
                <option value="gemini-3-flash-preview">Gemini 3 Flash (أداء فائق السرعة)</option>
                <option value="custom-itpc-v1">ITPC-Custom-OCR-v1 (نموذج محلي خاص)</option>
              </select>
           </div>

           <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/10">
              <p className="text-xs font-bold text-blue-600 leading-relaxed">
                ملاحظة: النماذج الاحترافية تتطلب اتصالاً مستقراً بخوادم Gemini API لضمان جودة الاستخراج الدلالي.
              </p>
           </div>
        </div>

        {/* Security & Backup Settings */}
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border dark:border-slate-800 border-slate-100 shadow-sm space-y-8">
           <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-emerald-600/10 rounded-2xl flex items-center justify-center text-2xl">🛡️</div>
              <h3 className="text-xl font-black dark:text-white">الأمان والنسخ الاحتياطي</h3>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">تردد النسخ التلقائي</label>
                 <select 
                    value={backupFreq} 
                    onChange={(e) => setBackupFreq(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-xl font-bold text-sm outline-none border-none"
                 >
                    <option value="hourly">كل ساعة</option>
                    <option value="daily">يومياً (موصى به)</option>
                    <option value="weekly">أسبوعياً</option>
                 </select>
              </div>
              <div className="space-y-3">
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">معيار التشفير</label>
                 <input 
                    type="text" 
                    readOnly 
                    value={encryptionLevel}
                    className="w-full bg-slate-100 dark:bg-slate-800 p-4 rounded-xl font-bold text-sm text-slate-400"
                 />
              </div>
           </div>

           <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
              <span className="text-xs font-black dark:text-white">تفعيل سجل التدقيق (Audit Logs)</span>
              <div className="w-12 h-6 bg-emerald-500 rounded-full flex items-center px-1 shadow-inner">
                 <div className="w-4 h-4 bg-white rounded-full translate-x-6"></div>
              </div>
           </div>
        </div>

        {/* Interface Settings */}
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border dark:border-slate-800 border-slate-100 shadow-sm space-y-8">
           <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-amber-600/10 rounded-2xl flex items-center justify-center text-2xl">🎨</div>
              <h3 className="text-xl font-black dark:text-white">تخصيص الواجهة</h3>
           </div>

           <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">نمط العرض الافتراضي</p>
              <div className="flex gap-4">
                 <button 
                   onClick={() => setDarkMode(false)}
                   className={`flex-1 p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${!darkMode ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 dark:border-slate-800'}`}
                 >
                    <span className="text-2xl">☀️</span>
                    <span className="text-xs font-black">الوضع النهاري</span>
                 </button>
                 <button 
                   onClick={() => setDarkMode(true)}
                   className={`flex-1 p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${darkMode ? 'border-blue-600 bg-blue-900/20' : 'border-slate-100 dark:border-slate-800'}`}
                 >
                    <span className="text-2xl">🌙</span>
                    <span className="text-xs font-black">الوضع الليلي</span>
                 </button>
              </div>
           </div>
        </div>

        {/* System Info */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-10 rounded-[3rem] text-white flex flex-col justify-between">
           <div className="space-y-2">
              <h3 className="text-xl font-black">معلومات النظام</h3>
              <p className="text-slate-400 text-xs font-medium">نظام IntelliOCR v2.5.0-Release</p>
           </div>
           
           <div className="space-y-4 mt-10">
              <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                 <span>حالة الخادم المحلي</span>
                 <span className="text-emerald-500">متصل (Online)</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                 <div className="w-full h-full bg-emerald-500"></div>
              </div>
              
              <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                 <span>استهلاك الذاكرة</span>
                 <span>١٢٨ ميجابايت</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                 <div className="w-1/4 h-full bg-blue-500"></div>
              </div>
           </div>

           <button className="w-full mt-10 py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">تحديث النظام</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
