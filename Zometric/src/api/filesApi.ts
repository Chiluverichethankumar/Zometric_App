import { api } from './index';
import type { UploadFilePayload } from '../types/api';

// Backend group list shape
export interface FileGroupSummary {
  group_id: string;
  note: string;
  created_at: string;
  total_files: number;
  files: {
    id: number;        
    supabase_url: string;
    original_name: string;
     download_url: string; backend
  }[];
}

// Backend group detail shape
export interface FileGroupDetail {
  group_id: string;
  note: string;
  created_at: string;
  files: {
    supabase_url: string;
    original_name: string;
  }[];
}

// keep your existing uploadFiles mutation
export const filesApi = api.injectEndpoints({
  endpoints: (build) => ({
    uploadFiles: build.mutation<any, UploadFilePayload>({
      query: ({ note, files }) => {
        const formData = new FormData();
        formData.append('note', note);
        files.forEach((file) => {
          formData.append('files', {
            uri: file.uri,
            name: file.name,
            type: file.type ?? 'application/octet-stream',
          } as any);
        });
        return {
          url: '/api/files/',
          method: 'POST',
          body: formData,
        };
      },
    }),

    getFiles: build.query<FileGroupSummary[], void>({
      query: () => '/api/files/',
      providesTags: ['Files'],
    }),

    getFileGroup: build.query<FileGroupDetail, string>({
      query: (groupId) => `/api/files/${groupId}/`,
    }),

    deleteFile: build.mutation<any, { fullId: string }>({
      query: ({ fullId }) => ({
        url: `/api/files/${fullId}/delete/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Files"],
    }),

  }),

  overrideExisting: true,
});

export const {
  useUploadFilesMutation,
  useGetFilesQuery,
  useGetFileGroupQuery,
  useDeleteFileMutation, 
} = filesApi;
