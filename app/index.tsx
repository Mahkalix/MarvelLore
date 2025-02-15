import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Image, TouchableOpacity, Animated, ImageBackground, Platform } from 'react-native';
import { Link } from 'expo-router';

export default function Index() {
  const [glowAnimation] = useState(new Animated.Value(0)); // Valeur initiale de l'animation (opacité du glow)
  const [showButton, setShowButton] = useState(true); // Gère l'affichage du bouton de clic

  // Fonction pour démarrer l'animation de glow
  useEffect(() => {
    if (showButton) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnimation, {
            toValue: 1, // L'effet de glow devient visible
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnimation, {
            toValue: 0, // L'effet de glow disparaît
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [showButton]);

  const toggleButton = () => {
    setShowButton(false); // Le bouton disparaît après le clic
  };

  return (
    <View style={styles.webWrapper}>
      <ImageBackground 
        source={require('../assets/images/marvelbg.jpg')} 
        style={styles.background}
        resizeMode="cover" 
      >
        <View style={styles.container}>
          <Image
            source={require('../assets/images/marvel.png')}
            style={styles.logo}
          />
          <Text style={styles.title}>Welcome to the Marvel Universe</Text>
          <Text style={styles.description}>
            Dive into the world of Marvel characters, events, and epic stories.
          </Text>

          {/* Le bouton animé avec glow */}
          {showButton && (
            <Animated.View
              style={[
                styles.toggleButton,
                {
                  shadowColor: '#e62429', // Couleur du glow
                  shadowOffset: { width: 0, height: 0 },
                  shadowRadius: 10,
                  shadowOpacity: glowAnimation, // Animation de l'opacité du glow
                  elevation: 10,
                },
              ]}
            >
              <TouchableOpacity onPress={toggleButton}>
                <Text style={styles.toggleButtonText}>
                  Click to explore Avengers and X-Men
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {!showButton && <Link href="/character-list" style={styles.button}></Link>}
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  webWrapper: {
    flex: 1,
    ...Platform.select({
      web: {
        maxWidth: 500, // Set the max width to simulate a mobile device
        marginHorizontal: 'auto', // Center the content horizontally
      },
    }),
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
    overflow: 'hidden',
    
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(28, 31, 35, 0.8)', // Un fond sombre semi-transparent pour rappeler l'univers Marvel
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    maxWidth: 500,

  },
  logo: {
    width: 200,
    height: 100,
    marginBottom: 30,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e62429', // Rouge Marvel
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 24,
    textAlign: 'center',
  },
  toggleButton: {
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#e62429',
    borderRadius: 20,
  },
  toggleButtonText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
  button: {
    fontSize: 18,
    color: '#fff',
    textDecorationLine: 'underline',
    borderWidth: 2,
    borderColor: '#e62429',
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 20,
    textAlign: 'center',
  },
});
