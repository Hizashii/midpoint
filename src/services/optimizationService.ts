import { Participant, Venue, VenueCandidate, VenueScore, RankedResults, SessionPreferences } from '../types';
import { routingService } from './routingService';

/**
 * Optimization Service.
 * Orchestrates the fairness engine, travel time computations, and ranking.
 */
export const optimizationService = {
  /**
   * Calculates the weighted average center of all participants.
   * Used as the initial search center for venue discovery.
   */
  calculateSearchCenter(participants: Participant[]): { lat: number; lng: number } | null {
    const validParticipants = participants.filter(p => p.location);
    if (validParticipants.length === 0) return null;

    let totalWeight = 0;
    let latSum = 0;
    let lngSum = 0;

    validParticipants.forEach(p => {
      const weight = p.weight || 1.0;
      const loc = p.location!;
      latSum += loc.lat * weight;
      lngSum += loc.lng * weight;
      totalWeight += weight;
    });

    return {
      lat: latSum / totalWeight,
      lng: lngSum / totalWeight,
    };
  },

  /**
   * Scores a set of venues based on REAL travel times and group constraints.
   * This is an ASYNC operation as it calls the routing service.
   */
  async scoreVenues(
    venues: Venue[], 
    participants: Participant[], 
    preferences: SessionPreferences
  ): Promise<VenueCandidate[]> {
    const validParticipants = participants.filter(p => p.location);
    if (validParticipants.length === 0) return [];

    // To keep performance high and respect API limits, we limit the number of candidates we score deeply
    // In a real production app, we might use a matrix routing API for this.
    const topCandidates = venues.slice(0, 10); 

    const scoredCandidates = await Promise.all(
      topCandidates.map(async (venue) => {
        const travelTimes: Record<string, number> = {};
        let violatedConstraints = 0;
        
        // Compute travel time for each participant to this venue
        await Promise.all(
          validParticipants.map(async (p) => {
            const route = await routingService.getRoute(
              p.location!,
              { lat: venue.lat, lng: venue.lng },
              p.mode
            );
            
            const minutes = route ? route.durationMinutes : this.estimateFallbackTime(p.location!, venue, p.mode);
            travelTimes[p.userId] = minutes;
            
            if (minutes > (p.maxTravelMinutes || 60)) {
              violatedConstraints++;
            }
          })
        );

        const times = Object.values(travelTimes);
        if (times.length === 0) return null;

        const avgMinutes = times.reduce((a, b) => a + b, 0) / times.length;
        const maxMinutes = Math.max(...times);
        const minMinutes = Math.min(...times);
        const variance = maxMinutes - minMinutes;

        // Scoring formula refined:
        // Prioritize: 1. Low Violations, 2. Low Variance (Fairness), 3. Low Average Time
        let totalScore = 100 
          - (violatedConstraints * 25)
          - (variance * 1.5)
          - (avgMinutes * 1.0)
          - (maxMinutes * 0.5);

        // Preference Bonuses
        if (venue.priceLevel && preferences.budget && venue.priceLevel <= preferences.budget) totalScore += 10;
        if (venue.rating && venue.rating >= 4.5) totalScore += 5;

        // Fairness Score (0-100)
        // A perfect 100 means everyone travels exactly the same amount of time.
        const fairnessScore = Math.max(0, Math.min(100, Math.round(
          100 - (variance * 3.0)
        )));

        const score: VenueScore = {
          venueId: venue.id,
          averageMinutes: Math.round(avgMinutes),
          maxMinutes: Math.round(maxMinutes),
          variance: Math.round(variance),
          violatedConstraints,
          fairnessScore,
          totalScore: Math.max(0, Math.round(totalScore)),
        };

        return {
          ...venue,
          ...score,
          travelTimes,
        };
      })
    );

    return scoredCandidates
      .filter((v): v is VenueCandidate => v !== null)
      .sort((a, b) => b.totalScore - a.totalScore);
  },

  /**
   * Returns ranked lists for different UI tabs.
   */
  getRankedResults(candidates: VenueCandidate[]): RankedResults {
    return {
      bestMatch: [...candidates].sort((a, b) => b.totalScore - a.totalScore),
      fastest: [...candidates].sort((a, b) => a.averageMinutes - b.averageMinutes),
      fairest: [...candidates].sort((a, b) => b.fairnessScore - a.fairnessScore),
      cheapest: [...candidates].sort((a, b) => (a.priceLevel || 3) - (b.priceLevel || 3)),
      leastWalking: [...candidates].sort((a, b) => {
        // Find results where participants using 'walk' mode have the lowest times
        return a.averageMinutes - b.averageMinutes; 
      }),
    };
  },

  /**
   * Fallback estimation if routing service fails or is throttled.
   */
  estimateFallbackTime(origin: { lat: number; lng: number }, dest: { lat: number; lng: number }, mode: string): number {
    const dist = routingService.calculateHaversineDistance(origin, dest) / 1000; // km
    switch (mode) {
      case 'walk': return Math.round(dist * 12.5); 
      case 'bike': return Math.round(dist * 4.5);  
      case 'car': return Math.round(dist * 2.5 + 5);
      case 'transit': return Math.round(dist * 3.5 + 10);
      default: return Math.round(dist * 5);
    }
  }
};
