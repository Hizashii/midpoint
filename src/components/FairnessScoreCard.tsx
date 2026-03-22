import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radii } from '../lib/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface FairnessScoreCardProps {
  score: number; // 0-100
  label?: string;
}

export const FairnessScoreCard: React.FC<FairnessScoreCardProps> = ({ score, label = 'Fairness Score' }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>{score}%</Text>
        </View>
      </View>
      <View style={styles.track}>
        <View style={[styles.progress, { width: `${score}%` }]} />
      </View>
      <View style={styles.footer}>
        <MaterialCommunityIcons name="check-decagram" size={14} color={colors.tertiary} />
        <Text style={styles.footerText}>High equality in travel times</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.tertiary + '0D',
    padding: spacing['4'],
    borderRadius: radii.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: 14,
    color: colors.tertiary,
  },
  scoreBadge: {
    backgroundColor: colors.tertiary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  scoreText: {
    fontFamily: typography.fontFamily.label,
    fontSize: 12,
    fontWeight: '800',
    color: colors['on-tertiary'],
  },
  track: {
    height: 6,
    backgroundColor: colors.tertiary + '33',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progress: {
    height: '100%',
    backgroundColor: colors.tertiary,
    borderRadius: 3,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontFamily: typography.fontFamily.body,
    fontSize: 11,
    color: colors.tertiary,
    marginLeft: 4,
  },
});
