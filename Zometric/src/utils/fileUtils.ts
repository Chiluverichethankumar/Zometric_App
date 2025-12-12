// src/utils/fileUtils.ts
import type { ZometricFile } from '../types/api';

// Simple deterministic string hash (good enough for dedupe)
const simpleHash = (str: string): string => {
  let hash = 0;
  if (str.length === 0) return '0';
  for (let i = 0; i < str.length; i += 1) {
    const chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit int
  }
  // Convert to unsigned hex string
  return Math.abs(hash).toString(16);
};

export const hashFileMeta = async (params: {
  uri: string;
  name: string;
  size: number;
  type?: string;
}): Promise<string> => {
  const seed = `${params.uri}|${params.name}|${params.size}|${params.type ?? ''}`;
  return simpleHash(seed);
};

export const formatBytes = (bytes: number): string => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  return `${value.toFixed(1)} ${sizes[i]}`;
};

export const toZometricFile = (doc: {
  uri: string;
  name: string;
  size: number | null;
  type?: string | null;
}): Omit<ZometricFile, 'hash' | 'note'> => ({
  uri: doc.uri,
  name: doc.name,
  size: doc.size ?? 0,
  mimeType: doc.type ?? undefined,
});
