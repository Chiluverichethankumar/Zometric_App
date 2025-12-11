// // import React, { useState, useMemo } from 'react';
// // import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
// // import { useFilePicker } from '../../hooks/useFilePicker';
// // import { useFileHash } from '../../hooks/useFileHash';
// // import { useUploadFilesMutation } from '../../api/filesApi';
// // import Input from '../../components/common/Input';
// // import Button from '../../components/common/Button';
// // import FilePreview from '../../components/upload/FilePreview';
// // import UploadProgress from '../../components/upload/UploadProgress';

// // const FileUploadScreen: React.FC = () => {
// //   const [note, setNote] = useState('');
// //   const { files: pickedDocs, pickFiles, clearFiles, removeFile } = useFilePicker();
// //   const { hashedFiles, loading: hashing } = useFileHash(pickedDocs);
// //   const [uploadFiles, { isLoading }] = useUploadFilesMutation();
// //   const [progress, setProgress] = useState(0);
// //   const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

// //   const hasDuplicates = useMemo(
// //     () => hashedFiles.some((f) => f.isDuplicate),
// //     [hashedFiles]
// //   );

// //   const onUpload = async () => {
// //     if (!note.trim()) {
// //       Alert.alert('Note required', 'Please enter a note before uploading.');
// //       return;
// //     }
// //     if (hashedFiles.length === 0) {
// //       Alert.alert('No files', 'Please select at least one file.');
// //       return;
// //     }

// //     const nonDuplicate = hashedFiles.filter((f) => !f.isDuplicate);
// //     if (nonDuplicate.length === 0) {
// //       Alert.alert('All duplicates', 'Remove duplicates or pick a new file.');
// //       return;
// //     }

// // try {
// //   setProgress(0);
// //   setStatus('idle');

// //   const filesPayload = nonDuplicate.map((f) => ({
// //     uri: f.uri,
// //     name: f.name,
// //     type: f.mimeType ?? 'application/octet-stream',
// //   }));

// //   const result = await uploadFiles({
// //     note: note.trim(),
// //     files: filesPayload,
// //   }).unwrap();

// //   console.log('UPLOAD RESULT ===>', result);

// //   // ✅ Smooth UI success transition
// //   setProgress(1);
// //   setStatus('success');

// //   clearFiles();
// //   setNote('');

// //   // ⏳ Success message will fade out automatically
// //   setTimeout(() => {
// //     setProgress(0);   // hide progress bar
// //     setStatus('idle'); // hide success message
// //   }, 1200);

// // } catch (err: any) {
// //   console.log('UPLOAD ERROR ===>', err);
// //   setStatus('error');
// //   setProgress(0);

// //   const data = err?.data;
// //   let detail =
// //     data?.detail ||
// //     data?.message ||
// //     data?.error ||
// //     (typeof data === 'string' ? data : '');

// //   if (data?.duplicates && Array.isArray(data.duplicates)) {
// //     detail = detail || `Duplicate files: ${data.duplicates.join(', ')}`;
// //   }

// //   if (!detail) {
// //     detail = 'Something went wrong while uploading.';
// //   }

// //   Alert.alert('Upload failed', detail);
// // }

// //   };

// //   return (
// //     <View style={styles.container}>
// //       {/* Scrollable Content */}
// //       <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
// //         <Text style={styles.title}>Upload Files</Text>

// //         <Input
// //           label="Note"
// //           placeholder='e.g. "Test Group 1 - 5 mixed files"'
// //           value={note}
// //           onChangeText={setNote}
// //         />

// //         <Button
// //           label="Select Files"
// //           onPress={pickFiles}
// //           loading={hashing}
// //           style={styles.selectButton}
// //         />

// //         <Text style={styles.sectionTitle}>Selected Files</Text>

// //         {hashedFiles.length === 0 ? (
// //           <View style={styles.empty}>
// //             <Text style={styles.emptyText}>No files selected yet.</Text>
// //             <Text style={styles.emptySub}>
// //               Tap "Select Files" to choose 5 mixed files like in Postman.
// //             </Text>
// //           </View>
// //         ) : (
// //           <View style={styles.filesList}>
// //             {hashedFiles.map((file) => (
// //               <FilePreview
// //                 key={file.uri}
// //                 file={file}
// //                 onRemove={() => removeFile(file.uri)}
// //               />
// //             ))}
// //           </View>
// //         )}

