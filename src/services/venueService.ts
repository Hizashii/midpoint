import { Venue } from '../types';

export const venueService = {
  /**
   * Fetches venues from OpenStreetMap using the Overpass API.
   * Includes a timeout and robust mock fallback for demo stability.
   */
  async findVenues(lat: number, lng: number, type: string = 'coffee', radiusMeters: number = 1500): Promise<Venue[]> {
    const amenity = this.mapTypeToAmenity(type);
    
    const query = `
      [out:json][timeout:15];
      (
        node["amenity"="${amenity}"](around:${radiusMeters},${lat},${lng});
        way["amenity"="${amenity}"](around:${radiusMeters},${lat},${lng});
        node["leisure"="${amenity}"](around:${radiusMeters},${lat},${lng});
      );
      out body;
      >;
      out skel qt;
    `;

    try {
      // Add a client-side timeout to the fetch call
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();
      
      if (!data.elements || data.elements.length === 0) {
        return this.getMockVenues(lat, lng, type);
      }

      return data.elements
        .filter((el: any) => el.tags && el.tags.name)
        .map((el: any) => ({
          id: el.id.toString(),
          name: el.tags.name,
          type: type,
          location: {
            lat: el.lat || (el.center ? el.center.lat : lat),
            lng: el.lon || (el.center ? el.center.lon : lng),
          },
          address: el.tags['addr:street'] 
            ? `${el.tags['addr:street']} ${el.tags['addr:housenumber'] || ''}`.trim()
            : `${type.charAt(0).toUpperCase() + type.slice(1)} near you`,
          rating: 4.0 + (Math.random() * 0.9),
          photoUrl: `https://picsum.photos/seed/${el.id}/400/300`
        }));
    } catch (error) {
      console.warn('Overpass API failed or timed out, using high-quality mock data for demo:', error);
      return this.getMockVenues(lat, lng, type);
    }
  },

  /**
   * Generates high-quality mock venues centered around the midpoint.
   * Ensures the demo always works even without internet or slow API.
   */
  getMockVenues(lat: number, lng: number, type: string): Venue[] {
    const venues: Venue[] = [
      {
        id: 'mock_v1',
        name: type === 'coffee' ? 'The Cozy Bean' : 'Midpoint Restaurant',
        type: type,
        location: { lat: lat + 0.002, lng: lng + 0.001 },
        address: 'Havnegade 12, Esbjerg',
        rating: 4.8,
        photoUrl: 'https://picsum.photos/seed/m1/400/300'
      },
      {
        id: 'mock_v2',
        name: type === 'coffee' ? 'Espresso House' : 'Urban Diner',
        type: type,
        location: { lat: lat - 0.001, lng: lng - 0.003 },
        address: 'Torvegade 5, Esbjerg',
        rating: 4.5,
        photoUrl: 'https://picsum.photos/seed/m2/400/300'
      },
      {
        id: 'mock_v3',
        name: type === 'coffee' ? 'Library Cafe' : 'Central Kitchen',
        type: type,
        location: { lat: lat + 0.004, lng: lng - 0.002 },
        address: 'Skolegade 22, Esbjerg',
        rating: 4.2,
        photoUrl: 'https://picsum.photos/seed/m3/400/300'
      }
    ];
    return venues;
  },

  mapTypeToAmenity(type: string): string {
    const map: Record<string, string> = {
      coffee: 'cafe',
      food: 'restaurant',
      drinks: 'pub',
      park: 'park',
      work: 'library',
    };
    return map[type] || 'cafe';
  }
};
