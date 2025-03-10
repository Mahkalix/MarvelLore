import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput } from 'react-native';
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

const Account = () => {
  const router = useRouter();
  const [favoriteCharacter, setFavoriteCharacter] = useState<string | null>(null);
  const [characterImage, setCharacterImage] = useState<string | null>(null);
  const [marvelCharacters, setMarvelCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [password, setPassword] = useState<string>('');

  const defaultImage = require('../assets/images/marvel.png');  // Default image path

  // Function to fetch the favorite character of the user
  const fetchFavoriteCharacter = async () => {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    const userId = 1; // Placeholder user ID, replace with actual user ID if needed
    try {
      const response = await fetch(`http://localhost:4000/user/favorite-character/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setFavoriteCharacter(data.favoriteCharacter);
      setCharacterImage(data.characterImage || defaultImage);  // Default image if no image exists
    } catch (error) {
      console.error('Error fetching favorite character:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch Marvel characters
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

  // Function to update favorite character
  const updateFavoriteCharacter = async () => {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    const userId = 1; // Placeholder user ID, replace with actual user ID if needed
    const selectedCharacterData = marvelCharacters.find(
      (char) => char.name === selectedCharacter
    );

    if (selectedCharacterData) {
      const characterImageUrl = `${selectedCharacterData.thumbnail.path}.${selectedCharacterData.thumbnail.extension}`;
      try {
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
      } catch (error) {
        console.error('Error updating favorite character:', error);
      }
    }
  };

  // Function to fetch user info (email, name)
  const fetchUserInfo = async () => {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    const userId = 1; // Placeholder user ID, replace with actual user ID if needed
    try {
      const response = await fetch(`http://localhost:4000/user/info/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setEmail(data.email);
      setName(data.name);
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  // Function to update user info
  const updateUserInfo = async () => {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    const userId = 1; // Placeholder user ID, replace with actual user ID if needed
    try {
      const response = await fetch('http://localhost:4000/user/update-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          email,
          name,
          password,
        }),
      });
      const data = await response.json();
      console.log(data.message);
    } catch (error) {
      console.error('Error updating user info:', error);
    }
  };

  // Function to pick an image for the character
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setCharacterImage(result.assets[0].uri); // Set picked image
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchFavoriteCharacter();
    fetchMarvelCharacters();
    fetchUserInfo();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account</Text>
      <View style={styles.favoriteContainer}>
        <Text style={styles.favoriteText}>Favorite Character</Text>
        <Image
          source={characterImage ? { uri: characterImage } : defaultImage}
          style={styles.characterImage}
        />
        <Text style={styles.favoriteText}>{favoriteCharacter || 'No character selected'}</Text>
        <Picker
          selectedValue={selectedCharacter}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedCharacter(itemValue)}
        >
          {marvelCharacters.map((character) => (
            <Picker.Item key={character.id} label={character.name} value={character.name} />
          ))}
        </Picker>
        <TouchableOpacity onPress={updateFavoriteCharacter} style={styles.button}>
          <Text style={styles.buttonText}>Update Favorite Character</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={pickImage} style={styles.button}>
        <Text style={styles.buttonText}>Pick an Image</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={updateUserInfo} style={styles.button}>
        <Text style={styles.buttonText}>Update User Info</Text>
      </TouchableOpacity>
    </View>
  );
};

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

export default Account;
