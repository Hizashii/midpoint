import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps, View } from 'react-native';
import { colors, typography, radii, shadows } from '../lib/theme';

interface SecondaryButtonProps extends TouchableOpacityProps {
  title: string;
  icon?: React.ReactNode;
}

export const SecondaryButton = ({ title, icon, style, ...props }: SecondaryButtonProps) => {
  return (
    <TouchableOpacity activeOpacity={0.7} style={[styles.container, style]} {...props}>
      <View style={styles.content}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={styles.text}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    height: 58,
    borderRadius: radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: colors['surface-container-high'],
    ...shadows.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 10,
  },
  text: {
    color: colors['on-surface'],
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 16,
  },
});
