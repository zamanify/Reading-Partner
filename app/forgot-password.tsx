import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'myapp://reset-password',
      });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert(
          'Check your email',
          'We\'ve sent you a password reset link. Please check your email and follow the instructions.',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleGoBack}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#6B7280" strokeWidth={1.5} />
        </TouchableOpacity>

        {/* Card Container */}
        <View style={styles.card}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <BookOpen size={32} color="#6B7280" strokeWidth={1.5} />
          </View>

          {/* Title */}
          <Text style={styles.title}>Reset Password</Text>
          
          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you a link to reset your password.
          </Text>

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

          {/* Reset Password Button */}
          <TouchableOpacity 
            style={[styles.primaryButton, loading && styles.disabledButton]} 
            activeOpacity={0.8}
            onPress={handleResetPassword}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? 'Sending...' : 'Reset password'}
            </Text>
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
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
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
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#6B7280',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.6,
  },
});