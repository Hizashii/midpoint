import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Image, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, typography, radii, spacing, shadows } from '../../src/lib/theme';
import { useMeetupStore } from '../../src/store/meetupStore';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { SecondaryButton } from '../../src/components/SecondaryButton';

const { width, height } = Dimensions.get('window');

export default function ResultScreen() {
  const { id } = useLocalSearchParams();
  const session = useMeetupStore(state => state.sessions.find(s => s.id === id) || state.activeSession);
  const venues = useMeetupStore(state => state.venueCandidates);
  
  if (!session || !venues.length) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Calculating best midpoints...</Text>
      </View>
    );
  }

  const bestVenue = venues[0];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Editorial Hero */}
      <View style={styles.heroContainer}>
        <Image 
          source={{ uri: bestVenue.photoUrl || 'https://picsum.photos/seed/hero/800/600' }} 
          style={styles.heroImage} 
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.4)', 'transparent', 'transparent', colors.background]}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          locations={[0, 0.3, 0.6, 1]}
        />
        
        <SafeAreaView style={styles.heroSafe} edges={['top']}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.circleButton}>
              <MaterialIcons name="arrow-back" size={24} color={colors['on-surface']} />
            </TouchableOpacity>
            <View style={styles.heroBadge}>
              <MaterialCommunityIcons name="auto-awesome" size={16} color="white" />
              <Text style={styles.heroBadgeText}>BEST MATCH</Text>
            </View>
            <TouchableOpacity style={styles.circleButton}>
              <MaterialIcons name="share" size={24} color={colors['on-surface']} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        <View style={styles.heroTitleContainer}>
          <Text style={styles.venueTitle}>{bestVenue.name}</Text>
          <View style={styles.venueMeta}>
            <MaterialIcons name="location-on" size={14} color={colors.primary} />
            <Text style={styles.venueAddress}>{bestVenue.address}</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Fairness Analysis */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardLabel}>Fairness Score</Text>
              <Text style={styles.cardSublabel}>Equality based on travel time</Text>
            </View>
            <Text style={styles.scoreText}>{bestVenue.fairnessScore}%</Text>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${bestVenue.fairnessScore}%` }]} />
            </View>
          </View>
          
          <View style={styles.analysisRow}>
            <View style={styles.analysisItem}>
              <Text style={styles.analysisValue}>{bestVenue.averageTravelTime}m</Text>
              <Text style={styles.analysisLabel}>Average</Text>
            </View>
            <View style={styles.analysisDivider} />
            <View style={styles.analysisItem}>
              <Text style={styles.analysisValue}>{bestVenue.maxTravelTime}m</Text>
              <Text style={styles.analysisLabel}>Max Travel</Text>
            </View>
            <View style={styles.analysisDivider} />
            <View style={styles.analysisItem}>
              <Text style={styles.analysisValue}>±{Math.round(bestVenue.maxTravelTime - bestVenue.averageTravelTime)}m</Text>
              <Text style={styles.analysisLabel}>Variance</Text>
            </View>
          </View>
        </View>

        {/* Travel Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Travel Breakdown</Text>
          <View style={styles.travelList}>
            {session.participants.map((p, index) => {
              const time = bestVenue.travelTimes[p.userId] || 15;
              return (
                <View key={p.id} style={styles.travelItem}>
                  <View style={styles.travelUser}>
                    <Image source={{ uri: p.profile.avatarUrl }} style={styles.travelAvatar} />
                    <View>
                      <Text style={styles.travelName}>{p.profile.name}</Text>
                      <Text style={styles.travelMode}>{p.preferences?.transportMode || 'Public Transit'}</Text>
                    </View>
                  </View>
                  <View style={styles.travelTimeBadge}>
                    <Text style={styles.travelTimeText}>{time} min</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Alternatives */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Other Options</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.altScroll}>
            {venues.slice(1).map(venue => (
              <TouchableOpacity key={venue.id} style={styles.altCard}>
                <Image source={{ uri: venue.photoUrl || `https://picsum.photos/seed/${venue.id}/400/300` }} style={styles.altImage} />
                <View style={styles.altInfo}>
                  <Text style={styles.altTitle} numberOfLines={1}>{venue.name}</Text>
                  <View style={styles.altStats}>
                    <Text style={styles.altStatText}>{venue.fairnessScore}% Fair</Text>
                    <Text style={styles.altBullet}>•</Text>
                    <Text style={styles.altStatText}>{venue.averageTravelTime}m avg</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        <View style={{ height: 140 }} />
      </ScrollView>

      {/* Floating Action Footer */}
      <View style={styles.footer}>
        <LinearGradient
          colors={['rgba(253, 248, 248, 0)', 'rgba(253, 248, 248, 1)']}
          style={styles.footerGradient}
          pointerEvents="none"
        />
        <View style={styles.footerContent}>
          <SecondaryButton 
            title="Invite" 
            icon={<MaterialCommunityIcons name="account-plus-outline" size={20} color={colors['on-surface']} />}
            style={styles.secondaryBtn}
          />
          <PrimaryButton 
            title="Confirm Venue" 
            style={styles.primaryBtn}
            onPress={() => router.push(`/session/${session.id}`)}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { fontFamily: typography.fontFamily.bodyMedium, color: colors.outline },
  heroContainer: {
    height: height * 0.42,
    width: '100%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroSafe: {
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 10,
  },
  headerRow: {
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
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  heroBadge: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.full,
    gap: 6,
    ...shadows.lg,
  },
  heroBadgeText: {
    fontFamily: typography.fontFamily.label,
    fontSize: 11,
    fontWeight: '900',
    color: 'white',
    letterSpacing: 1,
  },
  heroTitleContainer: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    zIndex: 10,
  },
  venueTitle: {
    fontFamily: typography.fontFamily.headlineExtraBold,
    fontSize: 34,
    color: colors['on-surface'],
    letterSpacing: -1,
    marginBottom: 4,
  },
  venueMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  venueAddress: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: 15,
    color: colors['on-surface-variant'],
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: radii['3xl'],
    padding: 24,
    ...shadows.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
    marginBottom: 32,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  cardLabel: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 18,
    color: colors['on-surface'],
  },
  cardSublabel: {
    fontFamily: typography.fontFamily.body,
    fontSize: 13,
    color: colors.outline,
    marginTop: 2,
  },
  scoreText: {
    fontFamily: typography.fontFamily.headlineExtraBold,
    fontSize: 28,
    color: colors.tertiary,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors['surface-container-high'],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.tertiary,
    borderRadius: 4,
  },
  analysisRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  analysisItem: {
    alignItems: 'center',
    flex: 1,
  },
  analysisValue: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 17,
    color: colors['on-surface'],
  },
  analysisLabel: {
    fontFamily: typography.fontFamily.label,
    fontSize: 11,
    color: colors.outline,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  analysisDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors['outline-variant'],
    opacity: 0.5,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 20,
    color: colors['on-surface'],
  },
  seeAllText: {
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.primary,
    fontSize: 14,
  },
  travelList: {
    backgroundColor: 'white',
    borderRadius: radii['2xl'],
    padding: 16,
    gap: 16,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  travelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  travelUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  travelAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors['surface-container-low'],
  },
  travelName: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: 15,
    color: colors['on-surface'],
  },
  travelMode: {
    fontFamily: typography.fontFamily.body,
    fontSize: 12,
    color: colors.outline,
  },
  travelTimeBadge: {
    backgroundColor: colors.primary + '10',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.md,
  },
  travelTimeText: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 14,
    color: colors.primary,
  },
  altScroll: {
    gap: 16,
    paddingRight: 20,
  },
  altCard: {
    width: 240,
    backgroundColor: 'white',
    borderRadius: radii['2xl'],
    overflow: 'hidden',
    ...shadows.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  altImage: {
    width: '100%',
    height: 120,
  },
  altInfo: {
    padding: 16,
    gap: 4,
  },
  altTitle: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 16,
    color: colors['on-surface'],
  },
  altStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  altStatText: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: 13,
    color: colors.outline,
  },
  altBullet: {
    color: colors.outline,
    fontSize: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    zIndex: 100,
  },
  footerGradient: {
    position: 'absolute',
    top: -60,
    left: 0,
    right: 0,
    height: 60,
  },
  footerContent: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 12,
    gap: 12,
    backgroundColor: colors.background,
  },
  secondaryBtn: {
    flex: 1,
  },
  primaryBtn: {
    flex: 2,
    ...shadows.lg,
  },
});
