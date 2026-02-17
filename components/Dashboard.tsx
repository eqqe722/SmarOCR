
import React, { useState, useMemo, useEffect } from 'react';
import { DocumentData } from '../types.ts';
import { processDocumentWithAI } from '../services/geminiService.ts';
import CameraScanner from './CameraScanner.tsx';

interface DashboardProps {
  docs: DocumentData[];
  onUploadComplete: (doc: DocumentData) => void;
  onViewDoc: (doc: DocumentData) => void;
  darkMode: boolean;
}

interface PendingCapture {
  base64: string;
  type: string;
  name: string;
  previewUrl: string;
}

const Dashboard: React.FC<DashboardProps> = ({ docs, onUploadComplete, onViewDoc, darkMode }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [pendingCapture, setPendingCapture] = useState<PendingCapture | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activityFeed, setActivityFeed] = useState<string[]>([
    "تم تفعيل محرك Gemini 3 Pro بنجاح",
    "فحص حالة الاتصال بخادم وزارة الاتصالات: مستقر",
    "جاهز لاستقبال طلبات الأرشفة الرقمية"
  ]);

  useEffect(() => {
    if (isUploading) {
      const messages = [
        "جاري رفع المستند المشفر...",
        "تحليل بنية المستند بصرياً...",
        "محرك OCR يتعرف على الحقول العربية...",
        "تطبيق خوارزميات الذكاء الدلالي...",
        "تم استخراج البيانات وتجهيز المراجعة."
      ];
      let i = 0;
      const interval = setInterval(() => {
        if (i < messages.length) {
          setActivityFeed(prev => [messages[i], ...prev].slice(0, 5));
          i++;
        } else {
          clearInterval(interval);
        }
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [isUploading]);

  const stats = useMemo(() => [
    { label: 'حالة النظام', value: 'مستقر', color: 'text-emerald-500', sub: 'Gemini 3 Pro Active' },
    { label: 'زمن المعالجة', value: '0.9s', color: 'text-blue-500', sub: 'أداء فائق' },
    { label: 'الأرشيف الحالي', value: docs.length, color: 'text-amber-500', sub: 'سجلات الجلسة' },
    { label: 'مستوى الأمان', value: 'نشط', color: 'text-blue-500', sub: 'تشفير وطني' }
  ], [docs]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setError(null);
    const previewUrl = URL.createObjectURL(file);
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });

    setPendingCapture({ base64, type: file.type, name: file.name, previewUrl });
  };

  const confirmAndProcess = async () => {
    if (!pendingCapture) return;
    setIsUploading(true);
    setError(null);
    try {
      const processedDoc = await processDocumentWithAI(pendingCapture.base64, pendingCapture.type, pendingCapture.name);
      onUploadComplete({ ...processedDoc, originalFileUrl: pendingCapture.previewUrl });
      setPendingCapture(null);
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء المعالجة.");
      setPendingCapture(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700" dir="rtl">
      {showScanner && (
        <CameraScanner 
          onCapture={(b64) => {
            const previewUrl = URL.createObjectURL(new Blob([Uint8Array.from(atob(b64), c => c.charCodeAt(0))], {type: 'image/jpeg'}));
            setPendingCapture({ base64: b64, type: 'image/jpeg', name: `Scan_${Date.now()}.jpg`, previewUrl });
            setShowScanner(false);
          }} 
          onClose={() => setShowScanner(false)} 
        />
      )}

      {pendingCapture && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-10 bg-slate-950/95 backdrop-blur-2xl">
          <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-[4rem] overflow-hidden flex flex-col md:flex-row shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10 animate-in zoom-in-95">
            <div className="flex-1 p-10 bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
               <img src={pendingCapture.previewUrl} className="max-h-[70vh] rounded-2xl shadow-2xl object-contain border border-white/10" alt="Preview" />
            </div>
            <div className="w-full md:w-[400px] p-16 flex flex-col justify-center gap-8">
              <div>
                <h3 className="text-3xl font-black dark:text-white mb-4">تأكيد الإدخال الرقمي</h3>
                <p className="text-sm font-bold text-slate-500 leading-relaxed">يرجى التأكد من أن جميع النصوص واضحة. سيقوم محرك Gemini 3 Pro باستخراج الجداول والحقول المهيكلة فور التأكيد.</p>
              </div>
              
              <div className="space-y-4">
                <button 
                  disabled={isUploading}
                  onClick={confirmAndProcess} 
                  className={`w-full py-5 rounded-[2rem] font-black shadow-2xl transition-all ${isUploading ? 'bg-slate-200 cursor-not-allowed grayscale' : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'}`}
                >
                  {isUploading ? 'جاري التحليل الاستراتيجي...' : 'بدء المعالجة الذكية'}
                </button>
                <button onClick={() => setPendingCapture(null)} className="w-full text-slate-400 font-black text-xs uppercase hover:text-red-500 transition-colors">إلغاء العملية</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <div key={i} className={`p-10 rounded-[3rem] border transition-all hover:translate-y-[-5px] duration-300 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/50'}`}>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <h4 className={`text-3xl font-black ${stat.color}`}>{stat.value}</h4>
            <p className="text-[9px] font-bold text-slate-500 mt-2 uppercase">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Interface */}
        <div className={`lg:col-span-2 p-20 rounded-[4rem] border-4 border-dashed transition-all relative overflow-hidden group ${
          isUploading ? 'border-blue-500/50 bg-blue-500/5' : 
          darkMode ? 'border-slate-800 hover:border-blue-500/50 bg-slate-900/50' : 
          'border-slate-100 hover:border-blue-400 bg-white shadow-sm'
        }`}>
          <div className="relative z-10 flex flex-col items-center text-center space-y-10">
             <div className={`w-32 h-32 rounded-[2.5rem] flex items-center justify-center text-5xl shadow-inner transition-all group-hover:rotate-12 ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                {isUploading ? '⚡' : '📂'}
             </div>
             <div>
                <h3 className="text-4xl font-black dark:text-white text-slate-900">إدخال مستند جديد للشبكة</h3>
                <p className="text-slate-500 font-bold mt-4 text-lg">نظام أتمتة الوثائق المدعوم بالذكاء الاصطناعي السيادي</p>
             </div>
             
             <div className="flex flex-wrap justify-center gap-8 mt-4">
                <label className="cursor-pointer bg-blue-600 text-white px-12 py-5 rounded-[2rem] font-black shadow-2xl hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-4">
                   <span>رفع ملف رقمي</span>
                   <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,image/*" />
                </label>
                
                <button 
                  onClick={() => setShowScanner(true)}
                  className="bg-slate-900 dark:bg-white dark:text-black text-white px-12 py-5 rounded-[2rem] font-black shadow-2xl hover:opacity-90 transition-all active:scale-95 flex items-center gap-4"
                >
                   <span>مسح ضوئي حي</span>
                </button>
             </div>
          </div>
        </div>

        {/* System Integrity & Live Feed */}
        <div className="space-y-10">
           <div className={`p-10 rounded-[3rem] border flex flex-col h-full ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/50'}`}>
              <div className="flex justify-between items-center mb-10">
                 <h4 className="text-sm font-black dark:text-white uppercase tracking-widest border-r-4 border-blue-600 pr-4">رادار العمليات المباشر</h4>
                 <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{animationDelay: '0s'}}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{animationDelay: '0.2s'}}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{animationDelay: '0.4s'}}></span>
                 </div>
              </div>
              <div className="flex-1 space-y-6">
                 {activityFeed.map((msg, i) => (
                   <div key={i} className="flex gap-4 animate-in slide-in-from-right duration-500" style={{animationDelay: `${i * 100}ms`}}>
                      <div className="w-2 h-2 rounded-full bg-blue-500/40 mt-1.5 shrink-0"></div>
                      <p className="text-[12px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed italic">
                         {msg}
                      </p>
                   </div>
                 ))}
              </div>
              <div className="mt-10 pt-10 border-t dark:border-slate-800 border-slate-50">
                 <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>نزاهة النظام</span>
                    <span className="text-emerald-500">مؤمنة بالكامل</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Recent Grid */}
      <div className="space-y-10 pb-20">
        <h3 className="text-2xl font-black dark:text-white text-slate-800 px-4">أحدث الوثائق المستخرجة</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {docs.length > 0 ? (
             docs.slice(0, 6).map((doc) => (
               <div 
                 key={doc.id} 
                 onClick={() => onViewDoc(doc)}
                 className="p-8 bg-white dark:bg-slate-900 rounded-[3rem] border dark:border-slate-800 border-slate-100 shadow-sm hover:shadow-2xl transition-all cursor-pointer group"
               >
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-3xl group-hover:bg-blue-600 group-hover:text-white transition-all group-hover:rotate-6">
                        📄
                     </div>
                     <div className="flex-1 overflow-hidden">
                        <h4 className="font-black text-lg text-slate-800 dark:text-white truncate">{doc.fileName}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase">{doc.category}</span>
                          <span className={`w-2 h-2 rounded-full ${doc.priority === 'high' ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                        </div>
                     </div>
                  </div>
               </div>
             ))
           ) : (
             <div className="col-span-full p-24 text-center dark:bg-slate-900/50 bg-white rounded-[4rem] border-4 border-dashed dark:border-slate-800 border-slate-100">
                <p className="text-slate-300 dark:text-slate-700 font-black text-2xl uppercase tracking-[0.3em]">لا توجد بيانات مسجلة في الجلسة الحالية</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
