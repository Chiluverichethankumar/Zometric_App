// src/hooks/useFileHash.ts
import { useEffect, useState } from 'react';
import { hashFileMeta, toZometricFile } from '../utils/fileUtils';
import type { ZometricFile } from '../types/api';
import type { PickedFile } from './useFilePicker';

export interface HashedFile extends ZometricFile {
  isDuplicate: boolean;
}

export const useFileHash = (docs: PickedFile[]) => {
  const [hashedFiles, setHashedFiles] = useState<HashedFile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const process = async () => {
      setLoading(true);
      try {
        const result: HashedFile[] = [];
        const seenHashes = new Set<string>();

        for (const doc of docs) {
          const base = toZometricFile({
            uri: doc.uri,
            name: doc.name,
            size: doc.size,
            type: doc.type ?? null,
          });

          const hash = await hashFileMeta({
            uri: base.uri,
            name: base.name,
            size: base.size,
            type: base.mimeType,
          });

          const isDuplicate = seenHashes.has(hash);
          seenHashes.add(hash);

          result.push({
            ...base,
            hash,
            note: '',       // note is handled separately in FileUploadScreen
            isDuplicate,
          });
        }

        if (!cancelled) {
          setHashedFiles(result);
        }
      } catch (e) {
        if (!cancelled) {
          console.warn('Hashing error', e);
          setHashedFiles([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (docs.length > 0) {
      process();
    } else {
      setHashedFiles([]);
    }

    return () => {
      cancelled = true;
    };
  }, [docs]);

  return { hashedFiles, loading };
};
