
import React, { useState, useEffect } from 'react';
import { DBRecord, AuditEntry, BackupRecord } from '../types.ts';
import { databaseService } from '../services/databaseService.ts';
import { backupService } from '../services/backupService.ts';

const DatabaseView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'records' | 'audit' | 'backup'>('records');
  const [records, setRecords] = useState<DBRecord[]>([]);
  const [audits, setAudits] = useState<AuditEntry[]>([]);
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('كافة التصنيفات');
  const [isBackingUp, setIsBackingUp] = useState(false);

  useEffect(() => {
    loadData();
  }, [searchQuery, filterCategory, activeTab]);

  const loadData = () => {
    if (activeTab === 'records') {
      let data = databaseService.search(searchQuery);
      if (filterCategory !== 'كافة التصنيفات') {
        data = data.filter(r => r.category === filterCategory);
      }
      setRecords(data);
    } else if (activeTab === 'audit') {
      setAudits(databaseService.getAuditLogs());
    } else {
      setBackups(backupService.getBackupHistory());
    }
  };

  const triggerManualBackup = async (type: 'incremental' | 'full') => {
    setIsBackingUp(true);
    await backupService.performBackup(type);
    loadData();
    setIsBackingUp(false);
  };

  const categories = ['كافة التصنيفات', ...Array.from(new Set(databaseService.getAllRecords().map(r => r.category)))];

  return (
    <div className="space-y-8 animate-in fade-in duration-500" dir="rtl">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">مستودع البيانات المهيكل</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">الأرشيف الرقمي المعتمد لمديرية تكنولوجيا المعلومات - وزارة الاتصالات</p>
        </div>
        
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border dark:border-slate-700">
          <button 
            onClick={() => setActiveTab('records')}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'records' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xl' : 'text-slate-400'}`}
          >
            السجلات المهيكلة
          </button>
          <button 
            onClick={() => setActiveTab('backup')}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'backup' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xl' : 'text-slate-400'}`}
          >
            النسخ والتعافي
          </button>
          <button 
            onClick={() => setActiveTab('audit')}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'audit' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xl' : 'text-slate-400'}`}
          >
            سجل التدقيق
          </button>
        </div>
      </div>

      {activeTab === 'records' && (
        <>
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border dark:border-slate-800 border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1 relative">
               <input 
                 type="text" 
                 placeholder="بحث في الحقول المهيكلة (رقم الكتاب، الجهة المصدرة، المحتوى)..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-12 outline-none font-bold text-slate-700 dark:text-white"
               />
               <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30">🔍</div>
            </div>
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 py-4 font-bold text-sm outline-none border-none cursor-pointer"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button 
              onClick={() => databaseService.exportDatabase()}
              className="bg-slate-900 dark:bg-white dark:text-black text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase shadow-xl hover:opacity-90 transition-all flex items-center gap-2"
            >
              <span>تصدير الأرشيف</span>
              <span>📥</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[3rem] border dark:border-slate-800 border-slate-100 overflow-hidden shadow-2xl">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-700">
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">المعرف الرقمي</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">عنوان الوثيقة</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">القسم الإداري</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">البيانات الجوهرية</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">تاريخ الأرشفة</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">العمليات</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-800 divide-slate-100">
                {records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                    <td className="p-6">
                      <span className="font-black text-blue-600 dark:text-blue-400 text-xs tracking-tighter">{rec.id}</span>
                    </td>
                    <td className="p-6">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{rec.fileName}</div>
                      <div className="text-[10px] text-slate-400">كود: {rec.docId.slice(0,8)}</div>
                    </td>
                    <td className="p-6">
                      <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-black text-slate-500">{rec.category}</span>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-wrap gap-2 max-w-xs">
                        {Object.entries(rec.mainFields).slice(0, 3).map(([k, v]) => (
                          <div key={k} className="text-[9px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-800">
                            <span className="font-black">{k}:</span> {v}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-6 text-xs font-medium text-slate-500">
                      {new Date(rec.createdAt).toLocaleDateString('ar-IQ')}
                    </td>
                    <td className="p-6">
                      <div className="flex gap-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <button title="عرض السجل" className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg text-blue-600">👁️</button>
                         <button title="حذف السجل" onClick={() => {
                           databaseService.deleteRecord(rec.id);
                           loadData();
                         }} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-red-500">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-32 text-center text-slate-300 dark:text-slate-700 italic font-black text-xl uppercase tracking-widest">
                       لا توجد سجلات مطابقة حالياً
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'backup' && (
        <div className="space-y-8">
           <div className="bg-blue-600 p-12 rounded-[3.5rem] text-white flex flex-col md:flex-row justify-between items-center gap-10 shadow-2xl relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                 <h3 className="text-3xl font-black leading-tight">مركز حماية البيانات والتعافي</h3>
                 <p className="text-blue-100 font-bold max-w-xl">
                   يتم تنفيذ نسخ احتياطي تراكمي يومياً (Incremental) ونسخ احتياطي كامل أسبوعياً (Full). جميع البيانات مشفرة باستخدام معيار AES-256-GCM عالي الأمان.
                 </p>
                 <div className="flex gap-4 pt-4">
                    <button 
                      onClick={() => triggerManualBackup('full')}
                      disabled={isBackingUp}
                      className="bg-white text-blue-600 px-8 py-3 rounded-2xl font-black text-[10px] uppercase shadow-xl hover:scale-105 transition-all"
                    >
                      {isBackingUp ? 'جاري النسخ...' : 'بدء نسخة كاملة يدوياً'}
                    </button>
                    <button 
                      onClick={() => triggerManualBackup('incremental')}
                      disabled={isBackingUp}
                      className="bg-blue-800 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase shadow-xl hover:scale-105 transition-all"
                    >
                      نسخة تراكمية فورية
                    </button>
                 </div>
              </div>
              <div className="text-8xl opacity-20 pointer-events-none">🛡️</div>
           </div>

           <div className="bg-white dark:bg-slate-900 rounded-[3rem] border dark:border-slate-800 border-slate-100 overflow-hidden shadow-xl">
              <div className="p-8 border-b dark:border-slate-800 flex justify-between items-center">
                 <h4 className="text-sm font-black dark:text-white uppercase tracking-widest">تاريخ النسخ الاحتياطي</h4>
                 <span className="text-[10px] font-black text-slate-400">التشفير: AES-256 السيادي</span>
              </div>
              <table className="w-full text-right">
                 <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50">
                       <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">معرف النسخة</th>
                       <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">النوع</th>
                       <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">الحجم المشفر</th>
                       <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">التوقيت</th>
                       <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">الحالة</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y dark:divide-slate-800">
                    {backups.map(bk => (
                       <tr key={bk.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                          <td className="p-6 font-black text-slate-700 dark:text-slate-300 text-xs">{bk.id}</td>
                          <td className="p-6">
                             <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${bk.type === 'full' ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                {bk.type === 'full' ? 'كاملة' : 'تراكمية'}
                             </span>
                          </td>
                          <td className="p-6 text-xs font-bold text-slate-500">{(bk.size / 1024).toFixed(2)} KB</td>
                          <td className="p-6 text-xs font-medium text-slate-500">{new Date(bk.timestamp).toLocaleString('ar-IQ')}</td>
                          <td className="p-6">
                             <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                <span className="text-[10px] font-black text-emerald-600 uppercase">ناجح</span>
                             </div>
                          </td>
                       </tr>
                    ))}
                    {backups.length === 0 && (
                       <tr>
                          <td colSpan={5} className="p-20 text-center text-slate-300 dark:text-slate-700 italic font-black uppercase tracking-widest">لا توجد نسخ احتياطية مسجلة</td>
                       </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-slate-900 rounded-[3rem] border border-slate-800 overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
             <h3 className="text-white font-black uppercase tracking-widest text-sm border-r-4 border-blue-600 pr-4">سجل العمليات والرقابة (Audit Logs)</h3>
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">المستوى: تدقيق مؤسسي كامل</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-800/50">
                  <th className="p-6 text-slate-400 font-black uppercase tracking-widest">الطابع الزمني</th>
                  <th className="p-6 text-slate-400 font-black uppercase tracking-widest">المستخدم</th>
                  <th className="p-6 text-slate-400 font-black uppercase tracking-widest">الإجراء</th>
                  <th className="p-6 text-slate-400 font-black uppercase tracking-widest">التفاصيل الفنية</th>
                  <th className="p-6 text-slate-400 font-black uppercase tracking-widest text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {audits.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-6 font-mono text-slate-500">
                      {new Date(log.timestamp).toLocaleString('ar-IQ')}
                    </td>
                    <td className="p-6 font-bold text-slate-300">{log.user}</td>
                    <td className="p-6">
                      <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-lg font-black uppercase text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-6 text-slate-400 max-w-md italic">{log.details}</td>
                    <td className="p-6 text-center">
                      <span className={`w-3 h-3 rounded-full inline-block ${
                        log.severity === 'critical' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' :
                        log.severity === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}></span>
                    </td>
                  </tr>
                ))}
                {audits.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-32 text-center text-slate-700 font-black text-xl uppercase tracking-widest">
                       لا توجد سجلات تدقيق حالياً
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseView;
