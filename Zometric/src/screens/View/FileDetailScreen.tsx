// // src/screens/View/FileDetailScreen.tsx
// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   ScrollView,
//   ActivityIndicator,
//   TouchableOpacity,
//   Linking,
// } from 'react-native';
// import type { NativeStackScreenProps } from '@react-navigation/native-stack';
// import { useGetFileGroupQuery } from '../../api/filesApi';
// import type { ViewStackParamList } from '../../types/navigation';

// type Props = NativeStackScreenProps<ViewStackParamList, 'FileDetail'>;

// const FileDetailScreen: React.FC<Props> = ({ route }) => {
//   const { groupId, index } = route.params;
//   const { data, isLoading, error } = useGetFileGroupQuery(groupId);

//   const [textContent, setTextContent] = useState<string | null>(null);
//   const [textLoading, setTextLoading] = useState(false);
//   const [textError, setTextError] = useState<string | null>(null);

//   // current file from group
//   const file = !isLoading && !error && data && data.files[index]
//     ? (data.files[index] as any)
//     : null;

//   // from your backend: "supabase_url": "https://...test.mp3"
//   const supabase_url: string | null = file?.supabase_url ?? null;
//   const original_name: string = file?.original_name ?? '';
//   const mime: string = (file && file.mime_type) || '';

//   const isImage = !!file && mime.startsWith('image/');
//   const isVideo = !!file && mime.startsWith('video/');
//   const isAudio = !!file && mime.startsWith('audio/');
//   const isTextLike =
//     !!file &&
//     (mime.startsWith('text/') ||
//       original_name.endsWith('.txt') ||
//       original_name.endsWith('.py') ||
//       original_name.endsWith('.js') ||
//       original_name.endsWith('.ts') ||
//       original_name.endsWith('.java') ||
//       original_name.endsWith('.json') ||
//       original_name.endsWith('.md'));

//   // Load text/code preview directly from supabase_url
//   useEffect(() => {
//     const loadText = async () => {
//       if (!isTextLike || !supabase_url) return;
//       try {
//         setTextLoading(true);
//         setTextError(null);
//         const res = await fetch(supabase_url);
//         const text = await res.text();
//         setTextContent(text);
//       } catch (e) {
//         console.log('TEXT LOAD ERROR ===>', e);
//         setTextError('Unable to load text preview.');
//         setTextContent(null);
//       } finally {
//         setTextLoading(false);
//       }
//     };
//     loadText();
//   }, [isTextLike, supabase_url]);

//   // Open Supabase public URL in Chrome / default browser
//   const onOpenInBrowser = async () => {
//     if (!supabase_url) {
//       console.log('No supabase_url for this file');
//       return;
//     }
//     console.log('Opening Supabase URL in browser:', supabase_url);
//     try {
//       await Linking.openURL(supabase_url);
//     } catch (e) {
//       console.log('OPEN URL ERROR ===>', e);
//     }
//   };

//   if (isLoading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" />
//       </View>
//     );
//   }

//   if (error || !data || !file) {
//     return (
//       <View style={styles.center}>
//         <Text style={styles.error}>Unable to load file.</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {/* Main preview area */}
//       <View style={styles.content}>
//         {isImage && supabase_url && (
//           <Image
//             source={{ uri: supabase_url }}
//             style={styles.fullImage}
//             resizeMode="contain"
//           />
//         )}

//         {!isImage && isVideo && (
//           <Text style={styles.info}>
//             Video preview not available. Use “Open in browser”.
//           </Text>
//         )}

//         {isAudio && (
//           <View style={styles.textContainer}>
//             <Text style={styles.code}>
//               This is an audio file: {original_name}
//               {'\n'}
//               Tap “Open in browser” to play it in your default audio app.
//             </Text>
//           </View>
//         )}

