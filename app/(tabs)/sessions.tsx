import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { colors, typography, spacing, radii, shadows } from '../../src/lib/theme';
import { MeetupSessionCard } from '../../src/components/MeetupSessionCard';
import { useAuthStore } from '../../src/store/authStore';
import { meetupService } from '../../src/services/meetupService';
import { MeetupSession } from '../../src/types';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';

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

  // Modern states: waiting_for_participants, confirmed, completed
  const activeSessions = sessions.filter(s => s.state !== 'completed');
  const pastSessions = sessions.filter(s => s.state === 'completed');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Your Meetups</Text>
          <Text style={styles.subtitle}>{sessions.length} sessions total</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          activeOpacity={0.8}
          onPress={() => router.push('/meetup/type')}
        >
          <MaterialCommunityIcons name="plus" size={28} color="white" />
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
              <MaterialCommunityIcons name="map-marker-path" size={64} color={colors.outline} />
            </View>
            <Text style={styles.emptyTitle}>The map is quiet</Text>
            <Text style={styles.emptySubtitle}>You haven't planned any meetups yet. Start one to find the perfect middle ground.</Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              activeOpacity={0.9}
              onPress={() => router.push('/meetup/type')}
            >
              <Text style={styles.emptyButtonText}>Start First Meetup</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {activeSessions.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>ACTIVE & UPCOMING</Text>
                {activeSessions.map((session) => (
                  <MeetupSessionCard 
                    key={session.id}
                    title={session.title}
                    time={session.state === 'confirmed' ? "Confirmed" : "Waiting for friends"}
                    image={`https://source.unsplash.com/featured/?${session.preferences.category},venue`}
                    avatars={session.participants.map(p => p.profile?.avatarUrl || `https://i.pravatar.cc/150?u=${p.userId}`)}
                    isToday={true}
                    onPress={() => router.push(`/session/${session.id}` as any)}
                  />
                ))}
              </View>
            )}

            {pastSessions.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>PAST MEETUPS</Text>
                {pastSessions.map((session) => (
                  <MeetupSessionCard 
                    key={session.id}
                    title={session.title}
                    time="Completed"
                    image={`https://source.unsplash.com/featured/?${session.preferences.category},building`}
                    avatars={session.participants.map(p => p.profile?.avatarUrl || `https://i.pravatar.cc/150?u=${p.userId}`)}
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
    paddingTop: 24,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: typography.fontFamily.headlineExtraBold,
    fontSize: 32,
    color: colors['on-surface'],
    letterSpacing: -0.8,
  },
  subtitle: {
    fontFamily: typography.fontFamily.body,
    fontSize: 14,
    color: colors.outline,
    marginTop: 2,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
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
    marginBottom: 40,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 12,
    color: colors.outline,
    marginBottom: 20,
    letterSpacing: 1.5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 24,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors['surface-container-low'],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  emptyTitle: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 24,
    color: colors['on-surface'],
    marginBottom: 12,
  },
  emptySubtitle: {
    fontFamily: typography.fontFamily.body,
    fontSize: 16,
    color: colors.outline,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: radii.xl,
    ...shadows.lg,
  },
  emptyButtonText: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 16,
    color: 'white',
  }
});
