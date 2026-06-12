// TeacherAssistant / MarkScan — root layout: providers, fonts, themed stack
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Bitter_500Medium, Bitter_700Bold } from '@expo-google-fonts/bitter';
import { Archivo_400Regular, Archivo_500Medium, Archivo_600SemiBold, Archivo_700Bold } from '@expo-google-fonts/archivo';
import { Caveat_700Bold } from '@expo-google-fonts/caveat';
import { AppProvider, useTheme } from '../src/AppState';

SplashScreen.preventAutoHideAsync().catch(() => {});

function ThemedStack() {
  const { c, statusLight } = useTheme();
  return (
    <>
      <StatusBar style={statusLight ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: c.bg },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" options={{ animation: 'fade' }} />
        <Stack.Screen name="scan" options={{ animation: 'slide_from_bottom' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    // Greenboard direction fonts (the chosen default)
    Bitter: Bitter_700Bold,
    Bitter_500Medium,
    Archivo: Archivo_400Regular,
    Archivo_500Medium,
    Archivo_600SemiBold,
    Archivo_700Bold,
    // handwriting on the scanned papers
    Caveat: Caveat_700Bold,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync().catch(() => {});
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <ThemedStack />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
