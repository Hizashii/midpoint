export interface UserProfile {
  id: string;
  name: string;
  avatarUrl?: string;
}

export type TransportMode = 'transit' | 'driving' | 'walking' | 'bicycling';

export interface ParticipantLocation {
  lat: number;
  lng: number;
  address?: string;
}

export interface ParticipantPreference {
  maxTravelTime: number; // in minutes
  transportMode: TransportMode;
}

export interface Participant {
  id: string;
  userId: string;
  profile: UserProfile;
  location?: ParticipantLocation;
  preferences?: ParticipantPreference;
  status: 'invited' | 'ready' | 'en_route' | 'arrived' | 'late';
  etaMinutes?: number;
}

export interface Venue {
  id: string;
  name: string;
  type: string;
  location: ParticipantLocation;
  address: string;
  photoUrl?: string;
  rating?: number;
}

export interface VenueCandidate extends Venue {
  fairnessScore: number;
  averageTravelTime: number;
  maxTravelTime: number;
  travelTimes: Record<string, number>; // participantId -> travel time in minutes
}

export interface MeetupSession {
  id: string;
  title: string;
  type: string; // e.g. 'coffee', 'dinner', 'park'
  date: string;
  participants: Participant[];
  status: 'planning' | 'deciding' | 'active' | 'completed';
  selectedVenueId?: string;
}
