import axios from 'axios';
import { MD5 } from 'crypto-js'; // Import MD5 from crypto-js
import { API_KEY, PRIVATE_KEY } from '@env';

const BASE_URL = 'https://gateway.marvel.com/v1/public/events';

// Fonction pour obtenir le timestamp actuel
const getTimestamp = () => new Date().getTime().toString();

// Fonction pour générer le hash MD5 nécessaire pour l'authentification
const getHash = (ts: string) => MD5(ts + PRIVATE_KEY + API_KEY).toString();

// Fonction pour récupérer les personnages associés à l'événement Avengers
export const fetchAvengersCharacters = async (offset = 0, limit = 20) => {
  const ts = getTimestamp();
  const hash = getHash(ts); // Générer le hash pour l'authentification

  try {
    // Première requête pour obtenir les événements
    const eventResponse = await axios.get(`${BASE_URL}`, {
      params: {
        ts,
        apikey: API_KEY,
        hash,
        offset,
        limit,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Loguer la réponse de l'API pour voir ce qui est renvoyé
    console.log('Event Response:', eventResponse.data);

    // Vérifier si des événements sont renvoyés
    if (eventResponse.data.data && eventResponse.data.data.results) {
      // Trouver l'événement Avengers dans la liste
      const avengersEvent = eventResponse.data.data.results.find(event =>
        event.title.toLowerCase().includes('avengers') // Cherche l'événement Avengers
      );

      if (avengersEvent) {
        const avengersEventId = avengersEvent.id;
        console.log('Avengers Event ID:', avengersEventId);

        // Maintenant, on récupère les personnages associés à l'événement Avengers
        const charactersResponse = await axios.get(`${BASE_URL}/${avengersEventId}/characters`, {
          params: {
            ts,
            apikey: API_KEY,
            hash,
            offset,
            limit,
          },
          headers: {
            'Content-Type': 'application/json',
          },
        });

        return charactersResponse.data; // Retourner les personnages associés
      } else {
        throw new Error('Avengers event not found');
      }
    } else {
      throw new Error('No events found or incorrect response format');
    }
  } catch (error) {
    // Loguer les erreurs pour mieux comprendre d'où vient le problème
    console.error('Error fetching Marvel events or characters:', error);
    throw error; // Relancer l'erreur
  }
};
