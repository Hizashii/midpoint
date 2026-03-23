import { TravelMode } from '../types';

export interface RouteResult {
  distanceMeters: number;
  durationMinutes: number;
  geometry?: string; // Encoded polyline
}

/**
 * Routing Service Abstraction.
 * Computes travel times and distances between coordinates.
 * Currently uses OSRM (Open Source Routing Machine) as the default provider.
 */
export const routingService = {
  /**
   * Calculates the travel burden from an origin to a destination.
   * Note: OSRM public demo only supports 'car' (driving) natively at /route/v1/driving.
   * For bike/walk, a production app should use a specialized provider or self-hosted OSRM profiles.
   */
  async getRoute(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    mode: TravelMode = 'car'
  ): Promise<RouteResult | null> {
    try {
      // Map app TravelMode to OSRM profiles
      // OSRM Public Server Profiles: driving, car, bike, foot
      const osrmMode = mode === 'walk' ? 'foot' : mode === 'bike' ? 'bicycle' : 'driving';
      
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/${osrmMode}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=false`
      );

      if (!response.ok) throw new Error('Routing request failed');

      const data = await response.json();

      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        return {
          distanceMeters: route.distance,
          durationMinutes: Math.round(route.duration / 60),
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching route:', error);
      // Fallback: simple birds-eye distance estimate (very rough)
      const dist = this.calculateHaversineDistance(origin, destination);
      const speedKmh = mode === 'walk' ? 5 : mode === 'bike' ? 15 : 40;
      return {
        distanceMeters: dist,
        durationMinutes: Math.round((dist / 1000) / speedKmh * 60),
      };
    }
  },

  /**
   * Helper to calculate straight-line distance in meters.
   */
  calculateHaversineDistance(
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number }
  ): number {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (point1.lat * Math.PI) / 180;
    const phi2 = (point2.lat * Math.PI) / 180;
    const deltaPhi = ((point2.lat - point1.lat) * Math.PI) / 180;
    const deltaLambda = ((point2.lng - point1.lng) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
};
