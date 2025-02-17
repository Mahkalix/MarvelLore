import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Platform, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Fonction pour valider les champs
  const validateInputs = () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Erreur', 'Adresse email invalide');
      return false;
    }
    return true;
  };

  // Fonction pour gérer la connexion
  const handleLogin = async () => {
    if (!validateInputs()) return;

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:4000/login', {  // Remplace par ton URL d'API
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      setIsLoading(false);

      if (response.ok) {
        // Stocker le token dans AsyncStorage
        await AsyncStorage.setItem('authToken', data.token);
        Alert.alert('Succès', 'Connexion réussie');
        router.push('/character-list'); // Page d'accueil après connexion
      } else {
        Alert.alert('Erreur', data.error || 'Échec de la connexion');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setIsLoading(false);
      Alert.alert('Erreur', 'Une erreur est survenue');
    }
  };

  return (
    <View style={styles.webWrapper}>
      <ImageBackground source={require('../assets/images/marvelbg.jpg')} style={styles.background} resizeMode="cover">
        <View style={styles.container}>
          <Text style={styles.title}>Connexion</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Se connecter</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={styles.registerLink}>Pas de compte ? S'inscrire</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  webWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
    overflow: 'hidden',
    width: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(28, 31, 35, 0.8)',
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#fff',
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
    ...Platform.select({
      web: {
        width: '20%',
      },
    }),
  },
  button: {
    width: '100%',
    padding: 12,
    backgroundColor: '#e62429',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
    ...Platform.select({
      web: {
        width: '20%',
      },
    }),
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerLink: {
    color: '#fff',
    marginTop: 10,
    textDecorationLine: 'underline',
  },
});
