import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, SafeAreaView, TouchableOpacity, useWindowDimensions, Platform, ActivityIndicator } from 'react-native';
import MapView, { Marker } from '../src/components/MapView';
import { colors, typography, spacing, radii, shadows } from '../src/lib/theme';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useMeetupStore } from '../src/store/meetupStore';
import { LinearGradient } from 'expo-linear-gradient';
import { optimizationService } from '../src/services/optimizationService';
import { venueService } from '../src/services/venueService';
import { SegmentedTabs } from '../src/components/SegmentedTabs';

export default function VenueRecommendationsScreen() {
  const { width, height } = useWindowDimensions();
  const activeSession = useMeetupStore(state => state.activeSession);
  const venues = useMeetupStore(state => state.venueCandidates);
  const setVenueCandidates = useMeetupStore(state => state.setVenueCandidates);
  
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState('Finding venues...');
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  
  const tabs = ['Best Match', 'Fastest', 'Fairest', 'Cheapest'];

  useEffect(() => {
    async function loadAndScoreVenues() {
      if (!activeSession) return;
      
      setLoading(true);
      try {
        setLoadingText('Searching for the best area...');
        const center = optimizationService.calculateSearchCenter(activeSession.participants);
        
        if (center) {
          setLoadingText('Fetching real venues...');
          const foundVenues = await venueService.findVenues(center.lat, center.lng, activeSession.preferences);
          
          setLoadingText('Computing travel times...');
          const scoredVenues = await optimizationService.scoreVenues(
            foundVenues, 
            activeSession.participants, 
            activeSession.preferences
          );
          
          setVenueCandidates(scoredVenues);
        }
      } catch (error) {
        console.error('Venue Loading Error:', error);
      } finally {
        setLoading(false);
      }
    }

    // Refresh if category changed or list is empty
    if (activeSession && (venues.length === 0 || venues[0]?.category !== activeSession.preferences.category)) {
      loadAndScoreVenues();
    } else {
      setLoading(false);
    }
  }, [activeSession?.id, activeSession?.preferences?.category]);

  const rankedResults = useMemo(() => {
    return optimizationService.getRankedResults(venues);
  }, [venues]);

  const displayedVenues = useMemo(() => {
    const activeTab = tabs[activeTabIndex];
    switch (activeTab) {
      case 'Fastest': return rankedResults.fastest;
      case 'Fairest': return rankedResults.fairest;
      case 'Cheapest': return rankedResults.cheapest;
      case 'Best Match': 
      default: return rankedResults.bestMatch;
    }
  }, [activeTabIndex, rankedResults]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{loadingText}</Text>
        <Text style={styles.loadingSubtext}>Our fairness engine is working its magic.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Midpoint Spots',
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { fontFamily: typography.fontFamily.headlineBold, color: colors['on-surface'] },
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <MaterialIcons name="arrow-back" size={24} color={colors['on-surface']} />
          </TouchableOpacity>
        )
      }} />
      
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: displayedVenues[0]?.lat || 55.4765,
            longitude: displayedVenues[0]?.lng || 8.4515,
            latitudeDelta: 0.04,
            longitudeDelta: 0.04,
          }}
        >
          {displayedVenues.map((venue) => (
            <Marker 
              key={venue.id} 
              coordinate={{ 
                latitude: venue.lat, 
                longitude: venue.lng 
              }}
            >
              <View style={styles.venueMarker}>
                <MaterialCommunityIcons 
                  name={venue.category === 'park' ? 'tree' : 'coffee'} 
                  size={16} 
                  color="white" 
                />
              </View>
            </Marker>
          ))}
        </MapView>
        <LinearGradient
          colors={['rgba(253, 248, 248, 0.6)', 'transparent', 'rgba(253, 248, 248, 0.3)']}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />
      </View>

      <View style={styles.tabsContainer}>
        <SegmentedTabs
          tabs={tabs}
          activeTab={activeTabIndex}
          onChange={setActiveTabIndex}
          style={{ marginHorizontal: 24 }}
        />
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false} bounces={true}>
        <View style={styles.listHeader}>
          <View>
            <Text style={styles.resultsCount}>{displayedVenues.length} locations found</Text>
            <Text style={styles.resultsArea}>Ranked by {tabs[activeTabIndex]}</Text>
          </View>
          <TouchableOpacity style={styles.filterChip}>
            <MaterialCommunityIcons name="tune-variant" size={18} color={colors.primary} />
            <Text style={styles.filterText}>Filter</Text>
          </TouchableOpacity>
        </View>

        {displayedVenues.map((venue) => (
          <TouchableOpacity 
            key={venue.id} 
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => router.push(`/venue/${venue.id}`)}
          >
            <View style={styles.cardImageContainer}>
              <Image 
                source={{ uri: venue.photoUrl }} 
                style={styles.cardImage} 
              />
              <View style={styles.fairnessBadge}>
                <MaterialCommunityIcons name="scale-balance" size={12} color="white" style={{ marginRight: 4 }} />
                <Text style={styles.fairnessBadgeText}>{venue.fairnessScore}% FAIR</Text>
              </View>
            </View>
            
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{venue.name}</Text>
                  <Text style={styles.cardSubtitle} numberOfLines={1}>{venue.address}</Text>
                </View>
                <View style={styles.rating}>
                  <MaterialIcons name="star" size={14} color="#FFB800" />
                  <Text style={styles.ratingText}>
                    {(venue.rating ?? 0).toFixed(1)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.cardFooter}>
                <View style={styles.timeInfo}>
                  <View style={styles.timeIconBg}>
                    <MaterialCommunityIcons name="clock-outline" size={14} color={colors.primary} />
                  </View>
                  <Text style={styles.timeText}>{venue.averageMinutes}m avg</Text>
                  <Text style={styles.maxTimeText}> (max {venue.maxMinutes}m)</Text>
                </View>
                <View style={styles.detailsButton}>
                  <Text style={styles.detailsButtonText}>VIEW</Text>
                  <MaterialIcons name="chevron-right" size={16} color={colors.primary} />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        
        {displayedVenues.length === 0 && (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="map-search-outline" size={48} color={colors.outline} />
            <Text style={styles.emptyTitle}>No spots found</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your travel time or picking a different meetup type.</Text>
          </View>
        )}
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 40,
  },
  loadingText: {
    marginTop: 20,
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 20,
    color: colors['on-surface'],
  },
  loadingSubtext: {
    marginTop: 8,
    fontFamily: typography.fontFamily.body,
    fontSize: 14,
    color: colors.outline,
    textAlign: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors['surface-container-low'],
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  mapContainer: {
    height: 220,
    width: '100%',
    ...shadows.sm,
  },
  map: {
    flex: 1,
  },
  tabsContainer: {
    paddingVertical: 16,
    backgroundColor: colors.background,
  },
  list: {
    flex: 1,
    paddingHorizontal: 24,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20,
  },
  resultsCount: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 12,
    color: colors.outline,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  resultsArea: {
    fontFamily: typography.fontFamily.headlineExtraBold,
    fontSize: 22,
    color: colors['on-surface'],
    marginTop: 4,
    letterSpacing: -0.5,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors['surface-container-low'],
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.full,
    gap: 8,
  },
  filterText: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: 14,
    color: colors['on-surface'],
  },
  card: {
    backgroundColor: colors['surface-container-lowest'],
    borderRadius: radii['2xl'],
    overflow: 'hidden',
    marginBottom: 24,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors['outline-variant'] + '15',
  },
  cardImageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  fairnessBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 103, 99, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.md,
  },
  fairnessBadgeText: {
    fontFamily: typography.fontFamily.label,
    fontSize: 11,
    fontWeight: '900',
    color: 'white',
    letterSpacing: 0.5,
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  cardTitle: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 20,
    color: colors['on-surface'],
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontFamily: typography.fontFamily.body,
    fontSize: 14,
    color: colors.outline,
    marginTop: 4,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors['surface-container-low'],
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.lg,
    gap: 4,
  },
  ratingText: {
    fontFamily: typography.fontFamily.label,
    fontSize: 13,
    fontWeight: '800',
    color: colors['on-surface'],
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors['surface-container-low'],
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeIconBg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  timeText: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: 15,
    color: colors.primary,
  },
  maxTimeText: {
    fontFamily: typography.fontFamily.body,
    fontSize: 13,
    color: colors.outline,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  detailsButtonText: {
    fontFamily: typography.fontFamily.label,
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
  },
  venueMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyTitle: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 20,
    color: colors['on-surface'],
  },
  emptySubtitle: {
    fontFamily: typography.fontFamily.body,
    fontSize: 15,
    color: colors.outline,
    textAlign: 'center',
    lineHeight: 22,
  }
});
