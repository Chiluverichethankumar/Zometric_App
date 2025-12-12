// src/hooks/useShareExtension.ts
import { useEffect, useState } from "react";
import { DeviceEventEmitter, NativeEventEmitter, NativeModules, Platform } from "react-native";
import type { NavigationProp } from "@react-navigation/native";

export type SharedFile = {
  uri: string;
  name?: string | null;
  mimeType?: string | null;
};

export default function useShareExtension(onShared?: (files: SharedFile[]) => void) {
  const [sharedFiles, setSharedFiles] = useState<SharedFile[] | null>(null);

  useEffect(() => {
    // DeviceEventEmitter is used for Android events emitted from native.
    const handler = (arr: any) => {
      try {
        // Native side emits an array of maps
        const parsed: SharedFile[] = Array.isArray(arr)
          ? arr.map((m: any) => ({
              uri: m.uri,
              name: m.name,
              mimeType: m.mimeType,
            }))
          : [];

        setSharedFiles(parsed);
        if (onShared) onShared(parsed);
      } catch (e) {
        console.warn("useShareExtension parse error", e);
      }
    };

    const subscription = DeviceEventEmitter.addListener("ShareExtensionReceived", handler);

    // Also: as a fallback, older RN might use NativeEventEmitter:
    // const subscription2 = new NativeEventEmitter(NativeModules.RNGestureHandlerModule).addListener(...)

    return () => {
      subscription.remove();
    };
  }, [onShared]);

  return { sharedFiles, setSharedFiles };
}
