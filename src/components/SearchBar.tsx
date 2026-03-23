import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TextInputProps, StyleProp, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, radii, spacing, typography, shadows } from '../lib/theme';

interface SearchBarProps extends Omit<TextInputProps, 'style'> {
  onFilterPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
}

export const SearchBar = ({ onFilterPress, containerStyle, ...props }: SearchBarProps) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.outerContainer}>
      <View
        style={[
          styles.container,
          isFocused && styles.containerFocused,
          containerStyle,
        ]}
      >
        <MaterialIcons name="search" size={24} color={colors.outline} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.outline}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
        {onFilterPress && (
          <MaterialIcons 
            name="tune" 
            size={24} 
            color={colors['on-surface-variant']} 
            onPress={onFilterPress}
            style={styles.filterIcon}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[4],
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors['surface-container-low'],
    borderRadius: radii.xl,
    paddingHorizontal: spacing[4],
    height: 48,
  },
  containerFocused: {
    backgroundColor: colors['surface-container-lowest'],
    ...shadows.ambient,
  },
  icon: {
    marginRight: spacing[2],
  },
  input: {
    flex: 1,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.sizes.sm,
    color: colors['on-surface'],
  },
  filterIcon: {
    marginLeft: spacing[2],
  },
});
