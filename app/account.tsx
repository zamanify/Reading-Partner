import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Menu } from 'lucide-react-native';
import { router } from 'expo-router';
import HamburgerMenu from '../components/HamburgerMenu';

export default function AccountScreen() {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [currentEmail, setCurrentEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleBack = () => {
    router.back();
  };

  const handleMenuPress = () => {
    setIsMenuVisible(true);
  };

  const handleMenuClose = () => {
    setIsMenuVisible(false);
  };

  const handleCancelSubscription = () => {
    // TODO: Implement subscription cancellation
    console.log('Cancel subscription');
  };

  const handleCancelAccount = () => {
    // TODO: Implement account cancellation
    console.log('Cancel account');
  };

  const handleSubmitChanges = () => {
    // TODO: Implement login info changes
    console.log('Submit changes');
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password');
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

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Content */}
        <View style={styles.content}>
          {/* Your subscription Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your subscription</Text>
            <View style={styles.underline} />
            
            <Text style={styles.subscriptionText}>
              You have an active subscription and pay 9 kr, €1, $1 or £1 per month, depending on where you live. You can unsubscribe whenever you want on Apple Store.
            </Text>
            
            <Text style={styles.subscriptionText}>
              Upon unsubscribing the service stays active until the end of the month. However, your account stays active without access to the services. If you wish to remove the account you need to do so separately below, deleting the app isn't enough.
            </Text>
            
            <Text style={styles.subscriptionHighlight}>
              But, are you sure? It's not expensive and quite useful. Don't you agree?
            </Text>
            
            <TouchableOpacity 
              style={styles.cancelSubscriptionButton}
              onPress={handleCancelSubscription}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelSubscriptionText}>Cancel subscription</Text>
            </TouchableOpacity>
          </View>

          {/* Your account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your account</Text>
            <View style={styles.underline} />
            
            <Text style={styles.accountText}>
              When you click the button below you cancel and remove the account. But you can easily reactivate it by logging in anytime within three months. However, after three months it's deleted entirely.
            </Text>
            
            <Text style={styles.accountText}>
              Please note that the subscription goes through Apple so in order to stop paying you need to cancel the service with them.
            </Text>
            
            <TouchableOpacity 
              style={styles.cancelAccountButton}
              onPress={handleCancelAccount}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelAccountText}>Cancel account</Text>
            </TouchableOpacity>
          </View>

          {/* Your login info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your login info</Text>
            <View style={styles.underline} />
            
            <View style={styles.formContainer}>
              <Text style={styles.inputLabel}>Current registered email*</Text>
              <TextInput
                style={styles.input}
                placeholder="E.g. name.lastname@maildomain.com"
                value={currentEmail}
                onChangeText={setCurrentEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              
              <Text style={styles.inputLabel}>Current password*</Text>
              <TextInput
                style={styles.input}
                placeholder="At least six characters and one number"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
              
              <Text style={styles.inputLabel}>New email (leave blank to use current)</Text>
              <TextInput
                style={styles.input}
                placeholder="E.g. name.lastname@maildomain.com"
                value={newEmail}
                onChangeText={setNewEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              
              <Text style={styles.inputLabel}>New password*</Text>
              <TextInput
                style={styles.input}
                placeholder="At least six characters and one number"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
              
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleSubmitChanges}
                activeOpacity={0.8}
              >
                <Text style={styles.submitButtonText}>Submit changes</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.forgotPasswordButton}
                onPress={handleForgotPassword}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotPasswordText}>I've forgotten my password</Text>
              </TouchableOpacity>
            </View>
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
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  underline: {
    width: '100%',
    height: 2,
    backgroundColor: '#000',
    marginBottom: 24,
  },
  subscriptionText: {
    fontSize: 16,
    color: '#000',
    lineHeight: 24,
    marginBottom: 16,
  },
  subscriptionHighlight: {
    fontSize: 16,
    color: '#000',
    lineHeight: 24,
    marginBottom: 24,
    fontWeight: '600',
  },
  cancelSubscriptionButton: {
    backgroundColor: '#AF52DE',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 8,
  },
  cancelSubscriptionText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  accountText: {
    fontSize: 16,
    color: '#000',
    lineHeight: 24,
    marginBottom: 16,
  },
  cancelAccountButton: {
    backgroundColor: '#AF52DE',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 8,
  },
  cancelAccountText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  formContainer: {
    gap: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#374151',
  },
  submitButton: {
    backgroundColor: '#AF52DE',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  forgotPasswordButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  forgotPasswordText: {
    color: '#AF52DE',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});