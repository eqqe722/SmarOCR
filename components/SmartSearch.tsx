
import React, { useState } from 'react';
import { DocumentData, SearchResult } from '../types.ts';
import { semanticSearchAI } from '../services/geminiService.ts';

interface SmartSearchProps {
  docs: DocumentData[];
}

const SmartSearch: React.FC<SmartSearchProps> = ({ docs }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    const aiResults = await semanticSearchAI(query, docs);
    setResults(aiResults);
    setIsSearching(false);
  };

  return (
    <div className="flex flex-col h-full space-y-10" dir="rtl">
      <div className="p-2 pb-0 space-y-10">
        <div className="flex justify-between items-center px-4">
           <div>
              <h2 className="text-4xl font-black dark:text-white text-slate-900">مركز استرجاع المعلومات الذكي</h2>
              <p className="dark:text-slate-400 text-slate-500 font-medium">البحث الدلالي في محتوى الأرشيف الرقمي باستخدام الذكاء الاصطناعي.</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { label: 'إجمالي الأرشيف الرقمي', value: docs.length },
             { label: 'عمليات البحث اليوم', value: '٢٤' },
             { label: 'التصنيفات المتاحة', value: '١٢' }
           ].map((stat, i) => (
             <div key={i} className="dark:bg-slate-900 bg-white p-10 rounded-[2.5rem] border dark:border-slate-800 border-slate-100 shadow-sm space-y-1">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
               <h4 className="text-4xl font-black dark:text-white text-slate-800">{stat.value}</h4>
             </div>
           ))}
        </div>
      </div>

      <div className="flex flex-1 gap-10 overflow-hidden">
        {/* Main Search */}
        <div className="flex-1 space-y-8 flex flex-col overflow-hidden px-4">
           <form onSubmit={handleSearch} className="relative">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث عن أي معلومة داخل المستندات (مثال: العقود المبرمة مع شركة...)"
                className="w-full dark:bg-slate-900 bg-white px-10 py-6 rounded-[2rem] border dark:border-slate-800 border-slate-200 outline-none shadow-xl transition-all text-lg font-bold"
              />
              <button type="submit" className="absolute left-6 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-10 py-3 rounded-2xl font-black text-sm uppercase shadow-lg shadow-blue-600/30">بدء البحث</button>
           </form>

           <div className="flex justify-between items-center text-slate-400 px-4">
              <p className="text-xs font-black uppercase tracking-widest">عدد النتائج المتطابقة: {results.length}</p>
           </div>

           <div className="flex-1 overflow-y-auto space-y-4 scrollbar-hide pb-10">
              {isSearching ? (
                 <div className="h-full flex items-center justify-center">
                    <p className="text-xl font-black text-blue-500 animate-pulse">جاري تحليل الأرشيف ذكياً...</p>
                 </div>
              ) : results.length > 0 ? (
                results.map((res, i) => (
                  <div key={i} className="dark:bg-slate-900 bg-white p-8 rounded-[2rem] border dark:border-slate-800 border-slate-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer">
                     <div className="flex justify-between items-start mb-4">
                        <h4 className="font-black text-blue-600 text-xl underline decoration-blue-100 underline-offset-8 decoration-2">{res.fileName}</h4>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">نسبة التطابق {Math.round(res.matchScore * 100)}%</span>
                     </div>
                     <p className="text-slate-600 dark:text-slate-400 text-sm leading-loose font-medium line-clamp-3 italic">
                        "{res.snippet}"
                     </p>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center dark:text-slate-700 text-slate-300">
                   <p className="font-black text-sm uppercase tracking-widest">لا توجد نتائج بحث لعرضها حالياً</p>
                </div>
              )}
           </div>
        </div>

        {/* Filters */}
        <div className="w-80 dark:bg-slate-900 bg-white rounded-[2.5rem] shadow-sm border dark:border-slate-800 border-slate-100 p-8 space-y-10 shrink-0">
           <h3 className="text-xl font-black dark:text-white text-slate-800 border-r-4 border-blue-600 pr-4">أدوات الفرز</h3>
           
           <div className="space-y-8">
              <div className="space-y-3">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">نطاق تاريخ الإصدار</p>
                 <input type="date" className="w-full dark:bg-slate-800 bg-slate-50 rounded-xl py-4 px-6 text-sm font-bold dark:text-white text-slate-600 outline-none" />
              </div>

              <div className="space-y-3">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">نوع المجلد</p>
                 <select className="w-full dark:bg-slate-800 bg-slate-50 rounded-xl py-4 px-6 text-sm font-bold dark:text-white text-slate-600 outline-none cursor-pointer">
                    <option>كافة السجلات</option>
                    <option>الكتب الرسمية</option>
                    <option>العقود والاتفاقيات</option>
                    <option>المخاطبات الداخلية</option>
                 </select>
              </div>
           </div>

           <div className="pt-6">
              <button className="w-full bg-slate-900 dark:bg-white dark:text-black text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-slate-900/20">تحديث نتائج البحث</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SmartSearch;
