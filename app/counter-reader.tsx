import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Menu } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import HamburgerMenu from '../components/HamburgerMenu';
import { supabaseDatabaseManager } from '../lib/supabaseDatabase';
import { DialogueLine } from '../lib/openaiOCR';

type Gender = 'Female' | 'Male' | 'Neutral';
type Mood = 'Neutral' | 'Action' | 'Adventure' | 'Comedy' | 'Drama' | 'Horror' | 'Thriller' | 'Sci-Fi' | 'Kids';
type Tempo = 'SLOW' | 'NORMAL' | 'FAST';

interface CharacterConfig {
  gender: Gender;
  mood: Mood;
  tempo: Tempo;
}

interface DummyCharacter {
  id: string;
  name: string;
  isCounterReader: boolean;
}

export default function CounterReaderScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();

  const [characters, setCharacters] = useState<DummyCharacter[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<DummyCharacter | null>(null);
  const [characterConfigs, setCharacterConfigs] = useState<Record<string, CharacterConfig>>({});
  const [loading, setLoading] = useState(true);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [chosenCharacterName, setChosenCharacterName] = useState<string | null>(null);

  useEffect(() => {
    loadProjectAndCharacters();
  }, [projectId]);

  const loadProjectAndCharacters = async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    try {
      const project = await supabaseDatabaseManager.getProjectById(projectId);

      if (!project || !project.lines || project.lines.length === 0) {
        Alert.alert(
          'No Characters Found',
          'No dialogue lines found in this script. Please review the script and try again.'
        );
        setLoading(false);
        return;
      }

      const uniqueCharacterNames = extractUniqueCharacters(project.lines);
      const characterList: DummyCharacter[] = uniqueCharacterNames.map((name, index) => ({
        id: `char_${index}`,
        name: name,
        isCounterReader: true
      }));

      setCharacters(characterList);
    } catch (error) {
      console.error('Failed to load project:', error);
      Alert.alert('Error', 'Failed to load project data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const extractUniqueCharacters = (lines: DialogueLine[]): string[] => {
    const characterSet = new Set<string>();

    lines.forEach(line => {
      if (line.character && line.character.trim()) {
        characterSet.add(line.character.trim().toUpperCase());
      }
    });

    return Array.from(characterSet).sort();
  };

  const handleBack = () => {
    router.back();
  };

  const handleCharacterToggle = (character: DummyCharacter, isCounterReader: boolean) => {
    if (!character.id) return;

    setCharacters(prev => prev.map(char =>
      char.id === character.id ? { ...char, isCounterReader } : char
    ));

    if (isCounterReader) {
      setCharacterConfigs(prev => ({
        ...prev,
        [character.id]: {
          gender: 'Female',
          mood: 'Neutral',
          tempo: 'NORMAL'
        }
      }));
      setSelectedCharacter({ ...character, isCounterReader: true });
      setChosenCharacterName(null);
    } else {
      setCharacterConfigs(prev => {
        const newConfigs = { ...prev };
        delete newConfigs[character.id];
        return newConfigs;
      });
      if (selectedCharacter?.id === character.id) {
        setSelectedCharacter(null);
      }
      setChosenCharacterName(character.name);
    }
  };

  const handleCharacterSelect = (character: DummyCharacter) => {
    if (character.isCounterReader) {
      setSelectedCharacter(character);
    }
  };

  const updateCharacterConfig = (field: keyof CharacterConfig, value: string) => {
    if (!selectedCharacter?.id) return;

    setCharacterConfigs(prev => ({
      ...prev,
      [selectedCharacter.id!]: {
        ...prev[selectedCharacter.id!],
        [field]: value
      }
    }));
  };

  const handleSubmit = async () => {
    if (!projectId) {
      Alert.alert('Error', 'Project ID is missing');
      return;
    }

    if (!chosenCharacterName) {
      Alert.alert('No Character Selected', 'Please select which character you will play by toggling it to "ME".');
      return;
    }

    try {
      await supabaseDatabaseManager.updateProjectChosenCharacter(projectId, chosenCharacterName);

      router.push({
        pathname: '/project-overview',
        params: { projectId }
      });
    } catch (error) {
      console.error('Failed to save chosen character:', error);
      Alert.alert('Error', 'Failed to save your character selection. Please try again.');
    }
  };

  const handleMenuPress = () => {
    setIsMenuVisible(true);
  };

  const handleMenuClose = () => {
    setIsMenuVisible(false);
  };

  const renderCharacterToggle = (character: DummyCharacter) => (
    <View key={character.id} style={styles.characterContainer}>
      <Text style={styles.characterName}>{character.name}</Text>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            styles.toggleLeft,
            !character.isCounterReader && styles.toggleActive
          ]}
          onPress={() => handleCharacterToggle(character, false)}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.toggleText,
            !character.isCounterReader && styles.toggleTextActive
          ]}>ME</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            styles.toggleRight,
            character.isCounterReader && styles.toggleActive
          ]}
          onPress={() => {
            handleCharacterToggle(character, true);
            handleCharacterSelect({ ...character, isCounterReader: true });
          }}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.toggleText,
            character.isCounterReader && styles.toggleTextActive
          ]}>APP</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderOptionButton = (
   key: string,
    label: string,
    isSelected: boolean,
    onPress: () => void,
    style?: any
  ) => (
    <TouchableOpacity
     key={key}
      style={[
        styles.optionButton,
        isSelected && styles.optionButtonActive,
        style
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[
        styles.optionText,
        isSelected && styles.optionTextActive
      ]}>{label}</Text>
    </TouchableOpacity>
  );

  const currentConfig = selectedCharacter?.id ? characterConfigs[selectedCharacter.id] : null;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading characters...</Text>
      </SafeAreaView>
    );
  }

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

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>Counter-reader</Text>
          <View style={styles.underline} />

          {/* Characters Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Character</Text>
            <View style={styles.sectionUnderline} />
            
            <View style={styles.charactersGrid}>
              {characters.map(renderCharacterToggle)}
            </View>
          </View>

          {/* Configuration Options - Only show if a counter reader is selected */}
          {selectedCharacter && currentConfig && (
            <>
              {/* Gender Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Gender</Text>
                <View style={styles.sectionUnderline} />
                
                <View style={styles.optionsRow}>
                  {renderOptionButton(
                   'Female',
                    'Female',
                    currentConfig.gender === 'Female',
                    () => updateCharacterConfig('gender', 'Female')
                  )}
                  {renderOptionButton(
                   'Male',
                    'Male',
                    currentConfig.gender === 'Male',
                    () => updateCharacterConfig('gender', 'Male')
                  )}
                  {renderOptionButton(
                   'Neutral',
                    'Neutral',
                    currentConfig.gender === 'Neutral',
                    () => updateCharacterConfig('gender', 'Neutral')
                  )}
                </View>
              </View>

              {/* Mood Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Mood</Text>
                <View style={styles.sectionUnderline} />
                
                <View style={styles.optionsGrid}>
                  {(['Neutral', 'Action', 'Adventure', 'Comedy', 'Drama', 'Horror', 'Thriller', 'Sci-Fi', 'Kids'] as Mood[]).map(mood => 
                    renderOptionButton(
                     mood,
                      mood,
                      currentConfig.mood === mood,
                      () => updateCharacterConfig('mood', mood),
                      styles.moodButton
                    )
                  )}
                </View>
              </View>

              {/* Tempo Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tempo</Text>
                <View style={styles.sectionUnderline} />
                
                <View style={styles.tempoContainer}>
                  <TouchableOpacity
                    style={[
                      styles.tempoButton,
                      currentConfig.tempo === 'SLOW' && styles.tempoButtonActive
                    ]}
                    onPress={() => updateCharacterConfig('tempo', 'SLOW')}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.tempoText,
                      currentConfig.tempo === 'SLOW' && styles.tempoTextActive
                    ]}>SLOW</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.tempoButton,
                      styles.tempoCenter,
                      currentConfig.tempo === 'NORMAL' && styles.tempoButtonActive
                    ]}
                    onPress={() => updateCharacterConfig('tempo', 'NORMAL')}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.tempoText,
                      currentConfig.tempo === 'NORMAL' && styles.tempoTextActive
                    ]}>NORMAL</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.tempoButton,
                      currentConfig.tempo === 'FAST' && styles.tempoButtonActive
                    ]}
                    onPress={() => updateCharacterConfig('tempo', 'FAST')}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.tempoText,
                      currentConfig.tempo === 'FAST' && styles.tempoTextActive
                    ]}>FAST</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Submit Button */}
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#AF52DE',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionUnderline: {
    width: '100%',
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#AF52DE',
    marginBottom: 20,
  },
  charactersGrid: {
    gap: 16,
  },
  characterContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  characterName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#AF52DE',
    marginBottom: 8,
    textAlign: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#AF52DE',
    overflow: 'hidden',
  },
  toggleButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleLeft: {
    borderTopLeftRadius: 23,
    borderBottomLeftRadius: 23,
  },
  toggleRight: {
    borderTopRightRadius: 23,
    borderBottomRightRadius: 23,
  },
  toggleActive: {
    backgroundColor: '#AF52DE',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#AF52DE',
  },
  toggleTextActive: {
    color: 'white',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionButtonActive: {
    backgroundColor: '#AF52DE',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  optionTextActive: {
    color: 'white',
  },
  moodButton: {
    minWidth: 100,
    marginBottom: 8,
  },
  tempoContainer: {
    flexDirection: 'row',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#AF52DE',
    overflow: 'hidden',
    marginHorizontal: 20,
  },
  tempoButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tempoCenter: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#AF52DE',
  },
  tempoButtonActive: {
    backgroundColor: '#AF52DE',
  },
  tempoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#AF52DE',
  },
  tempoTextActive: {
    color: 'white',
  },
  submitContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 40,
    backgroundColor: '#F8F9FA',
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
  loadingText: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 100,
  },
});