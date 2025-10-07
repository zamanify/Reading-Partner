import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FileText, MoveVertical as MoreVertical } from 'lucide-react-native';
import { Project } from '../lib/supabaseDatabase';

interface ProjectItemProps {
  project: Project;
  onPress: (project: Project) => void;
  onOptionsPress: (project: Project) => void;
}

export default function ProjectItem({ project, onPress, onOptionsPress }: ProjectItemProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onPress(project)}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <FileText size={20} color="#6B7280" strokeWidth={1.5} />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.projectName} numberOfLines={1}>
            {project.name}
          </Text>
          <Text style={styles.projectDate}>
            {formatDate(project.updated_at)}
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.optionsButton}
          onPress={() => onOptionsPress(project)}
          activeOpacity={0.7}
        >
          <MoreVertical size={20} color="#9CA3AF" strokeWidth={1.5} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textContainer: {
    flex: 1,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  projectDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  optionsButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});