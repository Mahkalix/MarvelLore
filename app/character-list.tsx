import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Image, TextInput, Dimensions, Platform } from 'react-native';
import { fetchAvengersAndXMenCharacters } from '../services/marvelApi';
import { getStoredData, storeData } from '../utils/storage'; // Import storage utility
import { Link, RelativePathString } from 'expo-router';

interface MarvelCharacter {
  id: number;
  name: string;
  thumbnail: {
    path: string;
    extension: string;
  };
  description: string;
  event?: string; // Added event property
}

const CharacterList: React.FC = () => {
  const [avengersCharacters, setAvengersCharacters] = useState<MarvelCharacter[]>([]);
  const [xmenCharacters, setXmenCharacters] = useState<MarvelCharacter[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [offset, setOffset] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const limit = 20; // Define the limit variable
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { width } = Dimensions.get('window');
  const numColumns = width > 768 ? 4 : 2;

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

  const renderCharacterItem = ({ item, index }: { item: MarvelCharacter, index: number }) => {
    const imageUrl = `${item.thumbnail.path}.${item.thumbnail.extension}`;
    const isLastItem = index === filteredCharacters.length - 1; // Check if it's the last item in the list
    return (
      <Link href={(`/character/${item.id}` as unknown) as RelativePathString} style={styles.card}>
        <Image
          source={{ uri: imageUrl }}
          style={[styles.image, isLastItem && { width: width > 768 ? '25%' : '50%' }]} // Adjust the width for the last image
        />
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.event}>{item.event}</Text>
      </Link>
    );
  };

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
        renderItem={renderCharacterItem}
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
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    textAlign: 'center',
  },
  image: {
    width: '100%', 
    height: 150,
    marginBottom: 8,
    borderRadius: 8,
  },
  name: {
    width: '100%', 
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    display: 'flex',
    justifyContent: 'center',
  },
  event: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    ...Platform.select({
      web: {
        display: 'flex', // Ensure the event is displayed below the title on web
      },
      default: {
        justifyContent: 'center', // Center the event on mobile
      },
    }),
  },
});

export default CharacterList;
