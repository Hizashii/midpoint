import { MeetupSession, VenueCandidate, UserProfile, Participant } from '../types';

export const mockUsers: Record<string, UserProfile> = {
  'user_1': { id: 'user_1', name: 'Alex', avatarUrl: 'https://i.pravatar.cc/150?u=user_1' },
  'user_2': { id: 'user_2', name: 'Jordan', avatarUrl: 'https://i.pravatar.cc/150?u=user_2' },
  'user_3': { id: 'user_3', name: 'Taylor', avatarUrl: 'https://i.pravatar.cc/150?u=user_3' },
};

export const mockVenues: VenueCandidate[] = [
  {
    id: 'venue_1',
    name: 'The Coffee Collective',
    category: 'coffee',
    lat: 55.6761,
    lng: 12.5683,
    address: 'Torvehallerne, 1360 København',
    photoUrl: 'https://picsum.photos/seed/v1/400/400',
    rating: 4.8,
    venueId: 'venue_1',
    fairnessScore: 92,
    averageMinutes: 12,
    maxMinutes: 15,
    variance: 5,
    violatedConstraints: 0,
    totalScore: 92,
    travelTimes: { 'user_1': 10, 'user_2': 11, 'user_3': 15 },
  },
  {
    id: 'venue_2',
    name: 'Lakeside Park',
    category: 'park',
    lat: 55.6811,
    lng: 12.5583,
    address: 'Dronning Louises Bro, 2200 København',
    photoUrl: 'https://picsum.photos/seed/v2/400/400',
    rating: 4.6,
    venueId: 'venue_2',
    fairnessScore: 85,
    averageMinutes: 18,
    maxMinutes: 22,
    variance: 8,
    violatedConstraints: 0,
    totalScore: 85,
    travelTimes: { 'user_1': 14, 'user_2': 18, 'user_3': 22 },
  },
  {
    id: 'venue_3',
    name: 'Central Station Cafe',
    category: 'coffee',
    lat: 55.6731,
    lng: 12.5643,
    address: 'Bernstorffsgade 16, 1577 København',
    photoUrl: 'https://picsum.photos/seed/v3/400/400',
    rating: 4.2,
    venueId: 'venue_3',
    fairnessScore: 78,
    averageMinutes: 15,
    maxMinutes: 25,
    variance: 20,
    violatedConstraints: 0,
    totalScore: 78,
    travelTimes: { 'user_1': 5, 'user_2': 15, 'user_3': 25 },
  }
];

export const mockParticipants: Participant[] = [
  { 
    id: 'p_1', 
    userId: 'user_1', 
    name: 'Alex', 
    profile: { id: 'user_1', name: 'Alex', avatarUrl: 'https://i.pravatar.cc/150?u=user_1' },
    status: 'arrived', 
    etaMinutes: 0,
    mode: 'walk',
    maxTravelMinutes: 30,
    weight: 1.0,
    location: { lat: 55.6761, lng: 12.5683 }
  },
  { 
    id: 'p_2', 
    userId: 'user_2', 
    name: 'Jordan', 
    profile: { id: 'user_2', name: 'Jordan', avatarUrl: 'https://i.pravatar.cc/150?u=user_2' },
    status: 'on_the_way', 
    etaMinutes: 5,
    mode: 'bike',
    maxTravelMinutes: 20,
    weight: 1.0,
    location: { lat: 55.6700, lng: 12.5600 }
  },
  { 
    id: 'p_3', 
    userId: 'user_3', 
    name: 'Taylor', 
    profile: { id: 'user_3', name: 'Taylor', avatarUrl: 'https://i.pravatar.cc/150?u=user_3' },
    status: 'on_the_way', 
    etaMinutes: 12,
    mode: 'transit',
    maxTravelMinutes: 45,
    weight: 1.2,
    location: { lat: 55.6600, lng: 12.5800 }
  },
];

export const mockSessions: MeetupSession[] = [
  {
    id: 'session_1',
    organizerId: 'user_1',
    title: 'Afternoon Coffee',
    preferences: {
      category: 'coffee',
      budget: 2,
    },
    createdAt: new Date().toISOString(),
    state: 'confirmed',
    chosenVenueId: 'venue_1',
    participants: mockParticipants
  }
];
