// src/share/ShareState.ts

let sharedStore: any[] = [];

export const addSharedFilesGlobal = (files: any[]) => {
  sharedStore = files;
};

export const getSharedFilesGlobal = () => sharedStore;

export const clearSharedFilesGlobal = () => {
  sharedStore = [];
};
