import * as Location from 'expo-location';
import { geocodingService } from './geocodingService';

export const locationService = {
  async requestPermissions(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  },

  async getCurrentLocation(): Promise<Location.LocationObject | null> {
    // FOR TESTING: Default to Esbjerg, Denmark
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
  },

  async reverseGeocode(lat: number, lng: number): Promise<string | null> {
    return geocodingService.reverseGeocode(lat, lng);
  }
};
