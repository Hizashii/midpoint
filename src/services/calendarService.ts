import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';

export const calendarService = {
  async isAvailable() {
    return Platform.OS !== 'web';
  },

  async requestPermissions() {
    if (Platform.OS === 'web') return false;
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        const { status: remindersStatus } = await Calendar.requestRemindersPermissionsAsync();
        return status === 'granted' && remindersStatus === 'granted';
      }
    } catch (e) {
      return false;
    }
    return false;
  },

  async getDefaultCalendarId() {
    if (Platform.OS === 'web') return null;
    try {
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar = calendars.find((cal) => cal.isPrimary) || calendars[0];
      return defaultCalendar ? defaultCalendar.id : null;
    } catch (e) {
      return null;
    }
  },

  async addEvent(title: string, startDate: Date, endDate: Date, location: string, notes: string) {
    if (Platform.OS === 'web') {
      console.log('Calendar events not supported on web');
      return null;
    }

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return null;

    const calendarId = await this.getDefaultCalendarId();
    if (!calendarId) return null;

    try {
      const eventId = await Calendar.createEventAsync(calendarId, {
        title,
        startDate,
        endDate,
        location,
        notes,
        timeZone: 'UTC',
      });
      return eventId;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      return null;
    }
  },
};
