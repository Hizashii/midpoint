import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, FlatList, ViewToken, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, interpolate, Extrapolation, useAnimatedScrollHandler } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, typography, spacing, radii, shadows } from '../src/lib/theme';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { useAuthStore } from '../src/store/authStore';

interface OnboardingData {
  id: string;
  title: string;
  description: string;
  renderIllustration: () => React.ReactNode;
}

const ONBOARDING_STEPS: OnboardingData[] = [
  {
    id: '1',
    title: 'Find the fairest place to meet.',
    description: "Say goodbye to travel-time inequality. Midpoint calculates the perfect spot for everyone in your group.",
    renderIllustration: () => (
      <View style={styles.illustrationContainer}>
        <Image 
          source={{ uri: 'https://picsum.photos/seed/map1/800/800' }} 
          style={[styles.mapBase, { opacity: 0.2 }]} 
        />
        <LinearGradient
          colors={['transparent', colors.background]}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0.7 }}
          end={{ x: 0, y: 1 }}
        />
        <View style={styles.routeLineWrapper}>
          <View style={[styles.staticLine, { 
            width: 120, 
            height: 2, 
            top: '30%', 
            left: '20%', 
            transform: [{ rotate: '25deg' }],
            borderStyle: 'dashed',
            borderWidth: 1,
            borderColor: colors.primary,
            opacity: 0.4
          }]} />
          <View style={[styles.staticLine, { 
            width: 120, 
            height: 2, 
            top: '30%', 
            right: '20%', 
            transform: [{ rotate: '-25deg' }],
            borderStyle: 'dashed',
            borderWidth: 1,
            borderColor: colors.primary,
            opacity: 0.4
          }]} />
          <View style={[styles.staticLine, { 
            width: 2, 
            height: 100, 
            bottom: '20%', 
            left: '50%',
            borderStyle: 'dashed',
            borderWidth: 1,
            borderColor: colors.primary,
            opacity: 0.4
          }]} />
        </View>
        <View style={styles.midpointPinContainer}>
          <View style={styles.pulseContainer} />
          <View style={styles.pinCircle}>
            <MaterialIcons name="location-on" size={24} color="white" />
          </View>
          <View style={styles.pinLabel}>
            <Text style={styles.pinLabelText}>Midpoint Found</Text>
          </View>
        </View>
        <View style={[styles.avatarWrapper, { top: '25%', left: '15%' }]}>
          <Image source={{ uri: 'https://i.pravatar.cc/150?u=sarah' }} style={styles.avatarImage} />
          <View style={styles.avatarLabel}><Text style={styles.avatarLabelText}>Sarah</Text></View>
        </View>
        <View style={[styles.avatarWrapper, { top: '25%', right: '15%' }]}>
          <Image source={{ uri: 'https://i.pravatar.cc/150?u=tom' }} style={styles.avatarImage} />
          <View style={styles.avatarLabel}><Text style={styles.avatarLabelText}>Tom</Text></View>
        </View>
        <View style={[styles.avatarWrapper, { bottom: '15%', left: '42%' }]}>
          <Image source={{ uri: 'https://i.pravatar.cc/150?u=alex' }} style={styles.avatarImage} />
          <View style={styles.avatarLabel}><Text style={styles.avatarLabelText}>Alex</Text></View>
        </View>
      </View>
    )
  },
  {
    id: '2',
    title: 'Coordinate in real-time.',
    description: "Track everyone's progress, share ETAs, and see when your friends are nearby. No more 'Where are you?' texts.",
    renderIllustration: () => (
      <View style={styles.illustrationContainer}>
        <View style={styles.statusCardsContainer}>
          <View style={[styles.statusCard, { transform: [{ rotate: '-5deg' }, { translateX: -20 }] }]}>
            <Image source={{ uri: 'https://i.pravatar.cc/150?u=sarah' }} style={styles.statusAvatar} />
            <View>
              <Text style={styles.statusName}>Sarah</Text>
              <Text style={styles.statusEta}>5 min away</Text>
            </View>
            <View style={[styles.statusIndicator, { backgroundColor: colors.primary }]} />
          </View>
          <View style={[styles.statusCard, { transform: [{ rotate: '3deg' }, { translateY: -40 }, { translateX: 20 }], zIndex: 10 }]}>
            <Image source={{ uri: 'https://i.pravatar.cc/150?u=tom' }} style={styles.statusAvatar} />
            <View>
              <Text style={styles.statusName}>Tom</Text>
              <Text style={styles.statusEta}>Arrived</Text>
            </View>
            <View style={[styles.statusIndicator, { backgroundColor: colors.tertiary }]} />
          </View>
          <View style={[styles.statusCard, { transform: [{ rotate: '-2deg' }, { translateY: 40 }] }]}>
            <Image source={{ uri: 'https://i.pravatar.cc/150?u=alex' }} style={styles.statusAvatar} />
            <View>
              <Text style={styles.statusName}>Alex</Text>
              <Text style={styles.statusEta}>12 min away</Text>
            </View>
            <View style={[styles.statusIndicator, { backgroundColor: colors.error }]} />
          </View>
        </View>
      </View>
    )
  },
  {
    id: '3',
    title: 'Discover the best spots.',
    description: "Get tailored recommendations based on your group's vibe. From quiet coffee shops to lively bars.",
    renderIllustration: () => (
      <View style={styles.illustrationContainer}>
        <View style={styles.venuePreviewContainer}>
          <View style={[styles.venuePreviewCard, { transform: [{ scale: 0.9 }, { translateX: -40 }] }]}>
            <Image source={{ uri: 'https://picsum.photos/seed/venue1/400/300' }} style={styles.venuePreviewImage} />
            <View style={styles.venuePreviewInfo}>
              <Text style={styles.venuePreviewName}>Democratic Coffee</Text>
              <View style={styles.fairnessChip}><Text style={styles.fairnessChipText}>88% Fair</Text></View>
            </View>
          </View>
          <View style={[styles.venuePreviewCard, { zIndex: 10, ...shadows.lg }]}>
            <View style={styles.bestMatchBadge}>
              <MaterialIcons name="auto-awesome" size={12} color="white" />
              <Text style={styles.bestMatchText}>Best Match</Text>
            </View>
            <Image source={{ uri: 'https://picsum.photos/seed/venue2/400/300' }} style={styles.venuePreviewImage} />
            <View style={styles.venuePreviewInfo}>
              <Text style={styles.venuePreviewName}>The Coffee Collective</Text>
              <View style={styles.fairnessChip}><Text style={styles.fairnessChipText}>96% Fair</Text></View>
            </View>
          </View>
          <View style={[styles.venuePreviewCard, { transform: [{ scale: 0.9 }, { translateX: 40 }] }]}>
            <Image source={{ uri: 'https://picsum.photos/seed/venue3/400/300' }} style={styles.venuePreviewImage} />
            <View style={styles.venuePreviewInfo}>
              <Text style={styles.venuePreviewName}>Mirabelle Bakery</Text>
              <View style={styles.fairnessChip}><Text style={styles.fairnessChipText}>82% Fair</Text></View>
            </View>
          </View>
        </View>
      </View>
    )
  }
];

