
import React, { useState } from 'react';
import { DocumentData } from '../types.ts';

interface ClassificationProps {
  docs: DocumentData[];
}

const Classification: React.FC<ClassificationProps> = ({ docs }) => {
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const derivedCategories = Array.from(new Set(docs.map(d => d.category || 'غير مصنف')));
  const allCategories = Array.from(new Set([...derivedCategories, ...customCategories]));

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newCategoryName.trim();
    if (trimmedName && !allCategories.includes(trimmedName)) {
      setCustomCategories(prev => [...prev, trimmedName]);
      setNewCategoryName('');
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-10" dir="rtl">
      <div className="flex flex-col space-y-2">
         <h2 className="text-3xl font-black text-slate-900">بنية الأرشفة المؤسسية</h2>
         <p className="text-slate-500 font-medium text-lg">تنظيم المستندات حسب الإدارات والأقسام التابعة لوزارة الاتصالات.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {allCategories.map((cat, idx) => {
          const catDocs = docs.filter(d => (d.category || 'غير مصنف') === cat);
          
          return (
            <div key={idx} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden group hover:shadow-xl transition-all duration-500">
              <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
                <h3 className="font-black text-base tracking-tight uppercase">{cat}</h3>
                <span className="text-xs font-black bg-blue-600 px-4 py-1.5 rounded-full">{catDocs.length} ملف</span>
              </div>
              <div className="p-8 space-y-4 min-h-[160px]">
                {catDocs.length > 0 ? (
                  catDocs.map(doc => (
                    <div key={doc.id} className="p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-blue-200 transition-all cursor-pointer">
                      <span className="text-sm font-black text-slate-700 block">{doc.fileName}</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase mt-1 block">رقم السجل: #{doc.id.slice(0,5)}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full py-10">
                    <p className="text-center text-slate-300 text-xs font-black uppercase tracking-widest">لا توجد بيانات متاحة</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-center group hover:border-blue-400 transition-all"
        >
          <span className="text-base font-black text-slate-800 uppercase tracking-widest">+ إضافة تصنيف جديد</span>
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div 
            className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="relative bg-white rounded-[3rem] w-full max-w-lg p-12 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="mb-10">
                <h3 className="text-2xl font-black text-slate-800">تعريف قسم جديد</h3>
                <p className="text-slate-400 text-sm font-bold mt-2">أدخل المسمى الوظيفي للقسم أو نوع المستندات الجديد.</p>
            </div>
            
            <form onSubmit={handleAddCategory} className="space-y-8">
              <input 
                autoFocus
                type="text" 
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="اسم التصنيف..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-slate-800 font-bold outline-none"
              />
              
              <div className="flex gap-4">
                <button 
                  type="submit"
                  disabled={!newCategoryName.trim()}
                  className="flex-1 bg-blue-600 text-white font-black py-5 rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-600/20 disabled:bg-slate-200"
                >
                  تأكيد الحفظ
                </button>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 bg-slate-100 text-slate-500 font-bold rounded-2xl"
                >
                  إغلاق
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classification;
