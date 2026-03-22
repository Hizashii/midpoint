import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, typography, radii, spacing } from '../../src/lib/theme';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { SecondaryButton } from '../../src/components/SecondaryButton';
import { useAuthStore } from '../../src/store/authStore';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const login = useAuthStore(state => state.login);

  const handleSignIn = async () => {
    await login(email || 'guest@example.com');
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to coordinate your meetups.</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <MaterialIcons name="email" size={20} color={colors.outline} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor={colors.outline}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>
          
          <PrimaryButton 
            title="Continue with Email" 
            onPress={handleSignIn}
            style={styles.mainButton}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <SecondaryButton 
            title="Continue as Guest" 
            onPress={() => login('guest@example.com').then(() => router.replace('/(tabs)'))}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  keyboardView: {
    flex: 1,
    paddingHorizontal: spacing[6],
    justifyContent: 'center',
  },
  header: {
    marginBottom: spacing[10],
  },
  title: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: typography.sizes['3xl'],
    color: colors['on-surface'],
    marginBottom: spacing[2],
  },
  subtitle: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.sizes.md,
    color: colors['on-surface-variant'],
  },
  form: {
    gap: spacing[4],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors['surface-container-low'],
    borderRadius: radii.xl,
    height: 56,
    paddingHorizontal: spacing[4],
    borderWidth: 1,
    borderColor: 'rgba(193, 198, 215, 0.2)',
    marginBottom: spacing[2],
  },
  icon: {
    marginRight: spacing[3],
  },
  input: {
    flex: 1,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.sizes.md,
    color: colors['on-surface'],
  },
  mainButton: {
    marginBottom: spacing[2],
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing[4],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors['surface-container-highest'],
  },
  dividerText: {
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.outline,
    paddingHorizontal: spacing[4],
  },
});