//         {!isImage && !isVideo && !isAudio && isTextLike && (
//           <View style={styles.textContainer}>
//             {textLoading && (
//               <ActivityIndicator size="small" color="#2563EB" />
//             )}
//             {textError && (
//               <Text style={styles.info}>{textError}</Text>
//             )}
//             {textContent && !textError && (
//               <ScrollView>
//                 <Text style={styles.code}>{textContent}</Text>
//               </ScrollView>
//             )}
//           </View>
//         )}

//         {!isImage && !isVideo && !isAudio && !isTextLike && (
//           <Text style={styles.info}>
//             This file type cannot be previewed. Use “Open in browser”.
//           </Text>
//         )}
//       </View>

//       {/* Metadata + Open in browser */}
//       <View style={styles.meta}>
//         <Text style={styles.metaLabel}>Note</Text>
//         <Text style={styles.metaValue}>{data.note}</Text>

//         <Text style={styles.metaLabel}>Created</Text>
//         <Text style={styles.metaValue}>
//           {new Date(data.created_at).toLocaleString()}
//         </Text>

//         <Text style={styles.metaLabel}>File name</Text>
//         <Text style={styles.metaValue}>{original_name}</Text>

//         <TouchableOpacity
//           style={styles.downloadButton}
//           onPress={onOpenInBrowser}
//         >
//           <Text style={styles.downloadText}>Open in browser</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#FFFFFF' },
//   content: {
//     flex: 1,
//     backgroundColor: '#000000',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   fullImage: {
//     width: '100%',
//     height: '100%',
//   },
//   info: {
//     color: '#F9FAFB',
//     fontSize: 14,
//     paddingHorizontal: 16,
//     textAlign: 'center',
//   },
//   textContainer: {
//     flex: 1,
//     alignSelf: 'stretch',
//     backgroundColor: '#0B1120',
//     padding: 12,
//     margin: 12,
//     borderRadius: 8,
//   },
//   code: {
//     color: '#E5E7EB',
//     fontSize: 12,
//     fontFamily: 'monospace',
//   },
//   meta: {
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderTopWidth: 1,
//     borderTopColor: '#E5E7EB',
//     backgroundColor: '#F9FAFB',
//   },
//   metaLabel: {
//     fontSize: 12,
//     color: '#6B7280',
//     marginTop: 4,
//   },
//   metaValue: {
//     fontSize: 14,
//     color: '#111827',
//   },
//   downloadButton: {
//     marginTop: 12,
//     backgroundColor: '#2563EB',
//     paddingVertical: 10,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   downloadText: {
//     color: '#FFFFFF',
//     fontWeight: '600',
//     fontSize: 14,
//   },
//   center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
//   error: { color: 'red', marginBottom: 8 },
// });

// export default FileDetailScreen;



