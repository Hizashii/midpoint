import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Image, TouchableOpacity, Switch, Platform } from 'react-native';
import { colors, typography, spacing, radii, shadows } from '../../src/lib/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Editorial Header */}
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: user?.avatarUrl || 'https://i.pravatar.cc/150?u=me' }} 
                style={styles.avatar} 
              />
              <TouchableOpacity style={styles.editAvatarButton}>
                <MaterialCommunityIcons name="camera" size={16} color="white" />
              </TouchableOpacity>
            </View>
            <View style={styles.nameContainer}>
              <Text style={styles.userName}>{user?.name || 'Anders Jensen'}</Text>
              <Text style={styles.userEmail}>anders@midpoint.app</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <MaterialCommunityIcons name="cog-outline" size={24} color={colors['on-surface']} />
          </TouchableOpacity>
        </View>

        {/* Premium Settings Groups */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Account Preferences</Text>
          <View style={styles.card}>
            <ProfileItem 
              icon="car-hatchback" 
              label="Default Transport" 
              value="Public Transit" 
              iconColor={colors.primary}
            />
            <View style={styles.divider} />
            <ProfileItem 
              icon="clock-check-outline" 
              label="Max Travel Time" 
              value="45 min" 
              iconColor={colors.tertiary}
            />
            <View style={styles.divider} />
            <ProfileItem 
              icon="map-marker-star-outline" 
              label="Home Base" 
              value="Esbjerg, DK" 
              iconColor={colors.secondary}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Notifications</Text>
          <View style={styles.card}>
            <ProfileToggle 
              icon="bell-ring-outline" 
              label="Meetup Reminders" 
              initialValue={true} 
              iconColor="#FF9500"
            />
            <View style={styles.divider} />
            <ProfileToggle 
              icon="message-text-outline" 
              label="Live Status Updates" 
              initialValue={false} 
              iconColor="#5856D6"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Support</Text>
          <View style={styles.card}>
            <ProfileItem icon="help-circle-outline" label="Help Center" iconColor={colors.outline} />
            <View style={styles.divider} />
            <ProfileItem icon="shield-check-outline" label="Privacy Policy" iconColor={colors.outline} />
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <MaterialCommunityIcons name="logout" size={20} color={colors.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Midpoint v1.0.4 (Production)</Text>
        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const ProfileItem = ({ icon, label, value, iconColor }: { icon: any; label: string; value?: string; iconColor: string }) => (
  <TouchableOpacity style={styles.profileItem}>
    <View style={styles.itemLeft}>
      <View style={[styles.iconBg, { backgroundColor: iconColor + '10' }]}>
        <MaterialCommunityIcons name={icon} size={22} color={iconColor} />
      </View>
      <Text style={styles.itemLabel}>{label}</Text>
    </View>
    <View style={styles.itemRight}>
      {value && <Text style={styles.itemValue}>{value}</Text>}
      <MaterialCommunityIcons name="chevron-right" size={20} color={colors.outline} />
    </View>
  </TouchableOpacity>
);

const ProfileToggle = ({ icon, label, initialValue, iconColor }: { icon: any; label: string; initialValue: boolean; iconColor: string }) => {
  const [isEnabled, setIsEnabled] = React.useState(initialValue);
  return (
    <View style={styles.profileItem}>
      <View style={styles.itemLeft}>
        <View style={[styles.iconBg, { backgroundColor: iconColor + '10' }]}>
          <MaterialCommunityIcons name={icon} size={22} color={iconColor} />
        </View>
        <Text style={styles.itemLabel}>{label}</Text>
      </View>
      <Switch
        trackColor={{ false: colors['surface-container-highest'], true: colors.primary + '40' }}
        thumbColor={isEnabled ? colors.primary : colors['surface-container-low']}
        ios_backgroundColor={colors['surface-container-highest']}
        onValueChange={setIsEnabled}
        value={isEnabled}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 32,
    marginBottom: 40,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 4,
    borderColor: 'white',
    ...shadows.md,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameContainer: {
    gap: 4,
  },
  userName: {
    fontFamily: typography.fontFamily.headlineExtraBold,
    fontSize: 24,
    color: colors['on-surface'],
    letterSpacing: -0.5,
  },
  userEmail: {
    fontFamily: typography.fontFamily.body,
    fontSize: 14,
    color: colors.outline,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 14,
    color: colors.outline,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
    marginLeft: 4,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: radii['2xl'],
    paddingVertical: 8,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  profileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: 16,
    color: colors['on-surface'],
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemValue: {
    fontFamily: typography.fontFamily.body,
    fontSize: 14,
    color: colors.outline,
  },
  divider: {
    height: 1,
    backgroundColor: colors['surface-container-low'],
    marginLeft: 72,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
    paddingVertical: 16,
    borderRadius: radii.xl,
    backgroundColor: colors.error + '08',
  },
  logoutText: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 16,
    color: colors.error,
  },
  versionText: {
    fontFamily: typography.fontFamily.body,
    fontSize: 12,
    color: colors.outline,
    textAlign: 'center',
    marginTop: 24,
    opacity: 0.6,
  }
});
