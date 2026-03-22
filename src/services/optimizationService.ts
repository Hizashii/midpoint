import { Participant, Venue, VenueCandidate } from '../types';

export const optimizationService = {
  calculateMidpoint(participants: Participant[]): { lat: number; lng: number } | null {
    const validLocations = participants
      .map(p => p.location)
      .filter((loc): loc is { lat: number; lng: number } => !!loc);
    
    if (validLocations.length === 0) return null;

    const latSum = validLocations.reduce((sum, loc) => sum + loc.lat, 0);
    const lngSum = validLocations.reduce((sum, loc) => sum + loc.lng, 0);

    return {
      lat: latSum / validLocations.length,
      lng: lngSum / validLocations.length,
    };
  },

  scoreVenues(venues: Venue[], participants: Participant[]): VenueCandidate[] {
    return venues.map(venue => {
      const travelTimes: Record<string, number> = {};
      participants.forEach(p => {
        const dist = this.getHaversineDistance(
          p.location?.lat || 0, p.location?.lng || 0,
          venue.location.lat, venue.location.lng
        );
        // Assuming 10km = 15min transit
        travelTimes[p.userId] = Math.max(5, Math.round(dist * 1.5)); 
      });

      const times = Object.values(travelTimes);
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      const max = Math.max(...times);
      const min = Math.min(...times);
      const variance = max - min;

      const fairnessScore = Math.max(0, Math.min(100, Math.round(100 - (variance / avg * 50))));

      return {
        ...venue,
        travelTimes,
        averageTravelTime: Math.round(avg),
        maxTravelTime: max,
        fairnessScore,
      };
    }).sort((a, b) => b.fairnessScore - a.fairnessScore);
  },

  categorizeRecommendations(venues: VenueCandidate[]) {
    if (venues.length === 0) return {};

    const bestMatch = venues[0]; // Already sorted by fairness
    
    const fastest = [...venues].sort((a, b) => a.averageTravelTime - b.averageTravelTime)[0];
    
    const fairest = [...venues].sort((a, b) => b.fairnessScore - a.fairnessScore)[0];
    
    // Simulate cheapest by looking at a hypothetical price property or using a deterministic random based on id
    const cheapest = [...venues].sort((a, b) => {
      const priceA = a.id.length % 3; // Mock price tier 0,1,2
      const priceB = b.id.length % 3;
      if (priceA === priceB) return b.fairnessScore - a.fairnessScore;
      return priceA - priceB;
    })[0];

    return {
      bestMatch,
      fastest,
      fairest,
      cheapest,
    };
  },

  getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
};
