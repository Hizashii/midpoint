import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const notificationService = {
  async isAvailable() {
    return Platform.OS !== 'web';
  },

  async requestPermissions() {
    if (Platform.OS === 'web') return false;
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (e) {
      return false;
    }
  },

  async scheduleMeetingReminder(title: string, body: string, date: Date) {
    if (Platform.OS === 'web') {
      console.log('Notifications not supported on web via expo-notifications');
      return null;
    }

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      // Schedule 15 minutes before
      const trigger = new Date(date);
      trigger.setMinutes(trigger.getMinutes() - 15);

      if (trigger < new Date()) {
        // If meeting is very soon, schedule for 10 seconds from now
        trigger.setTime(new Date().getTime() + 10000);
      }

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Midpoint: ${title}`,
          body,
          data: { screen: 'session/leave-now' },
        },
        trigger,
      });
      return identifier;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  },
};
