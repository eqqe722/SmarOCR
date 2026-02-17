
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppView, DocumentData, Notification } from './types.ts';
import Sidebar from './components/Sidebar.tsx';
import Dashboard from './components/Dashboard.tsx';
import OCRProcessor from './components/OCRProcessor.tsx';
import DataCleaning from './components/DataCleaning.tsx';
import SmartSearch from './components/SmartSearch.tsx';
import Classification from './components/Classification.tsx';
import Analytics from './components/Analytics.tsx';
import DatabaseView from './components/DatabaseView.tsx';
import TechnicalSpec from './components/TechnicalSpec.tsx';
import Settings from './components/Settings.tsx';
import { databaseService } from './services/databaseService.ts';
import { backupService } from './services/backupService.ts';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [processedDocs, setProcessedDocs] = useState<DocumentData[]>([]);
  const [activeDoc, setActiveDoc] = useState<DocumentData | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Initialize backups and clean URLs
  useEffect(() => {
    // Run automated backup checks on start
    backupService.checkAndRunScheduledBackups();

    return () => {
      processedDocs.forEach(doc => {
        if (doc.originalFileUrl && doc.originalFileUrl.startsWith('blob:')) {
          URL.revokeObjectURL(doc.originalFileUrl);
        }
      });
    };
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const addNotification = useCallback((message: string, type: Notification['type'] = 'info') => {
    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      type,
      timestamp: new Date()
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 3));
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
    }, 4000);
  }, []);

  const handleDocumentProcessed = useCallback((doc: DocumentData) => {
    setProcessedDocs(prev => [doc, ...prev]);
    setActiveDoc(doc);
    setCurrentView(AppView.PROCESSING);
    addNotification(`تم التعرف على المستند بنجاح`, 'success');
  }, [addNotification]);

  const updateActiveDocument = useCallback((updatedDoc: DocumentData) => {
    setProcessedDocs(prev => prev.map(d => d.id === updatedDoc.id ? updatedDoc : d));
    setActiveDoc(updatedDoc);
  }, []);

  const archiveToDatabase = useCallback((doc: DocumentData) => {
    databaseService.saveRecord(doc);
    addNotification('تم ترحيل المستند بنجاح', 'success');
    setCurrentView(AppView.DATABASE);
  }, [addNotification]);

  const viewLabels = useMemo(() => ({
    [AppView.DASHBOARD]: 'لوحة التحكم الرئيسية',
    [AppView.PROCESSING]: 'مركز المراجعة الفنية',
    [AppView.CLEANING]: 'منصة تنقية البيانات',
    [AppView.SEARCH]: 'محرك البحث الدلالي',
    [AppView.CLASSIFICATION]: 'الأرشفة والتصنيف الهيكلي',
    [AppView.ANALYTICS]: 'مركز التحليلات الاستراتيجية',
    [AppView.DATABASE]: 'مستودع البيانات المهيكل',
    [AppView.SETTINGS]: 'إعدادات النظام السيادي',
    [AppView.TECHNICAL_SPEC]: 'المواصفات الفنية للنظام'
  }), []);

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard 
          docs={processedDocs} 
          onUploadComplete={handleDocumentProcessed} 
          onViewDoc={(doc) => { setActiveDoc(doc); setCurrentView(AppView.PROCESSING); }}
          darkMode={darkMode}
        />;
      case AppView.PROCESSING:
        return (
          <div className="h-full flex flex-col space-y-4">
             <OCRProcessor 
              doc={activeDoc} 
              onUpdate={updateActiveDocument}
              onClean={() => setCurrentView(AppView.CLEANING)} 
              darkMode={darkMode}
            />
            {activeDoc && (
              <div className="flex justify-center p-4">
                 <button 
                   onClick={() => archiveToDatabase(activeDoc)}
                   className="bg-emerald-600 text-white px-16 py-4 rounded-2xl font-black shadow-xl hover:bg-emerald-700 transition-all flex items-center gap-4"
                 >
                   <span>ترحيل السجل إلى قاعدة البيانات</span>
                 </button>
              </div>
            )}
          </div>
        );
      case AppView.CLEANING:
        return <DataCleaning docs={processedDocs} setDocs={setProcessedDocs} />;
      case AppView.SEARCH:
        return <SmartSearch docs={processedDocs} />;
      case AppView.CLASSIFICATION:
        return <Classification docs={processedDocs} />;
      case AppView.ANALYTICS:
        return <Analytics docs={processedDocs} />;
      case AppView.DATABASE:
        return <DatabaseView />;
      case AppView.SETTINGS:
        return <Settings darkMode={darkMode} setDarkMode={setDarkMode} />;
      case AppView.TECHNICAL_SPEC:
        return <TechnicalSpec darkMode={darkMode} />;
      default:
        return <Dashboard docs={processedDocs} onUploadComplete={handleDocumentProcessed} onViewDoc={setActiveDoc} darkMode={darkMode} />;
    }
  };

  return (
    <div className={`flex h-screen w-full font-['Tajawal'] overflow-hidden transition-colors duration-500 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#f8fafc] text-slate-900'}`} dir="rtl">
      <Sidebar currentView={currentView} setView={setCurrentView} darkMode={darkMode} />
      
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        <div className="absolute top-6 left-6 z-[100] flex flex-col gap-3 w-72 pointer-events-none">
          {notifications.map(notif => (
            <div key={notif.id} className={`pointer-events-auto p-4 rounded-xl shadow-xl border ${
              notif.type === 'success' ? 'bg-emerald-500 text-white border-emerald-400' :
              notif.type === 'error' ? 'bg-red-500 text-white border-red-400' :
              darkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-slate-900 border-slate-100'
            }`}>
              <p className="text-[10px] font-black uppercase tracking-widest">{notif.message}</p>
            </div>
          ))}
        </div>

        <header className={`h-24 border-b flex items-center justify-between px-10 shrink-0 z-30 ${darkMode ? 'bg-slate-900 border-slate-800 shadow-xl shadow-black/20' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex flex-col">
            <h1 className="text-xl font-black">{viewLabels[currentView]}</h1>
            <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">ITPC - وزارة الاتصالات</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button onClick={() => setDarkMode(false)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black ${!darkMode ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>نهار</button>
              <button onClick={() => setDarkMode(true)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black ${darkMode ? 'bg-slate-700 text-blue-400 shadow-sm' : 'text-slate-400'}`}>ليل</button>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-6 transition-colors duration-300 scrollbar-hide">
          <div className="max-w-[1200px] mx-auto min-h-full">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
