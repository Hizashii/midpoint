import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, shadows } from '../../lib/theme';
import { MapMarker } from './MapMarker';
import { SelectedVenueOverlay } from './SelectedVenueOverlay';

export type VenueMarkerProps = {
  coordinate: { latitude: number; longitude: number };
  id?: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  /** Pin fill — defaults to tertiary for venues vs user primary */
  accentColor?: string;
  selected?: boolean;
};

/**
 * Venue / POI pin — compact, white rim, optional branded selection halo.
 */
export function VenueMarker({
  coordinate,
  id,
  icon,
  accentColor = colors.tertiary,
  selected,
}: VenueMarkerProps) {
  const pin = (
    <View style={[styles.pin, { backgroundColor: accentColor }, selected && styles.pinSelected]}>
      <MaterialCommunityIcons name={icon} size={selected ? 18 : 16} color="white" />
    </View>
  );

  return (
    <MapMarker id={id} coordinate={coordinate}>
      {selected ? <SelectedVenueOverlay emphasized>{pin}</SelectedVenueOverlay> : pin}
    </MapMarker>
  );
}

const styles = StyleSheet.create({
  pin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2.5,
    borderColor: colors['surface-container-lowest'],
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  pinSelected: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    ...shadows.lg,
  },
});
