import { useEffect, useState } from 'react';
import { supabase, isPlaceholder } from '../lib/supabase';
import { MeetupSession } from '../types';
import { meetupService } from '../services/meetupService';

export function useRealtimeSession(sessionId: string) {
  const [session, setSession] = useState<MeetupSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;

    const fetchSession = async () => {
      const data = await meetupService.getSession(sessionId);
      setSession(data);
      setLoading(false);
    };

    fetchSession();

    if (isPlaceholder) return;

    const channel = supabase
      .channel(`session:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meetup_sessions',
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          console.log('Realtime Session Update:', payload);
          fetchSession();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'session_participants',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          console.log('Realtime Participant Update:', payload);
          fetchSession();
        }
      )
      .subscribe((status) => {
        console.log(`Realtime Subscription Status for ${sessionId}:`, status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  return { session, loading };
}
