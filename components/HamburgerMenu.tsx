import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { X, ArrowRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';

interface HamburgerMenuProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function HamburgerMenu({ isVisible, onClose }: HamburgerMenuProps) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleCreateNew = () => {
    onClose();
    router.push('/create-project');
  };

  const handleYourArchive = () => {
    onClose();
    router.push('/start');
  };

  const handleAbout = () => {
    onClose();
    router.push('/about');
  };

  const handleAccount = () => {
    onClose();
    router.push('/account');
  };

  const handleContactSupport = () => {
    onClose();
    router.push('/contact-support');
  };

  const handlePrivacy = () => {
    onClose();
    // TODO: Navigate to privacy screen
    console.log('Privacy and cookies');
  };

  const handleLogOut = async () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    setShowLogoutModal(false);
    onClose();
    try {
      await supabase.auth.signOut();
      router.replace('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
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
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <X size={24} color="#000" strokeWidth={1.5} />
            </TouchableOpacity>
          </View>

          {/* Menu Items */}
          <View style={styles.menuContent}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleCreateNew}
              activeOpacity={0.7}
            >
              <ArrowRight size={20} color="#AF52DE" strokeWidth={2} />
              <Text style={styles.menuText}>Create new</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleYourArchive}
              activeOpacity={0.7}
            >
              <ArrowRight size={20} color="#AF52DE" strokeWidth={2} />
              <Text style={styles.menuText}>Your archive</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleAbout}
              activeOpacity={0.7}
            >
              <ArrowRight size={20} color="#AF52DE" strokeWidth={2} />
              <Text style={styles.menuText}>About Reading Partner</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleAccount}
              activeOpacity={0.7}
            >
              <ArrowRight size={20} color="#AF52DE" strokeWidth={2} />
              <Text style={styles.menuText}>Your account</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleContactSupport}
              activeOpacity={0.7}
            >
              <ArrowRight size={20} color="#AF52DE" strokeWidth={2} />
              <Text style={styles.menuText}>Contact and support</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handlePrivacy}
              activeOpacity={0.7}
            >
              <ArrowRight size={20} color="#AF52DE" strokeWidth={2} />
              <Text style={styles.menuText}>Privacy and cookies</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleLogOut}
              activeOpacity={0.7}
            >
              <ArrowRight size={20} color="#AF52DE" strokeWidth={2} />
              <Text style={styles.menuText}>Log out</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
          </View>

          {/* Logout Confirmation Modal */}
          {showLogoutModal && (
            <View style={styles.logoutModalOverlay}>
              <View style={styles.logoutModalContent}>
                <Text style={styles.logoutModalText}>
                  Are you sure you want to log out Reading Partner?
                </Text>
                
                <TouchableOpacity 
                  style={styles.logoutModalButtonNo}
                  onPress={handleCancelLogout}
                  activeOpacity={0.8}
                >
                  <Text style={styles.logoutModalButtonNoText}>No, go back</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.logoutModalButtonYes}
                  onPress={handleConfirmLogout}
                  activeOpacity={0.8}
                >
                  <Text style={styles.logoutModalButtonYesText}>Yes, log out</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 28,
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
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },
  menuText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#AF52DE',
    marginLeft: 16,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#AF52DE',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#AF52DE',
    marginVertical: 4,
  },
  logoutModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoutModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 32,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  logoutModalText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  logoutModalButtonNo: {
    backgroundColor: '#FF3B30',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoutModalButtonNoText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutModalButtonYes: {
    backgroundColor: '#AF52DE',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
  },
  logoutModalButtonYesText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});