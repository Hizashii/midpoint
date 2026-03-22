import { supabase, isPlaceholder } from '../lib/supabase';
import { MeetupSession, Participant } from '../types';
import { mockSessions } from '../data/mockData';

const demoSessionsCache: Record<string, MeetupSession> = {};

export const meetupService = {
  async createSession(title: string, type: string, creatorId: string): Promise<MeetupSession | null> {
    if (isPlaceholder) {
      const mockSessionId = `mock_${Date.now()}`;
      const newSession: MeetupSession = {
        id: mockSessionId,
        title,
        type,
        date: new Date().toISOString(),
        status: 'planning',
        participants: [
          {
            id: 'p_me',
            userId: creatorId,
            profile: { id: creatorId, name: 'You (Esbjerg)', avatarUrl: 'https://i.pravatar.cc/150?u=me' },
            location: { lat: 55.4765, lng: 8.4515 },
            status: 'ready',
          },
          {
            id: 'p_2',
            userId: 'friend_1',
            profile: { id: 'friend_1', name: 'Sarah (Esbjerg N)', avatarUrl: 'https://i.pravatar.cc/150?u=sarah' },
            location: { lat: 55.4850, lng: 8.4400 },
            status: 'ready',
          },
          {
            id: 'p_3',
            userId: 'friend_2',
            profile: { id: 'friend_2', name: 'James (Esbjerg S)', avatarUrl: 'https://i.pravatar.cc/150?u=james' },
            location: { lat: 55.4650, lng: 8.4650 },
            status: 'ready',
          }
        ],
      };
      demoSessionsCache[mockSessionId] = newSession;
      return newSession;
    }

    const { data, error } = await supabase
      .from('meetup_sessions')
      .insert({
        title,
        type,
        creator_id: creatorId,
        status: 'planning',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating session:', error);
      return null;
    }

    // Automatically add creator as participant
    await this.joinSession(data.id, creatorId);

    return {
      id: data.id,
      title: data.title,
      type: data.type,
      date: data.created_at,
      status: data.status,
      participants: [],
    };
  },

  async joinSession(sessionId: string, profileId: string): Promise<boolean> {
    if (isPlaceholder) return true;

    const { error } = await supabase
      .from('session_participants')
      .insert({
        session_id: sessionId,
        profile_id: profileId,
        status: 'ready',
      });

    if (error && error.code !== '23505') { // Ignore unique constraint violation (already joined)
      console.error('Error joining session:', error);
      return false;
    }
    return true;
  },

  async getSession(sessionId: string): Promise<MeetupSession | null> {
    if (isPlaceholder || sessionId.startsWith('mock_')) {
      return demoSessionsCache[sessionId] || mockSessions.find(s => s.id === sessionId) || mockSessions[0];
    }

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

    if (error) {
      console.error('Error fetching session:', error);
      return mockSessions[0]; // Fallback to mock on error
    }

    return this.transformSession(data);
  },

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
        .or(`creator_id.eq.${profileId},id.in.(select session_id from session_participants where profile_id = '${profileId}')`);

      if (error) {
        console.error('Error fetching user sessions:', error);
        return mockSessions;
      }

      return data.map(this.transformSession);
    } catch (e) {
      return mockSessions;
    }
  },

  async updateParticipantLocation(sessionId: string, profileId: string, lat: number, lng: number): Promise<void> {
    if (isPlaceholder) return;
    
    await supabase
      .from('session_participants')
      .update({ lat, lng })
      .eq('session_id', sessionId)
      .eq('profile_id', profileId);
  },

  async finalizeSession(sessionId: string, venueId: string, venueName: string): Promise<boolean> {
    if (isPlaceholder || sessionId.startsWith('mock_')) {
      if (demoSessionsCache[sessionId]) {
        demoSessionsCache[sessionId].status = 'active';
        demoSessionsCache[sessionId].selectedVenueId = venueId;
      }
      return true;
    }

    const { error } = await supabase
      .from('meetup_sessions')
      .update({
        selected_venue_id: venueId,
        status: 'active',
      })
      .eq('id', sessionId);

    return !error;
  },

  transformSession(data: any): MeetupSession {
    return {
      id: data.id,
      title: data.title,
      type: data.type,
      date: data.created_at,
      status: data.status,
      selectedVenueId: data.selected_venue_id,
      participants: (data.participants || []).map((p: any) => ({
        id: p.id,
        userId: p.profile_id,
        profile: {
          id: p.profile.id,
          name: p.profile.full_name,
          avatarUrl: p.profile.avatar_url,
        },
        location: p.lat ? { lat: p.lat, lng: p.lng } : undefined,
        status: p.status,
        etaMinutes: p.eta_minutes,
      })),
    };
  }
};
