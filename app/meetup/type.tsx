import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { router, Stack } from 'expo-router';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { colors, typography, radii, spacing, shadows } from '../../src/lib/theme';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { MapBottomSheet } from '../../src/components/MapBottomSheet';
import { StepProgress } from '../../src/components/StepProgress';
import MapView from '../../src/components/MapView';
import { locationService } from '../../src/services/locationService';

const { width } = Dimensions.get('window');

const MEETUP_TYPES = [
  { id: 'coffee', icon: 'coffee', label: 'Coffee' },
  { id: 'dinner', icon: 'food', label: 'Dinner' },
  { id: 'drinks', icon: 'glass-cocktail', label: 'Drinks' },
  { id: 'coworking', icon: 'laptop', label: 'Work' },
  { id: 'park', icon: 'tree', label: 'Park' },
  { id: 'custom', icon: 'plus-circle', label: 'Custom' },
];

export default function MeetupTypeScreen() {
  const [selectedType, setSelectedType] = useState('coffee');
  const [region, setRegion] = useState({
    latitude: 55.4765, // Esbjerg default
    longitude: 8.4515,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  useEffect(() => {
    locationService.getCurrentLocation().then(loc => {
      if (loc) {
        setRegion(prev => ({
          ...prev,
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        }));
      }
    });
  }, []);

  const onTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
    router.push({
      pathname: '/meetup/setup',
      params: { 
        type: typeId,
        lat: region.latitude,
        lng: region.longitude
      }
    });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        headerShown: true,
        headerTransparent: true,
        headerTitle: '',
        headerLeft: () => (
          <View style={styles.headerLogo}>
            <MaterialIcons name="explore" size={26} color={colors.primary} />
            <Text style={styles.headerTitleText}>Midpoint</Text>
          </View>
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

      <MapBottomSheet>
        <View style={styles.bottomSheetHeader}>
          <View style={styles.progressRow}>
            <StepProgress currentStep={1} totalSteps={3} />
            <Text style={styles.stepLabel}>STEP 1 OF 3</Text>
          </View>
          
          <View style={styles.titleGroup}>
            <Text style={styles.headline}>Choose Meetup Type</Text>
            <Text style={styles.subheadline}>Select the vibe for your gathering.</Text>
          </View>
        </View>

        <View style={styles.grid}>
          {MEETUP_TYPES.map((type) => {
            const isSelected = selectedType === type.id;
            const isCustom = type.id === 'custom';
            
            return (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeCard, 
                  isSelected && styles.typeCardSelected,
                  isCustom && !isSelected && styles.customCard
                ]}
                onPress={() => onTypeSelect(type.id)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.iconBg, 
                  isSelected && styles.iconBgSelected,
                  isCustom && !isSelected && styles.customIconBg
                ]}>
                  <MaterialCommunityIcons 
                    name={type.icon as any} 
                    size={28} 
                    color={isSelected ? colors['on-primary'] : colors.primary} 
                  />
                </View>
                <Text style={styles.typeLabel}>{type.label}</Text>
              </TouchableOpacity>
            );
          })}
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
  map: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.6,
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
    borderColor: colors['primary-container'],
    borderRadius: 20,
  },
  bottomSheetHeader: {
    gap: 16,
    marginBottom: 24,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepLabel: {
    fontFamily: typography.fontFamily.label,
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1.5,
  },
  titleGroup: {
    gap: 4,
  },
  headline: {
    fontFamily: typography.fontFamily.headlineExtraBold,
    fontSize: 28,
    color: colors['on-surface'],
    letterSpacing: -0.5,
  },
  subheadline: {
    fontFamily: typography.fontFamily.body,
    fontSize: 14,
    color: colors['on-surface-variant'],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeCard: {
    width: (width - 48 - 12) / 2,
    backgroundColor: colors['surface-container-lowest'],
    borderRadius: radii.xl,
    padding: 20,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 12,
    ...shadows.sm,
  },
  typeCardSelected: {
    borderWidth: 2,
    borderColor: colors.primary + '20',
  },
  customCard: {
    borderWidth: 2,
    borderColor: colors.primary + '40',
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    backgroundColor: colors['surface-container-low'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBgSelected: {
    backgroundColor: colors.primary,
  },
  customIconBg: {
    backgroundColor: colors['primary-fixed'],
  },
  typeLabel: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 18,
    color: colors['on-surface'],
  },
  footer: {
    marginTop: 24,
    paddingBottom: 8,
  },
});
