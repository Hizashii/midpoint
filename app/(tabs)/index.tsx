import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, Text, ScrollView, Image, TouchableOpacity, Dimensions, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import MapView, { Marker, PROVIDER_GOOGLE } from '../../src/components/MapView';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, typography, radii, spacing, shadows } from '../../src/lib/theme';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { useAuthStore } from '../../src/store/authStore';
import { meetupService } from '../../src/services/meetupService';
import { locationService } from '../../src/services/locationService';
import { MeetupSession } from '../../src/types';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const [sessions, setSessions] = useState<MeetupSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [region, setRegion] = useState({
    latitude: 55.4765,
    longitude: 8.4515,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });
  
  const user = useAuthStore((state) => state.user);

  const fetchSessions = useCallback(async () => {
    if (user?.id) {
      setIsLoading(true);
      try {
        const data = await meetupService.getUserSessions(user.id);
        setSessions(data);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [user?.id]);

  useEffect(() => {
    fetchSessions();
    
    locationService.getCurrentLocation().then(loc => {
      if (loc) {
        setRegion(prev => ({
          ...prev,
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        }));
      }
    });
  }, [fetchSessions]);

  return (
    <View style={styles.container}>
      {/* Map Layer */}
      <View style={StyleSheet.absoluteFillObject}>
        <MapView 
          style={StyleSheet.absoluteFillObject}
          initialRegion={region}
        >
          {/* User Marker */}
          <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }}>
            <View style={styles.userMarkerOuter}>
              <View style={styles.userMarkerInner}>
                {user?.avatarUrl ? (
                  <Image source={{ uri: user.avatarUrl }} style={styles.userMarkerAvatar} />
                ) : (
                  <MaterialIcons name="person" size={20} color="white" />
                )}
              </View>
              <View style={styles.markerPointer} />
            </View>
          </Marker>

          {/* Active Session Markers (Mocked for visual depth) */}
          <Marker coordinate={{ latitude: region.latitude + 0.005, longitude: region.longitude + 0.005 }}>
            <View style={styles.venueMarker}>
              <MaterialCommunityIcons name="coffee" size={18} color="white" />
            </View>
          </Marker>
        </MapView>
        
        {/* Soft Map Overlays */}
        <LinearGradient
          colors={['rgba(253, 248, 248, 0.7)', 'transparent', 'transparent', 'rgba(253, 248, 248, 0.5)']}
          style={[StyleSheet.absoluteFillObject, { pointerEvents: 'none' } as any]}
        />
      </View>

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Floating Search / Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.headerAvatar}>
            <Image 
              source={{ uri: user?.avatarUrl || 'https://i.pravatar.cc/150?u=me' }} 
              style={styles.avatarImage} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.searchBar} activeOpacity={0.9}>
            <MaterialIcons name="search" size={22} color={colors.outline} />
            <Text style={styles.searchPlaceholder}>Search midpoint spots...</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterButton}>
            <MaterialCommunityIcons name="tune-variant" size={22} color={colors['on-surface']} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Premium Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.sheetHandleContainer}>
          <View style={styles.sheetHandle} />
        </View>

        <ScrollView 
          contentContainerStyle={styles.sheetContent} 
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* Main Action */}
          <PrimaryButton 
            title="Start a new meetup" 
            icon={<MaterialCommunityIcons name="plus-circle" size={24} color="white" />}
            onPress={() => router.push('/meetup/type')}
            style={styles.primaryAction}
          />

          {/* Favorites / Chips */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Favorite Spots</Text>
              <TouchableOpacity>
                <Text style={styles.actionText}>See all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
              <TouchableOpacity style={styles.spotChip}>
                <View style={[styles.chipIcon, { backgroundColor: colors.tertiary + '15' }]}>
                  <MaterialCommunityIcons name="star" size={16} color={colors.tertiary} />
                </View>
                <Text style={styles.chipLabel}>Work HQ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.spotChip}>
                <View style={[styles.chipIcon, { backgroundColor: colors.primary + '15' }]}>
                  <MaterialCommunityIcons name="heart" size={16} color={colors.primary} />
                </View>
                <Text style={styles.chipLabel}>Lakeside Park</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.spotChip}>
                <View style={[styles.chipIcon, { backgroundColor: colors.secondary + '15' }]}>
                  <MaterialCommunityIcons name="history" size={16} color={colors.secondary} />
                </View>
                <Text style={styles.chipLabel}>Mirabelle</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Upcoming Sessions */}
          <View style={[styles.section, { marginBottom: 120 }]}>
            <Text style={styles.sectionTitle}>Upcoming Meetups</Text>
            {isLoading ? (
              <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
            ) : sessions.length > 0 ? (
              sessions.map((session) => (
                <TouchableOpacity 
                  key={session.id} 
                  style={styles.sessionCard}
                  onPress={() => router.push(`/session/${session.id}` as any)}
                >
                  <View style={styles.sessionCardImage}>
                    <LinearGradient
                      colors={[colors['surface-container-high'], colors['surface-container-low']]}
                      style={StyleSheet.absoluteFillObject}
                    />
                    <MaterialCommunityIcons name="map-marker-path" size={28} color={colors.outline} />
                  </View>
                  <View style={styles.sessionCardInfo}>
                    <Text style={styles.sessionTitleText} numberOfLines={1}>{session.title}</Text>
                    <View style={styles.sessionMeta}>
                      <View style={styles.statusPill}>
                        <Text style={styles.statusPillText}>Today, 15:30</Text>
                      </View>
                      <View style={styles.avatarStack}>
                        <View style={styles.stackAvatar} />
                        <View style={[styles.stackAvatar, { marginLeft: -10, backgroundColor: colors.tertiary }]}>
                          <Text style={styles.stackText}>+2</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color={colors['outline-variant']} />
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptySessions}>
                <MaterialCommunityIcons name="calendar-blank" size={48} color={colors['surface-container-highest']} />
                <Text style={styles.emptyText}>No meetups planned yet</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 50,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: spacing[4],
    gap: 12,
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'white',
    ...shadows.sm,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  searchBar: {
    flex: 1,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: radii.full,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
    ...shadows.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  searchPlaceholder: {
    fontFamily: typography.fontFamily.body,
    fontSize: 15,
    color: colors.outline,
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: 'white',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  // Map Markers
  userMarkerOuter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarkerInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  userMarkerAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  markerPointer: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'white',
    transform: [{ rotate: '180deg' }],
    marginTop: -2,
  },
  venueMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.tertiary,
    borderWidth: 3,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  // Bottom Sheet
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: height * 0.52,
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
  primaryAction: {
    marginBottom: 32,
    ...shadows.lg,
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
    fontSize: 18,
    color: colors['on-surface'],
  },
  actionText: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: 14,
    color: colors.primary,
  },
  chipsScroll: {
    gap: 12,
    paddingRight: 20,
  },
  spotChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.full,
    gap: 8,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  chipIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipLabel: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: 14,
    color: colors['on-surface'],
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: radii['2xl'],
    padding: 16,
    gap: 16,
    ...shadows.sm,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  sessionCardImage: {
    width: 60,
    height: 60,
    borderRadius: radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sessionCardInfo: {
    flex: 1,
    gap: 6,
  },
  sessionTitleText: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 16,
    color: colors['on-surface'],
  },
  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusPill: {
    backgroundColor: colors.primary + '10',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  statusPillText: {
    fontFamily: typography.fontFamily.label,
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stackAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.outline,
    borderWidth: 2,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stackText: {
    fontSize: 8,
    color: 'white',
    fontWeight: 'bold',
  },
  emptySessions: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontFamily: typography.fontFamily.body,
    fontSize: 14,
    color: colors.outline,
  }
});
