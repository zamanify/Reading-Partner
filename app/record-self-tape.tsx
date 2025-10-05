import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Dimensions, DeviceEventEmitter } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { X, RotateCcw, Circle, Square, Play, Download, Trash2 } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Video, ResizeMode } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import { Platform } from 'react-native';

export default function RecordSelfTapeScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const [facing, setFacing] = useState<CameraType>('front');
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [orientation, setOrientation] = useState<ScreenOrientation.Orientation>(ScreenOrientation.Orientation.PORTRAIT_UP);
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedVideoUri, setRecordedVideoUri] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [mediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions();
  const cameraRef = useRef<CameraView>(null);
  const videoRef = useRef<Video>(null);

  useEffect(() => {
    // Allow all orientations for this screen
    ScreenOrientation.unlockAsync();
    
    // Get initial orientation
    ScreenOrientation.getOrientationAsync().then(setOrientation);
    
    // Listen for orientation changes
    const subscription = ScreenOrientation.addOrientationChangeListener((event) => {
      setOrientation(event.orientationInfo.orientation);
    });
    
    // Listen for dimension changes
    const dimensionSubscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    
    return () => {
      // Lock back to portrait when leaving this screen
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      subscription?.remove();
      dimensionSubscription?.remove();
    };
  }, []);

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleClose = () => {
    if (isRecording) {
      stopRecording();
    }
    router.back();
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
    triggerHaptic();
  };

  const startCountdown = () => {
    setCountdown(3);
    triggerHaptic();
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev === null) return null;
        
        if (prev > 1) {
          triggerHaptic();
          return prev - 1;
        } else {
          clearInterval(countdownInterval);
          startRecording();
          return null;
        }
      });
    }, 1000);
  };

  const startRecording = async () => {
    if (!cameraRef.current) return;

    try {
      triggerHaptic();
      setIsRecording(true);
      
      // Start the recording timer
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      const video = await cameraRef.current.recordAsync({
        quality: '1080p',
      });
      
      clearInterval(timer);
      setRecordedVideoUri(video.uri);
      console.log('Video recorded:', video.uri);
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording');
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (!cameraRef.current || !isRecording) return;

    try {
      triggerHaptic();
      cameraRef.current.stopRecording();
      setIsRecording(false);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const handleMainButtonPress = () => {
    // Disable button during countdown
    if (countdown !== null) return;
    
    if (isRecording) {
      stopRecording();
    } else if (recordedVideoUri) {
      // Toggle video playback
      if (isPlaying) {
        videoRef.current?.pauseAsync();
        setIsPlaying(false);
      } else {
        videoRef.current?.playAsync();
        setIsPlaying(true);
      }
    } else {
      startCountdown();
    }
  };

  const handleExitScreen = () => {
    if (isRecording) {
      stopRecording();
    }
    // Reset all states
    setRecordedVideoUri(null);
    setIsPlaying(false);
    setRecordingTime(0);
    setCountdown(null);
    router.back();
  };

  const handleRestartRecording = () => {
    if (isRecording) {
      stopRecording();
    }
    // Reset all recording states
    setRecordedVideoUri(null);
    setIsPlaying(false);
    setRecordingTime(0);
    setCountdown(null);
    triggerHaptic();
  };

  const handleDeleteConfirmation = () => {
    setShowDeleteConfirmation(true);
  };

  const handleSaveVideo = async () => {
    if (!recordedVideoUri) return;

    try {
      // Request media library permissions if not granted
      if (!mediaLibraryPermission?.granted) {
        const { granted } = await requestMediaLibraryPermission();
        if (!granted) {
          Alert.alert('Permission Required', 'Please grant permission to save videos to your photo library.');
          return;
        }
      }

      // Save video to device
      await MediaLibrary.saveToLibraryAsync(recordedVideoUri);
      triggerHaptic();
      Alert.alert('Success', 'Video saved to your photo library!');
    } catch (error) {
      console.error('Failed to save video:', error);
      Alert.alert('Error', 'Failed to save video to your device');
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTitle = () => {
    if (countdown !== null || isRecording || recordedVideoUri) {
      return formatTime(recordingTime);
    }
    return 'Record self-tape';
  };

  const getInstructions = () => {
    if (recordedVideoUri) {
      return "Press play to watch, close to restart or save to phone if you're happy.";
    } else if (countdown !== null || isRecording) {
      return "Press stop when you're done.";
    }
    return 'We countdown from three, with a beep for each step, then the recording starts.';
  };

  const getMainButtonIcon = () => {
    if (countdown !== null) {
      return <Text style={styles.countdownText}>{countdown}</Text>;
    } else if (isRecording) {
      return <Square size={32} color="white" fill="white" />;
    } else if (recordedVideoUri) {
      return <Play size={32} color="white" fill="white" />;
    } else {
      return <Circle size={32} color="white" fill="white" />;
    }
  };

  const isLandscape = orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT || 
                     orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT;

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading camera...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            We need access to your camera and microphone to record your self-tape.
          </Text>
          <TouchableOpacity 
            style={styles.permissionButton}
            onPress={recordedVideoUri ? handleDeleteConfirmation : handleExitScreen}
            activeOpacity={0.8}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera View or Video Player - Full screen */}
      {recordedVideoUri && isPlaying ? (
        <Video
          ref={videoRef} // Removed conditional landscape style
          style={styles.camera}
          source={{ uri: recordedVideoUri }}
          useNativeControls={false}
          resizeMode={ResizeMode.COVER}
          isLooping={false}
          shouldPlay={isPlaying}
          onPlaybackStatusUpdate={(status) => {
            if (status.isLoaded && status.didJustFinish) {
              setIsPlaying(false);
            }
          }}
        />
      ) : (
        <CameraView
          ref={cameraRef} // Removed conditional landscape style
          style={styles.camera} 
          facing={facing}
          mode="video"
        />
      )}
      
      {/* Camera/Video Content */}
      <View style={styles.cameraContent}> {/* This will overlay the entire screen */}
        {/* UI Overlay with Content */}
        <View style={styles.bottomOverlay}> {/* Removed conditional landscape style */}
          {/* Title and Instructions */}
          <View style={styles.textContent}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{getTitle()}</Text>
              {recordedVideoUri && (
                <TouchableOpacity 
                  style={styles.downloadButton}
                  onPress={handleSaveVideo}
                  activeOpacity={0.7}
                >
                  <Download size={24} color="white" strokeWidth={2} />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.titleLine} />
            <Text style={styles.instructions}>{getInstructions()}</Text>
          </View>
          
          {/* Controls */}
          <View style={styles.controls}>
            {/* Left Control - X Button (Close/Restart) */}
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={recordedVideoUri ? handleDeleteConfirmation : handleExitScreen}
              activeOpacity={0.7}
            >
              {recordedVideoUri ? (
                <Trash2 size={28} color="white" strokeWidth={2} />
              ) : (
                <X size={28} color="white" strokeWidth={2} />
              )}
            </TouchableOpacity>

            {/* Main Action Button */}
            <TouchableOpacity 
              style={styles.recordButton}
              onPress={handleMainButtonPress}
              activeOpacity={0.8}
              disabled={countdown !== null}
            >
              <View style={styles.recordButtonInner}>
                {getMainButtonIcon()}
              </View>
            </TouchableOpacity>

            {/* Right Control - Camera Toggle or Spacer */}
            {!recordedVideoUri ? (
              <TouchableOpacity 
                style={styles.controlButton}
                onPress={toggleCameraFacing}
                activeOpacity={0.7}
              >
                <RotateCcw size={28} color="white" strokeWidth={2} />
              </TouchableOpacity>
            ) : (
              <View style={styles.controlButton} />
            )}
          </View>
        </View>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirmation && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>Are you sure you want to delete recording?</Text>
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonNo]}
                  onPress={() => setShowDeleteConfirmation(false)}
                >
                  <Text style={styles.modalButtonText}>No</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonYes]}
                  onPress={() => {
                    handleRestartRecording();
                    setShowDeleteConfirmation(false);
                  }}
                >
                  <Text style={styles.modalButtonText}>Yes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  landscapeContainer: {
    // This style is no longer needed as absolute positioning handles orientation, keeping for reference
    flexDirection: 'row',
  },
  camera: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  // landscapeCamera: { // Removed as absolute positioning handles this
  //   flex: 1,
  // },
  cameraContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    fontSize: 18,
    color: '#6B7280',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#F8F9FA',
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: '#AF52DE',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0, // Added to stretch across full width
    paddingBottom: 30, // Reduced by 50% from 60
    paddingHorizontal: 24,
    backgroundColor: 'transparent', // Ensure no background color
  },
  landscapeBottomOverlay: { // Removed as absolute positioning handles this
    // This style is no longer needed as absolute positioning handles orientation
  },
  textContent: {
    alignItems: 'flex-start', // Keep this for alignment
    marginBottom: 11, // Reduced by ~65% from 32
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    width: '100%',
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    textAlign: 'left',
    flex: 1,
  },
  downloadButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  titleLine: {
    width: '100%',
    height: 1,
    backgroundColor: 'white',
    marginBottom: 16,
  },
  instructions: {
    fontSize: 16,
    color: 'white',
    textAlign: 'left',
    lineHeight: 22,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 60,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 45, 146, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownText: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
  },
  // New styles for the modal
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  modalButtonYes: {
    backgroundColor: '#FF3B30',
  },
  modalButtonNo: {
    backgroundColor: '#6B7280',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});