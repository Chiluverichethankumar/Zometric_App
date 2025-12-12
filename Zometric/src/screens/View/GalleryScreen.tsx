// // // src/screens/View/GalleryScreen.tsx
// // import React, { useState } from 'react';
// // import { View, Text, StyleSheet, ScrollView } from 'react-native';
// // import { useNavigation } from '@react-navigation/native';
// // import { useGetFilesQuery } from '../../api/filesApi';
// // import { useFileGroup } from '../../hooks/useFileGroup';
// // import Input from '../../components/common/Input';
// // import Loading from '../../components/common/Loading';
// // import MasonryGroup from '../../components/gallery/MasonryGroup';
// // import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
// // import type { ViewStackParamList } from '../../types/navigation';

// // type Nav = NativeStackNavigationProp<ViewStackParamList, 'Gallery'>;

// // const GalleryScreen: React.FC = () => {
// //   const [search, setSearch] = useState('');
// //   const { data, isLoading, error } = useGetFilesQuery();
// //   const { groups } = useFileGroup(data, search);
// //   const navigation = useNavigation<Nav>();

// //   if (isLoading) return <Loading />;

// //   return (
// //     <View style={styles.container}>
// //       <Text style={styles.title}>Gallery</Text>

// //       <Input
// //         placeholder='Search by note or date (e.g. "meeting" or "2025-12-08")'
// //         value={search}
// //         onChangeText={setSearch}
// //         autoCapitalize="none"
// //       />

// //       {error && (
// //         <Text style={styles.error}>Failed to load files. Pull to retry.</Text>
// //       )}

// //       <ScrollView>
// //         {groups.length === 0 ? (
// //           <View style={styles.empty}>
// //             <Text style={styles.emptyText}>No files found.</Text>
// //             <Text style={styles.emptySub}>
// //               Try uploading from the Home tab or adjust your search.
// //             </Text>
// //           </View>
// //         ) : (
// //           groups.map((group) => (
// //             <MasonryGroup
// //               key={group.group_id}
// //               group={group}
// //               onFilePress={(fileIndex) => {
// //                 navigation.navigate('FileDetail', {
// //                   groupId: group.group_id,
// //                   index: fileIndex,
// //                 });
// //               }}
// //             />
// //           ))
// //         )}
// //       </ScrollView>
// //     </View>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   container: { flex: 1, padding: 12, paddingTop: 24, backgroundColor: '#F3F4F6' },
// //   title: {
// //     fontSize: 20,
// //     fontWeight: '600',
// //     color: '#111827',
// //     marginBottom: 12,
// //     textAlign: 'center',
// //   },
// //   error: { color: 'red', marginBottom: 8 },
// //   empty: { paddingVertical: 32, alignItems: 'center' },
// //   emptyText: { color: '#4B5563', fontSize: 14, fontWeight: '500' },
// //   emptySub: {
// //     color: '#9CA3AF',
// //     fontSize: 12,
// //     marginTop: 4,
// //     textAlign: 'center',
// //   },
// // });

// // export default GalleryScreen;
// // src/screens/View/GalleryScreen.tsx

// import React, { useState, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   RefreshControl,
//   SafeAreaView, // Use SafeAreaView for better layout on notched devices
//   StatusBar,    // Manage status bar appearance
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { useGetFilesQuery } from '../../api/filesApi';
// import { useFileGroup } from '../../hooks/useFileGroup';
// import Input from '../../components/common/Input';
// import Loading from '../../components/common/Loading';
// import MasonryGroup from '../../components/gallery/MasonryGroup';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Add an icon library for better visuals
// import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import type { ViewStackParamList } from '../../types/navigation';

// type Nav = NativeStackNavigationProp<ViewStackParamList, 'Gallery'>;

// const GalleryScreen: React.FC = () => {
//   const [search, setSearch] = useState('');
//   // Destructure refetch and isFetching for pull-to-refresh
//   const { data, isLoading, error, refetch, isFetching } = useGetFilesQuery();
//   const { groups } = useFileGroup(data, search);
//   const navigation = useNavigation<Nav>();

//   // Use useCallback for pull-to-refresh logic
//   const onRefresh = useCallback(() => {
//     refetch();
//   }, [refetch]);

//   if (isLoading && !data) {
//     // Only show full-screen Loading on initial load
//     return <Loading size="large" />;
//   }

//   // --- RENDERING LOGIC ---

//   const renderContent = () => {
//     if (error) {
//       // Improved error display with an icon
//       return (
//         <View style={styles.messageContainer}>
//           <Icon name="alert-circle-outline" size={30} color="#EF4444" />
//           <Text style={styles.errorMessage}>
//             Failed to load files. Pull down to retry.
//           </Text>
//         </View>
//       );
//     }

//     if (groups.length === 0) {
//       // Improved empty state with an icon
//       return (
//         <View style={styles.emptyContainer}>
//           <Icon name="folder-open-outline" size={50} color="#9CA3AF" />
//           <Text style={styles.emptyText}>No files found</Text>
//           <Text style={styles.emptySub}>
//             Try uploading from the Home tab or adjust your search: **"{search}"**
//           </Text>
//         </View>
//       );
//     }

//     // Render file groups
//     return groups.map((group) => (
//       <MasonryGroup
//         key={group.group_id}
//         group={group}
//         onFilePress={(fileIndex) => {
//           navigation.navigate('FileDetail', {
//             groupId: group.group_id,
//             index: fileIndex,
//           });
//         }}
//       />
//     ));
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <StatusBar barStyle="dark-content" backgroundColor={styles.header.backgroundColor} />
//       <View style={styles.header}>
//         <Text style={styles.title}>Your Gallery</Text>
//       </View>

