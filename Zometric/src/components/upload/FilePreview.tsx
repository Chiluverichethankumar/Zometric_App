// src/components/upload/FilePreview.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { HashedFile } from '../../hooks/useFileHash';
import { formatBytes } from '../../utils/fileUtils';
import DedupeBadge from './DedupeBadge';

interface Props {
  file: HashedFile;
  onRemove: () => void;
}

const FilePreview: React.FC<Props> = ({ file, onRemove }) => {
  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text numberOfLines={1} style={styles.name}>
          {file.name}
        </Text>
        <Text style={styles.size}>{formatBytes(file.size)}</Text>
        <DedupeBadge visible={file.isDuplicate} />
      </View>
      <TouchableOpacity onPress={onRemove}>
        <Text style={styles.remove}>Remove</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  info: { flex: 1, marginRight: 8 },
  name: { fontWeight: '600' },
  size: { fontSize: 12, color: '#9CA3AF' },
  remove: { color: '#EF4444', fontSize: 12 },
});

export default FilePreview;
