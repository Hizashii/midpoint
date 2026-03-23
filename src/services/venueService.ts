import { Venue, SessionPreferences } from '../types';

/**
 * Venue Service Abstraction.
 * Fetches and filters real place data based on group preferences.
 * Currently uses OpenStreetMap (Overpass API) as the primary data source.
 */
export const venueService = {
  /**
   * Fetches venues from OpenStreetMap using the Overpass API.
   * Uses a timeout and robust fallback for reliability.
   */
  async findVenues(
    lat: number, 
    lng: number, 
    preferences: SessionPreferences, 
    radiusMeters: number = 3000
  ): Promise<Venue[]> {
    const amenity = this.mapCategoryToAmenity(preferences.category);
    
    // Optimized Overpass Query: Search for specific amenities/leisure tags
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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); 

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error('Venue request failed');
      
      const data = await response.json();
      
      let venues: Venue[] = [];
      
      if (!data.elements || data.elements.length === 0) {
        return this.getFallbackVenues(lat, lng, preferences.category);
      }

      venues = data.elements
        .filter((el: any) => el.tags && el.tags.name)
        .map((el: any) => {
          const venueName = el.tags.name;
          const photoUrl = `https://source.unsplash.com/featured/?${preferences.category},${venueName.replace(/\s+/g, '')}`;
          
          return {
            id: el.id.toString(),
            name: venueName,
            category: preferences.category,
            lat: el.lat || (el.center ? el.center.lat : lat),
            lng: el.lon || (el.center ? el.center.lon : lng),
            address: el.tags['addr:street'] 
              ? `${el.tags['addr:street']} ${el.tags['addr:housenumber'] || ''}`.trim()
              : `${preferences.category.charAt(0).toUpperCase() + preferences.category.slice(1)} in this area`,
            priceLevel: this.estimatePriceLevel(el.tags),
            rating: 4.0 + (Math.random() * 0.9), // OSM doesn't have ratings, we simulate for UI depth
            photoUrl: photoUrl,
            tags: this.extractTags(el.tags)
          };
        });

      return this.filterVenues(venues, preferences);
    } catch (error) {
      console.warn('Venue fetching failed, using fallback data:', error);
      return this.getFallbackVenues(lat, lng, preferences.category);
    }
  },

  /**
   * Fetches rich detail for a specific venue.
   */
  async getVenueDetails(venueId: string, venueName?: string): Promise<any> {
    // Simulation of detailed fetch (Google/Yelp would go here)
    await new Promise(resolve => setTimeout(resolve, 400));

    const name = venueName || "Local Spot";
    
    return {
      id: venueId,
      description: `A highly recommended ${name} known for its quality and inviting atmosphere. A perfect midpoint for your group.`,
      reviews: [
        { id: 'r1', author: 'Anna S.', rating: 5, text: "Truly a hidden gem. The seating was great for our large group.", date: 'Yesterday' },
        { id: 'r2', author: 'Mark L.', rating: 4, text: "Excellent coffee and fast wifi. A bit busy but worth it.", date: '3 days ago' }
      ],
      openingHours: "Mon-Sun: 08:00 - 22:00",
      phoneNumber: "+45 00 00 00 00",
      website: `https://www.google.com/search?q=${encodeURIComponent(name)}`,
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`
    };
  },

  /**
   * Applies user-defined filters to candidate venues.
   */
  filterVenues(venues: Venue[], preferences: SessionPreferences): Venue[] {
    return venues.filter(v => {
      // Budget filter
      if (preferences.budget && v.priceLevel && v.priceLevel > preferences.budget) {
        return false;
      }
      return true;
    });
  },

  /**
   * Mocks high-quality local data if the API is down or empty.
   */
  getFallbackVenues(lat: number, lng: number, category: string): Venue[] {
    const titles = category === 'coffee' ? ['Artisan Brew', 'The Daily Grind'] : ['Green Space', 'City Square'];
    return titles.map((name, i) => ({
      id: `fallback_${i}`,
      name,
      category,
      lat: lat + (0.005 * (i + 1)),
      lng: lng + (0.005 * (i + 1)),
      address: 'Central District',
      priceLevel: 2,
      rating: 4.7,
      photoUrl: `https://source.unsplash.com/featured/?${category},${name.replace(/\s+/g, '')}`,
      tags: ['Local Favorite', 'Midpoint Choice']
    }));
  },

  /**
   * Maps app categories to OSM amenity tags.
   */
  mapCategoryToAmenity(category: string): string {
    const map: Record<string, string> = {
      coffee: 'cafe',
      dinner: 'restaurant',
      drinks: 'pub',
      park: 'park',
      coworking: 'library',
    };
    return map[category] || 'cafe';
  },

  /**
   * Heuristic to estimate price level from OSM tags.
   */
  estimatePriceLevel(tags: any): number {
    if (tags.cuisine === 'fine_dining' || tags.price === 'expensive') return 3;
    if (tags.amenity === 'fast_food' || tags.price === 'cheap') return 1;
    return 2;
  },

  /**
   * Extracts useful metadata from OSM tags.
   */
  extractTags(tags: any): string[] {
    const extracted: string[] = [];
    if (tags.outdoor_seating === 'yes') extracted.push('Outdoor seating');
    if (tags.wheelchair === 'yes') extracted.push('Accessible');
    if (tags.internet_access === 'wlan') extracted.push('Free WiFi');
    if (tags.takeaway === 'yes') extracted.push('Takeaway');
    return extracted;
  }
};
