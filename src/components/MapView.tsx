import React from 'react';
import { ViewStyle, StyleProp } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';

MapLibreGL.setAccessToken(null);

interface MapViewProps {
  style?: StyleProp<ViewStyle>;
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta?: number;
    longitudeDelta?: number;
  };
  children?: React.ReactNode;
  customMapStyle?: any;
  provider?: any;
}

export default function MapView({ style, initialRegion, children }: MapViewProps) {
  // Rough estimate of zoom level from delta
  const zoomLevel = initialRegion?.latitudeDelta 
    ? Math.round(Math.log(360 / initialRegion.latitudeDelta) / Math.LN2) 
    : 14;

  return (
    <MapLibreGL.MapView
      style={style as any}
      styleURL="https://tiles.openfreemap.org/styles/liberty"
      logoEnabled={false}
      attributionEnabled={false}
    >
      {initialRegion && (
        <MapLibreGL.Camera
          defaultSettings={{
            centerCoordinate: [initialRegion.longitude, initialRegion.latitude],
            zoomLevel: Math.max(1, Math.min(zoomLevel, 20)),
          }}
        />
      )}
      {children}
    </MapLibreGL.MapView>
  );
}

interface MarkerProps {
  coordinate: { latitude: number; longitude: number };
  children?: React.ReactNode;
  id?: string;
}

export function Marker({ coordinate, children, id }: MarkerProps) {
  const markerId = id || `marker-${coordinate.latitude}-${coordinate.longitude}`;
  return (
    <MapLibreGL.PointAnnotation 
      id={markerId} 
      coordinate={[coordinate.longitude, coordinate.latitude]}
    >
      {children}
    </MapLibreGL.PointAnnotation>
  );
}

export const PROVIDER_GOOGLE = 'google';
export const Circle = () => null;
export const Polygon = () => null;
