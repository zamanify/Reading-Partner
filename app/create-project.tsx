import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Menu } from 'lucide-react-native';
import { router } from 'expo-router';
import { databaseManager } from '../lib/database';
import HamburgerMenu from '../components/HamburgerMenu';

export default function CreateProjectScreen() {
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleSaveProject = async () => {
    if (!projectName.trim()) {
      return;
    }

    // Just navigate to submit script with the project name
    router.push({
      pathname: '/submit-script',
      params: { projectName: projectName.trim() }
    });
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

      {/* Hamburger Menu */}
      <HamburgerMenu 
        isVisible={isMenuVisible}
        onClose={handleMenuClose}
      />

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
        <Text style={styles.title}>Name reading project</Text>
        <View style={styles.underline} />
        
        <Text style={styles.description}>
          Use a straight forward and{'\n'}descriptive name for your reading{'\n'}partner project.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="E.g. Dune Part III, The Bad Guy"
          value={projectName}
          onChangeText={setProjectName}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleSaveProject}
        />

        <TouchableOpacity 
          style={[styles.saveButton, (!projectName.trim() || loading) && styles.disabledButton]}
          onPress={handleSaveProject}
          disabled={!projectName.trim() || loading}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save and go to next step'}
          </Text>
        </TouchableOpacity>
      </View>
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
  description: {
    fontSize: 16,
    color: '#000',
    lineHeight: 24,
    marginBottom: 48,
  },
  input: {
    width: '100%',
    height: 56,
    borderWidth: 2,
    borderColor: '#AF52DE',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#AF52DE',
    backgroundColor: 'white',
    marginBottom: 32,
  },
  saveButton: {
    backgroundColor: '#AF52DE',
    borderRadius: 28,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    width: '100%',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});