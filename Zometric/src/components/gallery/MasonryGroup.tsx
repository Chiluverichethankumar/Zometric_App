import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import type { GalleryGroup } from '../../hooks/useFileGroup';
import FileCard from './FileCard';

interface Props {
  group: GalleryGroup;
  onFilePress?: (fileIndex: number) => void;
}

const MasonryGroup: React.FC<Props> = ({ group, onFilePress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.date}>{group.displayDate}</Text>
      <Text style={styles.note}>{group.note}</Text>
      <Text style={styles.count}>{group.total_files} files</Text>

      <FlatList
        data={group.files}
        keyExtractor={(_, index) => `${group.group_id}-${index}`}
        numColumns={3}
        columnWrapperStyle={styles.row}
        renderItem={({ item, index }) => (
          <View style={styles.cardWrapper}>
            <FileCard
              uri={item.supabase_url}
              name={item.original_name}
              onPress={() => onFilePress?.(index)}
            />
          </View>
        )}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  date: {
    fontSize: 12,
    color: '#6B7280',
  },
  note: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 2,
  },
  count: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
    marginBottom: 8,
  },
  row: {
    justifyContent: 'space-between',
  },
  cardWrapper: {
    flex: 1 / 3,
    marginVertical: 4,
  },
});

export default MasonryGroup;
