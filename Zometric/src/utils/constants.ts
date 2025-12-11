// src/utils/constants.ts
import { Platform } from 'react-native';

export const API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:8000',
  ios: 'http://127.0.0.1:8000',
  default: 'http://127.0.0.1:8000',
});

export const COLORS = {
  primary: '#2563EB',
  bg: '#050816',
  text: '#000000ff',
  danger: '#EF4444',
  border: '#1F2937',
};
