import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { colors, typography, radii, spacing, shadows } from '../lib/theme';

interface SegmentedTabsProps {
  tabs: string[];
  activeTab: number;
  onChange: (index: number) => void;
  style?: any;
}

export const SegmentedTabs = ({ tabs, activeTab, onChange, style }: SegmentedTabsProps) => {
  const [indicatorX] = React.useState(new Animated.Value(0));
  const containerWidth = React.useRef(0);

  const moveIndicator = (index: number) => {
    const tabWidth = containerWidth.current / tabs.length;
    Animated.spring(indicatorX, {
      toValue: index * tabWidth,
      useNativeDriver: true,
      bounciness: 0,
    }).start();
  };

  React.useEffect(() => {
    moveIndicator(activeTab);
  }, [activeTab]);

  return (
    <View 
      style={[styles.container, style]}
      onLayout={(e) => {
        containerWidth.current = e.nativeEvent.layout.width;
        moveIndicator(activeTab);
      }}
    >
      <Animated.View 
        style={[
          styles.indicator, 
          { 
            width: `${100 / tabs.length}%`,
            transform: [{ translateX: indicatorX }] 
          }
        ]} 
      />
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={tab}
          activeOpacity={0.8}
          style={styles.tab}
          onPress={() => onChange(index)}
        >
          <Text 
            style={[
              styles.tabText, 
              activeTab === index && styles.activeTabText
            ]}
          >
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors['surface-container-high'],
    borderRadius: radii.full,
    padding: 4,
    height: 48,
    position: 'relative',
    ...shadows.sm,
  },
  indicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    backgroundColor: colors['surface-container-lowest'],
    borderRadius: radii.full,
    ...shadows.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  tabText: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: 14,
    color: colors['on-surface-variant'],
  },
  activeTabText: {
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors['on-surface'],
  },
});
