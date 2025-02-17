import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="+not-found" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="character-list" options={{ title: 'Avengers and X-Men Characters', headerStyle: { backgroundColor: '#e62429' }, headerTintColor: '#ffffff' }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="character/[id]" options={{ title: 'Character Details', headerStyle: { backgroundColor: '#e62429' }, headerTintColor: '#ffffff' }} />
    </Stack>
  );
}