// //         {(isLoading || progress > 0) && (
// //           <View style={styles.progressContainer}>
// //             <UploadProgress progress={progress} />
// //             <Text style={styles.uploadStatus}>
// //               {isLoading
// //                 ? 'Uploading…'
// //                 : progress === 1
// //                 ? 'Upload complete'
// //                 : ''}
// //             </Text>
// //           </View>
// //         )}

// //         {status === 'success' && (
// //           <Text style={styles.success}>Upload successful.</Text>
// //         )}
// //         {status === 'error' && (
// //           <Text style={styles.errorText}>Upload failed. Please try again.</Text>
// //         )}
// //       </ScrollView>

// //       {/* FIXED BOTTOM BUTTONS */}
// //       <View style={styles.bottomContainer}>
// //         {hashedFiles.length > 0 && (
// //           <Button
// //             label="Clear Selected Files"
// //             onPress={clearFiles}
// //             variant="secondary"
// //             style={styles.clearButton}
// //           />
// //         )}

// //         <Button
// //           label={hasDuplicates ? 'Upload (duplicates ignored)' : 'Upload'}
// //           onPress={onUpload}
// //           loading={isLoading}
// //           style={styles.uploadButton}
// //         />
// //       </View>
// //     </View>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: '#f8f9fa',
// //   },
// //   scrollContent: {
// //     flex: 1,
// //     padding: 16,
// //     paddingTop: 24,
// //     paddingBottom: 100, // Extra space for bottom buttons
// //   },
// //   title: {
// //     fontSize: 24,
// //     fontWeight: '700',
// //     marginBottom: 24,
// //     textAlign: 'center',
// //     color: '#1f2937',
// //   },
// //   selectButton: {
// //     marginBottom: 16,
// //   },
// //   sectionTitle: {
// //     fontSize: 18,
// //     fontWeight: '600',
// //     marginTop: 20,
// //     marginBottom: 12,
// //     color: '#374151',
// //   },
// //   filesList: {
// //     flex: 1,
// //   },
// //   empty: {
// //     paddingVertical: 32,
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //   },
// //   emptyText: {
// //     fontSize: 16,
// //     fontWeight: '600',
// //     color: '#6b7280',
// //   },
// //   emptySub: {
// //     fontSize: 14,
// //     color: '#9ca3af',
// //     marginTop: 8,
// //     textAlign: 'center',
// //     lineHeight: 20,
// //   },
// //   progressContainer: {
// //     marginTop: 16,
// //     padding: 16,
// //     backgroundColor: 'white',
// //     borderRadius: 12,
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 8,
// //     elevation: 3,
// //   },
// //   uploadStatus: {
// //     fontSize: 14,
// //     color: '#6B7280',
// //     marginTop: 8,
// //     textAlign: 'center',
// //   },
// //   success: {
// //     color: '#10b981',
// //     marginTop: 12,
// //     textAlign: 'center',
// //     fontSize: 16,
// //     fontWeight: '600',
// //   },
// //   errorText: {
// //     color: '#ef4444',
// //     marginTop: 12,
// //     textAlign: 'center',
// //     fontSize: 16,
// //     fontWeight: '600',
// //   },
// //   // FIXED BOTTOM SECTION
// //   bottomContainer: {
// //     position: 'absolute',
// //     bottom: 0,
// //     left: 0,
// //     right: 0,
// //     backgroundColor: 'white',
// //     padding: 16,
// //     paddingBottom: 32,
// //     borderTopWidth: 1,
// //     borderTopColor: '#e5e7eb',
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: -2 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 8,
// //     elevation: 8,
// //   },
// //   clearButton: {
// //     marginBottom: 12,
// //   },
// //   uploadButton: {
// //     backgroundColor: '#3b82f6',
// //   },
// // });

// // export default FileUploadScreen;
// // src/screens/Home/FileUploadScreen.tsx
// import React, { useState, useMemo, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Alert,
//   ScrollView,
//   NativeModules,
//   NativeEventEmitter
// } from 'react-native';

// import { useFilePicker } from '../../hooks/useFilePicker';
// import { useFileHash } from '../../hooks/useFileHash';
// import { useUploadFilesMutation } from '../../api/filesApi';
// import Input from '../../components/common/Input';
// import Button from '../../components/common/Button';
// import FilePreview from '../../components/upload/FilePreview';
// import UploadProgress from '../../components/upload/UploadProgress';

// import { getSharedFilesGlobal, clearSharedFilesGlobal } from "../../share/ShareState";


// const DEVICE_EVENT = 'ShareExtensionReceived'; // matches MainActivity.EVENT_SHARE

// const FileUploadScreen: React.FC = () => {
//   const [note, setNote] = useState('');

