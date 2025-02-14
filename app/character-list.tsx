import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Image, TextInput } from 'react-native';
import { fetchAvengersCharacters } from '../services/marvelApi'; // Importer la fonction fetchAvengersCharacters

interface MarvelCharacter {
  id: number;
  name: string;
  thumbnail: {
    path: string;
    extension: string;
  };
  description: string;
}

const AvengersCharacterList: React.FC = () => {
  const [characters, setCharacters] = useState<MarvelCharacter[]>([]); // Liste des personnages Avengers
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [offset, setOffset] = useState<number>(0); // Pagination offset
  const [hasMore, setHasMore] = useState<boolean>(true); // Plus de personnages à charger
  const [searchQuery, setSearchQuery] = useState<string>(''); // Query pour la recherche

  // Charger les personnages Avengers
  const loadAvengersCharacters = async () => {
    if (loading || !hasMore) return; // Empêcher les multiples requêtes

    setLoading(true);

    try {
      const response = await fetchAvengersCharacters(offset); // Appeler la fonction pour récupérer les personnages
      if (response?.data?.results) {
        const newCharacters = response.data.results;
        setCharacters((prev) => [...prev, ...newCharacters]); // Ajouter les nouveaux personnages à l'ancienne liste
        setOffset((prev) => prev + 20); // Mettre à jour l'offset pour la pagination
        setHasMore(newCharacters.length === 20); // Vérifier s'il y a encore plus de personnages à charger
      }
    } catch (err) {
      setError('Failed to fetch Avengers characters.');
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les personnages en fonction de la recherche
  const filteredCharacters = characters.filter((character) =>
    character.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Charger les personnages Avengers lors du montage du composant ou lorsqu'il y a un changement d'offset
  useEffect(() => {
    loadAvengersCharacters();
  }, [offset]);

  if (loading && characters.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading Avengers characters...</Text>
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
      {/* Barre de recherche */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search Avengers characters..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Affichage de la liste filtrée des personnages */}
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
          if (!loading && hasMore) loadAvengersCharacters(); // Charger plus de personnages
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

export default AvengersCharacterList;
