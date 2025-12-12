import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

interface Props {
  uri: string;
  name: string;
  onPress?: () => void;
}

const FileCard: React.FC<Props> = ({ uri, name, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <View style={styles.container}>
        <Image style={styles.image} source={{ uri }} resizeMode="cover" />
        <Text numberOfLines={1} style={styles.name}>
          {name}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingBottom: 4,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#E5E7EB',
  },
  name: {
    fontSize: 11,
    color: '#374151',
    marginTop: 2,
    paddingHorizontal: 4,
  },
});

export default FileCard;
