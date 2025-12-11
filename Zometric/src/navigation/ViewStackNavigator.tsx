// src/navigation/ViewStackNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GalleryScreen from '../screens/View/GalleryScreen';
import FileDetailScreen from '../screens/View/FileDetailScreen';
import type { ViewStackParamList } from '../types/navigation';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Stack = createNativeStackNavigator<ViewStackParamList>();

const ViewStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      {/* Gallery Screen */}
      <Stack.Screen
        name="Gallery"
        component={GalleryScreen}
        options={{ headerShown: false }}
      />

      {/* File Detail Screen */}
      <Stack.Screen
        name="FileDetail"
        component={FileDetailScreen}
        options={({ navigation, route }) => ({
          headerTitle: (route.params as any)?.title ?? 'View File',
          headerTintColor: '#111827',
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerShadowVisible: true,

          // BACK BUTTON
          headerLeft: () => (
            <Ionicons
              name="chevron-back"
              size={24}
              color="#2563EB"
              style={{ marginLeft: 8 }}
              onPress={() => navigation.goBack()}
            />
          ),

          // DELETE BUTTON
          headerRight: () => (
            <Ionicons
              name="trash-outline"
              size={24}
              color="red"
              style={{ marginRight: 12 }}
              onPress={() => {
                // 🔥 Correct: Update params, do NOT navigate again
                navigation.setParams({ deleteRequested: true });
              }}
            />
          ),
        })}
      />
    </Stack.Navigator>
  );
};

export default ViewStackNavigator;
