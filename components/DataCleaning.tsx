
import React, { useState } from 'react';
import { DocumentData, OCRField, CustomCleaningRule } from '../types.ts';
import { cleanDataWithAI } from '../services/geminiService.ts';

interface DataCleaningProps {
  docs: DocumentData[];
  setDocs: React.Dispatch<React.SetStateAction<DocumentData[]>>;
}

const DataCleaning: React.FC<DataCleaningProps> = ({ docs, setDocs }) => {
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleaningStatus, setCleaningStatus] = useState('');
  const [customRules, setCustomRules] = useState<CustomCleaningRule[]>([
    { id: '1', name: 'إزالة التشكيل', pattern: '[\\u064B-\\u0652]', replacement: '', isActive: true },
    { id: '2', name: 'توحيد المسافات', pattern: '\\s+', replacement: ' ', isActive: true }
  ]);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [newRule, setNewRule] = useState({ name: '', pattern: '', replacement: '' });

  const applyLocalRules = (text: string) => {
    let result = text;
    customRules.filter(r => r.isActive).forEach(rule => {
      try {
        const regex = new RegExp(rule.pattern, 'g');
        result = result.replace(regex, rule.replacement);
      } catch (e) {
        console.error(`خطأ في القاعدة: ${rule.name}`, e);
      }
    });
    return result;
  };

  const handleSmartClean = async () => {
    if (docs.length === 0) return;
    setIsCleaning(true);
    setCleaningStatus('جاري تنفيذ بروتوكول التنقية الهجين...');

    try {
      const updatedDocs = await Promise.all(docs.map(async (doc) => {
        // الخطوة 1: تنقية الذكاء الاصطناعي
        const aiCleanedFields = await cleanDataWithAI(doc.fields);
        
        // الخطوة 2: تنقية القواعد الصارمة (Local Regex)
        const locallyCleanedFields = aiCleanedFields.map(field => ({
          ...field,
          value: applyLocalRules(field.value)
        }));

        return { ...doc, fields: locallyCleanedFields };
      }));
      
      setDocs(updatedDocs);
      setCleaningStatus('اكتملت التنقية بنجاح.');
    } catch (error) {
      setCleaningStatus('فشلت العملية.');
    } finally {
      setIsCleaning(false);
      setTimeout(() => setCleaningStatus(''), 4000);
    }
  };

  const addRule = () => {
    if (newRule.name && newRule.pattern) {
      const rule: CustomCleaningRule = {
        id: Math.random().toString(36).substr(2, 9),
        ...newRule,
        isActive: true
      };
      setCustomRules([...customRules, rule]);
      setNewRule({ name: '', pattern: '', replacement: '' });
      setShowRuleModal(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800" dir="rtl">
      {/* Header */}
      <div className="px-10 py-10 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-xl">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">وحدة جودة البيانات</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">تنقية هجينة تعتمد على الذكاء الاصطناعي والقواعد الهيكلية.</p>
        </div>
        <div className="flex gap-4">
           {cleaningStatus && <div className="flex items-center px-6 rounded-2xl bg-blue-500/10 text-blue-600 text-[10px] font-black uppercase">{cleaningStatus}</div>}
           <button 
             onClick={handleSmartClean}
             disabled={isCleaning || docs.length === 0}
             className={`px-10 py-4 rounded-2xl font-black shadow-xl transition-all ${isCleaning ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
           >
             {isCleaning ? 'جاري المعالجة...' : 'بدء التنقية الذكية'}
           </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Rules Sidebar */}
        <div className="w-80 bg-slate-50 dark:bg-slate-950 border-l dark:border-slate-800 p-8 space-y-8 overflow-y-auto">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black dark:text-white border-r-4 border-blue-600 pr-3 uppercase">قواعد Regex مخصصة</h3>
            <button onClick={() => setShowRuleModal(true)} className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black">+</button>
          </div>

          <div className="space-y-4">
             {customRules.map((rule) => (
               <div key={rule.id} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border dark:border-slate-800 shadow-sm group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-black dark:text-white">{rule.name}</span>
                    <button onClick={() => setCustomRules(customRules.filter(r => r.id !== rule.id))} className="text-slate-300 hover:text-red-500 transition-colors">✕</button>
                  </div>
                  <code className="text-[9px] text-blue-500 bg-blue-500/5 px-2 py-1 rounded block truncate">{rule.pattern}</code>
               </div>
             ))}
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 p-12 bg-slate-50 dark:bg-slate-950 overflow-y-auto">
           <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border dark:border-slate-800 overflow-hidden">
              <table className="w-full text-right">
                 <thead className="bg-slate-100/50 dark:bg-slate-800/50">
                    <tr>
                       <th className="p-6 text-[10px] font-black text-slate-400 uppercase">المستند</th>
                       <th className="p-6 text-[10px] font-black text-slate-400 uppercase">تصنيف</th>
                       <th className="p-6 text-[10px] font-black text-slate-400 uppercase">أهم الحقول</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y dark:divide-slate-800">
                    {docs.map((doc, idx) => (
                       <tr key={idx} className="hover:bg-blue-500/5 transition-colors">
                          <td className="p-6">
                             <div className="font-black dark:text-white">{doc.fileName}</div>
                          </td>
                          <td className="p-6">
                             <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase text-slate-500">{doc.category}</span>
                          </td>
                          <td className="p-6">
                             <div className="flex flex-wrap gap-2">
                                {doc.fields.slice(0, 2).map(f => (
                                  <div key={f.id} className="text-[10px] bg-blue-50 dark:bg-slate-800 border dark:border-slate-700 px-3 py-1 rounded-lg">
                                    <span className="font-black text-blue-600">{f.name}:</span> {f.value}
                                  </div>
                                ))}
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </div>

      {/* Rule Modal */}
      {showRuleModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-md bg-slate-950/40">
           <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="p-10 border-b dark:border-slate-800">
                <h3 className="text-2xl font-black dark:text-white">إضافة قاعدة تنقية برمجية</h3>
              </div>
              <div className="p-10 space-y-6">
                 <input 
                   type="text" 
                   placeholder="اسم القاعدة (مثلاً: تنظيف التاريخ)"
                   value={newRule.name}
                   onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                   className="w-full bg-slate-100 dark:bg-slate-800 rounded-2xl px-6 py-4 outline-none font-bold"
                 />
                 <input 
                   type="text" 
                   placeholder="النمط (Regex)"
                   value={newRule.pattern}
                   onChange={(e) => setNewRule({...newRule, pattern: e.target.value})}
                   className="w-full bg-slate-100 dark:bg-slate-800 rounded-2xl px-6 py-4 outline-none font-mono"
                 />
                 <input 
                   type="text" 
                   placeholder="الاستبدال بـ (Replacement)"
                   value={newRule.replacement}
                   onChange={(e) => setNewRule({...newRule, replacement: e.target.value})}
                   className="w-full bg-slate-100 dark:bg-slate-800 rounded-2xl px-6 py-4 outline-none font-bold"
                 />
              </div>
              <div className="p-10 bg-slate-50 dark:bg-slate-950 flex gap-4">
                 <button onClick={addRule} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black">إضافة القاعدة</button>
                 <button onClick={() => setShowRuleModal(false)} className="px-8 bg-white dark:bg-slate-800 text-slate-400 font-bold rounded-2xl">إلغاء</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default DataCleaning;
