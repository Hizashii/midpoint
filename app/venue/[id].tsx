import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Platform, Alert, ActivityIndicator } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { colors, typography, radii, spacing, shadows } from '../../src/lib/theme';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { meetupService } from '../../src/services/meetupService';
import { calendarService } from '../../src/services/calendarService';
import { notificationService } from '../../src/services/notificationService';
import { useMeetupStore } from '../../src/store/meetupStore';
import { venueService } from '../../src/services/venueService';
import MapView from '../../src/components/MapView';
import type { VenueCandidate } from '../../src/types';

const FALLBACK_VENUE: VenueCandidate = {
  id: 'fallback-venue',
  venueId: 'fallback-venue',
  name: 'Mikkeller Bar',
  lat: 55.6761,
  lng: 12.5683,
  category: 'Craft Beer & Nordic Bites',
  address: 'Viktoriagade 8, 1655 Copenhagen',
  rating: 4.8,
  photoUrl: 'https://i.pravatar.cc/800?u=mikkeller',
  priceLevel: 2,
  tags: ['Good for groups', 'Open late', 'Outdoor seating'],
  averageMinutes: 0,
  maxMinutes: 0,
  variance: 0,
  violatedConstraints: 0,
  fairnessScore: 0,
  totalScore: 0,
  travelTimes: {},
};

