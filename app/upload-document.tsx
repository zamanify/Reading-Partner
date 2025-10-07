import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Menu, FileText, Download } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import HamburgerMenu from '../components/HamburgerMenu';
import { extractTextFromDocument } from '../lib/openaiOCR';
import { validateFileSize, validatePDFPages } from '../lib/pdfValidator';

interface SelectedFile {
  name: string;
  size: number;
  uri: string;
  mimeType: string;
}

export default function UploadDocumentScreen() {
  const { projectName } = useLocalSearchParams<{ projectName: string }>();
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleSelectFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/rtf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile({
          name: file.name,
          size: file.size || 0,
          uri: file.uri,
          mimeType: file.mimeType || '',
        });
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to select document');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !projectName) return;

    setIsProcessing(true);

    try {
      let extractedText = '';

      if (selectedFile.mimeType === 'text/plain' || selectedFile.name.toLowerCase().endsWith('.txt')) {
        extractedText = await FileSystem.readAsStringAsync(selectedFile.uri);
      } else {
        const sizeValidation = await validateFileSize(selectedFile.uri, 5);
        if (!sizeValidation.isValid) {
          Alert.alert('File Too Large', sizeValidation.error || 'File exceeds 5MB limit');
          setIsProcessing(false);
          return;
        }

        if (selectedFile.mimeType === 'application/pdf') {
          const pageValidation = await validatePDFPages(selectedFile.uri, 10);
          if (!pageValidation.isValid) {
            Alert.alert('Too Many Pages', pageValidation.error || 'PDF exceeds 10 page limit');
            setIsProcessing(false);
            return;
          }
        }

        const ocrResult = await extractTextFromDocument(
          selectedFile.uri,
          selectedFile.mimeType
        );

        if (!ocrResult.success) {
          Alert.alert(
            'Extraction Failed',
            ocrResult.error || 'Failed to extract text from the document. Please try again or use a different file format.',
            [{ text: 'OK' }]
          );
          setIsProcessing(false);
          return;
        }

        extractedText = ocrResult.text;

        if (!extractedText || extractedText.trim().length === 0) {
          Alert.alert(
            'No Text Found',
            'No text could be extracted from the document. Please make sure the document contains readable text.',
            [{ text: 'OK' }]
          );
          setIsProcessing(false);
          return;
        }
      }

      setIsProcessing(false);

      router.push({
        pathname: '/review-script',
        params: {
          projectName,
          extractedText
        }
      });
    } catch (error) {
      console.error('Failed to process file:', error);
      Alert.alert('Error', 'Failed to process the selected file. Please try again.');
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(0)) + sizes[i];
  };

  const handleMenuPress = () => {
    setIsMenuVisible(true);
  };

  const handleMenuClose = () => {
    setIsMenuVisible(false);
  };

  if (isProcessing) {
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
          <Text style={styles.subtitle}>Upload as document</Text>
          <View style={styles.underline} />

          {/* Loading State */}
          <View style={styles.loadingContainer}>
            <View style={styles.spinner} />
            <Text style={styles.loadingTitle}>Processing</Text>
            <Text style={styles.loadingSubtitle}>Give a few seconds</Text>
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
        <Text style={styles.subtitle}>Upload as document</Text>
        <View style={styles.underline} />

        <Text style={styles.description}>
          Upload a document with the script.{'\n'}Make sure the document only has{'\n'}the script you want to self-tape.
        </Text>

        {/* Upload Area */}
        <TouchableOpacity 
          style={styles.uploadArea}
          onPress={handleSelectFile}
          activeOpacity={0.8}
        >
          {selectedFile ? (
            <View style={styles.fileContainer}>
              <View style={styles.fileIcon}>
                <FileText size={32} color="#AF52DE" strokeWidth={1.5} />
                <Text style={styles.fileType}>PDF</Text>
              </View>
              <Text style={styles.fileName}>{selectedFile.name}</Text>
              <Text style={styles.fileSize}>({formatFileSize(selectedFile.size)})</Text>
            </View>
          ) : (
            <View style={styles.uploadPrompt}>
              <Download size={48} color="#9CA3AF" strokeWidth={1.5} />
              <Text style={styles.uploadTitle}>Select file to upload</Text>
              <Text style={styles.uploadSubtitle}>(PDF, Word, RTF, TXT)</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Upload Button - Only show when file is selected */}
        {selectedFile && (
          <TouchableOpacity 
            style={styles.uploadButton}
            onPress={handleUpload}
            activeOpacity={0.9}
          >
            <Text style={styles.uploadButtonText}>Upload</Text>
          </TouchableOpacity>
        )}
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
  description: {
    fontSize: 16,
    color: '#000',
    lineHeight: 24,
    marginBottom: 48,
  },
  uploadArea: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: 'white',
  },
  uploadPrompt: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#9CA3AF',
    marginTop: 16,
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  fileContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  fileIcon: {
    position: 'relative',
    marginBottom: 16,
  },
  fileType: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    transform: [{ translateX: -12 }],
    fontSize: 12,
    fontWeight: '600',
    color: '#AF52DE',
    backgroundColor: 'white',
    paddingHorizontal: 4,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#AF52DE',
    textAlign: 'center',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  uploadButton: {
    backgroundColor: '#AF52DE',
    borderRadius: 28,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 40,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    width: 60,
    height: 60,
    borderWidth: 4,
    borderColor: '#E5E7EB',
    borderTopColor: '#AF52DE',
    borderRadius: 30,
    marginBottom: 24,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#AF52DE',
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 14,
    color: '#AF52DE',
  },
});