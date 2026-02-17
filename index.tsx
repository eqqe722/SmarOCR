
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const initApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error("فشل الوصول إلى عنصر root في HTML.");
    return;
  }

  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("حدث خطأ أثناء تشغيل نظام IntelliOCR:", error);
  }
};

// تشغيل التطبيق بعد تحميل المستند بالكامل
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
