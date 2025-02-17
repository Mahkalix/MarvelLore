import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { fetchAvengersAndXMenCharacters } from '../services/marvelApi';

interface Character {
  id: number;
  name: string;
  thumbnail: {
    path: string;
    extension: string;
  };
}

export default function Account() {
  const router = useRouter();
  const [favoriteCharacter, setFavoriteCharacter] = useState<string | null>(null);
  const [characterImage, setCharacterImage] = useState<string | null>(null);
  const [marvelCharacters, setMarvelCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const defaultImage = require('../assets/images/marvel.png');

  const fetchFavoriteCharacter = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const userId = 1; // Replace with actual user ID from token if needed
      const response = await fetch(`http://localhost:4000/user/favorite-character/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      setFavoriteCharacter(data.favoriteCharacter);
      setCharacterImage(data.characterImage || defaultImage);
    } catch (error) {
      console.error('Error fetching favorite character:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMarvelCharacters = async () => {
    try {
      const response = await fetchAvengersAndXMenCharacters();
      const avengers = response.avengers.data.results;
      const xmen = response.xmen.data.results;
      setMarvelCharacters([...avengers, ...xmen]);
    } catch (error) {
      console.error('Error fetching Marvel characters:', error);
    }
  };

  const updateFavoriteCharacter = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const userId = 1; // Replace with actual user ID from token if needed
      const selectedCharacterData = marvelCharacters.find(
        (char) => char.name === selectedCharacter
      );

      if (selectedCharacterData) {
        const characterImageUrl = `${selectedCharacterData.thumbnail.path}.${selectedCharacterData.thumbnail.extension}`;

        const response = await fetch('http://localhost:4000/user/update-favorite-character', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId,
            favoriteCharacter: selectedCharacter,
            characterImage: characterImageUrl,
          }),
        });

        const data = await response.json();
        console.log(data.message);
        setFavoriteCharacter(selectedCharacter);
        setCharacterImage(characterImageUrl);
      }
    } catch (error) {
      console.error('Error updating favorite character:', error);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setCharacterImage(uri);
    }
  };

  useEffect(() => {
    fetchFavoriteCharacter();
    fetchMarvelCharacters();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('authToken');
    router.push('/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account</Text>

      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <View style={styles.favoriteContainer}>
          <TouchableOpacity onPress={pickImage}>
            <Image source={characterImage ? { uri: characterImage } : defaultImage} style={styles.characterImage} />
          </TouchableOpacity>
          <Text style={styles.favoriteText}>
            Favorite Character: {favoriteCharacter}
          </Text>
        </View>
      )}

      <Picker
        selectedValue={selectedCharacter}
        onValueChange={(itemValue) => setSelectedCharacter(itemValue)}
        style={styles.picker}
      >
        {marvelCharacters.map((character) => (
          <Picker.Item key={character.id} label={character.name} value={character.name} />
        ))}
      </Picker>

      <TouchableOpacity style={styles.button} onPress={updateFavoriteCharacter}>
        <Text style={styles.buttonText}>Update Favorite Character</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  favoriteContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  characterImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 10,
  },
  favoriteText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  picker: {
    height: 50,
    width: 250,
    marginBottom: 20,
  },
  button: {
    width: '80%',
    padding: 12,
    backgroundColor: '#e62429',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