export default function OnboardingScreen() {
  const { width, height } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);
  const setOnboarded = useAuthStore(state => state.setOnboarded);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const handleNext = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < ONBOARDING_STEPS.length) {
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    } else {
      setOnboarded(true);
      router.replace('/(tabs)');
    }
  };

  const handleSkip = () => {
    setOnboarded(true);
    router.replace('/(tabs)');
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index ?? 0;
      setCurrentIndex(index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50
  }).current;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <SafeAreaView style={styles.header} edges={['top']}>
        <Text style={styles.logoText}>Midpoint</Text>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </SafeAreaView>

      <Animated.FlatList
        ref={flatListRef}
        data={ONBOARDING_STEPS}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        renderItem={({ item }) => (
          <View style={[styles.stepContainer, { width, height }]}>
            <View style={styles.illustrationWrapper}>
              {item.renderIllustration()}
            </View>
            <View style={styles.contentWrapper}>
              <View style={styles.textContent}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
              </View>
            </View>
          </View>
        )}
      />

      <SafeAreaView style={styles.footer} edges={['bottom']}>
        <View style={styles.pagination}>
          {ONBOARDING_STEPS.map((_, index) => {
            const animatedDotStyle = useAnimatedStyle(() => {
              const dotWidth = interpolate(
                scrollX.value,
                [(index - 1) * width, index * width, (index + 1) * width],
                [6, 32, 6],
                Extrapolation.CLAMP
              );
              const opacity = interpolate(
                scrollX.value,
                [(index - 1) * width, index * width, (index + 1) * width],
                [0.3, 1, 0.3],
                Extrapolation.CLAMP
              );
              return {
                width: dotWidth,
                opacity,
                backgroundColor: currentIndex === index ? colors.primary : colors['outline-variant']
              };
            });
            return (
              <TouchableOpacity 
                key={index} 
                onPress={() => flatListRef.current?.scrollToIndex({ index, animated: true })}
              >
                <Animated.View style={[styles.dot, animatedDotStyle]} />
              </TouchableOpacity>
            );
          })}
        </View>

        <PrimaryButton 
          title={currentIndex === ONBOARDING_STEPS.length - 1 ? "Get Started" : "Next"} 
          onPress={handleNext}
          style={styles.button}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
    height: 64,
  },
  logoText: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 20,
    fontWeight: '800',
    color: colors['on-surface'],
    letterSpacing: -1,
  },
  skipText: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: 14,
    color: colors.outline,
  },
  stepContainer: {
    // dimensions set dynamically
  },
  illustrationWrapper: {
    height: '50%',
    width: '100%',
    backgroundColor: colors['surface-container-low'],
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  illustrationContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapBase: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  routeLineWrapper: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  staticLine: {
    position: 'absolute',
  },
  midpointPinContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  pinCircle: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: 'white',
    ...shadows.lg,
  },
  pinLabel: {
    position: 'absolute',
    bottom: -40,
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    ...shadows.sm,
  },
  pinLabelText: {
    fontFamily: typography.fontFamily.label,
    fontWeight: '700',
    fontSize: 10,
    color: colors.primary,
  },
  pulseContainer: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    opacity: 0.2,
  },
  avatarWrapper: {
    position: 'absolute',
    alignItems: 'center',
    gap: 8,
    zIndex: 30,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'white',
    ...shadows.md,
  },
  avatarLabel: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  avatarLabelText: {
    fontFamily: typography.fontFamily.label,
    fontWeight: '700',
    fontSize: 10,
  },
  contentWrapper: {
    height: '50%',
    paddingHorizontal: spacing[8],
    paddingTop: spacing[8],
    justifyContent: 'space-between',
    paddingBottom: 140, 
  },
  textContent: {
    alignItems: 'center',
    gap: spacing[6],
  },
  title: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 32,
    fontWeight: '800',
    color: colors['on-surface'],
    textAlign: 'center',
    lineHeight: 38,
  },
  description: {
    fontFamily: typography.fontFamily.body,
    fontSize: 16,
    color: colors.secondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing[2],
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingHorizontal: spacing[8],
    paddingBottom: spacing[10],
    gap: spacing[8],
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  button: {
    width: '100%',
  },
  statusCardsContainer: {
    width: '80%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusCard: {
    position: 'absolute',
    width: 200,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: radii['2xl'],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...shadows.md,
  },
  statusAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  statusName: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 14,
    color: colors['on-surface'],
  },
  statusEta: {
    fontFamily: typography.fontFamily.body,
    fontSize: 12,
    color: colors.outline,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  venuePreviewContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  venuePreviewCard: {
    position: 'absolute',
    width: 160,
    backgroundColor: 'white',
    borderRadius: radii['2xl'],
    overflow: 'hidden',
    ...shadows.md,
  },
  venuePreviewImage: {
    width: '100%',
    height: 100,
  },
  venuePreviewInfo: {
    padding: 10,
    gap: 4,
  },
  venuePreviewName: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 12,
    color: colors['on-surface'],
  },
  fairnessChip: {
    backgroundColor: colors.tertiary + '1A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  fairnessChipText: {
    fontFamily: typography.fontFamily.label,
    fontSize: 10,
    fontWeight: '700',
    color: colors.tertiary,
  },
  bestMatchBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    zIndex: 20,
    gap: 4,
  },
  bestMatchText: {
    fontFamily: typography.fontFamily.label,
    fontSize: 8,
    fontWeight: '800',
    color: 'white',
  }
});
