import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { TabParamList } from '../types/navigation';
import FileUploadScreen from '../screens/Home/FileUploadScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../utils/constants';
import ViewStackNavigator from './ViewStackNavigator';

const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#6B7280',
        tabBarIcon: ({ color, size }) => {
          let iconName: string;

          if (route.name === 'Home') {
            iconName = 'cloud-upload-outline';
          } else if (route.name === 'View') {
            iconName = 'images-outline';
          } else {
            iconName = 'person-circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={FileUploadScreen} />
      <Tab.Screen name="View" component={ViewStackNavigator} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
