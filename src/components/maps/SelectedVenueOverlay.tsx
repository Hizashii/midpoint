import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors } from '../../lib/theme';

type Props = {
  children: React.ReactNode;
  /** Larger ring + soft fill for “selected” venue or midpoint focus */
  emphasized?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Branded halo around a venue / focus pin — primary tint, low noise (design: meetup zones).
 */
export function SelectedVenueOverlay({ children, emphasized, style }: Props) {
  return (
    <View style={[styles.wrap, style]} pointerEvents="box-none">
      <View style={[styles.ringOuter, emphasized && styles.ringOuterEmphasized]} pointerEvents="none" />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringOuter: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: colors.primary + '55',
    backgroundColor: colors.primary + '12',
  },
  ringOuterEmphasized: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderColor: colors.primary + '99',
    backgroundColor: colors.primary + '18',
  },
});
