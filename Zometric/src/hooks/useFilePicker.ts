// src/hooks/useFilePicker.ts
import { useState } from 'react';
import { pick, types } from '@react-native-documents/picker';

export interface PickedFile {
  uri: string;
  name: string;
  size: number;
  type?: string;
}

export const useFilePicker = () => {
  const [files, setFiles] = useState<PickedFile[]>([]);

  const pickFiles = async () => {
    try {
      const results = await pick({
        allowMultiSelection: true,
        type: [types.allFiles],
      });

      console.log('PICK RESULTS ===>', results);

      const mapped: PickedFile[] = results.map((f: any) => ({
        uri: f.uri,
        name: f.name ?? f.fileName ?? 'Unnamed',
        size: f.size ?? 0,
        type: f.type ?? f.nativeType ?? undefined,
      }));

      console.log('MAPPED FILES ===>', mapped);
      setFiles(mapped);
    } catch (err: any) {
      if (!(err instanceof Error && err.message?.toLowerCase().includes('cancel'))) {
        console.warn('File picker error', err);
      }
    }
  };

  const clearFiles = () => setFiles([]);

  const removeFile = (uri: string) => {
    setFiles((prev) => prev.filter((f) => f.uri !== uri));
  };

  // ⭐ NEW: add shared files (from Share Intent)
  const addSharedFiles = (sharedFiles: any[]) => {
    const newFiles: PickedFile[] = sharedFiles.map((f) => ({
      uri: f.uri,
      name: f.name ?? f.uri.split('/').pop() ?? 'Unnamed',
      size: 0, // Shared URIs usually do not provide size
      type: f.mimeType ?? 'application/octet-stream',
    }));

    setFiles((prev) => {
      const merged = [...prev];
      newFiles.forEach((nf) => {
        if (!merged.some((m) => m.uri === nf.uri)) {
          merged.push(nf);
        }
      });
      return merged;
    });
  };

  return {
    files,
    pickFiles,
    clearFiles,
    removeFile,
    addSharedFiles, // ⭐ make available to UI
  };
};
