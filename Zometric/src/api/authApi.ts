// src/api/authApi.ts - ✅ MINOR FIX: Consistent ProfileApiResponse
import { api } from './index';
import type { AuthResponse, AuthCredentials, User } from '../types/api';

export interface ProfileApiResponse {
  username: string;
  email: string;
  date_joined: string;
  tokens: string[];
}


export const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<AuthResponse, AuthCredentials>({
      query: (credentials) => ({
        url: '/api/login/',
        method: 'POST',
        body: credentials,
      }),
    }),
    signup: build.mutation<AuthResponse, AuthCredentials>({
      query: (credentials) => ({
        url: '/api/signup/',
        method: 'POST',
        body: credentials,
      }),
    }),
    profile: build.query<ProfileApiResponse, void>({
      query: () => '/api/profile/',
      providesTags: ['Profile'],
    }),
    logout: build.mutation<void, void>({
      query: () => ({
        url: '/api/logout/',
        method: 'POST',
      }),
      invalidatesTags: ['Profile'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useLoginMutation,
  useSignupMutation,
  useProfileQuery,
  useLogoutMutation,
} = authApi;