export default function VenueDetailsScreen() {
  const { id } = useLocalSearchParams();
  const activeSession = useMeetupStore(state => state.activeSession);
  const venueCandidates = useMeetupStore(state => state.venueCandidates);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [details, setDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const venue = venueCandidates.find(v => v.id === id) ?? FALLBACK_VENUE;

  const participants = activeSession?.participants || [];

  useEffect(() => {
    async function loadDetails() {
      try {
        const data = await venueService.getVenueDetails(id as string, venue.name);
        setDetails(data);
      } catch (e) {
        console.error("Failed to load details", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadDetails();
  }, [id, venue.name]);

  const handleOpenGoogleMaps = () => {
    if (details?.googleMapsUrl) {
      if (Platform.OS === 'web') {
        window.open(details.googleMapsUrl, '_blank');
      } else {
        // For native, we could use Linking, but just alert the URL for now as a fallback
        Alert.alert("Opening Google Maps", "Taking you to the official Google Maps page for " + venue.name);
      }
    }
  };

  const handleChooseVenue = async () => {
    console.log("Choosing venue:", id);
    setIsFinalizing(true);
    try {
      const sessionId = activeSession?.id || 'demo-session';
      const venueName = venue.name; 
      
      console.log("Finalizing session in service...");
      await meetupService.finalizeSession(sessionId, id as string);
      
      console.log("Updating store...");
      const updatedSession = activeSession ? {
        ...activeSession,
        state: 'confirmed' as any,
        chosenVenueId: id as string
      } : {
        id: 'demo-session',
        title: `${venue.name} Meetup`,
        preferences: { category: 'drinks' },
        createdAt: new Date().toISOString(),
        state: 'confirmed' as any,
        chosenVenueId: id as string,
        participants: participants
      };
      
      useMeetupStore.getState().setActiveSession(updatedSession as any);
      
      if (Platform.OS !== 'web') {
        console.log("Attempting native integrations...");
        try {
          const startDate = new Date();
          startDate.setHours(startDate.getHours() + 1); 
          await calendarService.addEvent(
            `Meetup at ${venueName}`,
            startDate,
            new Date(startDate.getTime() + 2 * 60 * 60 * 1000),
            venue.address,
            'Midpoint organized session.'
          );
          await notificationService.scheduleMeetingReminder(
            'Time to get ready!',
            `Your meeting at ${venueName} starts soon.`,
            startDate
          );
        } catch (e) {
          console.warn("Native integration failed", e);
        }
      }

      console.log("Showing confirmation alert...");
      if (Platform.OS === 'web') {
        router.replace('/session/leave-now');
      } else {
        Alert.alert(
          "Meetup Confirmed!",
          "Session active. Notifications scheduled.",
          [{ text: "Awesome", onPress: () => router.replace('/session/leave-now') }]
        );
      }
    } catch (error) {
      console.error("Failed to choose venue:", error);
      Alert.alert("Error", "Could not finalize session. Please try again.");
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        headerShown: true,
        headerTransparent: true,
        headerTitle: '',
        headerLeft: () => (
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={colors['on-surface']} />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerButton}>
              <MaterialIcons name="share" size={22} color={colors.primary} />
            </TouchableOpacity>
            <View style={styles.avatarContainer}>
               <MaterialIcons name="account-circle" size={32} color={colors['primary-container']} />
            </View>
          </View>
        )
      }} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Image 
            source={{ uri: venue.photoUrl || 'https://i.pravatar.cc/800?u=venue' }} 
            style={styles.heroImage} 
          />
          <View style={styles.heroOverlay} />
          <View style={styles.premiumBadge}>
            <MaterialIcons name="verified" size={16} color={colors.tertiary} />
            <Text style={styles.premiumText}>MIDPOINT PICK</Text>
          </View>
        </View>

        {/* Venue Content */}
        <View style={styles.contentCard}>
          <View style={styles.venueHeader}>
            <Text style={styles.venueTitle}>{venue.name}</Text>
            <View style={styles.venueMeta}>
              <View style={styles.ratingRow}>
                <MaterialIcons name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>{venue.rating?.toFixed(1) || '4.5'}</Text>
              </View>
              <Text style={styles.metaDivider}>•</Text>
              <Text style={styles.priceText}>{"$".repeat(venue.priceLevel || 2)}</Text>
              <Text style={styles.metaDivider}>•</Text>
              <Text style={styles.categoryText}>{venue.category}</Text>
            </View>
          </View>

          <View style={styles.tagRow}>
            {(venue.tags ?? ['Good for groups', 'Open late', 'Outdoor seating']).map((tag: string) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.description}>
            {details?.description || "Loading description..."}
          </Text>

          <TouchableOpacity 
            style={styles.googleMapsButton} 
            onPress={handleOpenGoogleMaps}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="google-maps" size={20} color={colors.primary} />
            <Text style={styles.googleMapsButtonText}>View on Google Maps</Text>
          </TouchableOpacity>

          {/* Mini Map */}
          <View style={styles.miniMapContainer}>
            <MapView 
              style={styles.miniMap} 
              initialRegion={{
                latitude: venue.lat || 55.6761,
                longitude: venue.lng || 12.5683,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            />
            <View style={styles.mapPin}>
              <View style={styles.pinCircle}>
                <MaterialIcons name="location-on" size={20} color="white" />
              </View>
            </View>
            <View style={styles.addressBadge}>
              <Text style={styles.addressText}>{venue.address}</Text>
            </View>
          </View>
        </View>

        {/* Group Arrival Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Travel Times for Group</Text>
          <View style={styles.participantList}>
            {participants.map(p => (
              <View key={p.id} style={styles.participantRow}>
                <View style={styles.participantInfo}>
                  <View style={styles.avatarWrapper}>
                    <Image source={{ uri: p.profile?.avatarUrl || `https://i.pravatar.cc/150?u=${p.id}` }} style={styles.participantAvatar} />
                    {p.status === 'arrived' && (
                      <View style={styles.statusCheck}>
                        <MaterialIcons name="check" size={10} color="white" />
                      </View>
                    )}
                  </View>
                  <View>
                    <Text style={styles.participantName}>{p.profile?.name || p.name}</Text>
                    <Text style={styles.participantStatusDetails}>
                      {p.status === 'arrived' ? 'Arrived' : `${p.mode.charAt(0).toUpperCase() + p.mode.slice(1)} • ${p.etaMinutes || 15} min away`}
                    </Text>
                  </View>
                </View>
                
                {p.status === 'arrived' ? (
                  <View style={[styles.statusPill, { backgroundColor: colors['tertiary-fixed'] }]}>
                    <Text style={[styles.statusPillText, { color: colors['on-tertiary-fixed'] }]}>ARRIVED</Text>
                  </View>
                ) : (
                  <View style={styles.etaContainer}>
                    <Text style={styles.etaTime}>{p.etaMinutes || 15}m</Text>
                    <Text style={styles.etaLabel}>ETA</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Reviews Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What guests say</Text>
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <View style={styles.reviewList}>
              {details?.reviews?.map((review: any) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewAuthor}>{review.author}</Text>
                    <View style={styles.reviewRating}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <MaterialIcons 
                          key={i} 
                          name="star" 
                          size={14} 
                          color={i < review.rating ? "#FFD700" : colors.outline} 
                        />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.reviewQuote}>"{review.text}"</Text>
                  <Text style={styles.reviewDate}>{review.date}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Buttons */}
      <View style={styles.footer}>
        <PrimaryButton 
          title={isFinalizing ? "Finalizing..." : "Choose this place"} 
          onPress={handleChooseVenue} 
          disabled={isFinalizing}
        />
        <TouchableOpacity style={styles.secondaryButton}>
          <MaterialIcons name="bookmark-border" size={24} color={colors['on-surface']} />
          <Text style={styles.secondaryButtonText}>Save venue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
    ...shadows.sm,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 16,
  },
  avatarContainer: {
    borderWidth: 2,
    borderColor: colors['surface-container-highest'],
    borderRadius: 20,
  },
  scrollContent: {
    paddingBottom: 180,
  },
  heroSection: {
    height: 380,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  premiumBadge: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
    ...shadows.sm,
  },
  premiumText: {
    fontFamily: typography.fontFamily.label,
    fontSize: 10,
    fontWeight: '800',
    color: colors.tertiary,
    letterSpacing: 1,
  },
  contentCard: {
    marginTop: -24,
    backgroundColor: colors['surface-container-lowest'],
    borderTopLeftRadius: radii['2xl'],
    borderTopRightRadius: radii['2xl'],
    padding: 24,
    ...shadows.lg,
  },
  venueHeader: {
    marginBottom: 16,
  },
  venueTitle: {
    fontFamily: typography.fontFamily.headlineExtraBold,
    fontSize: 32,
    color: colors['on-surface'],
    letterSpacing: -1,
    marginBottom: 8,
  },
  venueMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 14,
  },
  metaDivider: {
    color: colors.outline,
  },
  priceText: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: 14,
    color: colors.secondary,
  },
  categoryText: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: 14,
    color: colors.secondary,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  tag: {
    backgroundColor: colors['surface-container-low'],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
  },
  tagText: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: 12,
    color: colors['on-surface-variant'],
  },
  description: {
    fontFamily: typography.fontFamily.body,
    fontSize: 14,
    color: colors['on-surface-variant'],
    lineHeight: 22,
    marginBottom: 24,
  },
  googleMapsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 12,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors['outline-variant'] + '30',
    gap: 10,
    marginBottom: 24,
    ...shadows.sm,
  },
  googleMapsButtonText: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: 14,
    color: colors.primary,
  },
  miniMapContainer: {
    height: 120,
    borderRadius: radii.xl,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors['surface-container-low'],
  },
  miniMap: {
    width: '100%',
    height: '100%',
    opacity: 0.5,
  },
  mapPin: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinCircle: {
    width: 40,
    height: 40,
    backgroundColor: colors.primary,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
    ...shadows.md,
  },
  addressBadge: {
    position: 'absolute',
    bottom: 8,
    left: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.lg,
  },
  addressText: {
    fontFamily: typography.fontFamily.label,
    fontSize: 10,
    fontWeight: '700',
    color: colors['on-surface'],
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 20,
    color: colors['on-surface'],
    marginBottom: 16,
  },
  participantList: {
    gap: 12,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors['surface-container-lowest'],
    padding: 16,
    borderRadius: radii.xl,
    ...shadows.sm,
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarWrapper: {
    position: 'relative',
  },
  participantAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  statusCheck: {
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
    fontSize: 14,
    color: colors['on-surface'],
  },
  participantStatusDetails: {
    fontFamily: typography.fontFamily.body,
    fontSize: 12,
    color: colors['on-surface-variant'],
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  statusPillText: {
    fontFamily: typography.fontFamily.label,
    fontSize: 10,
    fontWeight: '800',
  },
  etaContainer: {
    alignItems: 'flex-end',
  },
  etaTime: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 14,
    color: colors.primary,
  },
  etaLabel: {
    fontFamily: typography.fontFamily.label,
    fontSize: 8,
    fontWeight: '800',
    color: colors.outline,
    letterSpacing: 1,
  },
  reviewList: {
    gap: 16,
  },
  reviewCard: {
    backgroundColor: colors['surface-container-low'],
    padding: 24,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors['outline-variant'] + '15',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewAuthor: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 14,
    color: colors['on-surface'],
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontFamily: typography.fontFamily.label,
    fontSize: 11,
    color: colors.outline,
    marginTop: 8,
  },
  reviewQuote: {
    fontFamily: typography.fontFamily.body,
    fontSize: 14,
    color: colors['on-surface'],
    fontStyle: 'italic',
    lineHeight: 22,
    marginBottom: 16,
  },
  reviewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reviewAvatars: {
    flexDirection: 'row',
  },
  smallAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors['surface-container-low'],
  },
  reviewCount: {
    fontFamily: typography.fontFamily.label,
    fontSize: 10,
    fontWeight: '700',
    color: colors['on-surface-variant'],
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(253, 248, 248, 0.9)',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    gap: 12,
    ...shadows.lg,
  },
  secondaryButton: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors['surface-container-highest'],
    borderRadius: radii.xl,
    gap: 8,
  },
  secondaryButtonText: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 16,
    color: colors['on-surface'],
  },
});
