// src/components/upload/DedupeBadge.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../utils/constants';

interface Props {
  visible: boolean;
}

const DedupeBadge: React.FC<Props> = ({ visible }) => {
  if (!visible) return null;
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>Duplicate</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: COLORS.danger,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
});

export default DedupeBadge;
