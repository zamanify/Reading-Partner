import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Menu, Sparkles } from 'lucide-react-native';
import { router } from 'expo-router';
import { databaseManager, Project } from '../lib/database';
import ProjectItem from '../components/ProjectItem';
import HamburgerMenu from '../components/HamburgerMenu';

export default function StartPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      await databaseManager.initializeDatabase();
      const projectList = await databaseManager.getProjects();
      setProjects(projectList);
    } catch (error) {
      console.error('Failed to load projects:', error);
      Alert.alert('Error', 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleNewRehearsal = async () => {
    router.push('/create-project');
  };

  const handleProjectPress = (project: Project) => {
    router.push({
      pathname: '/project-overview',
      params: { projectId: project.id.toString() }
    });
  };

  const handleProjectOptions = (project: Project) => {
    Alert.alert(
      'Project Options',
      `What would you like to do with "${project.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => handleDeleteProject(project.id)
        },
      ]
    );
  };

  const handleDeleteProject = async (projectId: number) => {
    try {
      await databaseManager.deleteProject(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (error) {
      console.error('Failed to delete project:', error);
      Alert.alert('Error', 'Failed to delete project');
    }
  };

  const handleMenuPress = () => {
    setIsMenuVisible(true);
  };

  const handleMenuClose = () => {
    setIsMenuVisible(false);
  };

  const renderProject = ({ item }: { item: Project }) => (
    <ProjectItem
      project={item}
      onPress={handleProjectPress}
      onOptionsPress={handleProjectOptions}
    />
  );

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

      {/* Main Content */}
      <View style={styles.content}>
        {/* Gradient Button */}
        <TouchableOpacity 
          style={styles.gradientButtonContainer}
          onPress={handleNewRehearsal}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#FF3B30', '#FF2D92', '#AF52DE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientButton}
          >
            <View style={styles.buttonIconContainer}>
              <Sparkles size={32} color="white" strokeWidth={1.5} />
            </View>
            <Text style={styles.buttonText}>
              New rehearsal{'\n'}or self-tape
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Dashed Line */}
        <View style={styles.dashedLineContainer}>
          <View style={styles.dashedLine} />
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Everything starts with a script, a{'\n'}few lines, some great dialogue.
        </Text>

        {/* Archive Section */}
        <View style={styles.archiveSection}>
          <Text style={styles.archiveTitle}>Your archive</Text>
          <View style={styles.archiveLine} />
          
          {loading ? (
            <Text style={styles.archiveEmpty}>Loading...</Text>
          ) : projects.length === 0 ? (
            <Text style={styles.archiveEmpty}>Empty. For now.</Text>
          ) : (
            <FlatList
              data={projects}
              renderItem={renderProject}
              keyExtractor={(item) => item.id.toString()}
              style={styles.projectsList}
              showsVerticalScrollIndicator={false}
            />
          )}
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    paddingTop: 60,
  },
  gradientButtonContainer: {
    width: 196,
    height: 196,
    borderRadius: 60,
    marginBottom: 40,
  },
  gradientButton: {
    flex: 1,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  buttonIconContainer: {
    marginBottom: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 30,
  },
  dashedLineContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  dashedLine: {
    width: 200,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#FF2D92',
  },
  subtitle: {
    fontSize: 16,
    color: '#FF2D92',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  archiveSection: {
    width: '100%',
    alignItems: 'flex-start',
    flex: 1,
  },
  archiveTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  archiveLine: {
    width: '100%',
    height: 2,
    backgroundColor: '#000',
    marginBottom: 24,
  },
  archiveEmpty: {
    fontSize: 16,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  projectsList: {
    width: '100%',
    flex: 1,
  },
});