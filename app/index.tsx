import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen } from 'lucide-react-native';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function ReadingPartnerScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        Alert.alert('Login Failed', error.message);
      } else {
        router.replace('/start');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        Alert.alert('Sign Up Failed', error.message);
      } else {
        router.replace('/start');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Card Container */}
        <View style={styles.card}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <BookOpen size={32} color="#6B7280" strokeWidth={1.5} />
          </View>

          {/* Title */}
          <Text style={styles.title}>Reading Partner</Text>

          {/* Email Input */}
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Password Input */}
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
           onSubmitEditing={handleLogin}
           returnKeyType="go"
          />

          {/* Log in Button */}
          <TouchableOpacity 
            style={[styles.primaryButton, loading && styles.disabledButton]} 
            activeOpacity={0.8}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? 'Logging in...' : 'Log in'}
            </Text>
          </TouchableOpacity>

          {/* Forgot Password Link */}
          {/* Sign up Button */}
          <TouchableOpacity 
            style={[styles.secondaryButton, loading && styles.disabledButton]} 
            activeOpacity={0.8}
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>
              {loading ? 'Creating account...' : 'Sign up'}
            </Text>
          </TouchableOpacity>

          {/* Forgot Password Link */}
          <TouchableOpacity 
            style={styles.forgotPasswordContainer}
            activeOpacity={0.7}
            onPress={() => router.push('/forgot-password')}
          >
            <Text style={styles.forgotPasswordText}>I've forgotten my password</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FAFAFA',
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#6B7280',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  secondaryButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.6,
  },
  forgotPasswordContainer: {
    marginTop: 16,
    paddingVertical: 8,
  },
  forgotPasswordText: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});