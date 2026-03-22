import React from 'react';
import { View, StyleSheet, Dimensions, Platform, ScrollView } from 'react-native';
import { colors, radii } from '../lib/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MapBottomSheetProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const MapBottomSheet = ({ 
  children, 
  footer
}: MapBottomSheetProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.sheet}>
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>
        
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {children}
        </ScrollView>

        {footer && (
          <View style={styles.footerContainer}>
            {footer}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.65, // Increased height slightly for better reach
    zIndex: 100,
  },
  sheet: {
    flex: 1,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii['3xl'],
    borderTopRightRadius: radii['3xl'],
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -12 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
      },
      android: {
        elevation: 20,
      },
      web: {
        boxShadow: '0px -12px 24px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 48,
    height: 5,
    backgroundColor: colors['outline-variant'],
    borderRadius: 3,
    opacity: 0.3,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },
  footerContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors['surface-container-low'],
  },
});
