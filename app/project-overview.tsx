import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Menu, Trash2, CornerUpLeft, Play } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { supabaseDatabaseManager, Project, Character } from '../lib/supabaseDatabase';
import HamburgerMenu from '../components/HamburgerMenu';

export default function ProjectOverviewScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  useEffect(() => {
    loadProjectData();
  }, []);

  const loadProjectData = async () => {
    if (!projectId) return;
    
    try {
      const projectData = await supabaseDatabaseManager.getProjectById(projectId);
      const projectCharacters = await supabaseDatabaseManager.getCharactersByProject(projectId);
      
      setProject(projectData);
      setCharacters(projectCharacters);
    } catch (error) {
      console.error('Failed to load project data:', error);
      Alert.alert('Error', 'Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleDeleteProject = () => {
    Alert.alert(
      'Delete Project',
      'Are you sure you want to delete this project? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await supabaseDatabaseManager.deleteProject(projectId!);
              router.replace('/start');
            } catch (error) {
              console.error('Failed to delete project:', error);
              Alert.alert('Error', 'Failed to delete project');
            }
          }
        },
      ]
    );
  };

  const handleRehearseLines = () => {
    // TODO: Navigate to rehearse lines screen
    console.log('Rehearse lines');
  };

  const handleCreateSelfTape = () => {
    router.push({
      pathname: '/record-self-tape',
      params: { projectId }
    });
  };

  const handleMenuPress = () => {
    setIsMenuVisible(true);
  };

  const handleMenuClose = () => {
    setIsMenuVisible(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMainCharacter = () => {
    const userCharacters = characters.filter(char => !char.isCounterReader);
    return userCharacters.length > 0 ? userCharacters[0].name : 'Not set';
  };

  const getCounterReaderSettings = () => {
    const counterReaders = characters.filter(char => char.isCounterReader);
    if (counterReaders.length === 0) return { gender: 'Not set', mood: 'Not set', tempo: 'Not set' };
    
    // For now, return default settings - in a real app, you'd store these configurations
    return {
      gender: 'Female',
      mood: 'Comedy', 
      tempo: 'Normal'
    };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading project...</Text>
      </SafeAreaView>
    );
  }

  if (!project) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Project not found</Text>
      </SafeAreaView>
    );
  }

  const counterReaderSettings = getCounterReaderSettings();

  return (
    <>
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

      {/* Back Button and Delete */}
      <View style={styles.topActions}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#000" strokeWidth={1.5} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={handleDeleteProject}
          activeOpacity={0.7}
        >
          <Trash2 size={24} color="#000" strokeWidth={1.5} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Overview</Text>
        <View style={styles.underline} />

        {/* Project Name Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Reading project name</Text>
            <TouchableOpacity style={styles.editButton}>
              <CornerUpLeft size={16} color="#AF52DE" strokeWidth={1.5} />
            </TouchableOpacity>
          </View>
          <Text style={styles.projectName}>{project.name}</Text>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Settings</Text>
            <TouchableOpacity style={styles.editButton}>
              <CornerUpLeft size={16} color="#AF52DE" strokeWidth={1.5} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.settingsGrid}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Last saved →</Text>
              <Text style={styles.settingValue}>{formatDate(project.updatedAt)}</Text>
            </View>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Your character →</Text>
              <Text style={styles.settingValue}>{getMainCharacter()}</Text>
            </View>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Script status →</Text>
              <Text style={styles.settingValue}>
                {project.script ? 'Uploaded and saved' : 'Not uploaded'}
              </Text>
            </View>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Characters →</Text>
              <Text style={styles.settingValue}>
                {characters.length > 0 ? 'Attributed' : 'Not attributed'}
              </Text>
            </View>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Gender →</Text>
              <Text style={styles.settingValue}>{counterReaderSettings.gender}</Text>
            </View>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Mood →</Text>
              <Text style={styles.settingValue}>{counterReaderSettings.mood}</Text>
            </View>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Tempo →</Text>
              <Text style={styles.settingValue}>{counterReaderSettings.tempo}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {/* Rehearse Lines Button */}
          <TouchableOpacity 
            style={styles.actionButtonContainer}
            onPress={handleRehearseLines}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#FF3B30', '#AF52DE']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionButton}
            >
              <View style={styles.actionIconContainer}>
                <View style={styles.rehearseIcon}>
                  <View style={styles.rehearseCorner} />
                  <View style={styles.rehearseCorner} />
                  <View style={styles.rehearseCorner} />
                  <View style={styles.rehearseCorner} />
                </View>
              </View>
              <Text style={styles.actionButtonTitle}>Rehearse{'\n'}lines</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Create Self-tape Button */}
          <TouchableOpacity 
            style={styles.actionButtonContainer}
            onPress={handleCreateSelfTape}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#AF52DE', '#FF3B30']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionButton}
            >
              <View style={styles.actionIconContainer}>
                <View style={styles.selfTapeIcon}>
                  <View style={styles.selfTapeCorner} />
                  <View style={styles.selfTapeCorner} />
                  <View style={styles.selfTapeCorner} />
                  <View style={styles.selfTapeCorner} />
                  <Play size={20} color="white" strokeWidth={2} fill="white" />
                </View>
              </View>
              <Text style={styles.actionButtonTitle}>Create{'\n'}self-tape</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Description Text */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>
            Use the voice mode to{'\n'}practice dialogue.
          </Text>
          <Text style={styles.descriptionText}>
            Use video mode to film{'\n'}yourself in dialogue.
          </Text>
        </View>
      </View>
      </SafeAreaView>

      {/* Hamburger Menu */}
      <HamburgerMenu 
        isVisible={isMenuVisible}
        onClose={handleMenuClose}
      />
    </>
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
  topActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000',
    marginLeft: 8,
  },
  deleteButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#AF52DE',
    flex: 1,
  },
  editButton: {
    padding: 4,
  },
  projectName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    lineHeight: 26,
  },
  settingsGrid: {
    gap: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  settingLabel: {
    fontSize: 16,
    color: '#000',
    minWidth: 140,
  },
  settingValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  actionButtonContainer: {
    flex: 1,
    height: 140,
    borderRadius: 24,
    overflow: 'hidden',
  },
  actionButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  actionIconContainer: {
    marginBottom: 12,
  },
  rehearseIcon: {
    width: 32,
    height: 32,
    position: 'relative',
  },
  rehearseCorner: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderWidth: 2,
    borderColor: 'white',
  },
  selfTapeIcon: {
    width: 32,
    height: 32,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selfTapeCorner: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderWidth: 2,
    borderColor: 'white',
  },
  actionButtonTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
  },
  descriptionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#AF52DE',
    textAlign: 'center',
    lineHeight: 18,
    flex: 1,
  },
  loadingText: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 100,
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 100,
  },
});

// Add styles for the corner icons
const cornerStyles = StyleSheet.create({
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
});

// Apply corner styles to the rehearse icon corners
const rehearseCornerStyles = [
  [cornerStyles.topLeft, { top: 0, left: 0 }],
  [cornerStyles.topRight, { top: 0, right: 0 }],
  [cornerStyles.bottomLeft, { bottom: 0, left: 0 }],
  [cornerStyles.bottomRight, { bottom: 0, right: 0 }],
];

// Apply corner styles to the self-tape icon corners  
const selfTapeCornerStyles = [
  [cornerStyles.topLeft, { top: 0, left: 0 }],
  [cornerStyles.topRight, { top: 0, right: 0 }],
  [cornerStyles.bottomLeft, { bottom: 0, left: 0 }],
  [cornerStyles.bottomRight, { bottom: 0, right: 0 }],
];