// src/screens/View/FileDetailScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  useGetFileGroupQuery,
  useDeleteFileMutation,
} from '../../api/filesApi';
import type { ViewStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<ViewStackParamList, 'FileDetail'>;

const FileDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { groupId, index, deleteRequested, fileId } = route.params;

  const { data, isLoading, error } = useGetFileGroupQuery(groupId);
  const [deleteFile] = useDeleteFileMutation();

  const [textContent, setTextContent] = useState<string | null>(null);
  const [textLoading, setTextLoading] = useState(false);
  const [textError, setTextError] = useState<string | null>(null);

  // 🟦 If deleteRequested is true → show confirmation popup
  useEffect(() => {
    if (deleteRequested) {
      Alert.alert(
        'Delete File',
        'Are you sure you want to delete this file?',
        [
          { text: 'Cancel', style: 'cancel' },

          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteFile({ fullId: fileId }).unwrap();
                Alert.alert('Deleted', 'File deleted successfully.');
                navigation.goBack(); // Return to Gallery
              } catch (e) {
                console.log('DELETE ERROR ===>', e);
                Alert.alert('Error', 'Failed to delete this file.');
              }
            },
          },
        ]
      );
    }
  }, [deleteRequested]);

  // ------------------------------
  // File Preview Logic
  // ------------------------------
  const file =
    !isLoading && !error && data && data.files[index]
      ? (data.files[index] as any)
      : null;

  const supabase_url: string | null = file?.supabase_url ?? null;
  const original_name: string = file?.original_name ?? '';
  const mime: string = file?.mime_type ?? '';

  const isImage = mime.startsWith('image/');
  const isVideo = mime.startsWith('video/');
  const isAudio = mime.startsWith('audio/');
  const isTextLike =
    mime.startsWith('text/') ||
    original_name.endsWith('.txt') ||
    original_name.endsWith('.py') ||
    original_name.endsWith('.js') ||
    original_name.endsWith('.ts') ||
    original_name.endsWith('.java') ||
    original_name.endsWith('.json') ||
    original_name.endsWith('.md');

  // Text loader for code/text files
  useEffect(() => {
    const loadText = async () => {
      if (!isTextLike || !supabase_url) return;
      try {
        setTextLoading(true);
        setTextError(null);
        const res = await fetch(supabase_url);
        const text = await res.text();
        setTextContent(text);
      } catch (e) {
        console.log('TEXT LOAD ERROR ===>', e);
        setTextError('Unable to load text preview.');
        setTextContent(null);
      } finally {
        setTextLoading(false);
      }
    };
    loadText();
  }, [supabase_url, isTextLike]);

  const onOpenInBrowser = async () => {
    if (!supabase_url) return;
    try {
      await Linking.openURL(supabase_url);
    } catch (e) {
      console.log('OPEN URL ERROR ===>', e);
    }
  };

  // ------------------------------
  // Screens
  // ------------------------------
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !data || !file) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Unable to load file.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Preview Area */}
      <View style={styles.content}>
        {isImage && (
          <Image
            source={{ uri: supabase_url! }}
            style={styles.fullImage}
            resizeMode="contain"
          />
        )}

        {isVideo && (
          <Text style={styles.info}>
            Video preview not available. Use "Open in browser".
          </Text>
        )}

        {isAudio && (
          <Text style={styles.info}>
            Audio file. Tap "Open in browser" to play it.
          </Text>
        )}

        {isTextLike && (
          <View style={styles.textContainer}>
            {textLoading && (
              <ActivityIndicator size="small" color="#2563EB" />
            )}
            {textError && <Text style={styles.info}>{textError}</Text>}
            {textContent && !textError && (
              <ScrollView>
                <Text style={styles.code}>{textContent}</Text>
              </ScrollView>
            )}
          </View>
        )}

        {!isImage && !isVideo && !isAudio && !isTextLike && (
          <Text style={styles.info}>
            This file type cannot be previewed. Open in browser.
          </Text>
        )}
      </View>

      {/* Metadata */}
      <View style={styles.meta}>
        <Text style={styles.metaLabel}>Note</Text>
        <Text style={styles.metaValue}>{data.note}</Text>

        <Text style={styles.metaLabel}>Created</Text>
        <Text style={styles.metaValue}>
          {new Date(data.created_at).toLocaleString()}
        </Text>

        <Text style={styles.metaLabel}>File name</Text>
        <Text style={styles.metaValue}>{original_name}</Text>

        <TouchableOpacity
          style={styles.downloadButton}
          onPress={onOpenInBrowser}
        >
          <Text style={styles.downloadText}>Open in browser</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ------------------------------
// Styles
// ------------------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  content: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },

  fullImage: {
    width: '100%',
    height: '100%',
  },

  info: {
    color: '#F9FAFB',
    fontSize: 14,
    paddingHorizontal: 16,
    textAlign: 'center',
  },

  textContainer: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: '#0B1120',
    padding: 12,
    margin: 12,
    borderRadius: 8,
  },

  code: {
    color: '#E5E7EB',
    fontSize: 12,
    fontFamily: 'monospace',
  },

  meta: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },

  metaLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  metaValue: {
    fontSize: 14,
    color: '#111827',
  },

  downloadButton: {
    marginTop: 12,
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },

  downloadText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { color: 'red', marginBottom: 8 },
});

export default FileDetailScreen;
