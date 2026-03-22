import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { colors, typography, spacing, radii, shadows } from '../../src/lib/theme';
import { MeetupSessionCard } from '../../src/components/MeetupSessionCard';
import { useAuthStore } from '../../src/store/authStore';
import { meetupService } from '../../src/services/meetupService';
import { MeetupSession } from '../../src/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function SessionsScreen() {
  const [sessions, setSessions] = useState<MeetupSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const user = useAuthStore((state) => state.user);

  const fetchSessions = useCallback(async () => {
    if (user?.id) {
      try {
        const data = await meetupService.getUserSessions(user.id);
        setSessions(data);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    }
  }, [user?.id]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSessions();
  };

  const activeSessions = sessions.filter(s => s.status === 'active' || s.status === 'planning' || s.status === 'deciding');
  const pastSessions = sessions.filter(s => s.status === 'completed');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Meetups</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/meetup/create')}
        >
          <MaterialCommunityIcons name="plus" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : sessions.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <MaterialCommunityIcons name="map-marker-path" size={64} color={colors['surface-container-highest']} />
            </View>
            <Text style={styles.emptyTitle}>No meetups yet</Text>
            <Text style={styles.emptySubtitle}>Plan your first meeting and find the perfect midpoint for everyone.</Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => router.push('/meetup/create')}
            >
              <Text style={styles.emptyButtonText}>Create a Meetup</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {activeSessions.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Active & Upcoming</Text>
                {activeSessions.map((session) => (
                  <MeetupSessionCard 
                    key={session.id}
                    title={session.title}
                    time="Today, 15:30" // Mock time for UI
                    image={`https://picsum.photos/seed/${session.id}/400/400`}
                    avatars={session.participants.map(p => p.profile.avatarUrl || '')}
                    isToday={true}
                    onPress={() => router.push(`/session/${session.id}` as any)}
                  />
                ))}
              </View>
            )}

            {pastSessions.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Past Meetups</Text>
                {pastSessions.map((session) => (
                  <MeetupSessionCard 
                    key={session.id}
                    title={session.title}
                    time="Oct 12, 10:00" // Mock time for UI
                    image={`https://picsum.photos/seed/${session.id}/400/400`}
                    avatars={session.participants.map(p => p.profile.avatarUrl || '')}
                    isToday={false}
                    onPress={() => router.push(`/session/${session.id}` as any)}
                  />
                ))}
              </View>
            )}
          </>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: typography.fontFamily.headlineExtraBold,
    fontSize: 32,
    color: colors['on-surface'],
    letterSpacing: -0.5,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 18,
    color: colors.outline,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors['surface-container-low'],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 22,
    color: colors['on-surface'],
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: typography.fontFamily.body,
    fontSize: 16,
    color: colors.outline,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: radii.xl,
    ...shadows.md,
  },
  emptyButtonText: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 16,
    color: 'white',
  }
});
