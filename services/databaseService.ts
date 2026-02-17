
import { DBRecord, DocumentData, AuditEntry } from '../types.ts';

const DB_KEY = 'itpc_ocr_database_v1';
const AUDIT_KEY = 'itpc_ocr_audit_logs_v1';

export const databaseService = {
  // حفظ سجل جديد في قاعدة البيانات
  saveRecord: (doc: DocumentData): DBRecord => {
    const records = databaseService.getAllRecords();
    
    const mainFields: Record<string, string> = {};
    doc.fields.forEach(f => {
      mainFields[f.name] = f.value;
    });

    const newRecord: DBRecord = {
      id: `REC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      docId: doc.id,
      fileName: doc.fileName,
      category: doc.category || 'عام',
      mainFields,
      createdAt: new Date().toISOString(),
      status: 'archived'
    };

    const updatedRecords = [newRecord, ...records];
    localStorage.setItem(DB_KEY, JSON.stringify(updatedRecords));
    
    // تسجيل العملية في Audit Log
    databaseService.logAudit('أرشفة مستند', `تم ترحيل المستند ${doc.fileName} إلى مستودع البيانات`, 'info');
    
    return newRecord;
  },

  getAllRecords: (): DBRecord[] => {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : [];
  },

  search: (query: string): DBRecord[] => {
    const records = databaseService.getAllRecords();
    if (!query) return records;
    
    const lowerQuery = query.toLowerCase();
    return records.filter(rec => 
      rec.fileName.toLowerCase().includes(lowerQuery) ||
      rec.category.toLowerCase().includes(lowerQuery) ||
      Object.values(rec.mainFields).some(v => v.toLowerCase().includes(lowerQuery))
    );
  },

  deleteRecord: (id: string) => {
    const records = databaseService.getAllRecords();
    const record = records.find(r => r.id === id);
    const filtered = records.filter(r => r.id !== id);
    localStorage.setItem(DB_KEY, JSON.stringify(filtered));
    
    if (record) {
      databaseService.logAudit('حذف سجل', `تم حذف السجل الرقمي ${id} الخاص بالوثيقة ${record.fileName}`, 'warning');
    }
  },

  // تصدير كافة السجلات كملف JSON
  exportDatabase: () => {
    const records = databaseService.getAllRecords();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(records, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `ITPC_Export_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    databaseService.logAudit('تصدير قاعدة البيانات', 'تم إنشاء وتنزيل نسخة من الأرشيف الرقمي للمستندات المهيكلة', 'info');
  },

  // نظام سجل التدقيق (Audit Log System)
  logAudit: (action: string, details: string, severity: AuditEntry['severity'] = 'info') => {
    const logs = databaseService.getAuditLogs();
    const newLog: AuditEntry = {
      id: `AUD-${Date.now()}`,
      action,
      details,
      severity,
      timestamp: new Date().toISOString(),
      user: 'المسؤول التقني'
    };
    localStorage.setItem(AUDIT_KEY, JSON.stringify([newLog, ...logs].slice(0, 500)));
  },

  getAuditLogs: (): AuditEntry[] => {
    const data = localStorage.getItem(AUDIT_KEY);
    return data ? JSON.parse(data) : [];
  }
};
