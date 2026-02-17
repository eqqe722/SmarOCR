
import React, { useState, useEffect, useRef } from 'react';
import { DocumentData, OCRField } from '../types.ts';

interface OCRProcessorProps {
  doc: DocumentData | null;
  onUpdate: (doc: DocumentData) => void;
  onClean: () => void;
  darkMode: boolean;
}

type ViewMode = 'split' | 'document' | 'data';

const OCRProcessor: React.FC<OCRProcessorProps> = ({ doc, onUpdate, onClean, darkMode }) => {
  const [zoom, setZoom] = useState(0.85);
  const [localFields, setLocalFields] = useState<OCRField[]>([]);
  const [activeTab, setActiveTab] = useState<'fields' | 'tables'>('fields');
  const [hoveredFieldId, setHoveredFieldId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true);

  useEffect(() => {
    if (doc) {
      setLocalFields(doc.fields);
      setIsScanning(true);
      const timer = setTimeout(() => setIsScanning(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [doc?.id]);

  if (!doc) return (
    <div className="h-full flex flex-col items-center justify-center text-center p-12">
       <div className="w-32 h-32 bg-slate-100 dark:bg-slate-800 rounded-[3rem] flex items-center justify-center mb-8 animate-pulse shadow-inner">
          <span className="text-5xl">🔍</span>
       </div>
       <h3 className="text-2xl font-black text-slate-400 uppercase tracking-widest">بانتظار تحليل الوثيقة</h3>
    </div>
  );

  const handleFieldChange = (id: string, value: string) => {
    const updated = localFields.map(f => f.id === id ? { ...f, value } : f);
    setLocalFields(updated);
    onUpdate({ ...doc, fields: updated });
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.9) return 'emerald';
    if (score >= 0.7) return 'amber';
    return 'rose';
  };

  const hoveredField = localFields.find(f => f.id === hoveredFieldId);

  return (
    <div className={`flex flex-col overflow-hidden transition-all duration-500 dark:bg-slate-900 bg-white ${
      isFullScreen ? 'fixed inset-0 z-[500] rounded-none' : 'h-[calc(100vh-180px)] rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-800'
    }`} dir="rtl">
      
      {/* Tool Header */}
      <div className="px-10 py-5 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-6">
          <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-600/20">📄</div>
          <div>
            <h3 className="text-lg font-black dark:text-white">{doc.fileName}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">معالجة استباقية • {doc.category}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-slate-200/50 dark:bg-slate-800 p-1 rounded-2xl flex">
            <button onClick={() => setViewMode('split')} className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all ${viewMode === 'split' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-md' : 'text-slate-400'}`}>عرض مزدوج</button>
            <button onClick={() => setViewMode('document')} className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all ${viewMode === 'document' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-md' : 'text-slate-400'}`}>الوثيقة</button>
            <button onClick={() => setViewMode('data')} className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all ${viewMode === 'data' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-md' : 'text-slate-400'}`}>المحرك</button>
          </div>

          <button 
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${showHeatmap ? 'bg-blue-600/10 text-blue-600 border-blue-600/20' : 'text-slate-400 border-slate-200 dark:border-slate-800'}`}
          >
            خريطة الثقة: {showHeatmap ? 'نشطة' : 'معطلة'}
          </button>
          
          <button onClick={() => setIsFullScreen(!isFullScreen)} className="p-3 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors">⛶</button>
          <button onClick={() => { onUpdate({...doc, fields: localFields}); onClean(); }} className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black shadow-xl hover:bg-emerald-700 transition-colors">اعتماد البيانات</button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Editor Sidebar */}
        {(viewMode === 'split' || viewMode === 'data') && (
          <div className={`${viewMode === 'data' ? 'w-full' : 'w-[480px]'} border-l dark:border-slate-800 flex flex-col bg-slate-50/30 dark:bg-slate-900/30`}>
             <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center">
                <div className="flex gap-2">
                  <button onClick={() => setActiveTab('fields')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${activeTab === 'fields' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>الحقول المستخرجة</button>
                  <button onClick={() => setActiveTab('tables')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${activeTab === 'tables' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>الجداول</button>
                </div>
             </div>

             <div className="flex-1 overflow-y-auto p-8 space-y-4 scrollbar-hide">
                {activeTab === 'fields' ? (
                  localFields.map(field => {
                    const color = getConfidenceColor(field.confidence);
                    return (
                      <div 
                        key={field.id}
                        onMouseEnter={() => setHoveredFieldId(field.id)}
                        onMouseLeave={() => setHoveredFieldId(null)}
                        className={`p-5 rounded-[2rem] border-2 transition-all ${
                          hoveredFieldId === field.id ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' : 'border-transparent bg-white dark:bg-slate-800 shadow-sm'
                        }`}
                      >
                         <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{field.name}</span>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-md bg-${color}-500/10 text-${color}-500 border border-${color}-500/20`}>
                               {Math.round(field.confidence * 100)}% Match
                            </span>
                         </div>
                         <input 
                           type="text" 
                           value={field.value}
                           onChange={(e) => handleFieldChange(field.id, e.target.value)}
                           className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-3 font-bold text-sm focus:ring-2 ring-blue-500 outline-none"
                         />
                      </div>
                    )
                  })
                ) : (
                  doc.tables.map(table => (
                    <div key={table.id} className="space-y-4 mb-10">
                       <h4 className="font-black text-slate-800 dark:text-white px-2 border-r-4 border-blue-600">{table.name}</h4>
                       <div className="rounded-2xl border dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950 shadow-inner">
                          <table className="w-full text-right text-[11px]">
                             <thead className="bg-slate-50 dark:bg-slate-800">
                                <tr>{table.headers.map((h, i) => <th key={i} className="p-3 text-slate-400 font-black">{h}</th>)}</tr>
                             </thead>
                             <tbody className="divide-y dark:divide-slate-800">
                                {table.rows.map((row, rIdx) => (
                                   <tr key={rIdx}>{row.map((cell, cIdx) => <td key={cIdx} className="p-3 font-bold dark:text-slate-300">{cell.value}</td>)}</tr>
                                ))}
                             </tbody>
                          </table>
                       </div>
                    </div>
                  ))
                )}
             </div>
          </div>
        )}

        {/* Document Viewer */}
        {(viewMode === 'split' || viewMode === 'document') && (
          <div className="flex-1 bg-slate-200 dark:bg-slate-950 relative overflow-hidden flex flex-col">
            {/* View Controls Overlay */}
            <div className="absolute bottom-10 left-10 z-20 flex gap-2 bg-white/95 dark:bg-slate-900/95 p-2 rounded-2xl shadow-2xl border border-white/20">
              <button onClick={() => setZoom(Math.max(0.1, zoom - 0.1))} className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-bold">-</button>
              <div className="px-4 flex items-center text-[10px] font-black uppercase dark:text-white">{Math.round(zoom * 100)}%</div>
              <button onClick={() => setZoom(Math.min(3, zoom + 0.1))} className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-bold">+</button>
            </div>

            <div className="flex-1 overflow-auto p-20 scrollbar-hide flex justify-center items-start">
               <div 
                 className="relative shadow-[0_40px_100px_rgba(0,0,0,0.3)] bg-white transition-all duration-300 origin-top"
                 style={{ transform: `scale(${zoom})`, width: '210mm', minHeight: '297mm' }}
               >
                  <img src={doc.originalFileUrl} className="w-full h-auto block select-none" alt="Source" />
                  
                  {/* Heatmap Layer */}
                  {showHeatmap && localFields.map(field => {
                    if (!field.box_2d) return null;
                    const color = getConfidenceColor(field.confidence);
                    const isActive = hoveredFieldId === field.id;
                    
                    return (
                      <div 
                        key={field.id}
                        className={`absolute border-2 transition-all duration-300 ${isActive ? 'z-30 border-blue-600 bg-blue-500/20 ring-4 ring-blue-500/10' : 'z-20 border-transparent bg-' + color + '-500/10'}`}
                        style={{
                          top: `${field.box_2d[0] / 10}%`,
                          left: `${field.box_2d[1] / 10}%`,
                          height: `${(field.box_2d[2] - field.box_2d[0]) / 10}%`,
                          width: `${(field.box_2d[3] - field.box_2d[1]) / 10}%`,
                        }}
                      >
                         {isActive && (
                           <div className="absolute -top-10 right-0 bg-blue-600 text-white text-[9px] px-3 py-1.5 rounded-lg font-black uppercase shadow-xl whitespace-nowrap">
                              {field.name} • {Math.round(field.confidence * 100)}%
                           </div>
                         )}
                      </div>
                    )
                  })}

                  {/* Scanning Effect */}
                  {isScanning && (
                    <div className="absolute inset-0 z-[100] pointer-events-none">
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.8)] animate-[scan_2s_linear_infinite]"></div>
                      <div className="absolute inset-0 bg-blue-500/5 animate-pulse"></div>
                    </div>
                  )}
               </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
};

export default OCRProcessor;
