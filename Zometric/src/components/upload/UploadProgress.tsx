// src/components/upload/UploadProgress.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../../utils/constants';

interface Props {
  progress: number; // 0..1
}

const UploadProgress: React.FC<Props> = ({ progress }) => {
  const clamped = Math.max(0, Math.min(1, progress));
  return (
    <View style={styles.container}>
      <View style={[styles.bar, { width: `${clamped * 100}%` }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1F2937',
    overflow: 'hidden',
    marginTop: 4,
  },
  bar: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
});

export default UploadProgress;
