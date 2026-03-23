import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Platform, ActivityIndicator, Alert, Image } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { colors, typography, radii, spacing, shadows } from '../../src/lib/theme';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import MapView, { Marker } from '../../src/components/MapView';
import { locationService } from '../../src/services/locationService';
import { meetupService } from '../../src/services/meetupService';
import { useAuthStore } from '../../src/store/authStore';

export default function SetupTripScreen() {
  const params = useLocalSearchParams();
  const user = useAuthStore(state => state.user);
  const meetupType = (params.type as string) || 'coffee';
  
  const [address, setAddress] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTransport, setSelectedTransport] = useState('walk');
  const [maxTravelTime, setMaxTravelTime] = useState(30);
  
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
        const lat = loc.coords.latitude;
        const lng = loc.coords.longitude;
        setRegion(prev => ({ ...prev, latitude: lat, longitude: lng }));
        const addr = await locationService.reverseGeocode(lat, lng);
        setAddress(addr || 'Current Location');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleCreateAndJoin = async () => {
    if (!user) {
      Alert.alert("Sign In Required", "You must be signed in to create a meetup.");
      return;
    }

    setIsCreating(true);
    try {
      // 1. Create the session record
      const sessionTitle = `${meetupType.charAt(0).toUpperCase() + meetupType.slice(1)} Meetup`;
      const session = await meetupService.createSession(
        sessionTitle,
        meetupType as any,
        user.id
      );

      if (session) {
        // 2. Update organizer's location/mode within the session
        await meetupService.updateParticipantLocation(
          session.id,
          user.id,
          region.latitude,
          region.longitude,
          selectedTransport,
          maxTravelTime
        );

        // 3. Navigate to the live session room
        router.push(`/session/${session.id}`);
      } else {
        throw new Error("Failed to create session");
      }
    } catch (error) {
      console.error("Setup Error:", error);
      Alert.alert("Error", "Could not create session. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const TRANSPORT_MODES = [
    { id: 'walk', icon: 'directions-walk', label: 'Walk' },
    { id: 'bike', icon: 'directions-bike', label: 'Bike' },
    { id: 'transit', icon: 'train', label: 'Transit' },
    { id: 'car', icon: 'directions-car', label: 'Car' },
  ];

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
            <View style={styles.avatarContainer}>
               <Image source={{ uri: user?.avatarUrl || 'https://i.pravatar.cc/150?u=me' }} style={styles.avatarImage} />
            </View>
          </View>
        )
      }} />

      <MapView 
        style={styles.map} 
        initialRegion={region}
      >
        <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }}>
          <View style={styles.pin}>
            <MaterialIcons name="location-on" size={24} color={colors.primary} />
          </View>
        </Marker>
      </MapView>

      <ScrollView 
        style={styles.contentOverlay}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Step Info */}
        <View style={styles.sessionCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.stepLabel}>STEP 2 OF 3</Text>
            <View style={styles.progressBar}><View style={styles.progressFill} /></View>
          </View>
          <Text style={styles.sessionTitle}>Set your origin</Text>
          <Text style={styles.sessionSubtitle}>We'll find the fairest midpoint for everyone.</Text>
        </View>

        {/* Location Input */}
        <View style={styles.section}>
          <View style={styles.searchInputContainer}>
            <MaterialIcons name="search" size={22} color={colors.primary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Enter starting address..."
              value={address}
              onChangeText={setAddress}
              placeholderTextColor={colors.outline}
            />
          </View>
          <TouchableOpacity 
            style={styles.useLocationButton} 
            onPress={handleUseCurrentLocation}
            disabled={isDetecting}
            activeOpacity={0.7}
          >
            {isDetecting ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <MaterialIcons name="my-location" size={18} color={colors.primary} />
                <Text style={styles.useLocationText}>Use GPS current location</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Preferences */}
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
                    activeOpacity={0.8}
                  >
                    <MaterialIcons 
                      name={mode.icon as any} 
                      size={24} 
                      color={isSelected ? 'white' : colors.outline} 
                    />
                    <Text style={[styles.transportLabel, isSelected && styles.transportLabelActive]}>
                      {mode.label}
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
            <View style={styles.sliderLabels}>
              <Text style={styles.rangeLabel}>15m</Text>
              <Text style={styles.rangeLabel}>60m+</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer Action */}
      <View style={styles.footer}>
        <PrimaryButton 
          title={isCreating ? "Creating Room..." : "Create Meetup Room"} 
          onPress={handleCreateAndJoin}
          disabled={isCreating}
          loading={isCreating}
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
    opacity: 0.5,
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
  headerRight: {
    marginRight: 16,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
    overflow: 'hidden',
    ...shadows.sm,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  pin: {
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 20,
    ...shadows.lg,
  },
  contentOverlay: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 100,
  },
  scrollContent: {
    paddingBottom: 160,
    gap: 20,
  },
  sessionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: radii['2xl'],
    padding: 24,
    ...shadows.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  stepLabel: {
    fontFamily: typography.fontFamily.label,
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1.5,
  },
  progressBar: {
    width: 60,
    height: 4,
    backgroundColor: colors['surface-container-high'],
    borderRadius: 2,
  },
  progressFill: {
    width: '66%',
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  sessionTitle: {
    fontFamily: typography.fontFamily.headlineExtraBold,
    fontSize: 26,
    color: colors['on-surface'],
    letterSpacing: -0.5,
  },
  sessionSubtitle: {
    fontFamily: typography.fontFamily.body,
    fontSize: 15,
    color: colors.outline,
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
    height: 60,
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors['outline-variant'] + '15',
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
    paddingVertical: 14,
    borderRadius: radii.xl,
  },
  useLocationText: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: 14,
    color: colors.primary,
  },
  preferencesCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: radii['2xl'],
    padding: 24,
    gap: 28,
    ...shadows.lg,
  },
  prefSection: {
    gap: 16,
  },
  prefLabel: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 11,
    color: colors.outline,
    letterSpacing: 1.2,
  },
  transportGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  transportButton: {
    flex: 1,
    height: 70,
    backgroundColor: colors['surface-container-low'],
    borderRadius: radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  transportButtonActive: {
    backgroundColor: colors.primary,
    ...shadows.md,
  },
  transportLabel: {
    fontFamily: typography.fontFamily.label,
    fontSize: 10,
    fontWeight: '700',
    color: colors.outline,
  },
  transportLabelActive: {
    color: 'white',
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  timeValue: {
    fontFamily: typography.fontFamily.headlineExtraBold,
    fontSize: 22,
    color: colors.primary,
  },
  timeUnit: {
    fontSize: 11,
    fontFamily: typography.fontFamily.label,
    color: colors.outline,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: colors['surface-container-high'],
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
    borderWidth: 5,
    borderColor: colors.primary,
    marginLeft: -12,
    ...shadows.md,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  rangeLabel: {
    fontFamily: typography.fontFamily.label,
    fontSize: 10,
    color: colors.outline,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(253, 248, 248, 0.95)',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 44 : 24,
    borderTopLeftRadius: radii['3xl'],
    borderTopRightRadius: radii['3xl'],
    ...shadows.ambient,
  },
});
