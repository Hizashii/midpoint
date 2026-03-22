import { MeetupSession, VenueCandidate, UserProfile } from '../types';

export const mockUsers: Record<string, UserProfile> = {
  'user_1': { id: 'user_1', name: 'Alex', avatarUrl: 'https://i.pravatar.cc/150?u=user_1' },
  'user_2': { id: 'user_2', name: 'Jordan', avatarUrl: 'https://i.pravatar.cc/150?u=user_2' },
  'user_3': { id: 'user_3', name: 'Taylor', avatarUrl: 'https://i.pravatar.cc/150?u=user_3' },
};

export const mockVenues: VenueCandidate[] = [
  {
    id: 'venue_1',
    name: 'The Coffee Collective',
    type: 'coffee',
    location: { lat: 55.6761, lng: 12.5683 },
    address: 'Torvehallerne, 1360 København',
    photoUrl: 'https://picsum.photos/seed/v1/400/400',
    rating: 4.8,
    fairnessScore: 92,
    averageTravelTime: 12,
    maxTravelTime: 15,
    travelTimes: { 'user_1': 10, 'user_2': 11, 'user_3': 15 },
  },
  {
    id: 'venue_2',
    name: 'Lakeside Park',
    type: 'park',
    location: { lat: 55.6811, lng: 12.5583 },
    address: 'Dronning Louises Bro, 2200 København',
    photoUrl: 'https://picsum.photos/seed/v2/400/400',
    rating: 4.6,
    fairnessScore: 85,
    averageTravelTime: 18,
    maxTravelTime: 22,
    travelTimes: { 'user_1': 14, 'user_2': 18, 'user_3': 22 },
  },
  {
    id: 'venue_3',
    name: 'Central Station Cafe',
    type: 'coffee',
    location: { lat: 55.6731, lng: 12.5643 },
    address: 'Bernstorffsgade 16, 1577 København',
    photoUrl: 'https://picsum.photos/seed/v3/400/400',
    rating: 4.2,
    fairnessScore: 78,
    averageTravelTime: 15,
    maxTravelTime: 25,
    travelTimes: { 'user_1': 5, 'user_2': 15, 'user_3': 25 },
  }
];

export const mockSessions: MeetupSession[] = [
  {
    id: 'session_1',
    title: 'Afternoon Coffee',
    type: 'coffee',
    date: new Date().toISOString(),
    status: 'active',
    selectedVenueId: 'venue_1',
    participants: [
      { id: 'p_1', userId: 'user_1', profile: mockUsers['user_1'], status: 'arrived', etaMinutes: 0 },
      { id: 'p_2', userId: 'user_2', profile: mockUsers['user_2'], status: 'en_route', etaMinutes: 5 },
      { id: 'p_3', userId: 'user_3', profile: mockUsers['user_3'], status: 'en_route', etaMinutes: 12 },
    ]
  }
];
