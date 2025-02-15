import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="+not-found" />
      <Stack.Screen name="index" options={{ headerShown: false }}/>
      <Stack.Screen name="character-list" options={{ title: 'Marvel Characters' }} />
    </Stack>
  );
}
