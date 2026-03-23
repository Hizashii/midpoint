import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ScrollViewProps,
  Dimensions,
  Platform,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, shadows, spacing } from '../../lib/theme';

const { height: windowHeight } = Dimensions.get('window');

type MapBottomSheetProps = {
  children: React.ReactNode;
  /** Extra space above home indicator + floating tab bar */
  bottomInset?: number;
  /** Fraction of screen height (0–1) */
  maxHeightRatio?: number;
  scrollProps?: ScrollViewProps;
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Show drag affordance (design: 36×5 @ 30% outline-variant) */
  showHandle?: boolean;
};

/**
 * Glass + tonal sheet for content over a map — matches DESIGN.md bottom sheet guidance.
 */
export function MapBottomSheet({
  children,
  bottomInset = 0,
  maxHeightRatio = 0.52,
  scrollProps,
  contentContainerStyle,
  showHandle = true,
}: MapBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, spacing[4]) + bottomInset;
  const maxH = windowHeight * maxHeightRatio;

  return (
    <View style={[styles.sheet, { maxHeight: maxH, paddingBottom: bottomPad }]}>
      <BlurView intensity={Platform.OS === 'ios' ? 85 : 70} tint="light" style={StyleSheet.absoluteFillObject} />
      <View style={styles.tint} />

      {showHandle && (
        <View style={styles.handleWrap}>
          <View style={styles.handle} />
        </View>
      )}

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollInner, contentContainerStyle]}
        {...scrollProps}
      >
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: radii['3xl'],
    borderTopRightRadius: radii['3xl'],
    overflow: 'hidden',
    ...shadows.ambient,
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(253, 248, 248, 0.82)',
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: spacing[3],
    paddingBottom: spacing[2],
    zIndex: 2,
  },
  handle: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors['outline-variant'],
    opacity: 0.35,
  },
  scrollInner: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[2],
    paddingBottom: spacing[4],
  },
});
