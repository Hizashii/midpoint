export type TravelMode = "walk" | "bike" | "car" | "transit";

export type ParticipantStatus =
  | "invited"
  | "setting_up"
  | "ready"
  | "on_the_way"
  | "late"
  | "arrived";

export interface UserProfile {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface ParticipantLocation {
  lat: number;
  lng: number;
  address?: string;
}

export interface Participant {
  id: string;
  userId: string;
  name: string;
  profile?: UserProfile;
  location?: ParticipantLocation;
  mode: TravelMode;
  maxTravelMinutes: number;
  weight: number; // importance/flexibility, default 1.0
  status: ParticipantStatus;
  etaMinutes?: number;
}

export type SessionCategory = "coffee" | "dinner" | "drinks" | "coworking" | "park" | "custom";

export interface SessionPreferences {
  category: SessionCategory;
  budget?: 1 | 2 | 3;
  indoorOnly?: boolean;
  openNow?: boolean;
}

export type SessionState =
  | "draft"
  | "waiting_for_participants"
  | "ready_to_optimize"
  | "optimized"
  | "confirmed"
  | "in_progress"
  | "completed";

export interface Venue {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: string;
  address: string;
  priceLevel?: number;
  rating?: number;
  photoUrl?: string;
  openingHours?: string;
  tags?: string[];
}

export interface VenueScore {
  venueId: string;
  averageMinutes: number;
  maxMinutes: number;
  variance: number;
  violatedConstraints: number;
  fairnessScore: number;
  totalScore: number;
}

export interface VenueCandidate extends Venue, VenueScore {
  travelTimes: Record<string, number>; // participantId -> travel time in minutes
}

export interface RankedResults {
  bestMatch: VenueCandidate[];
  fastest: VenueCandidate[];
  fairest: VenueCandidate[];
  cheapest: VenueCandidate[];
  leastWalking: VenueCandidate[];
}

export interface MeetupSession {
  id: string;
  organizerId: string;
  title: string;
  participants: Participant[];
  preferences: SessionPreferences;
  chosenVenueId?: string;
  state: SessionState;
  createdAt: string;
}
