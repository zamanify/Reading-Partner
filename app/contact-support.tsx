import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Menu } from 'lucide-react-native';
import { router } from 'expo-router';
import HamburgerMenu from '../components/HamburgerMenu';

export default function ContactSupportScreen() {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleBack = () => {
    router.back();
  };

  const handleMenuPress = () => {
    setIsMenuVisible(true);
  };

  const handleMenuClose = () => {
    setIsMenuVisible(false);
  };

  const handleSend = () => {
    // TODO: Implement send functionality
    console.log('Send message:', { name, email, message });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <View style={styles.logoLines}>
                <View style={styles.logoLine} />
                <View style={styles.logoLine} />
                <View style={styles.logoLine} />
              </View>
              <View style={styles.logoChat}>
                <View style={styles.chatBubble1} />
                <View style={styles.chatBubble2} />
              </View>
            </View>
            <Text style={styles.logoText}>
              Reading{'\n'}partner<Text style={styles.trademark}>™</Text>
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={handleMenuPress}
            activeOpacity={0.7}
          >
            <Menu size={24} color="#000" strokeWidth={1.5} />
          </TouchableOpacity>
        </View>

        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#000" strokeWidth={1.5} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>Contact and support</Text>
            <View style={styles.underline} />

            {/* Form */}
            <View style={styles.formContainer}>
              <Text style={styles.inputLabel}>Your name*</Text>
              <TextInput
                style={styles.input}
                placeholder="E.g. Charlie Chaplin"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
              />
              
              <Text style={styles.inputLabel}>Your email*</Text>
              <TextInput
                style={styles.input}
                placeholder="E.g. name.lastname@maildomain.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              
              <Text style={styles.inputLabel}>Your message*</Text>
              <TextInput
                style={styles.messageInput}
                placeholder="Write here"
                value={message}
                onChangeText={setMessage}
                multiline
                textAlignVertical="top"
                autoCapitalize="sentences"
                autoCorrect={true}
              />
            </View>
          </View>
        </ScrollView>

        {/* Send Button */}
        <View style={styles.sendContainer}>
          <TouchableOpacity 
            style={styles.sendButton}
            onPress={handleSend}
            activeOpacity={0.8}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Hamburger Menu */}
      <HamburgerMenu 
        isVisible={isMenuVisible}
        onClose={handleMenuClose}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 40,
    height: 40,
    marginRight: 12,
    position: 'relative',
  },
  logoLines: {
    position: 'absolute',
    left: 0,
    top: 8,
  },
  logoLine: {
    width: 16,
    height: 2,
    backgroundColor: '#000',
    marginBottom: 3,
  },
  logoChat: {
    position: 'absolute',
    right: 0,
    top: 4,
  },
  chatBubble1: {
    width: 14,
    height: 10,
    backgroundColor: '#000',
    borderRadius: 6,
    marginBottom: 2,
  },
  chatBubble2: {
    width: 12,
    height: 8,
    backgroundColor: '#000',
    borderRadius: 4,
    marginLeft: 2,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    lineHeight: 24,
  },
  trademark: {
    fontSize: 12,
    fontWeight: '400',
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginBottom: 24,
  },
  backText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  underline: {
    width: '100%',
    height: 2,
    backgroundColor: '#000',
    marginBottom: 32,
  },
  formContainer: {
    gap: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 0,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#374151',
  },
  messageInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 0,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#374151',
    height: 200,
    textAlignVertical: 'top',
  },
  sendContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 40,
    backgroundColor: '#F8F9FA',
  },
  sendButton: {
    backgroundColor: '#AF52DE',
    borderRadius: 28,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});