import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Platform, Dimensions, ActivityIndicator } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { colors, typography, radii, spacing, shadows } from '../../src/lib/theme';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { AvatarStack } from '../../src/components/AvatarStack';
import MapView from '../../src/components/MapView';
import { locationService } from '../../src/services/locationService';
import { useMeetupStore } from '../../src/store/meetupStore';

const TRANSPORT_MODES = [
  { id: 'walk', icon: 'directions-walk', label: 'Walk' },
  { id: 'bike', icon: 'directions-bike', label: 'Bike' },
  { id: 'transit', icon: 'train', label: 'Transit' },
  { id: 'car', icon: 'directions-car', label: 'Car' },
];

export default function SetupTripScreen() {
  const params = useLocalSearchParams();
  const meetupType = params.type as string || 'Coffee';
  
  const [location, setLocation] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [selectedTransport, setSelectedTransport] = useState('walk');
  const [maxTravelTime, setMaxTravelTime] = useState(30);
  const [isSchedulePrioritized, setIsSchedulePrioritized] = useState(true);
  
  const [region, setRegion] = useState({
    latitude: params.lat ? parseFloat(params.lat as string) : 55.4765,
    longitude: params.lng ? parseFloat(params.lng as string) : 8.4515,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const handleUseCurrentLocation = async () => {
    setIsDetecting(true);
    try {
      const loc = await locationService.getCurrentLocation();
      if (loc) {
        setRegion(prev => ({
          ...prev,
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        }));
        const address = await locationService.reverseGeocode(loc.coords.latitude, loc.coords.longitude);
        setLocation(address || 'Current Location');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleJoin = () => {
    // Create the session in our global state
    useMeetupStore.getState().createSession({
      title: `${meetupType.charAt(0).toUpperCase() + meetupType.slice(1)} at Midpoint`,
      type: meetupType,
      date: new Date().toISOString(),
      participants: [
        {
          id: 'p_me',
          userId: 'user_1',
          profile: { id: 'user_1', name: 'You', avatarUrl: 'https://i.pravatar.cc/150?u=me' },
          location: { lat: region.latitude, lng: region.longitude },
          status: 'ready',
        },
        {
          id: 'p_2',
          userId: 'user_2',
          profile: { id: 'user_2', name: 'Sarah', avatarUrl: 'https://i.pravatar.cc/150?u=sarah' },
          location: { lat: region.latitude + 0.01, lng: region.longitude - 0.01 },
          status: 'ready',
        }
      ]
    });
    
    router.push('/meetup/compare');
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
          <TouchableOpacity style={styles.avatarContainer}>
             <MaterialCommunityIcons name="account-circle" size={32} color={colors['primary-container']} />
          </TouchableOpacity>
        )
      }} />

      <MapView 
        style={styles.map} 
        initialRegion={region}
      />

      <ScrollView 
        style={styles.contentOverlay}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Session Header Card */}
        <View style={styles.sessionCard}>
          <View style={styles.sessionInfo}>
            <View>
              <Text style={styles.sessionTitle}>{meetupType.charAt(0).toUpperCase() + meetupType.slice(1)} Setup</Text>
              <Text style={styles.sessionSubtitle}>Organized by Sarah M.</Text>
            </View>
            <AvatarStack 
              urls={[
                'https://i.pravatar.cc/150?u=sarah',
                'https://i.pravatar.cc/150?u=james',
                '',
                ''
              ]} 
              size={32} 
            />
          </View>
        </View>

        {/* Location Search */}
        <View style={styles.section}>
          <View style={styles.searchInputContainer}>
            <MaterialIcons name="location-on" size={24} color={colors.primary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Enter starting location"
              value={location}
              onChangeText={setLocation}
              placeholderTextColor={colors.outline}
            />
          </View>
          <TouchableOpacity 
            style={styles.useLocationButton} 
            onPress={handleUseCurrentLocation}
            disabled={isDetecting}
          >
            {isDetecting ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <MaterialIcons name="my-location" size={18} color={colors['on-surface']} />
                <Text style={styles.useLocationText}>Use current location</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Preferences Panel */}
        <View style={styles.preferencesCard}>
          <View style={styles.prefSection}>
            <Text style={styles.prefLabel}>TRANSPORT MODE</Text>
            <View style={styles.transportGrid}>
              {TRANSPORT_MODES.map((mode) => {
                const isSelected = selectedTransport === mode.id;
                return (
                  <TouchableOpacity
                    key={mode.id}
                    style={[styles.transportButton, isSelected && styles.transportButtonActive]}
                    onPress={() => setSelectedTransport(mode.id)}
                  >
                    <MaterialIcons 
                      name={mode.icon as any} 
                      size={24} 
                      color={isSelected ? 'white' : colors['on-surface']} 
                    />
                    <Text style={[styles.transportLabel, isSelected && styles.transportLabelActive]}>
                      {mode.label.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.prefSection}>
            <View style={styles.sliderHeader}>
              <Text style={styles.prefLabel}>MAX TRAVEL TIME</Text>
              <Text style={styles.timeValue}>{maxTravelTime} <Text style={styles.timeUnit}>MIN</Text></Text>
            </View>
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { width: `${(maxTravelTime / 60) * 100}%` }]} />
              <View style={[styles.sliderThumb, { left: `${(maxTravelTime / 60) * 100}%` }]} />
            </View>
          </View>

          <View style={styles.timingRow}>
            <View>
              <Text style={styles.prefLabel}>SCHEDULE TYPE</Text>
              <Text style={styles.timingSubtext}>Prioritize meeting exactly at 12:30</Text>
            </View>
            <TouchableOpacity 
              style={[styles.toggle, isSchedulePrioritized && styles.toggleActive]}
              onPress={() => setIsSchedulePrioritized(!isSchedulePrioritized)}
            >
              <View style={[styles.toggleThumb, isSchedulePrioritized && styles.toggleThumbActive]}>
                 {isSchedulePrioritized && <MaterialCommunityIcons name="timer-outline" size={12} color={colors.primary} />}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <PrimaryButton 
          title="Join Session" 
          onPress={handleJoin}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.4,
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
    borderColor: colors['surface-container-lowest'],
    borderRadius: 20,
    backgroundColor: colors['surface-container-highest'],
  },
  contentOverlay: {
    flex: 1,
    paddingHorizontal: 24,
    marginTop: 100,
  },
  scrollContent: {
    paddingBottom: 140,
    gap: 24,
  },
  sessionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: radii.xl,
    padding: 24,
    ...shadows.md,
    ...Platform.select({
      ios: { backdropFilter: 'blur(20px)' },
    } as any),
  },
  sessionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sessionTitle: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 24,
    color: colors['on-surface'],
    letterSpacing: -0.5,
  },
  sessionSubtitle: {
    fontFamily: typography.fontFamily.body,
    fontSize: 14,
    color: colors['on-surface-variant'],
    marginTop: 4,
  },
  section: {
    gap: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors['surface-container-lowest'],
    borderRadius: radii.xl,
    paddingHorizontal: 16,
    height: 56,
    ...shadows.md,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: 16,
    color: colors['on-surface'],
  },
  useLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors['surface-container-low'],
    paddingVertical: 12,
    borderRadius: radii.xl,
  },
  useLocationText: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: 14,
    color: colors['on-surface'],
  },
  preferencesCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: radii.xl,
    padding: 24,
    gap: 32,
    ...shadows.md,
    ...Platform.select({
      ios: { backdropFilter: 'blur(20px)' },
    } as any),
  },
  prefSection: {
    gap: 16,
  },
  prefLabel: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 10,
    color: colors['on-surface-variant'],
    letterSpacing: 1.5,
  },
  transportGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  transportButton: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: colors['surface-container-high'],
    borderRadius: radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  transportButtonActive: {
    backgroundColor: colors.primary,
  },
  transportLabel: {
    fontFamily: typography.fontFamily.label,
    fontSize: 10,
    fontWeight: '700',
    color: colors['on-surface'],
  },
  transportLabelActive: {
    color: 'white',
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  timeValue: {
    fontFamily: typography.fontFamily.headlineExtraBold,
    fontSize: 20,
    color: colors.primary,
  },
  timeUnit: {
    fontSize: 10,
    fontFamily: typography.fontFamily.label,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: colors['surface-container-highest'],
    borderRadius: 3,
    position: 'relative',
    marginTop: 8,
  },
  sliderFill: {
    position: 'absolute',
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  sliderThumb: {
    position: 'absolute',
    top: -9,
    width: 24,
    height: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 4,
    borderColor: colors.primary,
    marginLeft: -12,
    ...shadows.sm,
  },
  timingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timingSubtext: {
    fontFamily: typography.fontFamily.body,
    fontSize: 12,
    color: colors['on-surface-variant'],
    marginTop: 2,
  },
  toggle: {
    width: 56,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors['surface-container-highest'],
    padding: 4,
  },
  toggleActive: {
    backgroundColor: colors.primary,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(253, 248, 248, 0.85)',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderTopLeftRadius: radii['2xl'],
    borderTopRightRadius: radii['2xl'],
    ...shadows.lg,
    ...Platform.select({
      ios: { backdropFilter: 'blur(20px)' },
    } as any),
  },
});
