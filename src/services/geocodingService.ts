export interface GeocodeResult {
  lat: number;
  lng: number;
  address: string;
}

export const geocodingService = {
  async reverseGeocode(lat: number, lng: number): Promise<string | null> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'MidpointApp/1.0',
            'Accept-Language': 'en-US,en;q=0.9',
          },
        }
      );
      
      const data = await response.json();
      
      if (data && data.address) {
        const road = data.address.road || data.address.pedestrian;
        const houseNumber = data.address.house_number;
        const city = data.address.city || data.address.town || data.address.village || data.address.suburb;
        
        if (road && city) {
          return `${road} ${houseNumber || ''}, ${city}`.trim();
        } else if (data.display_name) {
          return data.display_name.split(',').slice(0, 2).join(',').trim();
        }
      }
      return null;
    } catch (error) {
      console.error('Error reverse geocoding with Nominatim:', error);
      return null;
    }
  },

  async searchPlaces(query: string): Promise<GeocodeResult[]> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=dk`,
        {
          headers: {
            'User-Agent': 'MidpointApp/1.0',
            'Accept-Language': 'da,en',
          },
        }
      );
      
      const data = await response.json();
      if (data && data.length > 0) {
        return data.map((item: any) => ({
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          address: item.display_name.split(',').slice(0, 2).join(',').trim(),
        }));
      }
      return [];
    } catch (error) {
      console.error('Error searching places with Nominatim:', error);
      return [];
    }
  }
};