//   const {
//     files: pickedDocs,
//     pickFiles,
//     clearFiles,
//     removeFile,
//     addSharedFiles
//   } = useFilePicker();

//   const { hashedFiles, loading: hashing } = useFileHash(pickedDocs);
//   const [uploadFiles, { isLoading }] = useUploadFilesMutation();

//   const [progress, setProgress] = useState(0);
//   const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

//   // ============================
//   // 1️⃣ Load INITIAL shared files when screen opens
//   // ============================
//   useEffect(() => {
//     const initial = getSharedFilesGlobal();
//     if (initial && initial.length > 0) {
//       console.log("📥 Initial shared files:", initial);
//       addSharedFiles(initial);

//       if (!note.trim()) {
//         const now = new Date().toLocaleString();
//         setNote(`Shared on ${now}`);
//       }

//       clearSharedFilesGlobal(); // clean once consumed
//     }
//   }, []);

//   // ============================
//   // 2️⃣ Listen for LIVE share events from MainActivity
//   // ============================
//   useEffect(() => {
//     const emitter = new NativeEventEmitter(
//       (NativeModules as any).DeviceEventManagerModule
//     );

//     const sub = emitter.addListener(DEVICE_EVENT, (files: any) => {
//       const arr = Array.isArray(files) ? files : [files];
//       console.log("📥 Live share event received:", arr);

//       addSharedFiles(arr);

//       if (!note.trim()) {
//         const now = new Date().toLocaleString();
//         setNote(`Shared on ${now}`);
//       }
//     });

//     return () => sub.remove();
//   }, [addSharedFiles, note]);

//   const hasDuplicates = useMemo(
//     () => hashedFiles.some((f) => f.isDuplicate),
//     [hashedFiles]
//   );

//   // ============================
//   // Upload function
//   // ============================
//   const onUpload = async () => {
//     if (!note.trim()) {
//       Alert.alert('Note required', 'Please enter a note before uploading.');
//       return;
//     }
//     if (hashedFiles.length === 0) {
//       Alert.alert('No files', 'Please select at least one file.');
//       return;
//     }

//     const nonDuplicate = hashedFiles.filter((f) => !f.isDuplicate);
//     if (nonDuplicate.length === 0) {
//       Alert.alert('All duplicates', 'Remove duplicates or pick new files.');
//       return;
//     }

//     try {
//       setProgress(0);
//       setStatus('idle');

//       const filesPayload = nonDuplicate.map((f) => ({
//         uri: f.uri,
//         name: f.name,
//         type: f.mimeType ?? 'application/octet-stream'
//       }));

//       const result = await uploadFiles({
//         note: note.trim(),
//         files: filesPayload
//       }).unwrap();

//       console.log("UPLOAD RESULT ===>", result);

//       setProgress(1);
//       setStatus('success');

//       clearFiles();
//       setNote('');

//       setTimeout(() => {
//         setProgress(0);
//         setStatus('idle');
//       }, 1200);
//     } catch (err: any) {
//       console.log("UPLOAD ERROR ===>", err);
//       setStatus('error');
//       setProgress(0);

//       const data = err?.data;
//       let detail =
//         data?.detail ||
//         data?.message ||
//         data?.error ||
//         (typeof data === 'string' ? data : '');

//       if (!detail) detail = "Something went wrong.";

//       Alert.alert('Upload failed', detail);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
//         <Text style={styles.title}>Upload Files</Text>

//         <Input
//           label="Note"
//           placeholder='e.g. "Meeting photos"'
//           value={note}
//           onChangeText={setNote}
//         />

//         <Button
//           label="Select Files"
//           onPress={pickFiles}
//           loading={hashing}
//           style={styles.selectButton}
//         />

//         <Text style={styles.sectionTitle}>Selected Files</Text>

//         {hashedFiles.length === 0 ? (
//           <View style={styles.empty}>
//             <Text style={styles.emptyText}>No files selected yet.</Text>
//             <Text style={styles.emptySub}>Share from gallery or pick files manually.</Text>
//           </View>
//         ) : (
//           <View style={styles.filesList}>
//             {hashedFiles.map((file) => (
//               <FilePreview key={file.uri} file={file} onRemove={() => removeFile(file.uri)} />
//             ))}
//           </View>
//         )}

//         {(isLoading || progress > 0) && (
//           <View style={styles.progressContainer}>
//             <UploadProgress progress={progress} />
//             <Text style={styles.uploadStatus}>
//               {isLoading
//                 ? "Uploading…"
//                 : progress === 1
//                 ? "Upload complete"
//                 : ""}
//             </Text>
//           </View>
//         )}

