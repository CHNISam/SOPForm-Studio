import type { AppData } from './types';

const STORAGE_KEY = 'sopform_studio_v1';

export const getEmptyData = (): AppData => ({
  schemaVersion: 1,
  projects: [],
});

export const loadLocal = (): AppData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getEmptyData();
    const parsed = JSON.parse(raw);
    if (!parsed.projects) parsed.projects = [];
    return parsed;
  } catch (e) {
    console.error('Failed to load local data', e);
    return getEmptyData();
  }
};

export const saveLocal = (data: AppData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save local data', e);
  }
};

// Types for FS Access API
export interface FileSystemHandle {
  kind: 'file' | 'directory';
  name: string;
}

export interface FileSystemFileHandle extends FileSystemHandle {
  kind: 'file';
  getFile(): Promise<File>;
  createWritable(): Promise<FileSystemWritableFileStream>;
}

export interface FileSystemWritableFileStream extends WritableStream {
  write(data: any): Promise<void>;
  close(): Promise<void>;
}

declare global {
  interface Window {
    showOpenFilePicker(options?: any): Promise<FileSystemFileHandle[]>;
    showSaveFilePicker(options?: any): Promise<FileSystemFileHandle>;
  }
}

export async function saveToFile(handle: FileSystemFileHandle, data: AppData) {
  const writable = await handle.createWritable();
  await writable.write(JSON.stringify(data, null, 2));
  await writable.close();
}

export async function loadFromFile(handle: FileSystemFileHandle): Promise<AppData> {
  const file = await handle.getFile();
  const text = await file.text();
  return JSON.parse(text);
}
