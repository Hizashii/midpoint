import { create } from 'zustand';
import { MeetupSession, VenueCandidate, SessionState } from '../types';
import { mockSessions, mockVenues } from '../data/mockData';

interface MeetupState {
  sessions: MeetupSession[];
  activeSession: MeetupSession | null;
  venueCandidates: VenueCandidate[];
  setActiveSession: (session: MeetupSession | null) => void;
  createSession: (session: Partial<MeetupSession>) => void;
  updateSessionState: (sessionId: string, state: SessionState) => void;
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
      organizerId: session.organizerId || 'unknown',
      title: session.title || 'New Meetup',
      preferences: session.preferences || { category: 'coffee' },
      createdAt: new Date().toISOString(),
      participants: session.participants || [],
      state: 'draft',
    };
    return { sessions: [...state.sessions, newSession], activeSession: newSession };
  }),
  updateSessionState: (sessionId, newState) => set((state) => {
    const updatedSessions = state.sessions.map(s => 
      s.id === sessionId ? { ...s, state: newState } : s
    );
    const updatedActive = state.activeSession?.id === sessionId 
      ? { ...state.activeSession, state: newState } 
      : state.activeSession;
    return { sessions: updatedSessions, activeSession: updatedActive };
  }),
  setVenueCandidates: (venues) => set({ venueCandidates: venues }),
}));
