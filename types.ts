
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  PROCESSING = 'PROCESSING',
  CLEANING = 'CLEANING',
  SEARCH = 'SEARCH',
  CLASSIFICATION = 'CLASSIFICATION',
  ANALYTICS = 'ANALYTICS',
  DATABASE = 'DATABASE',
  SETTINGS = 'SETTINGS',
  TECHNICAL_SPEC = 'TECHNICAL_SPEC'
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timestamp: Date;
}

export interface OCRField {
  id: string;
  name: string;
  value: string;
  confidence: number;
  type: 'string' | 'number' | 'date' | 'currency' | 'email';
  isMandatory: boolean;
  box_2d?: number[]; // [ymin, xmin, ymax, xmax] normalized to 1000
}

export interface OCRTableCell {
  value: string;
  rowSpan?: number;
  colSpan?: number;
}

export interface OCRTable {
  id: string;
  name: string;
  rows: OCRTableCell[][];
  headers: string[];
  structure?: {
    hasMergedCells: boolean;
    hasMultiLineRows: boolean;
    hasNestedTables: boolean;
  };
}

export interface SignatureInfo {
  type: 'handwritten' | 'seal' | 'digital' | 'unknown';
  status: string;
  location: string;
  description: string;
  verified: boolean;
}

export interface DocumentData {
  id: string;
  fileName: string;
  status: 'processing' | 'completed' | 'error';
  timestamp: string;
  fileType: string;
  originalFileUrl?: string;
  fields: OCRField[];
  tables: OCRTable[];
  signatures?: SignatureInfo[];
  category?: string;
  summary?: string;
  patternId?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface DBRecord {
  id: string;
  docId: string;
  fileName: string;
  category: string;
  mainFields: Record<string, string>;
  createdAt: string;
  status: 'archived' | 'pending_review';
}

export interface AuditEntry {
  id: string;
  action: string;
  timestamp: string;
  user: string;
  details: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface BackupRecord {
  id: string;
  timestamp: string;
  type: 'incremental' | 'full';
  size: number;
  status: 'success' | 'failed';
  encryption: 'AES-256-GCM';
}

export interface SearchResult {
  docId: string;
  fileName: string;
  matchScore: number;
  snippet: string;
}

export interface CustomCleaningRule {
  id: string;
  name: string;
  pattern: string;
  replacement: string;
  isActive: boolean;
}
