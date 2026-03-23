import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, Text, ScrollView, Image, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import MapView from '../../src/components/MapView';
import { ParticipantMarker } from '../../src/components/maps/ParticipantMarker';
import { VenueMarker } from '../../src/components/maps/VenueMarker';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, typography, radii, spacing, shadows } from '../../src/lib/theme';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { MapBottomSheet } from '../../src/components/sheets/MapBottomSheet';
import { useAuthStore } from '../../src/store/authStore';
import { meetupService } from '../../src/services/meetupService';
import { locationService } from '../../src/services/locationService';
import { MeetupSession } from '../../src/types';

/** City-scale default (Copenhagen-ish) when GPS unavailable — not world view */
const DEFAULT_REGION = {
  latitude: 55.6761,
  longitude: 12.5683,
  latitudeDelta: 0.014,
  longitudeDelta: 0.014,
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const sheetBottomClearance = Math.max(tabBarHeight, Platform.OS === 'ios' ? 108 : 96) + spacing[2];

  const [sessions, setSessions] = useState<MeetupSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [region, setRegion] = useState(DEFAULT_REGION);

  const user = useAuthStore((state) => state.user);

  const venueOffsets = useMemo(
    () => [
      { lat: 0.0042, lng: 0.0035, icon: 'coffee' as const, id: 'demo-coffee' },
      { lat: -0.0036, lng: 0.0028, icon: 'glass-wine' as const, id: 'demo-wine', accent: colors.secondary },
    ],
    []
  );

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
    } else {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchSessions();

    locationService.getCurrentLocation().then((loc) => {
      if (loc) {
        setRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.012,
          longitudeDelta: 0.012,
        });
      }
    });
  }, [fetchSessions]);

  return (
    <View style={styles.container}>
      <View style={StyleSheet.absoluteFillObject}>
        <MapView
          style={StyleSheet.absoluteFillObject}
          initialRegion={region}
          mapStylePreset="liberty"
          rotateEnabled={false}
          pitchEnabled={false}
        >
          <ParticipantMarker
            id="home-user"
            coordinate={{ latitude: region.latitude, longitude: region.longitude }}
            avatarUrl={user?.avatarUrl}
            prominent
          />
          {venueOffsets.map((v, i) => (
            <VenueMarker
              key={v.id}
              id={v.id}
              coordinate={{
                latitude: region.latitude + v.lat,
                longitude: region.longitude + v.lng,
              }}
              icon={v.icon}
              accentColor={v.accent ?? colors.tertiary}
              selected={i === 0}
            />
          ))}
        </MapView>

        {/* Calmer map: soft vignette + legibility scrim under header */}
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(253, 248, 248, 0.55)', 'transparent']}
          style={styles.mapTopScrim}
        />
        <LinearGradient
          pointerEvents="none"
          colors={['transparent', 'rgba(253, 248, 248, 0.25)']}
          style={styles.mapBottomScrim}
        />
      </View>

      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={[styles.headerRow, { paddingTop: spacing[2] }]}>
          <TouchableOpacity style={styles.headerAvatar} accessibilityRole="button" accessibilityLabel="Profile">
            <Image
              source={{ uri: user?.avatarUrl || 'https://i.pravatar.cc/150?u=me' }}
              style={styles.avatarImage}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.searchBar}
            activeOpacity={0.85}
            onPress={() => router.push('/meetup/type')}
            accessibilityRole="button"
            accessibilityLabel="Start finding a meetup"
          >
            <MaterialIcons name="search" size={22} color={colors.outline} />
            <Text style={styles.searchPlaceholder}>Where are we meeting?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterButton} activeOpacity={0.85} accessibilityRole="button">
            <MaterialCommunityIcons name="tune-variant" size={22} color={colors['on-surface']} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <MapBottomSheet
        bottomInset={sheetBottomClearance}
        maxHeightRatio={0.5}
        contentContainerStyle={styles.sheetScrollContent}
      >
        <View style={styles.primaryActionBlock}>
          <PrimaryButton
            title="Start a new meetup"
            icon={<MaterialCommunityIcons name="plus-circle" size={22} color="white" />}
            onPress={() => router.push('/meetup/type')}
            style={styles.primaryAction}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Favorite spots</Text>
            <TouchableOpacity hitSlop={12}>
              <Text style={styles.actionText}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsScroll}
          >
            <TouchableOpacity style={styles.spotChip} activeOpacity={0.88}>
              <View style={[styles.chipIcon, { backgroundColor: colors.tertiary + '18' }]}>
                <MaterialCommunityIcons name="star" size={18} color={colors.tertiary} />
              </View>
              <Text style={styles.chipLabel}>Work HQ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.spotChip} activeOpacity={0.88}>
              <View style={[styles.chipIcon, { backgroundColor: colors.primary + '15' }]}>
                <MaterialCommunityIcons name="heart" size={18} color={colors.primary} />
              </View>
              <Text style={styles.chipLabel}>Lakeside Park</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.spotChip} activeOpacity={0.88}>
              <View style={[styles.chipIcon, { backgroundColor: colors.secondary + '15' }]}>
                <MaterialCommunityIcons name="history" size={18} color={colors.secondary} />
              </View>
              <Text style={styles.chipLabel}>Mirabelle</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.sectionLast}>
          <Text style={[styles.sectionTitle, styles.sectionTitleStandalone]}>Upcoming meetups</Text>
          {isLoading ? (
            <View style={styles.loadingBlock}>
              <ActivityIndicator color={colors.primary} size="small" />
              <Text style={styles.loadingLabel}>Syncing your meetups…</Text>
            </View>
          ) : sessions.length > 0 ? (
            sessions.map((session) => (
              <TouchableOpacity
                key={session.id}
                style={styles.sessionCard}
                activeOpacity={0.88}
                onPress={() => router.push(`/session/${session.id}` as any)}
              >
                <View style={styles.sessionCardImage}>
                  <LinearGradient
                    colors={[colors['surface-container-high'], colors['surface-container-low']]}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <MaterialCommunityIcons name="map-marker-path" size={26} color={colors.outline} />
                </View>
                <View style={styles.sessionCardInfo}>
                  <Text style={styles.sessionTitleText} numberOfLines={1}>
                    {session.title}
                  </Text>
                  <View style={styles.sessionMeta}>
                    <View style={styles.statusPill}>
                      <Text style={styles.statusPillText}>Active now</Text>
                    </View>
                    <View style={styles.avatarStack}>
                      <View style={styles.stackAvatar} />
                      <View style={[styles.stackAvatar, styles.stackAvatarOverlap, { backgroundColor: colors.tertiary }]}>
                        <Text style={styles.stackText}>+2</Text>
                      </View>
                    </View>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={22} color={colors['outline-variant']} />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptySessions}>
              <View style={styles.emptyIconContainer}>
                <MaterialCommunityIcons name="map-marker-radius" size={36} color={colors.outline} />
              </View>
              <Text style={styles.emptyText}>No meetups yet</Text>
              <Text style={styles.emptySubtext}>Start one and we’ll balance travel for everyone.</Text>
            </View>
          )}
        </View>
      </MapBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mapTopScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 140,
  },
  mapBottomScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
  },
  headerSafe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[3],
    gap: spacing[3],
  },
  headerAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: colors['surface-container-lowest'],
    ...shadows.md,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 21,
  },
  searchBar: {
    flex: 1,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: radii.full,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    gap: spacing[3],
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors['outline-variant'] + '18',
  },
  searchPlaceholder: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: 15,
    color: colors['on-surface-variant'],
    flex: 1,
  },
  filterButton: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors['outline-variant'] + '18',
  },
  sheetScrollContent: {
    paddingBottom: spacing[6],
  },
  primaryActionBlock: {
    marginBottom: spacing[6],
    ...shadows.sm,
  },
  primaryAction: {
    minHeight: 58,
    borderRadius: radii.xl,
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionLast: {
    marginBottom: spacing[2],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing[3],
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 18,
    color: colors['on-surface'],
    letterSpacing: -0.4,
  },
  sectionTitleStandalone: {
    marginBottom: spacing[3],
  },
  actionText: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: 13,
    color: colors.primary,
  },
  chipsScroll: {
    gap: spacing[3],
    paddingRight: spacing[6],
  },
  spotChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors['surface-container-lowest'],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: radii.full,
    gap: spacing[2],
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors['outline-variant'] + '12',
  },
  chipIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipLabel: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: 14,
    color: colors['on-surface'],
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors['surface-container-lowest'],
    borderRadius: radii['2xl'],
    padding: spacing[4],
    gap: spacing[4],
    marginBottom: spacing[3],
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors['outline-variant'] + '12',
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
    letterSpacing: -0.3,
  },
  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusPill: {
    backgroundColor: colors.tertiary + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  statusPillText: {
    fontFamily: typography.fontFamily.label,
    fontSize: 10,
    fontWeight: '800',
    color: colors.tertiary,
    letterSpacing: 0.4,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stackAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.outline,
    borderWidth: 2,
    borderColor: colors['surface-container-lowest'],
  },
  stackAvatarOverlap: {
    marginLeft: -12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stackText: {
    fontFamily: typography.fontFamily.label,
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  loadingBlock: {
    alignItems: 'center',
    paddingVertical: spacing[8],
    gap: spacing[2],
  },
  loadingLabel: {
    fontFamily: typography.fontFamily.body,
    fontSize: 13,
    color: colors.outline,
  },
  emptySessions: {
    alignItems: 'center',
    paddingVertical: spacing[8],
    gap: spacing[2],
  },
  emptyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors['surface-container-low'],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[1],
  },
  emptyText: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 17,
    color: colors['on-surface'],
  },
  emptySubtext: {
    fontFamily: typography.fontFamily.body,
    fontSize: 14,
    color: colors.outline,
    textAlign: 'center',
    paddingHorizontal: spacing[4],
    lineHeight: 20,
  },
});
