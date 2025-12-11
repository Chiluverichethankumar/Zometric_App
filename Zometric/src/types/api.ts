// src/types/api.ts
export interface User {
  username: string;
  email?: string;
  date_joined?: string;
}

export interface ProfileResponse extends User {
  tokens: string[];
}

export interface AuthResponse {
  token: string;
  username: string;
  message?: string;
}

export interface AuthCredentials {
  username: string;
  email?: string;
  password: string;
}

// Stage 4: Files

export interface ZometricFile {
  id?: number;
  uri: string;
  name: string;
  size: number;
  mimeType?: string;
  hash: string;
  note: string;
}

export interface UploadFilePayload {
  note: string;
  files: {
    uri: string;
    name: string;
    type?: string;
  }[];
}

