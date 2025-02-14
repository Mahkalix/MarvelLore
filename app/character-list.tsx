import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Image, TextInput, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { fetchCharacters } from '../services/marvelApi';

interface MarvelCharacter {
  id: number;
  name: string;
  thumbnail: {
    path: string;
    extension: string;
  };
  description: string;
}

const CharacterList: React.FC = () => {
  const [characters, setCharacters] = useState<MarvelCharacter[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [offset, setOffset] = useState<number>(0); // Pagination offset
  const [hasMore, setHasMore] = useState<boolean>(true); // More characters to load
  const [searchQuery, setSearchQuery] = useState<string>(''); // Search query

  // Load characters either from file, localStorage, or API
  const loadCharacters = async () => {
    if (loading || !hasMore) return; // Prevent multiple fetches or unnecessary loading

    setLoading(true);

    try {
      if (Platform.OS !== 'web') {
        const filePath = FileSystem.documentDirectory + 'marvelCharacters.json';

        const fileExists = await FileSystem.getInfoAsync(filePath);
        if (fileExists.exists) {
          const fileContent = await FileSystem.readAsStringAsync(filePath);
          const charactersData = JSON.parse(fileContent);
          setCharacters(charactersData);
        } else {
          loadPageCharacters();
        }
      } else {
        const storedCharacters = localStorage.getItem('marvelCharacters');
        if (storedCharacters) {
          const charactersData = JSON.parse(storedCharacters);
          setCharacters(charactersData);
        } else {
          loadPageCharacters();
        }
      }
    } catch (err) {
      setError('Failed to fetch characters.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch next page of characters from the API
  const loadPageCharacters = async () => {
    try {
      const response = await fetchCharacters(offset);
      if (response?.data?.results) {
        const newCharacters = response.data.results;
        setCharacters((prev) => [...prev, ...newCharacters]);
        setOffset((prev) => prev + 20); // Update offset for pagination
        setHasMore(newCharacters.length === 20); // Check if there are more characters
      }
    } catch (err) {
      setError('Failed to fetch characters.');
    }
  };

  // Filter characters by search query
  const filteredCharacters = characters.filter((character) =>
    character.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Load characters when component mounts or when offset changes
  useEffect(() => {
    loadCharacters();
  }, [offset]);

  if (loading && characters.length === 0) {
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
      {/* Search bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search characters..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Display filtered character list */}
      <FlatList
        data={filteredCharacters}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const imageUrl = `${item.thumbnail.path}.${item.thumbnail.extension}`;
          return (
            <View style={styles.card}>
              <Image source={{ uri: imageUrl }} style={styles.image} />
              <Text style={styles.name}>{item.name}</Text>
            </View>
          );
        }}
        onEndReached={() => {
          if (!loading && hasMore) loadCharacters();
        }}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 8,
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
    elevation: 3,
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
