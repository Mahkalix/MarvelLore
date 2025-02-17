import React, { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Vérifie si l'utilisateur a un token valide au montage du composant
  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        setIsAuthenticated(true); // Si un token est trouvé, l'utilisateur est authentifié
      } else {
        setIsAuthenticated(false); // Sinon, il n'est pas authentifié
        router.push('/login'); // Redirige vers la page de login si pas de token
      }
    };

    checkToken();
  }, [router]);

  return (
    <Stack>
      <Stack.Screen name="+not-found" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="character-list"
        options={{
          title: 'Avengers and X-Men Characters',
          headerStyle: { backgroundColor: '#e62429' },
          headerTintColor: '#ffffff',
        }}
        initialParams={{ isAuthenticated }}
      />
      <Stack.Screen
        name="account"
        options={{
          title: 'Account',
          headerStyle: { backgroundColor: '#e62429' },
          headerTintColor: '#ffffff',
        }}
      />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
    </Stack>
  );
}
