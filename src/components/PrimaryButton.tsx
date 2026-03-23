import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps, View, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, radii, shadows } from '../lib/theme';

interface PrimaryButtonProps extends TouchableOpacityProps {
  title: string;
  icon?: React.ReactNode;
  loading?: boolean;
}

export const PrimaryButton = ({ title, icon, loading, style, ...props }: PrimaryButtonProps) => {
  return (
    <TouchableOpacity activeOpacity={0.85} style={[styles.container, style]} {...props}>
      <LinearGradient
        colors={[colors.primary, colors['primary-container']]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {loading && <ActivityIndicator color="white" style={styles.loadingIndicator} />}
          {!loading && icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={styles.text}>{title}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.xl,
    ...shadows.md,
  },
  gradient: {
    height: 58,
    borderRadius: radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 10,
  },
  loadingIndicator: {
    marginRight: 10,
  },
  text: {
    color: 'white',
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 16,
    letterSpacing: 0.2,
  },
});
