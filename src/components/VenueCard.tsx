import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, typography, radii, spacing, shadows } from '../lib/theme';
import { VenueCandidate } from '../types';

interface VenueCardProps {
  venue: VenueCandidate;
  onPress?: () => void;
}

export const VenueCard = ({ venue, onPress }: VenueCardProps) => {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.card}>
      <View style={styles.imageContainer}>
        {venue.photoUrl ? (
          <Image 
            source={{ uri: venue.photoUrl }} 
            style={styles.image} 
            loadingIndicatorSource={{ uri: 'https://via.placeholder.com/64?text=...' }}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <MaterialIcons name="image" size={24} color={colors.outline} />
          </View>
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{venue.name}</Text>
        <Text style={styles.address} numberOfLines={1}>{venue.address}</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statBadge}>
            <MaterialIcons name="schedule" size={12} color={colors.primary} />
            <Text style={styles.statText}>{Math.round(venue.averageMinutes)}m avg</Text>
          </View>
          <View style={[styles.statBadge, styles.fairnessBadge]}>
            <MaterialIcons name="balance" size={12} color={colors.tertiary} />
            <Text style={[styles.statText, { color: colors.tertiary }]}>
              {venue.fairnessScore}% Fair
            </Text>
          </View>
        </View>
      </View>
      <MaterialIcons name="chevron-right" size={24} color={colors['outline-variant']} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: radii.xl,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: radii.md,
    backgroundColor: colors['surface-container-low'],
    overflow: 'hidden',
    marginRight: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 16,
    color: colors['on-surface'],
  },
  address: {
    fontFamily: typography.fontFamily.body,
    fontSize: 12,
    color: colors.outline,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '08',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  fairnessBadge: {
    backgroundColor: colors.tertiary + '08',
  },
  statText: {
    fontFamily: typography.fontFamily.label,
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  }
});
