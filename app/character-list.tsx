import React, { useEffect, useState } from 'react';
import { 
  View, Text, FlatList, ActivityIndicator, StyleSheet, Image, TextInput, 
  Dimensions, TouchableOpacity, ImageBackground 
} from 'react-native';
import { fetchAvengersAndXMenCharacters } from '../services/marvelApi';
import { getStoredData, storeData } from '../utils/storage';
import { Link } from 'expo-router';

interface MarvelCharacter {
  id: number;
  name: string;
  thumbnail: {
    path: string;
    extension: string;
  };
  description: string;
  event?: string;
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
  const limit = 20;

  const loadMarvelCharacters = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const storedData = await getStoredData('marvel_characters');
      if (storedData?.avengers && storedData?.xmen) {
        setAvengersCharacters(storedData.avengers || []);
        setXmenCharacters(storedData.xmen || []);
      } else {
        const response = await fetchAvengersAndXMenCharacters(offset);
        if (response?.avengers?.data?.results && response?.xmen?.data?.results) {
          const newAvengers = response.avengers.data.results.map((character: MarvelCharacter) => ({
            ...character,
            event: response.avengersEvent,
          }));
          const newXmen = response.xmen.data.results.map((character: MarvelCharacter) => ({
            ...character,
            event: response.xmenEvent,
          }));

          setAvengersCharacters((prev) => [...prev, ...newAvengers]);
          setXmenCharacters((prev) => [...prev, ...newXmen]);

          storeData('marvel_characters', { avengers: [...avengersCharacters, ...newAvengers], xmen: [...xmenCharacters, ...newXmen] });

          setOffset((prev) => prev + limit);
          setHasMore(newAvengers.length === limit || newXmen.length === limit);
        } else {
          setHasMore(false);
        }
      }
    } catch (err) {
      setError('Failed to fetch Marvel characters.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCharacters = [...avengersCharacters, ...xmenCharacters]
    .filter((character, index, self) => self.findIndex(c => c.id === character.id) === index)
    .sort((a, b) => a.name.localeCompare(b.name));

  useEffect(() => {
    loadMarvelCharacters();
  }, [offset]);

  if (loading && filteredCharacters.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#E62429" />
        <Text style={styles.loadingText}>Loading Marvel characters...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const renderCharacterItem = ({ item }: { item: MarvelCharacter }) => {
    const imageUrl = `${item.thumbnail.path}.${item.thumbnail.extension}`;

    return (
      <Link href={`/character/${item.id}`} asChild>
        <TouchableOpacity style={styles.card}>
          <Image source={{ uri: imageUrl }} style={styles.image} />
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.event}>{item.event}</Text>
        </TouchableOpacity>
      </Link>
    );
  };

  return (
    <ImageBackground 
      source={require('../assets/images/marvelbg.jpg')} 
      style={styles.backgroundImage}
    >
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
          data={filteredCharacters.filter(character =>
            character?.name?.toLowerCase()?.includes(searchQuery.toLowerCase())
          )}
          key={numColumns}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCharacterItem}
          numColumns={numColumns}
          onEndReached={() => {
            if (!loading && hasMore) loadMarvelCharacters();
          }}
          onEndReachedThreshold={0.5}
        />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    overflow: 'hidden',
    width: '100%',
  },
  container: {
    flex: 1,
    padding: 16,
    
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ddd',
    color: '#fff',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 8,
    color: '#fff',
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'black',
    marginTop: 10,
  },
  errorText: {
    color: '#ff5555',
  },
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: '#ffff',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 150,
    marginBottom: 8,
    borderRadius: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'black',
  },
  event: {
    fontSize: 12,
    textAlign: 'center',
    color: 'black',
  },
});

export default CharacterList;
