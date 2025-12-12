// src/utils/constants.ts
import { Platform } from 'react-native';

export const API_BASE_URL = Platform.select({
  android: 'https://file-uploading-django.onrender.com',
  ios: 'https://file-uploading-django.onrender.com',
  default: 'https://file-uploading-django.onrender.com',
});

export const COLORS = {
  primary: '#2563EB',
  bg: '#050816',
  text: '#000000ff',
  danger: '#EF4444',
  border: '#1F2937',
};
