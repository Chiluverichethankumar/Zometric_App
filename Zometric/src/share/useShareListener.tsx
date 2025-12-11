// src/share/useShareListener.ts
import { useEffect } from "react";
import { NativeEventEmitter, NativeModules } from "react-native";

const EVENT_NAME = "ShareExtensionReceived";
const PendingShare = (NativeModules as any)?.PendingShare;

export const useShareListener = (onFilesReceived?: (files: any[]) => void) => {
  useEffect(() => {
    console.log("📡 useShareListener mounted");

    // 1) try to fetch any pending data buffered by native MainActivity
    (async () => {
      try {
        if (PendingShare && typeof PendingShare.getPendingData === "function") {
          const pending = await PendingShare.getPendingData();
          if (pending && Array.isArray(pending) && pending.length > 0) {
            console.log("📥 Pending shared files (from native):", pending);
            onFilesReceived?.(pending);
          } else if (pending) {
            // sometimes single item returned as object
            const arr = Array.isArray(pending) ? pending : [pending];
            if (arr.length > 0) onFilesReceived?.(arr);
          }
        } else {
          console.log("⚠ PendingShare native module not available yet");
        }
      } catch (e) {
        console.warn("Failed to get pending share data:", e);
      }
    })();

    // 2) subscribe to live events emitted from MainActivity (DeviceEventManagerModule)
    const emitter = new NativeEventEmitter((NativeModules as any).DeviceEventManagerModule);
    const subscription = emitter.addListener(EVENT_NAME, (files: any) => {
      try {
        const arr = Array.isArray(files) ? files : [files];
        console.log("📥 Live share event received:", arr);
        onFilesReceived?.(arr);
      } catch (err) {
        console.warn("Error processing share event:", err);
      }
    });

    return () => {
      subscription.remove();
      console.log("🧹 useShareListener unmounted");
    };
  }, [onFilesReceived]);
};
