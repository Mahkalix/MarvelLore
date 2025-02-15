import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Image, TextInput, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchAvengersAndXMenCharacters } from '../../services/marvelApi';

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
  const [avengersCharacters, setAvengersCharacters] = useState<MarvelCharacter[]>([]);
  const [xmenCharacters, setXmenCharacters] = useState<MarvelCharacter[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [offset, setOffset] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { width } = Dimensions.get('window');
  const numColumns = width > 768 ? 4 : 2;

  const getStoredData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('marvel_characters');
      if (storedData) {
        return JSON.parse(storedData);
      } else if (typeof window !== 'undefined') {
        const storedDataWeb = localStorage.getItem('marvel_characters');
        if (storedDataWeb) {
          return JSON.parse(storedDataWeb);
        }
      }
      return [];
    } catch (error) {
      console.error('Error retrieving stored data', error);
      return [];
    }
  };

  const storeData = async (data: any) => {
    try {
      await AsyncStorage.setItem('marvel_characters', JSON.stringify(data));
      if (typeof window !== 'undefined') {
        localStorage.setItem('marvel_characters', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error storing data', error);
    }
  };

  const loadMarvelCharacters = async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      const storedData = await getStoredData();
      if (storedData?.avengers && storedData?.xmen) {
        setAvengersCharacters(storedData.avengers || []);
        setXmenCharacters(storedData.xmen || []);
      } else {
        const response = await fetchAvengersAndXMenCharacters(offset);
        if (response?.avengers?.data?.results && response?.xmen?.data?.results) {
          const newAvengers = response.avengers.data.results;
          const newXmen = response.xmen.data.results;

          setAvengersCharacters((prev) => [...prev, ...newAvengers]);
          setXmenCharacters((prev) => [...prev, ...newXmen]);

          storeData({ avengers: [...avengersCharacters, ...newAvengers], xmen: [...xmenCharacters, ...newXmen] });

          setOffset((prev) => prev + 20);
          setHasMore(newAvengers.length === 20 || newXmen.length === 20);
        }
      }
    } catch (err) {
      setError('Failed to fetch Marvel characters.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCharacters = [
    ...(avengersCharacters || []),
    ...(xmenCharacters || []),
  ].reduce((acc, current) => {
    if (!acc.find((character) => character.id === current.id)) {
      acc.push(current);
    }
    return acc;
  }, [] as MarvelCharacter[]).sort((a, b) => a.name.localeCompare(b.name));

  useEffect(() => {
    loadMarvelCharacters();
  }, [offset]);

  if (loading && filteredCharacters.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading Marvel characters...</Text>
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
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Marvel characters..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredCharacters?.filter((character) =>
          character?.name?.toLowerCase()?.includes(searchQuery.toLowerCase())
        ) || []}
        key={numColumns}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => {
          const imageUrl = `${item.thumbnail.path}.${item.thumbnail.extension}`;
          return (
            <View style={styles.card}>
              <Image source={{ uri: imageUrl }} style={styles.image} />
              <Text style={styles.name}>{item.name}</Text>
            </View>
          );
        }}
        numColumns={numColumns}
        onEndReached={() => {
          if (!loading && hasMore) loadMarvelCharacters();
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    flex: 1,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: undefined,
    aspectRatio: 1,
    marginBottom: 8,
    borderRadius: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CharacterList;
