import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Menu } from 'lucide-react-native';
import { router } from 'expo-router';
import HamburgerMenu from '../components/HamburgerMenu';

export default function AboutScreen() {
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const handleBack = () => {
    router.back();
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
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>About</Text>
          <View style={styles.underline} />

          {/* What Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What</Text>
            <Text style={styles.sectionText}>
              Reading Partner is an app that allows you read dialogue against a virtual counterpart, either to rehearse and learn your lines and/or to create self-tapes for casting call applications.
            </Text>
          </View>

          {/* Why Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Why</Text>
            <Text style={styles.sectionText}>
              Rehearsing lines and sending in self-tapes is a major part of being an actor and having a counter-reader with infinite patience for practicing and perfect timing for self-tapes is a pretty neat thing.
            </Text>
          </View>

          {/* Who Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Who</Text>
            <Text style={styles.sectionText}>
              Amateurs, semi-professional and professionals actors - they all can benefit from Reading Partner.
            </Text>
          </View>

          {/* Where Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Where</Text>
            <Text style={styles.sectionText}>
              Anywhere and everywhere.
            </Text>
          </View>

          {/* How Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How</Text>
            <Text style={styles.sectionText}>
              You submit the script, you define a few reading partners characteristics and then you're on. All rehearsals can be saved as audio on your phone and all self-tapes can be saved as video on your phone. Each submitted reading project's settings and script is saved for future usage or reference.
            </Text>
          </View>
        </View>
      </ScrollView>

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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 16,
    color: '#000',
    lineHeight: 24,
  },
});