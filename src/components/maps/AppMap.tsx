import React from 'react';
import { ViewStyle, StyleProp } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import {
  getMapStyleConfig,
  resolveMapStyleURL,
  MAP_STYLE_PRESETS,
  type MapStylePresetKey,
} from '../../config/mapStyles';

MapLibreGL.setAccessToken(null);

export type MapRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta?: number;
  longitudeDelta?: number;
};

export type AppMapProps = {
  style?: StyleProp<ViewStyle>;
  initialRegion?: MapRegion;
  children?: React.ReactNode;
  /**
   * Preset overrides active config for this map only.
   * Prefer global `setMapStyleConfig` for app-wide theme.
   */
  mapStylePreset?: MapStylePresetKey;
  /** Fully override style URL (e.g. A/B test) */
  styleURL?: string;
  /** Calmer, “premium” defaults */
  rotateEnabled?: boolean;
  pitchEnabled?: boolean;
  scrollEnabled?: boolean;
  zoomEnabled?: boolean;
  compassEnabled?: boolean;
  logoEnabled?: boolean;
  attributionEnabled?: boolean;
};

function zoomFromRegion(region: MapRegion | undefined): number {
  const delta = region?.latitudeDelta ?? 0.025;
  const z = Math.round(Math.log(360 / delta) / Math.LN2);
  return Math.max(11, Math.min(z, 19));
}

/**
 * MapLibre map wired to OpenFreeMap styles via `src/config/mapStyles`.
 */
export default function AppMap({
  style,
  initialRegion,
  children,
  mapStylePreset,
  styleURL: styleURLProp,
  rotateEnabled = false,
  pitchEnabled = false,
  scrollEnabled = true,
  zoomEnabled = true,
  compassEnabled = false,
  logoEnabled = false,
  attributionEnabled = true,
}: AppMapProps) {
  const styleURL =
    styleURLProp ??
    (mapStylePreset != null
      ? MAP_STYLE_PRESETS[mapStylePreset]
      : resolveMapStyleURL(getMapStyleConfig()));

  const mapProps = {
    style: style as object,
    styleURL,
    rotateEnabled,
    pitchEnabled,
    scrollEnabled,
    zoomEnabled,
    compassEnabled,
    logoEnabled,
    attributionEnabled,
  } as React.ComponentProps<typeof MapLibreGL.MapView>;

  return (
    <MapLibreGL.MapView {...mapProps}>
      {initialRegion && (
        <MapLibreGL.Camera
          defaultSettings={{
            centerCoordinate: [initialRegion.longitude, initialRegion.latitude],
            zoomLevel: zoomFromRegion(initialRegion),
          }}
        />
      )}
      {children}
    </MapLibreGL.MapView>
  );
}
