import React from 'react';
import { View } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';

export interface MapMarkerProps {
  coordinate: { latitude: number; longitude: number };
  children?: React.ReactNode;
  id?: string;
}

export function MapMarker({ coordinate, children, id }: MapMarkerProps) {
  const markerId =
    id ?? `marker-${coordinate.latitude.toFixed(5)}-${coordinate.longitude.toFixed(5)}`;
  return (
    <MapLibreGL.PointAnnotation id={markerId} coordinate={[coordinate.longitude, coordinate.latitude]}>
      <View collapsable={false}>{children}</View>
    </MapLibreGL.PointAnnotation>
  );
}

/** Default export alias for legacy `import { Marker } from '../MapView'`. */
export const Marker = MapMarker;
