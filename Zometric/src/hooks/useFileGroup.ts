// src/hooks/useFileGroup.ts
import { useMemo } from 'react';
import type { FileGroupSummary } from '../api/filesApi';

export interface GalleryGroup {
  group_id: string;
  note: string;
  created_at: string;
  displayDate: string;
  total_files: number;
  files: {
    supabase_url: string;
    original_name: string;
  }[];
}

export const useFileGroup = (
  groups: FileGroupSummary[] | undefined,
  search: string,
) => {
  const normalizedSearch = search.trim().toLowerCase();

  const filteredGroups: GalleryGroup[] = useMemo(() => {
    if (!groups) return [];

    return groups
      .filter((g) => {
        if (!normalizedSearch) return true;
        const noteMatch = g.note.toLowerCase().includes(normalizedSearch);
        const dateStr = new Date(g.created_at).toLocaleDateString();
        const dateMatch = dateStr.toLowerCase().includes(normalizedSearch);
        return noteMatch || dateMatch;
      })
      .map((g) => ({
        ...g,
        displayDate: new Date(g.created_at).toLocaleString(),
      }));
  }, [groups, normalizedSearch]);

  return { groups: filteredGroups };
};
