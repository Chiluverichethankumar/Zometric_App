// src/store/filesSlice.ts
import { createSlice } from '@reduxjs/toolkit';

interface FilesState {}

const initialState: FilesState = {};

const filesSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {},
});

export default filesSlice.reducer;
