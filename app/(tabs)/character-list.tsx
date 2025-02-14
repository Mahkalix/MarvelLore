import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { fetchCharacters } from '../../services/marvelApi'; // Update the import to match the function name

interface MarvelCharacter {
  id: number;
  name: string;
  thumbnail: {
    path: string;
    extension: string;
  };
}

const CharacterList: React.FC = () => {
  const [characters, setCharacters] = useState<MarvelCharacter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadCharacters = async () => {
      try {
        const response = await fetchCharacters();
        console.log('Fetched characters:', response);  // Vérifie la réponse de l'API

        // Vérifie que la réponse contient des personnages
        if (response && response.data && response.data.results) {
          const characters = response.data.results;
          setCharacters(characters);
        } else {
          setError('No characters found.');
        }
      } catch (err) {
        console.error('Error fetching characters:', err);
        setError('Failed to fetch characters.');
      } finally {
        setLoading(false);
      }
    };

    loadCharacters();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading characters...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={characters}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const imageUrl = `${item.thumbnail.path}.${item.thumbnail.extension}`;
          console.log('Image URL:', imageUrl);  // Vérifie l'URL de l'image

          return (
            <View style={styles.card}>
              <Image
                source={{ uri: imageUrl }}
                style={styles.image}
              />
              <Text style={styles.name}>{item.name}</Text>
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    padding: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3, // For Android shadow
  },
  image: {
    width: 50,
    height: 50,
    marginRight: 16,
    borderRadius: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    alignSelf: 'center',
  },
});

export default CharacterList;
