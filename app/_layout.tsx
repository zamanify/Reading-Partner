import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import '../global.css';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="create-project" />
        <Stack.Screen name="submit-script" />
        <Stack.Screen name="submit-text" />
        <Stack.Screen name="upload-document" />
        <Stack.Screen name="review-script" />
        <Stack.Screen name="counter-reader" />
        <Stack.Screen name="project-overview" />
        <Stack.Screen name="record-self-tape" />
        <Stack.Screen name="about" />
        <Stack.Screen name="account" />
        <Stack.Screen name="contact-support" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}