import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Image, StyleSheet, ScrollView, TextInput } from 'react-native';
import { useLocalSearchParams } from 'expo-router'; // Pour récupérer les paramètres d'URL
import { fetchAvengersAndXMenCharacters } from '../../services/marvelApi'; 
import { getStoredData, storeData } from '../../utils/storage'; // Import storage utility
import { MarvelCharacter } from './types'; 

interface Url {
  type: string;
  url: string;
}

interface CharacterImage {
  path: string;
  extension: string;
}

interface ResourceList {
  available: number;
  collectionURI: string;
  items: Array<{ resourceURI: string; name: string }>;
  returned: number;
}

interface LocalMarvelCharacter {
  id: number;
  name: string;
  description: string;
  modified: Date;
  resourceURI: string;
  urls: Url[];
  thumbnail: CharacterImage;
  comics: ResourceList;
  stories: ResourceList;
  events: ResourceList;
  series: ResourceList;
  event?: string; // Added event property
}

const CharacterDetail = () => {
  const { id } = useLocalSearchParams<{ id: string }>(); // Récupère l'ID du personnage depuis les paramètres d'URL
  const [character, setCharacter] = useState<LocalMarvelCharacter | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  // State pour la recherche dans chaque catégorie
  const [searchComics, setSearchComics] = useState('');
  const [searchStories, setSearchStories] = useState('');
  const [searchEvents, setSearchEvents] = useState('');
  const [searchSeries, setSearchSeries] = useState('');

  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        const storedCharacter = await getStoredData(`marvel_character_${id}`);
        if (storedCharacter) {
          setCharacter(storedCharacter);
          setLoading(false);
          return;
        }

        const response = await fetchAvengersAndXMenCharacters(); // Appel API
        const avengers = response.avengers.data.results;
        const xmen = response.xmen.data.results;
        const foundCharacter = [...avengers, ...xmen].find((character) => character.id.toString() === id);
        
        if (foundCharacter) {
          setCharacter(foundCharacter); // Si personnage trouvé, le mettre dans l'état
          storeData(`marvel_character_${id}`, foundCharacter);
        } else {
          setError('Personnage introuvable.');
        }
      } catch (err) {
        console.error(err);
        setError('Erreur lors du chargement du personnage.');
      } finally {
        setLoading(false);
      }
    };

    fetchCharacter();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
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

  if (!character) return null;

  const imageUrl = `${character.thumbnail.path}.${character.thumbnail.extension}`;

  // Fonction de filtrage pour chaque catégorie
  const filterItems = (items: Array<{ name: string; resourceURI: string }>, searchTerm: string) => {
    return items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: imageUrl }} style={styles.image} />
      <Text style={styles.modified}>Modified: {new Date(character.modified).toLocaleDateString()}</Text>
      <Text style={styles.name}>{character.name}</Text>
      <Text style={styles.event}>{character.event}</Text>
      <Text style={styles.description}>
        {character.description ? character.description : 'Pas de description disponible.'}
      </Text>

      {/* Comics */}
      <View style={styles.section}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Comics..."
          value={searchComics}
          onChangeText={setSearchComics}
        />
        <Text style={styles.sectionTitle}>Comics ({character.comics.available}):</Text>
        {filterItems(character.comics.items, searchComics).map((comic) => (
          <View key={comic.resourceURI} style={styles.item}>
            <Text style={styles.itemTitle}>{comic.name}</Text>
          </View>
        ))}
      </View>

      {/* Stories */}
      <View style={styles.section}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Stories..."
          value={searchStories}
          onChangeText={setSearchStories}
        />
        <Text style={styles.sectionTitle}>Stories ({character.stories.available}):</Text>
        {filterItems(character.stories.items, searchStories).map((story) => (
          <View key={story.resourceURI} style={styles.item}>
            <Text style={styles.itemTitle}>{story.name}</Text>
          </View>
        ))}
      </View>

      {/* Events */}
      <View style={styles.section}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Events..."
          value={searchEvents}
          onChangeText={setSearchEvents}
        />
        <Text style={styles.sectionTitle}>Events ({character.events.available}):</Text>
        {filterItems(character.events.items, searchEvents).map((event) => (
          <View key={event.resourceURI} style={styles.item}>
            <Text style={styles.itemTitle}>{event.name}</Text>
          </View>
        ))}
      </View>

      {/* Series */}
      <View style={styles.section}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Series..."
          value={searchSeries}
          onChangeText={setSearchSeries}
        />
        <Text style={styles.sectionTitle}>Series ({character.series.available}):</Text>
        {filterItems(character.series.items, searchSeries).map((series) => (
          <View key={series.resourceURI} style={styles.item}>
            <Text style={styles.itemTitle}>{series.name}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f4f4f7',
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f7',
  },
  image: {
    width: 280,
    height: 280,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  name: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 10,
    color: '#2e2e2e',
  },
  event: {
    fontSize: 18,
    fontStyle: 'italic',
    marginBottom: 12,
    color: '#7e7e7e',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
    marginBottom: 20,
    lineHeight: 24,
  },
  modified: {
    fontSize: 14,
    marginTop: 12,
    color: '#888',
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
    marginBottom: 15,
    width: '100%',
  },
  section: {
    marginTop: 20,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10, 
    color: '#2e2e2e',
  },
  item: {
    marginBottom: 10,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e2e2e',
  },
});

export default CharacterDetail;
