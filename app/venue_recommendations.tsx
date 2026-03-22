import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, SafeAreaView, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from '../src/components/MapView';
import { colors, typography, spacing, radii, shadows } from '../src/lib/theme';
import { TravelTimeChip } from '../src/components/TravelTimeChip';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useMeetupStore } from '../src/store/meetupStore';
import { LinearGradient } from 'expo-linear-gradient';

export default function VenueRecommendationsScreen() {
  const { width, height } = useWindowDimensions();
  const venues = useMeetupStore(state => state.venueCandidates);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Midpoint Spots',
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { fontFamily: typography.fontFamily.headlineBold, color: colors['on-surface'] },
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 8 }}>
            <MaterialIcons name="arrow-back" size={24} color={colors['on-surface']} />
          </TouchableOpacity>
        )
      }} />
      
      {/* Map Preview */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: venues[0]?.location.lat || 55.4765,
            longitude: venues[0]?.location.lng || 8.4515,
            latitudeDelta: 0.03,
            longitudeDelta: 0.03,
          }}
        >
          {venues.map((venue) => (
            <Marker 
              key={venue.id} 
              coordinate={{ 
                latitude: venue.location.lat, 
                longitude: venue.location.lng 
              }}
            >
              <View style={styles.venueMarker}>
                <MaterialCommunityIcons name="coffee" size={16} color="white" />
              </View>
            </Marker>
          ))}
        </MapView>
        <LinearGradient
          colors={['rgba(253, 248, 248, 0.4)', 'transparent', 'rgba(253, 248, 248, 0.2)']}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />
      </View>

      {/* List Area */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false} bounces={true}>
        <View style={styles.listHeader}>
          <View>
            <Text style={styles.resultsCount}>{venues.length} Locations Found</Text>
            <Text style={styles.resultsArea}>Near Esbjerg Midpoint</Text>
          </View>
          <TouchableOpacity style={styles.filterChip}>
            <MaterialCommunityIcons name="tune-variant" size={18} color={colors.primary} />
            <Text style={styles.filterText}>Filter</Text>
          </TouchableOpacity>
        </View>

        {venues.map((venue) => (
          <TouchableOpacity 
            key={venue.id} 
            style={styles.card}
            activeOpacity={0.95}
            onPress={() => router.push(`/venue/${venue.id}`)}
          >
            <View style={styles.cardImageContainer}>
              <Image 
                source={{ uri: venue.photoUrl || `https://picsum.photos/seed/${venue.id}/400/300` }} 
                style={styles.cardImage} 
              />
              <View style={styles.fairnessBadge}>
                <Text style={styles.fairnessBadgeText}>{venue.fairnessScore}% FAIR</Text>
              </View>
            </View>
            
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{venue.name}</Text>
                  <Text style={styles.cardSubtitle}>{venue.type} • {venue.address}</Text>
                </View>
                <View style={styles.rating}>
                  <MaterialIcons name="star" size={16} color="#FFB800" />
                  <Text style={styles.ratingText}>{(venue.rating || 4.5).toFixed(1)}</Text>
                </View>
              </View>
              
              <View style={styles.cardFooter}>
                <View style={styles.timeInfo}>
                  <MaterialCommunityIcons name="bus-clock" size={16} color={colors.primary} />
                  <Text style={styles.timeText}>{venue.averageTravelTime}m avg</Text>
                </View>
                <View style={styles.selectButton}>
                  <Text style={styles.selectButtonText}>Details</Text>
                  <MaterialIcons name="chevron-right" size={16} color="white" />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
  mapContainer: {
    height: 220,
    width: '100%',
    ...shadows.sm,
  },
  map: {
    flex: 1,
  },
  list: {
    flex: 1,
    paddingHorizontal: 24,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 24,
  },
  resultsCount: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 18,
    color: colors['on-surface'],
  },
  resultsArea: {
    fontFamily: typography.fontFamily.body,
    fontSize: 13,
    color: colors.outline,
    marginTop: 2,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.full,
    gap: 8,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  filterText: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: 14,
    color: colors.primary,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: radii['3xl'],
    overflow: 'hidden',
    marginBottom: 20,
    ...shadows.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  cardImageContainer: {
    width: '100%',
    height: 160,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  fairnessBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0, 103, 99, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  fairnessBadgeText: {
    fontFamily: typography.fontFamily.label,
    fontSize: 10,
    fontWeight: '900',
    color: 'white',
    letterSpacing: 0.5,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardTitle: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 18,
    color: colors['on-surface'],
  },
  cardSubtitle: {
    fontFamily: typography.fontFamily.body,
    fontSize: 13,
    color: colors.outline,
    marginTop: 2,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors['surface-container-low'],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  ratingText: {
    fontFamily: typography.fontFamily.label,
    fontSize: 12,
    fontWeight: '700',
    color: colors['on-surface'],
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors['surface-container-low'],
    paddingTop: 16,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: 14,
    color: colors.primary,
  },
  selectButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.xl,
    gap: 4,
    ...shadows.sm,
  },
  selectButtonText: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 13,
    color: 'white',
  },
  venueMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  }
});
