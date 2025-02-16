import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Image, TouchableOpacity, Animated, ImageBackground, Platform } from 'react-native';
import { Link } from 'expo-router';

export default function Index() {
  const [glowAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnimation, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false, 
        }),
        Animated.timing(glowAnimation, {
          toValue: 0,
          duration: 800,
          useNativeDriver: false, 
        }),
      ])
    ).start();
  }, []);

  const animatedGlowStyle = {
    shadowColor: '#e62429',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: glowAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    }),
    shadowRadius: glowAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [4, 15],
    }),
    elevation: glowAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [5, 20],
    }),
  };

  return (
    <View style={styles.webWrapper}>
      <ImageBackground source={require('../assets/images/marvelbg.jpg')} style={styles.background} resizeMode="cover">
        <View style={styles.container}>
          <Image source={require('../assets/images/marvel.png')} style={styles.logo} />
          <Text style={styles.title}>Welcome to the Marvel Universe</Text>
          <Text style={styles.description}>
            Dive into the world of Marvel characters, events, and epic stories.
          </Text>

          {/* Bouton animé avec lien */}
          <Link href="/character-list" asChild>
            <TouchableOpacity>
              <Animated.View style={[styles.toggleButton, animatedGlowStyle]}>
                <Text style={styles.toggleButtonText}>Click to explore Avengers and X-Men</Text>
              </Animated.View>
            </TouchableOpacity>
          </Link>
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
        maxWidth: 500,
        marginHorizontal: 'auto',
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
    backgroundColor: 'rgba(28, 31, 35, 0.8)',
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
    color: '#e62429',
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
    fontWeight: 'bold',
  },
});

