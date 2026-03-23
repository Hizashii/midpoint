import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Platform, ActivityIndicator } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { colors, typography, radii, spacing, shadows } from '../../src/lib/theme';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { LinearGradient } from 'expo-linear-gradient';
import { useRealtimeSession } from '../../src/hooks/useRealtimeSession';
import { venueService } from '../../src/services/venueService';

const { width } = Dimensions.get('window');

export default function MeetupRecapScreen() {
  const { id } = useLocalSearchParams();
  const { session, loading } = useRealtimeSession(id as string);
  const [chosenVenue, setChosenVenue] = useState<any>(null);
  const [venueLoading, setVenueLoading] = useState(false);

  useEffect(() => {
    async function loadVenue() {
      if (session?.chosenVenueId) {
        setVenueLoading(true);
        try {
          const details = await venueService.getVenueDetails(session.chosenVenueId);
          // In a real app, we'd also get the venue name/coords from the session's candidate list
          // For now, let's assume we fetch by ID.
          setChosenVenue(details);
        } catch (e) {
          console.error(e);
        } finally {
          setVenueLoading(false);
        }
      }
    }
    loadVenue();
  }, [session?.chosenVenueId]);

  if (loading || venueLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!session) return null;

  // Real Stats
  const participants = session.participants;
  const avgTravel = Math.round(
    participants.reduce((acc, p) => acc + (p.etaMinutes || 15), 0) / participants.length
  );
  
  // Compute Fairness (simplified)
  const times = participants.map(p => p.etaMinutes || 15);
  const variance = Math.max(...times) - Math.min(...times);
  const fairnessScore = Math.max(0, 100 - (variance * 3));

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        headerShown: true,
        headerTransparent: true,
        headerTitle: '',
        headerLeft: () => (
          <TouchableOpacity style={styles.headerButton} onPress={() => router.replace('/(tabs)')}>
            <MaterialIcons name="close" size={24} color={colors['on-surface']} />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <TouchableOpacity style={styles.avatarContainer}>
             <MaterialCommunityIcons name="share-variant" size={22} color={colors.primary} />
          </TouchableOpacity>
        )
      }} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
           <View style={styles.completedBadge}>
              <MaterialCommunityIcons name="check-circle" size={14} color={colors['on-tertiary-fixed']} />
              <Text style={styles.completedBadgeText}>COMPLETED SESSION</Text>
           </View>
           <Text style={styles.headline}>
              Good times at <Text style={{ color: colors.primary }}>{chosenVenue?.name || 'The Midpoint'}</Text>
           </Text>
           
           <View style={styles.heroSummaryRow}>
              <View style={styles.avatarCollage}>
                 {participants.map((p, i) => (
                   <Image 
                     key={p.id} 
                     source={{ uri: p.profile?.avatarUrl || `https://i.pravatar.cc/150?u=${p.userId}` }} 
                     style={[styles.collageAvatar, { marginLeft: i > 0 ? -24 : 0, zIndex: 10 - i }]} 
                   />
                 ))}
              </View>
              
              <View style={styles.statsRow}>
                 <View style={styles.statCard}>
                    <Text style={styles.statLabel}>FAIRNESS</Text>
                    <Text style={[styles.statValue, { color: colors.tertiary }]}>{fairnessScore}%</Text>
                 </View>
                 <View style={styles.statCard}>
                    <Text style={styles.statLabel}>AVG TRAVEL</Text>
                    <Text style={styles.statValue}>{avgTravel}m</Text>
                 </View>
              </View>
           </View>
        </View>

        {/* Venue Spotlight Card */}
        <View style={styles.spotlightCard}>
           <View style={styles.imageContainer}>
              <Image 
                source={{ uri: `https://source.unsplash.com/featured/?${session.preferences.category},interior` }} 
                style={styles.spotlightImage} 
              />
              <LinearGradient
                colors={['transparent', 'rgba(28, 27, 27, 0.8)']}
                style={styles.imageOverlay}
              />
              <View style={styles.imageTitleGroup}>
                 <View style={styles.locationRow}>
                    <MaterialCommunityIcons name="map-marker" size={12} color="white" />
                    <Text style={styles.locationText}>{session.preferences.category.toUpperCase()}</Text>
                 </View>
                 <Text style={styles.venueTitle}>{chosenVenue?.name || 'Local Spot'}</Text>
              </View>
           </View>
           
           <View style={styles.summarySection}>
              <View style={styles.summaryHeader}>
                 <Text style={styles.summaryTitle}>Group Journey</Text>
                 <View style={styles.divider} />
                 <Text style={styles.dateText}>{new Date(session.createdAt).toLocaleDateString()}</Text>
              </View>
              
              <View style={styles.travelerList}>
                 {participants.map(p => (
                   <View key={p.id} style={styles.travelerRow}>
                      <View style={styles.travelerInfo}>
                         <Image source={{ uri: p.profile?.avatarUrl || `https://i.pravatar.cc/150?u=${p.userId}` }} style={styles.travelerAvatar} />
                         <View>
                            <Text style={styles.travelerName}>{p.profile?.name || 'Friend'}</Text>
                            <Text style={styles.travelerFrom}>Via {p.mode}</Text>
                         </View>
                      </View>
                      <View style={styles.travelerMeta}>
                         <Text style={styles.travelTime}>{p.etaMinutes || 15}m</Text>
                         <Text style={styles.travelMode}>TRAVEL TIME</Text>
                      </View>
                   </View>
                 ))}
              </View>
           </View>
        </View>

        {/* Achievement Card */}
        {fairnessScore > 90 && (
          <View style={styles.achievementCard}>
             <LinearGradient
               colors={[colors.tertiary, '#004d4a']}
               start={{ x: 0, y: 0 }}
               end={{ x: 1, y: 1 }}
               style={styles.achievementGradient}
             >
                <MaterialCommunityIcons name="scale-balance" size={40} color="white" style={styles.achievementIcon} />
                <Text style={styles.achievementTitle}>Perfect Balance</Text>
                <Text style={styles.achievementDesc}>
                  Your group achieved a rare level of coordination. Nobody traveled more than {variance} minutes apart!
                </Text>
                <View style={styles.decoCircle} />
             </LinearGradient>
          </View>
        )}

        <View style={styles.actionsContainer}>
           <PrimaryButton 
             title="Plan another one" 
             icon={<MaterialCommunityIcons name="calendar-plus" size={18} color="white" />}
             onPress={() => router.replace('/meetup/type')} 
           />
           <TouchableOpacity style={styles.secondaryButton}>
              <MaterialIcons name="bookmark-border" size={20} color={colors.primary} />
              <Text style={styles.secondaryButtonText}>Save this spot</Text>
           </TouchableOpacity>
        </View>

        <View style={styles.socialFooter}>
           <Text style={styles.shareTitle}>#MidpointMemories</Text>
           <Text style={styles.shareSubtitle}>Shared journeys are the best ones.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
    ...shadows.md,
  },
  avatarContainer: {
    marginRight: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  scrollContent: {
    paddingTop: 100,
    paddingBottom: 60,
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 40,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors['tertiary-fixed'],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  completedBadgeText: {
    fontFamily: typography.fontFamily.label,
    fontSize: 10,
    fontWeight: '800',
    color: colors['on-tertiary-fixed'],
    letterSpacing: 1,
  },
  headline: {
    fontFamily: typography.fontFamily.headlineExtraBold,
    fontSize: 36,
    color: colors['on-surface'],
    letterSpacing: -1,
    lineHeight: 40,
    marginBottom: 24,
  },
  heroSummaryRow: {
    gap: 20,
  },
  avatarCollage: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  collageAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: 'white',
    ...shadows.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors['surface-container-low'],
    padding: 16,
    borderRadius: radii.xl,
  },
  statLabel: {
    fontFamily: typography.fontFamily.label,
    fontSize: 9,
    fontWeight: '800',
    color: colors.outline,
    letterSpacing: 1,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 22,
    color: colors['on-surface'],
  },
  spotlightCard: {
    backgroundColor: colors['surface-container-lowest'],
    borderRadius: radii['3xl'],
    overflow: 'hidden',
    ...shadows.lg,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors['outline-variant'] + '15',
  },
  imageContainer: {
    height: 240,
    position: 'relative',
  },
  spotlightImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  imageTitleGroup: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  locationText: {
    fontFamily: typography.fontFamily.label,
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1,
  },
  venueTitle: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 26,
    color: 'white',
  },
  summarySection: {
    padding: 24,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryTitle: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 16,
    color: colors['on-surface'],
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors['outline-variant'],
    marginHorizontal: 12,
    opacity: 0.1,
  },
  dateText: {
    fontFamily: typography.fontFamily.body,
    fontSize: 13,
    color: colors.outline,
  },
  travelerList: {
    gap: 20,
  },
  travelerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  travelerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  travelerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  travelerName: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 14,
    color: colors['on-surface'],
  },
  travelerFrom: {
    fontFamily: typography.fontFamily.body,
    fontSize: 12,
    color: colors.outline,
  },
  travelerMeta: {
    alignItems: 'flex-end',
  },
  travelTime: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 15,
    color: colors.primary,
  },
  travelMode: {
    fontFamily: typography.fontFamily.label,
    fontSize: 8,
    fontWeight: '800',
    color: colors.outline,
    letterSpacing: 0.5,
  },
  achievementCard: {
    borderRadius: radii['3xl'],
    overflow: 'hidden',
    ...shadows.md,
    marginBottom: 24,
  },
  achievementGradient: {
    padding: 24,
    position: 'relative',
  },
  achievementIcon: {
    marginBottom: 12,
  },
  achievementTitle: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 20,
    color: 'white',
    marginBottom: 4,
  },
  achievementDesc: {
    fontFamily: typography.fontFamily.body,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
  },
  decoCircle: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 40,
  },
  secondaryButton: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors['surface-container-low'],
    borderRadius: radii.xl,
    gap: 8,
  },
  secondaryButtonText: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 15,
    color: colors.primary,
  },
  socialFooter: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 4,
  },
  shareTitle: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 16,
    color: colors.outline,
    opacity: 0.5,
  },
  shareSubtitle: {
    fontFamily: typography.fontFamily.body,
    fontSize: 12,
    color: colors.outline,
    opacity: 0.4,
  },
});
