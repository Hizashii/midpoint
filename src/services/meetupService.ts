import { supabase, isPlaceholder } from '../lib/supabase';
import { MeetupSession, Participant, SessionCategory } from '../types';
import { mockSessions } from '../data/mockData';

// Local cache for non-Supabase demo sessions (e.g. initial onboarding)
const demoSessionsCache: Record<string, MeetupSession> = {};

export const meetupService = {
  /**
   * Creates a new meetup session in Supabase.
   */
  async createSession(title: string, category: SessionCategory, organizerId: string): Promise<MeetupSession | null> {
    if (isPlaceholder) {
      const mockSessionId = `mock_${Date.now()}`;
      const newSession: MeetupSession = {
        id: mockSessionId,
        organizerId,
        title,
        preferences: { category },
        createdAt: new Date().toISOString(),
        state: 'waiting_for_participants',
        participants: [
          {
            id: 'p_me',
            userId: organizerId,
            name: 'Organizer',
            profile: { id: organizerId, name: 'Organizer', avatarUrl: `https://i.pravatar.cc/150?u=${organizerId}` },
            location: { lat: 55.4765, lng: 8.4515 },
            status: 'ready',
            mode: 'car',
            maxTravelMinutes: 30,
            weight: 1.0,
          }
        ],
      };
      demoSessionsCache[mockSessionId] = newSession;
      return newSession;
    }

    try {
      // 1. Insert session record
      const { data, error } = await supabase
        .from('meetup_sessions')
        .insert({
          title,
          preferences: { category },
          organizer_id: organizerId,
          state: 'waiting_for_participants',
        })
        .select()
        .single();

      if (error) throw error;

      // 2. Automatically add creator as the first participant
      await this.joinSession(data.id, organizerId);

      return this.transformSession(data);
    } catch (error) {
      console.error('Error creating real session:', error);
      return null;
    }
  },

  /**
   * Joins an existing meetup session.
   */
  async joinSession(sessionId: string, userId: string): Promise<boolean> {
    if (isPlaceholder || sessionId.startsWith('mock_')) return true;

    try {
      const { error } = await supabase
        .from('session_participants')
        .insert({
          session_id: sessionId,
          profile_id: userId,
          status: 'setting_up',
        });

      // Ignore unique constraint error if user already joined
      if (error && error.code !== '23505') throw error;
      return true;
    } catch (error) {
      console.error('Error joining real session:', error);
      return false;
    }
  },

  /**
   * Fetches a single session with all participants.
   */
  async getSession(sessionId: string): Promise<MeetupSession | null> {
    if (isPlaceholder || sessionId.startsWith('mock_')) {
      return demoSessionsCache[sessionId] || mockSessions.find(s => s.id === sessionId) || null;
    }

    try {
      const { data, error } = await supabase
        .from('meetup_sessions')
        .select(`
          *,
          participants:session_participants(
            *,
            profile:profiles(*)
          )
        `)
        .eq('id', sessionId)
        .single();

      if (error) throw error;
      return this.transformSession(data);
    } catch (error) {
      console.error('Error fetching real session:', error);
      return null;
    }
  },

  /**
   * Fetches all sessions where the user is an organizer or participant.
   */
  async getUserSessions(profileId: string): Promise<MeetupSession[]> {
    if (isPlaceholder) {
      return [...Object.values(demoSessionsCache), ...mockSessions];
    }

    try {
      const { data, error } = await supabase
        .from('meetup_sessions')
        .select(`
          *,
          participants:session_participants(
            *,
            profile:profiles(*)
          )
        `)
        // This query finds sessions where user is organizer OR is in session_participants
        .or(`organizer_id.eq.${profileId},id.in.(select session_id from session_participants where profile_id = '${profileId}')`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(this.transformSession);
    } catch (error) {
      console.error('Error fetching user sessions from Supabase:', error);
      return [];
    }
  },

  /**
   * Confirms a venue and moves the session to 'confirmed' state.
   */
  async finalizeSession(sessionId: string, venueId: string): Promise<boolean> {
    if (isPlaceholder || sessionId.startsWith('mock_')) {
      if (demoSessionsCache[sessionId]) {
        demoSessionsCache[sessionId].state = 'confirmed';
        demoSessionsCache[sessionId].chosenVenueId = venueId;
      }
      return true;
    }

    try {
      const { error } = await supabase
        .from('meetup_sessions')
        .update({
          chosen_venue_id: venueId,
          state: 'confirmed',
        })
        .eq('id', sessionId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error finalizing real session:', error);
      return false;
    }
  },

  /**
   * Updates participant's live location and preferences.
   */
  async updateParticipantLocation(
    sessionId: string, 
    userId: string, 
    lat: number, 
    lng: number, 
    mode?: string, 
    maxMinutes?: number
  ): Promise<boolean> {
    if (isPlaceholder || sessionId.startsWith('mock_')) {
      const session = demoSessionsCache[sessionId] || mockSessions.find(s => s.id === sessionId);
      if (session) {
        const participant = session.participants.find(p => p.userId === userId);
        if (participant) {
          participant.location = { lat, lng };
          if (mode) participant.mode = mode as any;
          if (maxMinutes) participant.maxTravelMinutes = maxMinutes;
          participant.status = 'ready';
        }
        demoSessionsCache[sessionId] = { ...session };
      }
      return true;
    }

    try {
      const { error } = await supabase
        .from('session_participants')
        .update({
          lat,
          lng,
          status: 'ready',
          mode: mode || 'walk',
          max_travel_minutes: maxMinutes || 30,
        })
        .eq('session_id', sessionId)
        .eq('profile_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating real participant data:', error);
      return false;
    }
  },

  /**
   * Normalizes DB response into typed MeetupSession object.
   */
  transformSession(data: any): MeetupSession {
    return {
      id: data.id,
      organizerId: data.organizer_id,
      title: data.title,
      preferences: data.preferences,
      createdAt: data.created_at,
      state: data.state,
      chosenVenueId: data.chosen_venue_id,
      participants: (data.participants || []).map((p: any) => ({
        id: p.id,
        userId: p.profile_id,
        name: p.profile?.full_name || 'Anonymous',
        profile: p.profile ? {
          id: p.profile.id,
          name: p.profile.full_name || 'Anonymous',
          avatarUrl: p.profile.avatar_url || `https://i.pravatar.cc/150?u=${p.profile_id}`
        } : undefined,
        location: p.lat ? { lat: p.lat, lng: p.lng } : undefined,
        status: p.status,
        mode: p.mode || 'walk',
        maxTravelMinutes: p.max_travel_minutes || 30,
        weight: p.weight || 1.0,
        etaMinutes: p.eta_minutes,
      })),
    };
  }
};