//       <View style={styles.searchContainer}>
//         <Input
//           placeholder='Search notes or date (e.g. "meeting" or "2025-12-08")'
//           value={search}
//           onChangeText={setSearch}
//           autoCapitalize="none"
//           // Add Accessibility label
//           accessibilityLabel="Search gallery files"
//         />
//       </View>

//       <ScrollView
//         style={styles.scrollView}
//         contentContainerStyle={styles.contentContainer}
//         // Implement Pull-to-Refresh
//         refreshControl={
//           <RefreshControl refreshing={isFetching} onRefresh={onRefresh} tintColor="#4F46E5" />
//         }
//       >
//         {renderContent()}
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// // --- STYLES ---
// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#F9FAFB', // Lighter background for a modern look
//   },
//   header: {
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     backgroundColor: '#FFFFFF', // White header background
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E7EB',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: '700', // Bolder title
//     color: '#1F2937', // Darker text color
//     textAlign: 'left', // Align title left
//   },
//   searchContainer: {
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     backgroundColor: '#FFFFFF', // Keep search input on a clean background
//   },
//   scrollView: {
//     flex: 1,
//   },
//   contentContainer: {
//     padding: 8, // Padding for the masonry groups
//   },
//   // Improved message styles
//   messageContainer: {
//     paddingVertical: 40,
//     paddingHorizontal: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   errorMessage: {
//     color: '#EF4444',
//     marginTop: 8,
//     fontSize: 14,
//     fontWeight: '500',
//     textAlign: 'center',
//   },
//   // Improved empty state styles
//   emptyContainer: {
//     paddingVertical: 60, // More vertical space
//     paddingHorizontal: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#FFFFFF',
//     borderRadius: 8,
//     margin: 16,
//   },
//   emptyText: {
//     color: '#4B5563',
//     fontSize: 16,
//     fontWeight: '600', // Slightly bolder
//     marginTop: 12,
//   },
//   emptySub: {
//     color: '#9CA3AF',
//     fontSize: 13,
//     marginTop: 6,
//     textAlign: 'center',
//     lineHeight: 18,
//   },
// });

// export default GalleryScreen;

// src/screens/View/GalleryScreen.tsx

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  Platform, // Use Platform for platform-specific shadows
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useGetFilesQuery } from '../../api/filesApi';
import { useFileGroup } from '../../hooks/useFileGroup';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import MasonryGroup from '../../components/gallery/MasonryGroup';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ViewStackParamList } from '../../types/navigation';

type Nav = NativeStackNavigationProp<ViewStackParamList, 'Gallery'>;

// --- COLOR PALETTE ---
const COLORS = {
  background: '#F8F9FB', // Lightest gray for main background
  surface: '#FFFFFF', // White for cards/elements
  primary: '#1E40AF', // Deep blue for actions/refresh
  textPrimary: '#1F2937', // Dark text
  textSecondary: '#6B7280', // Gray text
  error: '#DC2626', // Red
};

const GalleryScreen: React.FC = () => {
  const [search, setSearch] = useState('');
  const { data, isLoading, error, refetch, isFetching } = useGetFilesQuery();
  const { groups } = useFileGroup(data, search);
  const navigation = useNavigation<Nav>();

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (isLoading && !data) {
    return <Loading size="large" />;
  }

  // --- RENDERING LOGIC ---
  const renderContent = () => {
    if (error) {
      return (
        <View style={styles.messageContainer}>
          <Icon name="alert-circle-outline" size={30} color={COLORS.error} />
          <Text style={styles.errorMessage}>
            Failed to load files. Check your connection or pull down to retry.
          </Text>
        </View>
      );
    }

    if (groups.length === 0) {
      return (
        <View style={styles.emptyCard}>
          <Icon name="folder-open-outline" size={50} color={COLORS.textSecondary} />
          <Text style={styles.emptyText}>No media found</Text>
          <Text style={styles.emptySub}>
            Try uploading from the Home tab or clear your current search: **"{search}"**
          </Text>
        </View>
      );
    }

    // Render file groups
    return (
      <View style={styles.masonryContainer}>
        {groups.map((group) => (
      <MasonryGroup
        key={group.group_id}
        group={group}
        onFilePress={(fileIndex) => {
          const file = group.files[fileIndex];

          // Construct the required fullId = "groupId.sub_id"
          const fullId = `${group.group_id}.${file.sub_id}`;
          navigation.navigate('FileDetail', {
            groupId: group.group_id,
            index: fileIndex,
            fileId: fullId,
            deleteRequested: false,
          });

        }}
      />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Media Library</Text>
        <Text style={styles.subtitle}>View your grouped files and notes.</Text>
      </View>

      {/* SEARCH INPUT - Now uses a card/shadow style */}
      <View style={styles.searchCard}>
        <Input
          placeholder='Search notes or date (e.g. "meeting" or "2025-12-08")'
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          accessibilityLabel="Search media library"
        />
      </View>

      {/* SCROLLABLE CONTENT */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: COLORS.surface,
  },
  title: {
    fontSize: 28, // Larger title
    fontWeight: '800', // Extra bold for impact
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  // Card styling for Search Bar
  searchCard: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    // Soft Shadow for elevation
    ...Platform.select({
      ios: {
        shadowColor: COLORS.textPrimary,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
    marginBottom: 10,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 10,
    paddingBottom: 40, // Extra space at the bottom
  },
  // Masonry container to manage padding around groups
  masonryContainer: {
    paddingHorizontal: 6, // Reduced horizontal padding for masonry look
  },
  // Improved message styles (Error)
  messageContainer: {
    paddingVertical: 50,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorMessage: {
    color: COLORS.error,
    marginTop: 10,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
  },
  // Improved empty state (now a "card")
  emptyCard: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12, // Rounded corners
    margin: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB', // Subtle border
  },
  emptyText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySub: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default GalleryScreen;