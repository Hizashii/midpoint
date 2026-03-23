import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, router, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';
import { Manrope_400Regular, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';

import { useColorScheme } from '@/components/useColorScheme';
import { useAuthStore } from '../src/store/authStore';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const initializeAuth = useAuthStore(state => state.initialize);

  useEffect(() => {
    initializeAuth();
  }, []);

  const [loaded, error] = useFonts(Platform.OS === 'web' ? {} : {
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    'Manrope': Manrope_400Regular,
    'Manrope-SemiBold': Manrope_600SemiBold,
    'Manrope-Bold': Manrope_700Bold,
    'Manrope-ExtraBold': Manrope_800ExtraBold,
    'Inter': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) {
      console.warn('Font loading failed, falling back to system fonts:', error);
      // Don't throw error to prevent crash
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Don't block rendering if fonts haven't loaded yet, just let system fonts handle it
  // This prevents the 12000ms timeout from blanking the screen
  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isOnboarded, isAuthenticated } = useAuthStore();
  const segments = useSegments();

  useEffect(() => {
    const path = segments as string[];
    if (path.length === 0) return;

    const inAuthGroup = path[0] === '(auth)';
    const inOnboarding = path[0] === 'onboarding';

    if (!isAuthenticated) {
      if (!inAuthGroup) {
        router.replace('/(auth)/sign-in');
      }
    } else if (!isOnboarded) {
      if (!inOnboarding) {
        router.replace('/onboarding');
      }
    } else if (inAuthGroup || inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [isOnboarded, isAuthenticated, segments]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="meetup/create" options={{ title: 'Plan Meetup' }} />
        <Stack.Screen name="session/[id]" options={{ title: 'Live Session', headerShown: false }} />
        <Stack.Screen name="result/[id]" options={{ title: 'Optimized Result', headerShown: false }} />
        <Stack.Screen name="venue/[id]" options={{ title: 'Venue Details' }} />
      </Stack>
    </ThemeProvider>
  );
}
