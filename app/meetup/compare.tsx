import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Platform } from 'react-native';
import { router, Stack } from 'expo-router';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { colors, typography, radii, spacing, shadows } from '../../src/lib/theme';
import { PrimaryButton } from '../../src/components/PrimaryButton';

const { width } = Dimensions.get('window');

const VENUES = [
  {
    id: '1',
    name: 'The Coffee Collective',
    category: 'Artisanal Bakery & Coffee',
    image: 'https://i.pravatar.cc/300?u=coffee1',
    fairness: 96,
    travelTime: 14,
    price: '$$$',
    badge: 'Best for Fairness',
    badgeColor: colors['tertiary-fixed'],
    onBadgeColor: colors['on-tertiary-fixed'],
  },
  {
    id: '2',
    name: 'Noma Garden',
    category: 'Botanical Dining',
    image: 'https://i.pravatar.cc/300?u=garden1',
    fairness: 91,
    travelTime: 22,
    price: '$$$$',
    badge: 'Best for Atmosphere',
    badgeColor: colors['primary-fixed'],
    onBadgeColor: colors['on-primary-fixed-variant'],
  },
  {
    id: '3',
    name: 'Prolog',
    category: 'Coffee & Community',
    image: 'https://i.pravatar.cc/300?u=prolog',
    fairness: 84,
    travelTime: 18,
    price: '$$',
    badge: 'Best for Price',
    badgeColor: colors['secondary-container'],
    onBadgeColor: colors['on-secondary-container'],
  },
];

export default function CompareVenuesScreen() {
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
          <TouchableOpacity style={styles.avatarContainer}>
             <MaterialCommunityIcons name="account-circle" size={32} color={colors['primary-container']} />
          </TouchableOpacity>
        )
      }} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headline}>Venue Comparison</Text>
          <Text style={styles.subheadline}>Comparing top-rated midpoints for your session.</Text>
        </View>

        <View style={styles.venueStack}>
          {VENUES.map((venue, index) => (
            <TouchableOpacity 
              key={venue.id} 
              style={styles.venueCard}
              activeOpacity={0.9}
              onPress={() => router.push(`/venue/${venue.id}`)}
            >
              <View style={styles.cardHeader}>
                <Image source={{ uri: venue.image }} style={styles.venueImage} />
                <View style={[styles.badge, { backgroundColor: venue.badgeColor }]}>
                  <Text style={[styles.badgeText, { color: venue.onBadgeColor }]}>{venue.badge.toUpperCase()}</Text>
                </View>
              </View>
              
              <View style={styles.cardBody}>
                <View style={styles.venueInfo}>
                  <Text style={styles.venueName}>{venue.name}</Text>
                  <Text style={styles.venueCategory}>{venue.category}</Text>
                </View>

                <View style={styles.metricsContainer}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>FAIRNESS</Text>
                    <Text style={[styles.metricValue, { color: colors.tertiary }]}>{venue.fairness}%</Text>
                  </View>
                  <View style={styles.verticalDivider} />
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>TRAVEL</Text>
                    <Text style={styles.metricValue}>{venue.travelTime}m</Text>
                  </View>
                  <View style={styles.verticalDivider} />
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>PRICE</Text>
                    <Text style={[styles.metricValue, { color: colors.primary }]}>{venue.price}</Text>
                  </View>
                </View>

                <PrimaryButton 
                  title="View Details" 
                  onPress={() => router.push(`/venue/${venue.id}`)}
                  style={styles.viewButton}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.insightsSection}>
          <View style={styles.insightHeader}>
             <MaterialCommunityIcons name="lightbulb-outline" size={24} color={colors.primary} />
             <Text style={styles.insightTitle}>Quick Insight</Text>
          </View>
          
          <View style={styles.insightGrid}>
            <View style={styles.insightCard}>
              <View style={[styles.insightIconBg, { backgroundColor: colors['tertiary-fixed'] }]}>
                <MaterialCommunityIcons name="scale-balance" size={24} color={colors['on-tertiary-fixed']} />
              </View>
              <View style={styles.insightTextContent}>
                <Text style={styles.insightCardTitle}>Most Equitable</Text>
                <Text style={styles.insightDescription}>The Coffee Collective offers the most balanced travel time for all participants.</Text>
              </View>
            </View>
          </View>
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
  avatarContainer: {
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 20,
    ...shadows.sm,
  },
  scrollContent: {
    paddingTop: 100,
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  headline: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 28,
    color: colors['on-surface'],
    letterSpacing: -1,
  },
  subheadline: {
    fontFamily: typography.fontFamily.body,
    fontSize: 15,
    color: colors['on-surface-variant'],
    marginTop: 4,
  },
  venueStack: {
    paddingHorizontal: 24,
    gap: 20,
  },
  venueCard: {
    backgroundColor: colors['surface-container-lowest'],
    borderRadius: radii['2xl'],
    overflow: 'hidden',
    ...shadows.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  cardHeader: {
    height: 160,
    position: 'relative',
  },
  venueImage: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  badgeText: {
    fontFamily: typography.fontFamily.label,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardBody: {
    padding: 20,
    gap: 16,
  },
  venueInfo: {
    gap: 2,
  },
  venueName: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 20,
    color: colors['on-surface'],
  },
  venueCategory: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: 14,
    color: colors['on-surface-variant'],
  },
  metricsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors['surface-container-low'],
    padding: 12,
    borderRadius: radii.xl,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  verticalDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors['outline-variant'],
    opacity: 0.3,
  },
  metricLabel: {
    fontFamily: typography.fontFamily.label,
    fontSize: 9,
    fontWeight: '700',
    color: colors['on-surface-variant'],
    letterSpacing: 1,
  },
  metricValue: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 16,
    color: colors['on-surface'],
  },
  viewButton: {
    height: 48,
  },
  insightsSection: {
    marginTop: 32,
    marginHorizontal: 24,
    backgroundColor: colors['surface-container-low'],
    borderRadius: radii['2xl'],
    padding: 24,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  insightTitle: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 18,
    color: colors['on-surface'],
  },
  insightGrid: {
    gap: 16,
  },
  insightCard: {
    flexDirection: 'row',
    gap: 12,
  },
  insightIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  insightTextContent: {
    flex: 1,
  },
  insightCardTitle: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 15,
    color: colors['on-surface'],
    marginBottom: 2,
  },
  insightDescription: {
    fontFamily: typography.fontFamily.body,
    fontSize: 13,
    color: colors['on-surface-variant'],
    lineHeight: 18,
  },
});