//         {status === "success" && <Text style={styles.success}>Upload successful!</Text>}
//         {status === "error" && <Text style={styles.errorText}>Upload failed. Try again.</Text>}
//       </ScrollView>

//       <View style={styles.bottomContainer}>
//         {hashedFiles.length > 0 && (
//           <Button
//             label="Clear Selected Files"
//             variant="secondary"
//             onPress={clearFiles}
//             style={styles.clearButton}
//           />
//         )}

//         <Button
//           label={hasDuplicates ? "Upload (duplicates ignored)" : "Upload"}
//           onPress={onUpload}
//           loading={isLoading}
//           style={styles.uploadButton}
//         />
//       </View>
//     </View>
//   );
// };

// // Styles remain unchanged
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f8f9fa" },
//   scrollContent: { flex: 1, padding: 16, paddingTop: 24, paddingBottom: 100 },
//   title: { fontSize: 24, fontWeight: "700", marginBottom: 24, textAlign: "center", color: "#1f2937" },
//   selectButton: { marginBottom: 16 },
//   sectionTitle: { fontSize: 18, fontWeight: "600", marginTop: 20, marginBottom: 12, color: "#374151" },
//   filesList: { flex: 1 },
//   empty: { paddingVertical: 32, alignItems: "center" },
//   emptyText: { fontSize: 16, fontWeight: "600", color: "#6b7280" },
//   emptySub: { fontSize: 14, color: "#9ca3af", marginTop: 6 },
//   progressContainer: {
//     marginTop: 16,
//     padding: 16,
//     backgroundColor: "white",
//     borderRadius: 12,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 3
//   },
//   uploadStatus: { fontSize: 14, color: "#6B7280", marginTop: 8, textAlign: "center" },
//   success: { color: "#10b981", marginTop: 12, textAlign: "center", fontSize: 16, fontWeight: "600" },
//   errorText: { color: "#ef4444", marginTop: 12, textAlign: "center", fontSize: 16, fontWeight: "600" },
//   bottomContainer: {
//     position: "absolute",
//     bottom: 0, left: 0, right: 0,
//     backgroundColor: "white",
//     padding: 16,
//     paddingBottom: 32,
//     borderTopWidth: 1,
//     borderTopColor: "#e5e7eb",
//     elevation: 8
//   },
//   clearButton: { marginBottom: 12 },
//   uploadButton: { backgroundColor: "#3b82f6" }
// });

// export default FileUploadScreen;
// src/screens/Home/FileUploadScreen.tsx
import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  NativeModules,
  NativeEventEmitter,
} from "react-native";

import { useRoute, useNavigation } from "@react-navigation/native";

import { useFilePicker } from "../../hooks/useFilePicker";
import { useFileHash } from "../../hooks/useFileHash";
import { useUploadFilesMutation } from "../../api/filesApi";

import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import FilePreview from "../../components/upload/FilePreview";
import UploadProgress from "../../components/upload/UploadProgress";

import {
  getSharedFilesGlobal,
  clearSharedFilesGlobal,
} from "../../share/ShareState";

const DEVICE_EVENT = "ShareExtensionReceived";

const FileUploadScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();

  const [note, setNote] = useState("");

  const {
    files: pickedDocs,
    pickFiles,
    clearFiles,
    removeFile,
    addSharedFiles,
  } = useFilePicker();

  const { hashedFiles, loading: hashing } = useFileHash(pickedDocs);
  const [uploadFiles, { isLoading }] = useUploadFilesMutation();

  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  // ============================================================
  // 1️⃣ Read files passed from App.tsx navigation
  // ============================================================
  useEffect(() => {
    const fromNav = route.params?.sharedFiles;

    if (fromNav?.length > 0) {
      console.log("📥 NAVIGATION shared files:", fromNav);
      addSharedFiles(fromNav);

      if (!note.trim()) {
        setNote(`Shared on ${new Date().toLocaleString()}`);
      }

      navigation.setParams({ sharedFiles: undefined });
    }
  }, [route.params]);

  // ============================================================
  // 2️⃣ Read buffered files from ShareState (cold start)
  // ============================================================
  useEffect(() => {
    const initial = getSharedFilesGlobal();

    if (initial?.length > 0) {
      console.log("📥 GLOBAL buffered files:", initial);
      addSharedFiles(initial);

      if (!note.trim()) {
        setNote(`Shared on ${new Date().toLocaleString()}`);
      }

      clearSharedFilesGlobal();
    }
  }, []);

  // ============================================================
  // 3️⃣ Read native PendingShare (MOST IMPORTANT FOR CLOSED APP)
  // ============================================================
  useEffect(() => {
    async function loadNativePending() {
      try {
        const pending = await NativeModules.PendingShare?.getPendingData();
        if (pending?.length > 0) {
          console.log("📥 NATIVE pending share:", pending);
          addSharedFiles(pending);

          if (!note.trim()) {
            setNote(`Shared on ${new Date().toLocaleString()}`);
          }
        }
      } catch (e) {
        console.log("⚠ PendingShare error:", e);
      }
    }

    loadNativePending();
  }, []);

  // ============================================================
  // 4️⃣ Live events when the app is already open
  // ============================================================
  useEffect(() => {
    const emitter = new NativeEventEmitter(
      (NativeModules as any).DeviceEventManagerModule
    );

    const sub = emitter.addListener(DEVICE_EVENT, (files: any) => {
      const arr = Array.isArray(files) ? files : [files];
      console.log("📥 LIVE share event:", arr);

      addSharedFiles(arr);

      if (!note.trim()) {
        setNote(`Shared on ${new Date().toLocaleString()}`);
      }
    });

    return () => sub.remove();
  }, [addSharedFiles, note]);

  // ============================================================
  // Duplicate detection
  // ============================================================
  const hasDuplicates = useMemo(
    () => hashedFiles.some((f) => f.isDuplicate),
    [hashedFiles]
  );

  // ============================================================
  // Upload Function
  // ============================================================
  const onUpload = async () => {
    if (!note.trim()) {
      Alert.alert("Note required", "Please enter a note before uploading.");
      return;
    }

    if (hashedFiles.length === 0) {
      Alert.alert("No files", "Please select at least one file.");
      return;
    }

    const valid = hashedFiles.filter((f) => !f.isDuplicate);

    if (valid.length === 0) {
      Alert.alert("All duplicates", "Remove duplicates or pick new files.");
      return;
    }

    try {
      setProgress(0);
      setStatus("idle");

      const payload = valid.map((f) => ({
        uri: f.uri,
        name: f.name,
        type: f.mimeType || "application/octet-stream",
      }));

      const result = await uploadFiles({
        note: note.trim(),
        files: payload,
      }).unwrap();

      console.log("UPLOAD RESULT:", result);

      setProgress(1);
      setStatus("success");
      clearFiles();
      setNote("");

      setTimeout(() => {
        setProgress(0);
        setStatus("idle");
      }, 1200);
    } catch (err: any) {
      console.log("UPLOAD ERROR:", err);
      setStatus("error");

      Alert.alert("Upload Failed", err?.data?.detail || "Something went wrong.");
    }
  };

  // ============================================================
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContent}>
        <Text style={styles.title}>Upload Files</Text>

        <Input
          label="Note"
          placeholder='e.g. "Meeting Photos"'
          value={note}
          onChangeText={setNote}
        />

        <Button
          label="Select Files"
          onPress={pickFiles}
          loading={hashing}
          style={styles.selectButton}
        />

        <Text style={styles.sectionTitle}>Selected Files</Text>

        {hashedFiles.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No files selected yet.</Text>
            <Text style={styles.emptySub}>Share from gallery or pick files manually.</Text>
          </View>
        ) : (
          <View style={styles.filesList}>
            {hashedFiles.map((file) => (
              <FilePreview
                key={file.uri}
                file={file}
                onRemove={() => removeFile(file.uri)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomContainer}>
        {hashedFiles.length > 0 && (
          <Button
            label="Clear Selected Files"
            variant="secondary"
            onPress={clearFiles}
            style={styles.clearButton}
          />
        )}

        <Button
          label={hasDuplicates ? "Upload (duplicates ignored)" : "Upload"}
          onPress={onUpload}
          loading={isLoading}
          style={styles.uploadButton}
        />
      </View>
    </View>
  );
};

// ----------------------------
// Styles (unchanged)
// ----------------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  scrollContent: { flex: 1, padding: 16, paddingTop: 24, paddingBottom: 100 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 24, textAlign: "center", color: "#1f2937" },
  selectButton: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginTop: 20, marginBottom: 12, color: "#374151" },
  filesList: { flex: 1 },
  empty: { paddingVertical: 32, alignItems: "center" },
  emptyText: { fontSize: 16, fontWeight: "600", color: "#6b7280" },
  emptySub: { fontSize: 14, color: "#9ca3af", marginTop: 6 },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  uploadButton: { backgroundColor: "#3b82f6" },
  clearButton: { marginBottom: 12 },
});

export default FileUploadScreen;
