import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, radii, spacing } from '../lib/theme';

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  style?: any;
}

export const StepProgress = ({ currentStep, totalSteps, style }: StepProgressProps) => {
  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View 
          key={index} 
          style={[
            styles.step, 
            { 
              backgroundColor: index < currentStep 
                ? colors.primary 
                : colors['surface-container-high'] 
            }
          ]} 
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 6,
    flex: 1,
  },
  step: {
    height: 6,
    borderRadius: radii.full,
    flex: 1,
  },
});
