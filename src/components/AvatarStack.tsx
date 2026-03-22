import React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import { colors, radii, typography, shadows } from '../lib/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface AvatarStackProps {
  urls: string[];
  max?: number;
  size?: number;
}

export const AvatarStack = ({ urls, max = 3, size = 32 }: AvatarStackProps) => {
  const visibleUrls = urls.slice(0, max);
  const remaining = urls.length - max;

  return (
    <View style={styles.container}>
      {visibleUrls.map((url, index) => (
        <View
          key={index}
          style={[
            styles.avatarContainer,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              marginLeft: index > 0 ? -(size * 0.3) : 0,
              zIndex: urls.length - index,
            },
          ]}
        >
          {url ? (
            <Image source={{ uri: url }} style={styles.image} />
          ) : (
            <View style={[styles.image, { backgroundColor: colors.outline }]}>
               <MaterialCommunityIcons name="account" size={size * 0.6} color="white" />
            </View>
          )}
        </View>
      ))}
      {remaining > 0 && (
        <View
          style={[
            styles.avatarContainer,
            styles.remainingContainer,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              marginLeft: -(size * 0.3),
              zIndex: 0,
            },
          ]}
        >
          <Text style={[styles.remainingText, { fontSize: size * 0.35 }]}>
            +{remaining}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    borderWidth: 2,
    borderColor: 'white',
    overflow: 'hidden',
    backgroundColor: colors['surface-container-highest'],
    ...shadows.sm,
  },
  image: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  remainingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors['surface-container-high'],
  },
  remainingText: {
    fontFamily: typography.fontFamily.headlineBold,
    color: colors['on-surface-variant'],
  },
});
