import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, radii, shadows } from '../lib/theme';
import { Participant } from '../types';

interface ParticipantStatusPillProps {
  participant: Participant;
}

export const ParticipantStatusPill = ({ participant }: ParticipantStatusPillProps) => {
  const getStatusConfig = () => {
    switch (participant.status) {
      case 'arrived':
        return {
          bg: colors['tertiary-fixed'],
          text: colors['on-tertiary-fixed'],
          label: 'ARRIVED',
        };
      case 'late':
        return {
          bg: colors['error-container'],
          text: colors['on-error-container'],
          label: 'LATE',
        };
      case 'on_the_way':
        return {
          bg: colors.primary,
          text: 'white',
          label: `${participant.etaMinutes ?? '—'} MIN`,
        };
      case 'ready':
      default:
        return {
          bg: colors['surface-container-highest'],
          text: colors['on-surface'],
          label: 'READY',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <View style={[styles.container, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: typography.fontFamily.label,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
