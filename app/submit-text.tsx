import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Menu } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { supabaseDatabaseManager } from '../lib/supabaseDatabase';
import { ScriptParser } from '../lib/scriptParser';
import HamburgerMenu from '../components/HamburgerMenu';

export default function SubmitTextScreen() {
  const [scriptText, setScriptText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const { projectName } = useLocalSearchParams<{ projectName: string }>();

  const handleBack = () => {
    router.back();
  };

  const handleSubmit = async () => {
    if (!scriptText.trim() || !projectName) {
      return;
    }

    setLoading(true);
    try {
      // Create the project with both name and script
      const project = await supabaseDatabaseManager.createProject(projectName);
      await supabaseDatabaseManager.updateProjectScript(project.id, scriptText.trim());

      // Identify and store characters from the script
      const identifiedCharacters = ScriptParser.identifyCharacters(scriptText.trim());

      // Store each character in the database
      for (const characterName of identifiedCharacters) {
        await supabaseDatabaseManager.createCharacter(project.id, characterName, false);
      }

      router.push({
        pathname: '/counter-reader',
        params: { projectId: project.id }
      });
    } catch (error) {
      console.error('Failed to save script:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuPress = () => {
    setIsMenuVisible(true);
  };

  const handleMenuClose = () => {
    setIsMenuVisible(false);
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
          <TouchableOpacity style={styles.menuButton}>
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
          <Text style={styles.subtitle}>Submit as text</Text>
          <View style={styles.underline} />

          {/* Script Input */}
          <TextInput
            style={styles.scriptInput}
            placeholder="Paste or write text here..."
            placeholderTextColor="#9CA3AF"
            value={scriptText}
            onChangeText={setScriptText}
            multiline
            textAlignVertical="top"
            autoFocus
          />
        </View>

        {/* Submit Button - Only show when there's text */}
        {scriptText.trim().length > 0 && (
          <View style={styles.submitContainer}>
            <TouchableOpacity 
              style={styles.submitButtonContainer}
              onPress={handleSubmit}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#FF3B30', '#FF2D92', '#AF52DE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitButton}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#AF52DE',
    marginBottom: 8,
  },
  underline: {
    width: '100%',
    height: 2,
    backgroundColor: '#000',
    marginBottom: 32,
  },
  scriptInput: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    fontSize: 16,
    fontFamily: Platform.select({
      ios: 'Courier',
      android: 'monospace',
      web: 'Courier, monospace',
    }),
    color: '#374151',
    lineHeight: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  submitContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  submitButtonContainer: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  submitButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});