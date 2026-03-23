import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, ActivityIndicator } from 'react-native';
import { colors, typography, spacing, radii, shadows } from '../../src/lib/theme';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { locationService } from '../../src/services/locationService';
import { meetupService } from '../../src/services/meetupService';
import { PlaceSearchBar } from '../../src/components/PlaceSearchBar';

const TRANSPORT_MODES = [
  { id: 'car', label: 'Drive', icon: 'car-hatchback' },
  { id: 'transit', label: 'Transit', icon: 'train-variant' },
  { id: 'walk', label: 'Walk', icon: 'walk' },
  { id: 'bike', label: 'Cycle', icon: 'bike' },
];

const TRAVEL_TIMES = [15, 30, 45, 60];

export default function ParticipantSetupScreen() {
  const [transportMode, setTransportMode] = useState('transit');
  const [maxTime, setMaxTime] = useState(30);
  const [isFlexible, setIsFlexible] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const user = useAuthStore(state => state.user);
  const { id: sessionId } = useLocalSearchParams();

  const handleGetLocation = async () => {
    setIsLocating(true);
    try {
      const loc = await locationService.getCurrentLocation();
      if (loc) {
        const address = await locationService.reverseGeocode(loc.coords.latitude, loc.coords.longitude);
        setLocation({
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
          address: address || `Esbjerg, Denmark`,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLocating(false);
    }
  };

  const handleJoin = async (selectedMode?: string, selectedTime?: number) => {
    if (!user || !location || !sessionId || isJoining) return;
    
    setIsJoining(true);
    try {
      await meetupService.updateParticipantLocation(
        sessionId as string,
        user.id,
        location.lat,
        location.lng,
        selectedMode || transportMode,
        selectedTime || maxTime
      );
      router.push(`/session/${sessionId}`);
    } catch (error) {
      console.error("Failed to join:", error);
    } finally {
      setIsJoining(false);
    }
  };

  const onTransportSelect = (mode: string) => {
    setTransportMode(mode);
    if (location) {
      handleJoin(mode, maxTime);
    }
  };

  const onTimeSelect = (time: number) => {
    setMaxTime(time);
    if (location) {
      handleJoin(transportMode, time);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        headerTitle: 'Your Setup',
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { fontFamily: typography.fontFamily.headlineBold, fontSize: 18 },
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBack}>
            <MaterialIcons name="arrow-back" size={24} color={colors['on-surface']} />
          </TouchableOpacity>
        )
      }} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.intro}>
          <Text style={styles.headline}>Final details.</Text>
          <Text style={styles.subheadline}>Tell us where you're starting from and how you're traveling today.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>1. STARTING POINT</Text>
          <PlaceSearchBar 
            onPlaceSelect={(res) => setLocation(res)} 
            placeholder="Search for an address..."
          />

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity 
            style={[styles.locationButton, location && { borderColor: colors.primary }]} 
            onPress={handleGetLocation}
            disabled={isLocating || isJoining}
            activeOpacity={0.7}
          >
            {isLocating ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <MaterialCommunityIcons name="target" size={22} color={colors.primary} />
            )}
            <Text style={styles.locationButtonText}>
              {isLocating ? 'Locating...' : 'Use current location'}
            </Text>
          </TouchableOpacity>

          {location && (
            <View style={styles.confirmedBox}>
              <View style={styles.confirmedIcon}>
                <MaterialIcons name="check" size={12} color="white" />
              </View>
              <Text style={styles.confirmedText} numberOfLines={1}>{location.address}</Text>
            </View>
          )}
        </View>

        <View style={[styles.section, !location && { opacity: 0.5 }]}>
          <Text style={styles.label}>2. TRANSPORT MODE & JOIN</Text>
          <View style={styles.transportGrid}>
            {TRANSPORT_MODES.map((mode) => (
              <TouchableOpacity
                key={mode.id}
                style={[
                  styles.modeCard,
                  transportMode === mode.id && styles.modeCardActive
                ]}
                onPress={() => onTransportSelect(mode.id)}
                disabled={!location || isJoining}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons 
                  name={mode.icon as any} 
                  size={24} 
                  color={transportMode === mode.id ? colors.primary : colors.outline} 
                />
                <Text style={[
                  styles.modeLabel,
                  transportMode === mode.id && styles.modeLabelActive
                ]}>{mode.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.section, !location && { opacity: 0.5 }]}>
          <Text style={styles.label}>OR CHOOSE MAX TIME</Text>
          <View style={styles.timeGrid}>
            {TRAVEL_TIMES.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeCard,
                  maxTime === time && styles.timeCardActive
                ]}
                onPress={() => onTimeSelect(time)}
                disabled={!location || isJoining}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.timeLabel,
                  maxTime === time && styles.timeLabelActive
                ]}>{time}m</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity 
            style={styles.flexibleCard} 
            onPress={() => setIsFlexible(!isFlexible)}
            disabled={!location || isJoining}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, isFlexible && styles.checkboxActive]}>
              {isFlexible && <MaterialIcons name="check" size={14} color="white" />}
            </View>
            <View>
              <Text style={styles.flexibleTitle}>I'm flexible with time</Text>
              <Text style={styles.flexibleSubtitle}>Prioritize the best venue over travel time</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        {isJoining && (
          <View style={styles.joiningOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.joiningText}>Joining Session...</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerBack: {
    marginLeft: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors['surface-container-low'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 24,
    gap: 32,
  },
  intro: {
    gap: 8,
  },
  headline: {
    fontFamily: typography.fontFamily.headlineExtraBold,
    fontSize: 28,
    color: colors['on-surface'],
    letterSpacing: -0.5,
  },
  subheadline: {
    fontFamily: typography.fontFamily.body,
    fontSize: 16,
    color: colors.outline,
    lineHeight: 22,
  },
  section: {
    gap: 16,
  },
  label: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 12,
    color: colors.outline,
    letterSpacing: 1,
    marginLeft: 4,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors['surface-container-high'],
  },
  dividerText: {
    fontFamily: typography.fontFamily.label,
    fontSize: 10,
    fontWeight: '800',
    color: colors.outline,
    paddingHorizontal: 12,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    height: 56,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors['surface-container-high'],
    gap: 10,
    ...shadows.sm,
  },
  locationButtonText: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: 15,
    color: colors.primary,
  },
  confirmedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.tertiary + '08',
    padding: 12,
    borderRadius: radii.md,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.tertiary + '20',
  },
  confirmedIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmedText: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: 14,
    color: colors.tertiary,
    flex: 1,
  },
  transportGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  modeCard: {
    flex: 1,
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors['surface-container-high'],
    gap: 8,
    ...shadows.sm,
  },
  modeCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '05',
    ...shadows.md,
  },
  modeLabel: {
    fontFamily: typography.fontFamily.label,
    fontSize: 11,
    fontWeight: '700',
    color: colors.outline,
  },
  modeLabelActive: {
    color: colors.primary,
  },
  timeGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  timeCard: {
    flex: 1,
    backgroundColor: 'white',
    height: 50,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors['surface-container-high'],
    ...shadows.sm,
  },
  timeCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '05',
  },
  timeLabel: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 15,
    color: colors.outline,
  },
  timeLabelActive: {
    color: colors.primary,
  },
  flexibleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: radii.xl,
    gap: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors['surface-container-high'],
    ...shadows.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors['surface-container-highest'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  flexibleTitle: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 15,
    color: colors['on-surface'],
  },
  flexibleSubtitle: {
    fontFamily: typography.fontFamily.body,
    fontSize: 12,
    color: colors.outline,
    marginTop: 2,
  },
  joiningOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  joiningText: {
    marginTop: 16,
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 16,
    color: colors.primary,
  },
});