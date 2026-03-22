import { create } from 'zustand';
import { MeetupSession, VenueCandidate } from '../types';
import { mockSessions, mockVenues } from '../data/mockData';

interface MeetupState {
  sessions: MeetupSession[];
  activeSession: MeetupSession | null;
  venueCandidates: VenueCandidate[];
  setActiveSession: (session: MeetupSession) => void;
  createSession: (session: Partial<MeetupSession>) => void;
  setVenueCandidates: (venues: VenueCandidate[]) => void;
}

export const useMeetupStore = create<MeetupState>((set) => ({
  sessions: mockSessions,
  activeSession: null,
  venueCandidates: mockVenues,
  setActiveSession: (session) => set({ activeSession: session }),
  createSession: (session) => set((state) => {
    const newSession: MeetupSession = {
      id: `session_${Date.now()}`,
      title: session.title || 'New Meetup',
      type: session.type || 'general',
      date: session.date || new Date().toISOString(),
      participants: session.participants || [],
      status: 'planning',
    };
    return { sessions: [...state.sessions, newSession], activeSession: newSession };
  }),
  setVenueCandidates: (venues) => set({ venueCandidates: venues }),
}));
