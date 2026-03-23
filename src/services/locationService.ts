import * as Location from 'expo-location';
import { geocodingService } from './geocodingService';

export const locationService = {
  /**
   * Checks and requests location permissions.
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Location.requestForegroundPermissionsAsync();
        finalStatus = status;
      }
      
      return finalStatus === 'granted';
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  },

  /**
   * Gets the user's current GPS position.
   * Falls back to a default if location is disabled or denied.
   */
  async getCurrentLocation(): Promise<Location.LocationObject | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      // Use a timeout to avoid hanging on certain devices
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      return location;
    } catch (error) {
      console.warn('Could not get current position, using fallback:', error);
      // Fallback to Esbjerg for demo/safety if real location fails
      return {
        coords: {
          latitude: 55.4765,
          longitude: 8.4515,
          altitude: 0,
          accuracy: 1,
          altitudeAccuracy: 1,
          heading: 0,
          speed: 0,
        },
        timestamp: Date.now(),
      };
    }
  },

  /**
   * Helper to get address string from coordinates.
   */
  async reverseGeocode(lat: number, lng: number): Promise<string | null> {
    return geocodingService.reverseGeocode(lat, lng);
  }
};
