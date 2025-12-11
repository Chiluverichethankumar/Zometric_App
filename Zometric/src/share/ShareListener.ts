// src/share/ShareListener.ts
import { NativeModules, NativeEventEmitter } from "react-native";

const EVENT = "ShareExtensionReceived";

// Memory store for files until FileUploadScreen loads
let sharedFiles: any[] = [];

// Listen to native events ONLY ONCE
const emitter = new NativeEventEmitter(
  (NativeModules as any).DeviceEventManagerModule
);

emitter.addListener(EVENT, (files: any) => {
  try {
    const arr = Array.isArray(files) ? files : [files];
    console.log("📥 ShareListener received files:", arr);
    sharedFiles = arr; // store for later usage
  } catch (e) {
    console.warn("ShareListener error:", e);
  }
});

/** Returns stored shared files */
export const getSharedFiles = () => {
  return sharedFiles;
};

/** Clears memory store */
export const clearSharedFiles = () => {
  sharedFiles = [];
};
