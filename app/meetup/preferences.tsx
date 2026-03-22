import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../src/lib/theme';

export default function MeetupPreferencesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Meetup Preferences</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 20,
    color: colors['on-surface'],
  },
});
