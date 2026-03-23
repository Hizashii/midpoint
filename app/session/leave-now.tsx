import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Platform } from 'react-native';
import { router, Stack } from 'expo-router';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { colors, typography, radii, spacing, shadows } from '../../src/lib/theme';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import MapView, { Marker } from '../../src/components/MapView';
import { LinearGradient } from 'expo-linear-gradient';
import { locationService } from '../../src/services/locationService';
import { useMeetupStore } from '../../src/store/meetupStore';

const { width } = Dimensions.get('window');

const VENUE_COORD = { latitude: 55.4765, longitude: 8.4515 };

export default function LeaveNowScreen() {
  const activeSession = useMeetupStore(state => state.activeSession);
  const [participants, setParticipants] = useState(activeSession?.participants || []);
  const [userLoc, setUserLoc] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(true);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    locationService.getCurrentLocation().then(loc => {
      if (loc) {
        setUserLoc({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude
        });
      }
    });

    if (isSimulating) {
      timerRef.current = setInterval(() => {
        setParticipants(prev => prev.map(p => {
          if (!p.location) return p;
          
          // Move 2% closer to venue every 3 seconds
          return {
            ...p,
            location: {
              lat: p.location.lat + (VENUE_COORD.latitude - p.location.lat) * 0.02,
              lng: p.location.lng + (VENUE_COORD.longitude - p.location.lng) * 0.02,
            }
          };
        }));
      }, 3000);
    }

    return () => clearInterval(timerRef.current);
  }, [isSimulating]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        headerShown: true,
        headerTransparent: true,
        headerTitle: '',
        headerLeft: () => (
          <TouchableOpacity style={styles.headerLogo} onPress={() => router.replace('/(tabs)')}>
            <MaterialIcons name="explore" size={26} color={colors.primary} />
            <Text style={styles.headerTitleText}>Midpoint</Text>
          </TouchableOpacity>
        ),
        headerRight: () => (
          <TouchableOpacity style={styles.avatarContainer}>
             <MaterialIcons name="account-circle" size={32} color={colors['primary-container']} />
          </TouchableOpacity>
        )
      }} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Live Countdown Bento Card */}
        <View style={styles.countdownCard}>
          <LinearGradient
            colors={[colors.primary, colors['primary-container']]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.countdownGradient}
          >
            <View style={styles.countdownHeader}>
              <MaterialIcons name="schedule" size={16} color="white" style={{ opacity: 0.9 }} />
              <Text style={styles.countdownLabel}>T-MINUS</Text>
            </View>
            <Text style={styles.countdownTitle}>Leave in 8 minutes</Text>
            <TouchableOpacity style={styles.routeButton} activeOpacity={0.8}>
              <MaterialIcons name="directions" size={20} color={colors.primary} />
              <Text style={styles.routeButtonText}>Go to Route</Text>
            </TouchableOpacity>
            
            {/* Abstract Deco */}
            <View style={styles.decoCircle} />
          </LinearGradient>
        </View>

        {/* Confirmed Venue Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Confirmed Venue</Text>
          <View style={styles.venueCard}>
            <Image 
              source={{ uri: 'https://i.pravatar.cc/200?u=mikkeller' }} 
              style={styles.venueImage} 
            />
            <View style={styles.venueInfo}>
              <Text style={styles.venueName}>{activeSession?.title || 'Mikkeller Bar'}</Text>
              <Text style={styles.venueAddress}>Viktoriagade 8, 1655 København</Text>
              <View style={styles.badgeRow}>
                <View style={[styles.badge, { backgroundColor: colors['tertiary-container'] }]}>
                  <Text style={[styles.badgeText, { color: colors['on-tertiary-container'] }]}>TOP PICK</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: colors['surface-container-low'] }]}>
                  <Text style={[styles.badgeText, { color: colors['on-surface-variant'] }]}>4.8 ★</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Live Map Section */}
        <View style={styles.section}>
          <View style={styles.mapHeader}>
            <Text style={styles.sectionTitle}>Live Tracking</Text>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>ACTIVE SESSION</Text>
            </View>
          </View>
          <View style={styles.mapContainer}>
            <MapView 
              style={styles.map} 
              initialRegion={{
                latitude: VENUE_COORD.latitude,
                longitude: VENUE_COORD.longitude,
                latitudeDelta: 0.04,
                longitudeDelta: 0.04,
              }}
            >
               {/* Venue Marker */}
               <Marker coordinate={VENUE_COORD}>
                  <View style={styles.venueMarker}>
                    <MaterialIcons name="location-on" size={20} color="white" />
                  </View>
               </Marker>

               {/* User Marker */}
               {userLoc && (
                 <Marker coordinate={userLoc}>
                    <View style={[styles.participantMarkerContainer, { zIndex: 100 }]}>
                      <View style={[styles.participantMarkerAvatar, { borderColor: colors.primary }]}>
                        <MaterialIcons name="person" size={20} color={colors.primary} />
                      </View>
                      <View style={[styles.markerNameBadge, { backgroundColor: colors.primary }]}>
                        <Text style={[styles.markerNameText, { color: 'white' }]}>You</Text>
                      </View>
                    </View>
                 </Marker>
               )}

               {/* Participant Markers */}
               {participants.map(p => (
                 p.location && (
                   <Marker key={p.id} coordinate={{ latitude: p.location.lat, longitude: p.location.lng }}>
                      <View style={styles.participantMarkerContainer}>
                        <View style={styles.participantMarkerAvatar}>
                          <Image source={{ uri: p.profile?.avatarUrl || `https://i.pravatar.cc/150?u=${p.id}` }} style={styles.markerImage} />
                        </View>
                        <View style={styles.markerNameBadge}>
                          <Text style={styles.markerNameText}>{(p.profile?.name || p.name || 'User').split(' ')[0]}</Text>
                        </View>
                      </View>
                   </Marker>
                 )
               ))}
            </MapView>
          </View>
        </View>

        {/* Squad Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Squad Status</Text>
          <View style={styles.statusList}>
            {participants.map(p => (
              <View key={p.id} style={styles.statusRow}>
                <View style={styles.statusInfo}>
                  <View style={styles.avatarContainerSmall}>
                    <Image source={{ uri: p.profile?.avatarUrl || `https://i.pravatar.cc/150?u=${p.id}` }} style={styles.statusAvatar} />
                  </View>
                  <View>
                    <Text style={styles.statusName}>{p.profile?.name || p.name || 'User'}</Text>
                    <Text style={styles.statusDetails}>{p.status === 'ready' ? 'On the way' : 'Getting ready'}</Text>
                  </View>
                </View>
                <View style={[
                  styles.statusPill, 
                  p.status === 'ready' ? { backgroundColor: colors['tertiary-fixed'] } : { backgroundColor: colors['surface-container-high'] }
                ]}>
                  <Text style={[
                    styles.statusPillText,
                    p.status === 'ready' ? { color: colors['on-tertiary-fixed'] } : { color: colors.outline }
                  ]}>{p.status === 'ready' ? 'MOVING' : 'READY'}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.mobileNav}>
         <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/(tabs)')}>
            <MaterialIcons name="home" size={26} color={colors.outline} />
            <Text style={styles.navLabel}>HOME</Text>
         </TouchableOpacity>
         <TouchableOpacity style={styles.navItem} onPress={() => router.push('/session/recap')}>
            <MaterialIcons name="people" size={26} color={colors.primary} />
            <Text style={[styles.navLabel, { color: colors.primary }]}>SESSIONS</Text>
            <View style={styles.activeDot} />
         </TouchableOpacity>
         <TouchableOpacity style={styles.navItem}>
            <MaterialIcons name="bookmark" size={26} color={colors.outline} />
            <Text style={styles.navLabel}>SAVED</Text>
         </TouchableOpacity>
         <TouchableOpacity style={styles.navItem}>
            <MaterialIcons name="person" size={26} color={colors.outline} />
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
    borderColor: 'white',
    borderRadius: 20,
    ...shadows.sm,
  },
  avatarContainerSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
    overflow: 'hidden',
  },
  scrollContent: {
    paddingTop: 100,
    paddingBottom: 120,
    paddingHorizontal: 24,
  },
  countdownCard: {
    borderRadius: radii.xl,
    overflow: 'hidden',
    ...shadows.lg,
    marginBottom: 32,
  },
  countdownGradient: {
    padding: 24,
    position: 'relative',
  },
  countdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  countdownLabel: {
    fontFamily: typography.fontFamily.label,
    fontSize: 10,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 1.5,
    opacity: 0.9,
  },
  countdownTitle: {
    fontFamily: typography.fontFamily.headlineExtraBold,
    fontSize: 32,
    color: 'white',
    marginBottom: 16,
  },
  routeButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radii.full,
  },
  routeButtonText: {
    fontFamily: typography.fontFamily.label,
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  decoCircle: {
    position: 'absolute',
    bottom: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: -1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 20,
    color: colors['on-surface'],
    marginBottom: 16,
  },
  venueCard: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: colors['surface-container-lowest'],
    padding: 20,
    borderRadius: radii.xl,
    ...shadows.md,
  },
  venueImage: {
    width: 80,
    height: 80,
    borderRadius: radii.lg,
  },
  venueInfo: {
    flex: 1,
    gap: 4,
  },
  venueName: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 18,
    color: colors['on-surface'],
  },
  venueAddress: {
    fontFamily: typography.fontFamily.body,
    fontSize: 14,
    color: colors['on-surface-variant'],
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  badgeText: {
    fontFamily: typography.fontFamily.label,
    fontSize: 10,
    fontWeight: '800',
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors['error-container'],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.error,
  },
  liveText: {
    fontFamily: typography.fontFamily.label,
    fontSize: 10,
    fontWeight: '900',
    color: colors['on-error-container'],
    letterSpacing: 1,
  },
  mapContainer: {
    height: 280,
    borderRadius: radii.xl,
    overflow: 'hidden',
    ...shadows.md,
    backgroundColor: colors['surface-container-low'],
  },
  map: {
    width: '100%',
    height: '100%',
    opacity: 0.7,
  },
  venueMarker: {
    width: 44,
    height: 44,
    backgroundColor: colors.primary,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'white',
    ...shadows.md,
  },
  participantMarkerContainer: {
    alignItems: 'center',
  },
  participantMarkerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'white',
    overflow: 'hidden',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  markerImage: {
    width: '100%',
    height: '100%',
  },
  markerNameBadge: {
    marginTop: 4,
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.full,
    ...shadows.sm,
  },
  markerNameText: {
    fontFamily: typography.fontFamily.label,
    fontSize: 9,
    fontWeight: '800',
    color: colors['on-surface'],
  },
  statusList: {
    gap: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors['surface-container-low'],
    padding: 16,
    borderRadius: radii.xl,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusAvatar: {
    width: '100%',
    height: '100%',
  },
  statusName: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 14,
    color: colors['on-surface'],
  },
  statusDetails: {
    fontFamily: typography.fontFamily.body,
    fontSize: 12,
    color: colors['on-surface-variant'],
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
  },
  statusPillText: {
    fontFamily: typography.fontFamily.label,
    fontSize: 10,
    fontWeight: '800',
  },
  mobileNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 84,
    backgroundColor: 'rgba(253, 248, 248, 0.9)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    borderTopLeftRadius: radii['3xl'],
    borderTopRightRadius: radii['3xl'],
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
