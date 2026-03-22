import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radii } from '../lib/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface TravelTimeChipProps {
  time: string;
  mode?: 'driving' | 'transit' | 'walking' | 'cycling';
  compact?: boolean;
}

export const TravelTimeChip: React.FC<TravelTimeChipProps> = ({ time, mode, compact }) => {
  return (
    <View style={[styles.container, compact && styles.compact]}>
      {mode && (
        <MaterialCommunityIcons 
          name={mode === 'driving' ? 'car' : mode === 'transit' ? 'train' : mode === 'walking' ? 'walk' : 'bike'} 
          size={14} 
          color={colors.primary} 
          style={styles.icon}
        />
      )}
      <Text style={[styles.text, compact && styles.compactText]}>{time}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '1A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  compact: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontFamily: typography.fontFamily.label,
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  compactText: {
    fontSize: 10,
  },
});
