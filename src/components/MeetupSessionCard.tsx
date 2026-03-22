import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../lib/theme';
import { AvatarStack } from './AvatarStack';

interface MeetupSessionCardProps {
  title: string;
  time: string;
  image: string;
  avatars: string[];
  participantCount?: number;
  isToday?: boolean;
  onPress?: () => void;
}

export const MeetupSessionCard: React.FC<MeetupSessionCardProps> = ({
  title,
  time,
  image,
  avatars,
  participantCount,
  isToday,
  onPress,
}) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: image }} style={styles.image} />
        {isToday && (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>TODAY</Text>
          </View>
        )}
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <MaterialCommunityIcons 
            name="chevron-right" 
            size={20} 
            color={colors.outline} 
          />
        </View>
        <View style={styles.details}>
          <View style={styles.timeContainer}>
            <MaterialCommunityIcons name="clock-outline" size={14} color={isToday ? colors.primary : colors.outline} />
            <Text style={[
              styles.timeText, 
              { color: isToday ? colors.primary : colors.secondary }
            ]}>{time}</Text>
          </View>
          <View style={styles.divider} />
          {participantCount ? (
            <Text style={styles.participantCount}>{participantCount} Friends</Text>
          ) : (
            <AvatarStack urls={avatars} size={22} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: radii['2xl'],
    ...shadows.sm,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: radii.xl,
    backgroundColor: colors['surface-container-low'],
    overflow: 'hidden',
    marginRight: 16,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  liveBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  liveDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FF3B30',
  },
  liveText: {
    fontFamily: typography.fontFamily.label,
    fontSize: 8,
    fontWeight: '900',
    color: 'white',
  },
  content: {
    flex: 1,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 17,
    color: colors['on-surface'],
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: 13,
  },
  divider: {
    width: 1,
    height: 12,
    backgroundColor: colors['outline-variant'],
    opacity: 0.5,
  },
  participantCount: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: 13,
    color: colors['on-surface-variant'],
  },
});
