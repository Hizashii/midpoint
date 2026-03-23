export interface GeocodeResult {
  lat: number;
  lng: number;
  address: string;
}

/**
 * Geocoding Service Abstraction.
 * Currently uses Nominatim (OpenStreetMap) as the free provider.
 */
export const geocodingService = {
  /**
   * Converts coordinates to a human-readable address.
   */
  async reverseGeocode(lat: number, lng: number): Promise<string | null> {
    try {
      // Nominatim requires a user-agent and valid request format
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'MidpointApp/1.0',
            'Accept-Language': 'en-US,en;q=0.9',
          },
        }
      );
      
      if (!response.ok) throw new Error('Geocoding request failed');
      
      const data = await response.json();
      
      if (data && data.address) {
        const road = data.address.road || data.address.pedestrian || data.address.suburb;
        const houseNumber = data.address.house_number;
        const city = data.address.city || data.address.town || data.address.village || data.address.county;
        
        if (road && city) {
          return `${road}${houseNumber ? ' ' + houseNumber : ''}, ${city}`.trim();
        } else if (data.display_name) {
          // Fallback to display name but shorten it for mobile UI
          return data.display_name.split(',').slice(0, 2).join(',').trim();
        }
      }
      return null;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  },

  /**
   * Searches for places by text query.
   */
  async searchPlaces(query: string): Promise<GeocodeResult[]> {
    if (!query || query.length < 2) return [];

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'MidpointApp/1.0',
            'Accept-Language': 'en-US,en;q=0.9',
          },
        }
      );
      
      if (!response.ok) throw new Error('Search request failed');
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        return data.map((item: any) => {
          // Clean up the display name for a cleaner UI
          const parts = item.display_name.split(',');
          const mainAddress = parts.slice(0, 2).join(',').trim();
          
          return {
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            address: mainAddress,
          };
        });
      }
      return [];
    } catch (error) {
      console.error('Error searching places:', error);
      return [];
    }
  }
};
