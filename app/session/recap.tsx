import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Platform } from 'react-native';
import { router, Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, radii, spacing, shadows } from '../../src/lib/theme';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const SUMMARY_PARTICIPANTS = [
  { id: '1', name: 'Sarah', from: 'Vesterbro', time: '12 min', mode: 'Walking', image: 'https://i.pravatar.cc/150?u=sarah' },
  { id: '2', name: 'James', from: 'Nørrebro', time: '15 min', mode: 'Biking', image: 'https://i.pravatar.cc/150?u=james' },
  { id: '3', name: 'Elena', from: 'Frederiksberg', time: '14 min', mode: 'Metro', image: 'https://i.pravatar.cc/150?u=elena' },
];

export default function MeetupRecapScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        headerShown: true,
        headerTransparent: true,
        headerTitle: '',
        headerLeft: () => (
          <View style={styles.headerLogo}>
            <MaterialCommunityIcons name="explore" size={24} color="#007AFF" />
            <Text style={styles.headerTitleText}>Midpoint</Text>
          </View>
        ),
        headerRight: () => (
          <View style={styles.avatarContainer}>
             <MaterialCommunityIcons name="account-circle" size={32} color={colors['primary-container']} />
          </View>
        )
      }} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
           <View style={styles.completedBadge}>
              <MaterialCommunityIcons name="check-circle" size={14} color={colors['on-tertiary-fixed']} />
              <Text style={styles.completedBadgeText}>COMPLETED SESSION</Text>
           </View>
           <Text style={styles.headline}>
              Good times at <Text style={{ color: colors.primary }}>Mikkeller Bar</Text>
           </Text>
           
           <View style={styles.heroSummaryRow}>
              <View style={styles.avatarCollage}>
                 {SUMMARY_PARTICIPANTS.map((p, i) => (
                   <Image 
                     key={p.id} 
                     source={{ uri: p.image }} 
                     style={[styles.collageAvatar, { marginLeft: i > 0 ? -20 : 0, zIndex: 10 - i }]} 
                   />
                 ))}
              </View>
              
              <View style={styles.statsRow}>
                 <View style={styles.statCard}>
                    <Text style={styles.statLabel}>FAIRNESS</Text>
                    <Text style={[styles.statValue, { color: colors.tertiary }]}>94%</Text>
                 </View>
                 <View style={styles.statCard}>
                    <Text style={styles.statLabel}>AVG TRAVEL</Text>
                    <Text style={styles.statValue}>14m</Text>
                 </View>
              </View>
           </View>
        </View>

        {/* Venue Spotlight Card */}
        <View style={styles.spotlightCard}>
           <View style={styles.imageContainer}>
              <Image 
                source={{ uri: 'https://i.pravatar.cc/800?u=mikkeller_interior' }} 
                style={styles.spotlightImage} 
              />
              <LinearGradient
                colors={['transparent', 'rgba(28, 27, 27, 0.8)']}
                style={styles.imageOverlay}
              />
              <View style={styles.imageTitleGroup}>
                 <View style={styles.locationRow}>
                    <MaterialCommunityIcons name="map-marker" size={12} color="white" />
                    <Text style={styles.locationText}>VICTORIAGADE, COPENHAGEN</Text>
                 </View>
                 <Text style={styles.venueTitle}>Mikkeller Bar</Text>
              </View>
           </View>
           
           <View style={styles.summarySection}>
              <View style={styles.summaryHeader}>
                 <Text style={styles.summaryTitle}>Travel Summary</Text>
                 <View style={styles.divider} />
                 <Text style={styles.dateText}>October 24, 2023</Text>
              </View>
              
              <View style={styles.travelerList}>
                 {SUMMARY_PARTICIPANTS.map(p => (
                   <View key={p.id} style={styles.travelerRow}>
                      <View style={styles.travelerInfo}>
                         <Image source={{ uri: p.image }} style={styles.travelerAvatar} />
                         <View>
                            <Text style={styles.travelerName}>{p.name}</Text>
                            <Text style={styles.travelerFrom}>From {p.from}</Text>
                         </View>
                      </View>
                      <View style={styles.travelerMeta}>
                         <Text style={styles.travelTime}>{p.time}</Text>
                         <Text style={styles.travelMode}>{p.mode.toUpperCase()}</Text>
                      </View>
                   </View>
                 ))}
              </View>
           </View>
        </View>

        {/* Fairness Achievement Card */}
        <View style={styles.achievementCard}>
           <LinearGradient
             colors={[colors.primary, colors['primary-container']]}
             start={{ x: 0, y: 0 }}
             end={{ x: 1, y: 1 }}
             style={styles.achievementGradient}
           >
              <MaterialCommunityIcons name="scale-balance" size={40} color="white" style={styles.achievementIcon} />
              <Text style={styles.achievementTitle}>Elite Balance Achieved</Text>
              <Text style={styles.achievementDesc}>
                The travel variance was less than 3 minutes between all participants. A truly fair midpoint.
              </Text>
              <View style={styles.decoCircle} />
           </LinearGradient>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
           <PrimaryButton 
             title="Rebook this spot" 
             icon={<MaterialCommunityIcons name="calendar-today" size={18} color="white" />}
             onPress={() => {}} 
           />
           <TouchableOpacity style={styles.secondaryButton}>
              <MaterialCommunityIcons name="bookmark" size={20} color={colors.primary} />
              <Text style={styles.secondaryButtonText}>Save to Favorites</Text>
           </TouchableOpacity>
        </View>

        {/* Social Share Footnote */}
        <View style={styles.socialFooter}>
           <View style={styles.shareRow}>
              <View style={styles.shareIconBg}>
                 <MaterialCommunityIcons name="share-variant" size={20} color={colors.primary} />
              </View>
              <View>
                 <Text style={styles.shareTitle}>Share this memory</Text>
                 <Text style={styles.shareSubtitle}>Send the summary card to your group</Text>
              </View>
           </View>
           <View style={styles.tagRow}>
              <View style={styles.tag}>
                 <Text style={styles.tagText}>#MidpointMemories</Text>
              </View>
              <View style={styles.tag}>
                 <Text style={styles.tagText}>Copenhagen</Text>
              </View>
           </View>
        </View>
      </ScrollView>

      {/* Mobile Nav */}
      <View style={styles.mobileNav}>
         <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/(tabs)')}>
            <MaterialCommunityIcons name="home-map-marker" size={24} color={colors.outline} />
            <Text style={styles.navLabel}>HOME</Text>
         </TouchableOpacity>
         <TouchableOpacity style={styles.navItem}>
            <MaterialCommunityIcons name="account-group" size={24} color={colors.primary} />
            <Text style={[styles.navLabel, { color: colors.primary }]}>SESSIONS</Text>
            <View style={styles.activeDot} />
         </TouchableOpacity>
         <TouchableOpacity style={styles.navItem}>
            <MaterialCommunityIcons name="bookmark-outline" size={24} color={colors.outline} />
            <Text style={styles.navLabel}>SAVED</Text>
         </TouchableOpacity>
         <TouchableOpacity style={styles.navItem}>
            <MaterialCommunityIcons name="account-outline" size={24} color={colors.outline} />
            <Text style={styles.navLabel}>PROFILE</Text>
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
  headerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 16,
    paddingVertical: 8,
  },
  headerTitleText: {
    fontFamily: typography.fontFamily.headlineExtraBold,
    fontSize: 22,
    color: colors['on-surface'],
    letterSpacing: -1,
  },
  avatarContainer: {
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.05)',
    borderRadius: 20,
    backgroundColor: colors['surface-container-highest'],
  },
  scrollContent: {
    paddingTop: 100,
    paddingBottom: 120,
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 48,
    alignItems: 'flex-start',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors['tertiary-fixed'],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
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
    fontSize: 40,
    color: colors['on-surface'],
    letterSpacing: -1.5,
    lineHeight: 44,
    marginBottom: 32,
  },
  heroSummaryRow: {
    flexDirection: 'column',
    gap: 24,
    width: '100%',
  },
  avatarCollage: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  collageAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: 'white',
    ...shadows.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    backgroundColor: colors['surface-container-low'],
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radii.xl,
    minWidth: 100,
  },
  statLabel: {
    fontFamily: typography.fontFamily.label,
    fontSize: 10,
    fontWeight: '700',
    color: colors['on-surface-variant'],
    letterSpacing: 1,
    marginBottom: 4,
    opacity: 0.6,
  },
  statValue: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 24,
    color: colors['on-surface'],
  },
  spotlightCard: {
    backgroundColor: colors['surface-container-lowest'],
    borderRadius: radii['3xl'],
    overflow: 'hidden',
    ...shadows.md,
    marginBottom: 24,
  },
  imageContainer: {
    height: 260,
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
    bottom: 24,
    left: 24,
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
    fontWeight: '700',
    color: 'white',
    letterSpacing: 1,
  },
  venueTitle: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 28,
    color: 'white',
  },
  summarySection: {
    padding: 32,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  summaryTitle: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 18,
    color: colors['on-surface'],
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors['outline-variant'],
    marginHorizontal: 16,
    opacity: 0.2,
  },
  dateText: {
    fontFamily: typography.fontFamily.body,
    fontSize: 14,
    color: colors['on-surface-variant'],
    opacity: 0.6,
  },
  travelerList: {
    gap: 24,
  },
  travelerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  travelerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  travelerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.primary + '20',
  },
  travelerName: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 15,
    color: colors['on-surface'],
  },
  travelerFrom: {
    fontFamily: typography.fontFamily.body,
    fontSize: 12,
    color: colors['on-surface-variant'],
    opacity: 0.8,
  },
  travelerMeta: {
    alignItems: 'flex-end',
  },
  travelTime: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 16,
    color: colors['on-surface'],
  },
  travelMode: {
    fontFamily: typography.fontFamily.label,
    fontSize: 9,
    fontWeight: '800',
    color: colors.tertiary,
    letterSpacing: 0.5,
  },
  achievementCard: {
    height: 220,
    borderRadius: radii['3xl'],
    overflow: 'hidden',
    ...shadows.lg,
    marginBottom: 24,
  },
  achievementGradient: {
    flex: 1,
    padding: 32,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  achievementIcon: {
    marginBottom: 16,
  },
  achievementTitle: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 24,
    color: 'white',
    marginBottom: 8,
    lineHeight: 28,
  },
  achievementDesc: {
    fontFamily: typography.fontFamily.body,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  decoCircle: {
    position: 'absolute',
    top: -48,
    right: -48,
    width: 192,
    height: 192,
    borderRadius: 96,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionsContainer: {
    backgroundColor: colors['surface-container-low'],
    padding: 32,
    borderRadius: radii['3xl'],
    gap: 16,
    marginBottom: 48,
  },
  secondaryButton: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors['surface-container-lowest'],
    borderRadius: radii.xl,
    gap: 8,
    ...shadows.sm,
  },
  secondaryButtonText: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 16,
    color: colors['on-surface'],
  },
  socialFooter: {
    paddingVertical: 48,
    borderTopWidth: 1,
    borderTopColor: colors['outline-variant'] + '20',
    gap: 24,
  },
  shareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  shareIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors['surface-container-high'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareTitle: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 16,
    color: colors['on-surface'],
  },
  shareSubtitle: {
    fontFamily: typography.fontFamily.body,
    fontSize: 12,
    color: colors['on-surface-variant'],
    opacity: 0.6,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    backgroundColor: colors['surface-container-high'],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.full,
  },
  tagText: {
    fontFamily: typography.fontFamily.label,
    fontSize: 11,
    fontWeight: '700',
    color: colors['on-surface-variant'],
    opacity: 0.8,
  },
  mobileNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(253, 248, 248, 0.85)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 20,
    borderTopLeftRadius: radii['2xl'],
    borderTopRightRadius: radii['2xl'],
    ...shadows.lg,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  navLabel: {
    fontFamily: typography.fontFamily.label,
    fontSize: 10,
    fontWeight: '700',
    color: colors.outline,
    letterSpacing: 1,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: 2,
  },
});
