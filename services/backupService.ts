
import { BackupRecord, DBRecord } from '../types.ts';
import { databaseService } from './databaseService.ts';

const BACKUP_HISTORY_KEY = 'itpc_ocr_backup_history';
const SYSTEM_SECRET = 'ITPC-SECURE-BACKUP-2025-SYSTEM-KEY-PROTECTED';

// Helper to encrypt data using AES-GCM (Web Crypto API)
async function encrypt(text: string, password: string): Promise<string> {
  const enc = new TextEncoder();
  const pwUtf8 = enc.encode(password);
  const pwHash = await crypto.subtle.digest('SHA-256', pwUtf8);

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const alg = { name: 'AES-GCM', iv: iv };
  const key = await crypto.subtle.importKey('raw', pwHash, alg, false, ['encrypt']);

  const ptUint8 = enc.encode(text);
  const ctBuffer = await crypto.subtle.encrypt(alg, key, ptUint8);

  const ctArray = Array.from(new Uint8Array(ctBuffer));
  const ivArray = Array.from(iv);
  
  return JSON.stringify({
    cipherText: btoa(String.fromCharCode.apply(null, ctArray)),
    iv: btoa(String.fromCharCode.apply(null, ivArray))
  });
}

export const backupService = {
  getBackupHistory: (): BackupRecord[] => {
    const data = localStorage.getItem(BACKUP_HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  },

  performBackup: async (type: 'incremental' | 'full'): Promise<BackupRecord | null> => {
    try {
      const allRecords = databaseService.getAllRecords();
      let dataToBackup: DBRecord[] = [];

      if (type === 'full') {
        dataToBackup = allRecords;
      } else {
        // Incremental: Only records from last 24 hours
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        dataToBackup = allRecords.filter(r => new Date(r.createdAt) > oneDayAgo);
      }

      if (dataToBackup.length === 0 && type === 'incremental') {
        console.log('No new data for incremental backup.');
        return null;
      }

      const rawData = JSON.stringify(dataToBackup);
      const encryptedData = await encrypt(rawData, SYSTEM_SECRET);
      
      // In a real browser app, we save the "Backup Blob" to IndexedDB or provide a download link
      // For this system simulation, we'll store the metadata and log the secure creation.
      
      const newBackup: BackupRecord = {
        id: `BK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        timestamp: new Date().toISOString(),
        type,
        size: encryptedData.length,
        status: 'success',
        encryption: 'AES-256-GCM'
      };

      const history = backupService.getBackupHistory();
      localStorage.setItem(BACKUP_HISTORY_KEY, JSON.stringify([newBackup, ...history].slice(0, 50)));
      
      databaseService.logAudit(
        `نسخ احتياطي ${type === 'full' ? 'كامل' : 'تراكمي'}`,
        `تم إنشاء نسخة احتياطية مشفرة AES-256 بنجاح. الحجم: ${(newBackup.size / 1024).toFixed(2)} KB`,
        'info'
      );

      return newBackup;
    } catch (error) {
      console.error('Backup failed:', error);
      databaseService.logAudit('فشل النسخ الاحتياطي', 'حدث خطأ تقني أثناء محاولة تشفير البيانات', 'critical');
      return null;
    }
  },

  checkAndRunScheduledBackups: async () => {
    const history = backupService.getBackupHistory();
    const now = Date.now();

    const lastFull = history.find(b => b.type === 'full');
    const lastIncremental = history.find(b => b.type === 'incremental');

    // Check Weekly Full Backup (7 days)
    if (!lastFull || (now - new Date(lastFull.timestamp).getTime() > 7 * 24 * 60 * 60 * 1000)) {
      console.log('Running scheduled full backup...');
      await backupService.performBackup('full');
    }

    // Check Daily Incremental Backup (24 hours)
    if (!lastIncremental || (now - new Date(lastIncremental.timestamp).getTime() > 24 * 60 * 60 * 1000)) {
       console.log('Running scheduled incremental backup...');
       await backupService.performBackup('incremental');
    }
  }
};
