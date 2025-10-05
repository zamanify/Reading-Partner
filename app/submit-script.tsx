import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Menu, CreditCard as Edit3, FileText, Mail, Mic } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import HamburgerMenu from '../components/HamburgerMenu';

export default function SubmitScriptScreen() {
  const { projectName } = useLocalSearchParams<{ projectName: string }>();
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleSubmitAsText = () => {
    router.push({
      pathname: '/submit-text',
      params: { projectName }
    });
  };

  const handleUploadDocument = () => {
    router.push({
      pathname: '/upload-document',
      params: { projectName }
    });
  };

  const handleSendAsEmail = () => {
    // TODO: Navigate to email input screen
    console.log('Send as email');
  };

  const handleInputAsSpeech = () => {
    // TODO: Navigate to speech recording screen
    console.log('Input as speech');
  };

  const handleMenuPress = () => {
    setIsMenuVisible(true);
  };

  const handleMenuClose = () => {
    setIsMenuVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
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

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Submit script</Text>
        <View style={styles.underline} />

        {/* Option Buttons */}
        <View style={styles.optionsContainer}>
          {/* Submit as text */}
          <TouchableOpacity 
            style={styles.optionButton}
            onPress={handleSubmitAsText}
            activeOpacity={0.8}
          >
            <Edit3 size={32} color="white" strokeWidth={1.5} />
            <Text style={styles.optionTitle}>Submit as text</Text>
            <Text style={styles.optionSubtitle}>Paste from clipboard or write directly</Text>
          </TouchableOpacity>

          {/* Upload as document */}
          <TouchableOpacity 
            style={styles.optionButton}
            onPress={handleUploadDocument}
            activeOpacity={0.8}
          >
            <FileText size={32} color="white" strokeWidth={1.5} />
            <Text style={styles.optionTitle}>Upload as document</Text>
            <Text style={styles.optionSubtitle}>From phone as PDF, Word, RTF or TXT</Text>
          </TouchableOpacity>

          {/* Send as email */}
          <TouchableOpacity 
            style={styles.optionButton}
            onPress={handleSendAsEmail}
            activeOpacity={0.8}
          >
            <Mail size={32} color="white" strokeWidth={1.5} />
            <Text style={styles.optionTitle}>Send as email</Text>
            <Text style={styles.optionSubtitle}>You get a code to paste as subject</Text>
          </TouchableOpacity>

          {/* Input as speech */}
          <TouchableOpacity 
            style={styles.optionButton}
            onPress={handleInputAsSpeech}
            activeOpacity={0.8}
          >
            <Mic size={32} color="white" strokeWidth={1.5} />
            <Text style={styles.optionTitle}>Input as speech</Text>
            <Text style={styles.optionSubtitle}>Just record the script using your voice</Text>
          </TouchableOpacity>
        </View>
      </View>

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
  content: {
    flex: 1,
    paddingHorizontal: 24,
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
  optionsContainer: {
    flex: 1,
    gap: 16,
  },
  optionButton: {
    backgroundColor: '#AF52DE',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  optionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  optionSubtitle: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 18,
  },
});