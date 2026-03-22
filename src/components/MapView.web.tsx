import React from 'react';
import { View, StyleSheet } from 'react-native';

const MapView: any = ({ children, style, initialRegion }: any) => {
  // Use OpenStreetMap export iframe for a real map view on web
  const lat = initialRegion?.latitude || 55.6761;
  const lon = initialRegion?.longitude || 12.5683;
  const zoom = 14;
  
  // Create an OSM embed URL that includes the marker if it's a single point
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lon-0.02}%2C${lat-0.02}%2C${lon+0.02}%2C${lat+0.02}&layer=mapnik&marker=${lat}%2C${lon}`;

  return (
    <View style={[style, { backgroundColor: '#f1edec', overflow: 'hidden' }]}>
      <iframe
        key={`${lat}-${lon}`} // Force re-render when coordinates change
        width="100%"
        height="100%"
        frameBorder="0"
        scrolling="no"
        marginHeight={0}
        marginWidth={0}
        src={mapUrl}
        style={{ border: 0 }}
      />
      <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' } as any]}>
        {children}
      </View>
    </View>
  );
};

const Marker: any = ({ children, coordinate }: any) => {
  if (!children) return null;
  // Position marker children absolutely over the iframe if possible, 
  // but for simplicity we'll just render them in a hidden way or simple overlay.
  return (
    <View style={{ position: 'absolute', left: '50%', top: '50%', transform: [{translateX: -18}, {translateY: -18}] }}>
      {children}
    </View>
  );
};

const Circle: any = () => null;
const Polygon: any = () => null;
const PROVIDER_GOOGLE = 'google';

export { Marker, PROVIDER_GOOGLE, Circle, Polygon };
export default MapView;
