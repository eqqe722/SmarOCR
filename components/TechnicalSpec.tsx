
import React from 'react';

interface TechnicalSpecProps {
  darkMode: boolean;
}

const TechnicalSpec: React.FC<TechnicalSpecProps> = React.memo(({ darkMode }) => {
  const sections = [
    {
      id: "architecture",
      title: "أولاً: البنية المعمارية الكاملة للنظام",
      subtitle: "نظام Modular Layered Architecture قابل للتوسع",
      content: [
        "1. طبقة الإدخال (Ingestion Layer): معالجة الصور وPDF بذكاء عالي.",
        "2. طبقة المعالجة (Processing Layer): محركات OpenCV وOCR المتقدمة.",
        "3. طبقة الذكاء (Intelligence Layer): معالجة دلالية باستخدام Gemini 3 Pro.",
        "4. طبقة التخزين (Local Storage): قواعد بيانات مهيكلة محلية مشفرة.",
        "5. طبقة البحث (Search Layer): بحث دلالي ونصوص كاملة (FTS).",
        "6. طبقة التفاعل (UI Layer): واجهة عصرية تدعم تعدد اللغات (RTL).",
        "7. طبقة الأمان (Security Layer): سجلات تدقيق (Audit Logs) وتشفير AES-256."
      ]
    },
    {
      id: "functional",
      title: "ثانياً: المتطلبات الوظيفية التفصيلية",
      subtitle: "من المعالجة المسبقة إلى التحليل الهيكلي",
      content: [
        "معالجة الصور: Adaptive Thresholding، Noise Removal، و Perspective Correction.",
        "دعم PDF المتطور: Text-based, Scanned, Hybrid, و Encrypted PDFs.",
        "محرك OCR الذكي: دعم كامل للعربية (Normalization & Post-Correction).",
        "تحليل التخطيط (Layout): كشف العناوين والفقرات والجداول (YOLOv8/LayoutParser).",
        "استخراج الجداول: بناء Grid Logical Model دقيق حتى مع الخلايا المدمجة."
      ]
    },
    {
      id: "storage",
      title: "ثالثاً: نظام التخزين والأمان المحلي",
      subtitle: "خصوصية البيانات والامتثال للمعايير الوطنية",
      content: [
        "تخزين مزدوج: Relational DB للبيانات المهيكلة و Document Store للمخرجات الخام.",
        "قواعد البيانات: دعم PostgreSQL و SQL Server مع Mapping تلقائي للحقول.",
        "النسخ الاحتياطي: بروتوكول Incremental Daily Backup مشفر بـ AES-256.",
        "سجل التدقيق (Audit Trail): نظام غير قابل للتعديل لتتبع كافة الحركات الحساسة."
      ]
    },
    {
      id: "roadmap",
      title: "رابعاً: خارطة الطريق (Technical Roadmap)",
      subtitle: "مراحل التطوير والنمو الاستراتيجي",
      content: [
        "المرحلة 1 (MVP): OCR أساسي عربي/إنجليزي، جداول بسيطة، وتخزين PostgreSQL.",
        "المرحلة 2: تصنيف ذكي (BERT)، Fuzzy Search، وإدارة قوالب المستندات.",
        "المرحلة 3: البحث الدلالي العميق (Semantic Search)، NER، والتعلم من التصحيحات."
      ]
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 text-right" dir="rtl">
      <div className="max-w-[1200px] mx-auto space-y-12">
        
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-slate-900 to-blue-950 p-16 rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 to-transparent blur-3xl"></div>
           </div>
           <div className="relative z-10 flex flex-col items-center text-center space-y-6">
              <div className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-center text-4xl shadow-2xl border border-white/20">
                ⚙️
              </div>
              <h2 className="text-5xl font-black tracking-tight">وثيقة المواصفات الفنية للنظام</h2>
              <p className="text-blue-200 text-lg font-bold max-w-3xl leading-relaxed italic">
                "بناء نظام أرشفة وطني متكامل يعتمد على الذكاء الاصطناعي السيادي، يضمن الأمان، السرعة، والدقة المتناهية في استرجاع المعلومات."
              </p>
           </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
           {sections.map((section) => (
             <div 
               key={section.id} 
               className={`p-12 rounded-[3.5rem] border-4 transition-all hover:scale-[1.02] duration-500 ${
                 darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-50 shadow-xl shadow-slate-200/50'
               }`}
             >
                <div className="mb-8">
                  <h3 className="text-2xl font-black text-blue-600 mb-2">{section.title}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{section.subtitle}</p>
                </div>
                
                <ul className="space-y-5">
                   {section.content.map((item, i) => (
                     <li key={i} className="flex items-start gap-4 group">
                        <span className="w-3 h-3 rounded-full bg-blue-500 mt-2 shrink-0 group-hover:scale-125 transition-transform"></span>
                        <p className={`text-base font-bold leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                           {item}
                        </p>
                     </li>
                   ))}
                </ul>
             </div>
           ))}
        </div>

        {/* Summary Footer */}
        <div className={`p-12 rounded-[4rem] text-center border-2 border-dashed ${darkMode ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
           <p className="font-black text-sm uppercase tracking-[0.4em]">نظام IntelliOCR v2.5 - تم التحديث ليتوافق مع المعايير الوطنية ٢٠٢٥</p>
        </div>
      </div>
    </div>
  );
});

export default TechnicalSpec;
