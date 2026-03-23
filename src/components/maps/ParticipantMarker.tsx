import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, shadows } from '../../lib/theme';
import { MapMarker } from './MapMarker';

export type ParticipantMarkerProps = {
  coordinate: { latitude: number; longitude: number };
  avatarUrl?: string | null;
  id?: string;
  /** Slightly larger hit area for “you are here” on home */
  prominent?: boolean;
};

/**
 * Distinctive “person” pin — primary ring, white cutout (design: custom pins).
 */
export function ParticipantMarker({
  coordinate,
  avatarUrl,
  id,
  prominent,
}: ParticipantMarkerProps) {
  const size = prominent ? 48 : 42;
  const inner = prominent ? 40 : 36;

  return (
    <MapMarker id={id} coordinate={coordinate}>
      <View style={styles.halo}>
        <View style={[styles.pulse, { width: size + 14, height: size + 14, borderRadius: (size + 14) / 2 }]} />
        <View
          style={[
            styles.disc,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
        >
          <View
            style={[
              styles.inner,
              {
                width: inner,
                height: inner,
                borderRadius: inner / 2,
              },
            ]}
          >
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <MaterialIcons name="person" size={prominent ? 24 : 20} color="white" />
            )}
          </View>
        </View>
      </View>
    </MapMarker>
  );
}

const styles = StyleSheet.create({
  halo: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    position: 'absolute',
    backgroundColor: colors.primary,
    opacity: 0.14,
  },
  disc: {
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors['surface-container-lowest'],
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  inner: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors['primary-container'],
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
});
