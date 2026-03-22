import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Marker } from '../../src/components/MapView';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, typography, radii, spacing, shadows } from '../../src/lib/theme';
import { useMeetupStore } from '../../src/store/meetupStore';
import { useAuthStore } from '../../src/store/authStore';
import { ParticipantStatusPill } from '../../src/components/ParticipantStatusPill';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { useRealtimeSession } from '../../src/hooks/useRealtimeSession';
import { optimizationService } from '../../src/services/optimizationService';
import { venueService } from '../../src/services/venueService';

const { width, height } = Dimensions.get('window');

export default function SessionScreen() {
  const { id } = useLocalSearchParams();
  const { session, loading } = useRealtimeSession(id as string);
  const [isCalculating, setIsCalculating] = useState(false);
  const user = useAuthStore(state => state.user);
  
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Syncing with group...</Text>
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.center}>
        <MaterialIcons name="error-outline" size={48} color={colors.error} />
        <Text style={styles.errorText}>Meetup not found</Text>
        <PrimaryButton title="Go back" onPress={() => router.back()} />
      </View>
    );
  }

  const currentUserParticipant = session.participants.find(p => p.userId === user?.id);
  const needsSetup = !currentUserParticipant?.location;

  const handleFindMidpoint = async () => {
    setIsCalculating(true);
    try {
      const midpoint = optimizationService.calculateMidpoint(session.participants);
      
      if (midpoint) {
        const venues = await venueService.findVenues(midpoint.lat, midpoint.lng, session.type);
        const scoredVenues = optimizationService.scoreVenues(venues, session.participants);
        useMeetupStore.getState().setVenueCandidates(scoredVenues);
        router.push(`/result/${session.id}`);
      } else {
        alert('No participant locations found yet.');
      }
    } catch (error) {
      console.error('Calculation failed:', error);
      alert('Something went wrong during calculation. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Map Layer */}
      <View style={StyleSheet.absoluteFillObject}>
        <MapView 
          style={StyleSheet.absoluteFillObject}
          initialRegion={{
            latitude: session.participants.find(p => p.location)?.location?.lat || 55.4765,
            longitude: session.participants.find(p => p.location)?.location?.lng || 8.4515,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          {session.participants.map((p) => (
             p.location && (
               <Marker 
                 key={p.id} 
                 coordinate={{ latitude: p.location.lat, longitude: p.location.lng }}
               >
                 <View style={styles.participantMarker}>
                   <Image source={{ uri: p.profile.avatarUrl }} style={styles.markerAvatar} />
                   <View style={[styles.statusDot, { backgroundColor: p.status === 'ready' ? colors.tertiary : colors.primary }]} />
                 </View>
               </Marker>
             )
          ))}
        </MapView>
        <LinearGradient
          colors={['rgba(253, 248, 248, 0.8)', 'transparent', 'transparent', 'rgba(253, 248, 248, 0.4)']}
          style={[StyleSheet.absoluteFillObject, { pointerEvents: 'none' } as any]}
        />
      </View>

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Floating Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.circleButton}>
            <MaterialIcons name="arrow-back" size={24} color={colors['on-surface']} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{session.title}</Text>
            <View style={styles.headerSubtitleRow}>
              <View style={styles.liveDot} />
              <Text style={styles.headerSubtitle}>{session.participants.length} Active Participants</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.circleButton}>
            <MaterialIcons name="share" size={24} color={colors['on-surface']} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Premium Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.sheetHandleContainer}>
          <View style={styles.sheetHandle} />
        </View>

        <ScrollView contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Group Readiness</Text>
            <Text style={styles.statusCount}>
              {session.participants.filter(p => p.location).length}/{session.participants.length} Ready
            </Text>
          </View>

          <View style={styles.participantsContainer}>
            {session.participants.map((participant) => (
              <View key={participant.id} style={styles.participantRow}>
                <View style={styles.participantLeft}>
                  <View style={styles.avatarContainer}>
                    <Image source={{ uri: participant.profile.avatarUrl }} style={styles.participantAvatar} />
                    {participant.location && (
                      <View style={styles.checkIcon}>
                        <MaterialIcons name="check" size={10} color="white" />
                      </View>
                    )}
                  </View>
                  <View>
                    <Text style={styles.participantName}>{participant.profile.name}</Text>
                    <Text style={styles.participantDetail}>
                      {participant.location ? 'Location shared' : 'Choosing origin...'}
                    </Text>
                  </View>
                </View>
                <ParticipantStatusPill participant={participant} />
              </View>
            ))}
          </View>

          <View style={styles.actionContainer}>
            {needsSetup ? (
              <PrimaryButton 
                title="Set My Origin" 
                icon={<MaterialCommunityIcons name="map-marker-plus" size={24} color="white" />}
                onPress={() => router.push(`/meetup/participants?id=${session.id}`)}
                style={styles.mainAction}
              />
            ) : (
              <PrimaryButton 
                title={isCalculating ? "Calculating Midpoint..." : "Optimize Midpoint"} 
                icon={<MaterialCommunityIcons name="auto-awesome" size={24} color="white" />}
                onPress={handleFindMidpoint}
                disabled={isCalculating || session.participants.filter(p => p.location).length === 0}
                style={[styles.mainAction, session.participants.filter(p => p.location).length === 0 && { opacity: 0.5 }]}
              />
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { fontFamily: typography.fontFamily.bodyMedium, color: colors.outline },
  errorText: { fontFamily: typography.fontFamily.headlineBold, fontSize: 18, color: colors['on-surface'], marginBottom: 16 },
  safeArea: { position: 'absolute', top: 0, width: '100%', zIndex: 50 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  headerTitleContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: radii.full,
    ...shadows.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  headerTitle: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 16,
    color: colors['on-surface'],
  },
  headerSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.tertiary,
  },
  headerSubtitle: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: 11,
    color: colors.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Map Markers
  participantMarker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: 'white',
    backgroundColor: 'white',
    ...shadows.lg,
  },
  markerAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
  // Bottom Sheet
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: height * 0.48,
    backgroundColor: 'rgba(253, 248, 248, 0.98)',
    borderTopLeftRadius: radii['3xl'],
    borderTopRightRadius: radii['3xl'],
    ...shadows.ambient,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  sheetHandleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: colors['outline-variant'],
    borderRadius: 2,
    opacity: 0.5,
  },
  sheetContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 18,
    color: colors['on-surface'],
  },
  statusCount: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: 14,
    color: colors.outline,
  },
  participantsContainer: {
    backgroundColor: 'white',
    borderRadius: radii['2xl'],
    padding: 8,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
    marginBottom: 24,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  participantLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  participantAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors['surface-container-low'],
  },
  checkIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.tertiary,
    borderWidth: 2,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  participantName: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 15,
    color: colors['on-surface'],
  },
  participantDetail: {
    fontFamily: typography.fontFamily.body,
    fontSize: 12,
    color: colors.outline,
    marginTop: 2,
  },
  actionContainer: {
    marginTop: 8,
  },
  mainAction: {
    ...shadows.lg,
  }
});
