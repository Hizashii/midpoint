import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, radii, shadows } from '../../src/lib/theme';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

function TabBarIcon(props: {
  name: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  color: string;
  focused: boolean;
}) {
  return (
    <View style={styles.iconContainer}>
      <MaterialCommunityIcons 
        size={26} 
        style={{ marginBottom: -3 }} 
        name={props.name} 
        color={props.color} 
      />
      {props.focused && <View style={[styles.activeDot, { backgroundColor: props.color }]} />}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.outline,
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarBackground: () => (
          <View style={styles.tabBarBackgroundContainer}>
            {Platform.OS === 'ios' ? (
              <BlurView intensity={90} tint="light" style={StyleSheet.absoluteFill} />
            ) : (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255, 255, 255, 0.95)' }]} />
            )}
          </View>
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? "map-marker-radius" : "map-marker-radius-outline"} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="sessions"
        options={{
          title: 'Meetups',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? "account-group" : "account-group-outline"} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? "bookmark" : "bookmark-outline"} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? "account" : "account-outline"} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 20,
    right: 20,
    height: 88,
    borderRadius: radii['3xl'],
    borderTopWidth: 0,
    backgroundColor: 'transparent',
    ...shadows.ambient,
    elevation: 12,
    paddingBottom: Platform.OS === 'ios' ? 8 : 8,
    paddingTop: 8,
  },
  tabBarBackgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radii['3xl'],
    overflow: 'hidden',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  tabBarLabel: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: 11,
    marginTop: 2,
    marginBottom: 4,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 6,
    position: 'absolute',
    bottom: -10,
  }
});
