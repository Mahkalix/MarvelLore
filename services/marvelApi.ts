import axios from 'axios';
import { MD5 } from 'crypto-js';
import Constants from 'expo-constants';

const { API_KEY, PRIVATE_KEY } = Constants.expoConfig?.extra || {};

// Vérifier si les variables sont bien récupérées
console.log('API_KEY:', API_KEY);
console.log('PRIVATE_KEY:', PRIVATE_KEY);

const BASE_URL = 'https://gateway.marvel.com/v1/public/events';

// Fonction pour obtenir le timestamp actuel
const getTimestamp = () => new Date().getTime().toString();

// Fonction pour générer le hash MD5 nécessaire pour l'authentification
const getHash = (ts: string) => MD5(ts + PRIVATE_KEY + API_KEY).toString();


// Fonction pour récupérer les personnages associés aux événements Avengers et X-Men
export const fetchAvengersAndXMenCharacters = async (offset = 0, limit = 80) => {
  const ts = getTimestamp();
  const hash = getHash(ts);

  try {
    const eventResponse = await axios.get(`${BASE_URL}`, {
      params: { ts, apikey: API_KEY, hash, offset, limit },
      headers: { 'Content-Type': 'application/json' },
    });

    console.log('Event Response:', eventResponse.data);

    if (eventResponse.data.data && eventResponse.data.data.results) {
      console.log('All Events:', eventResponse.data.data.results);

      const avengersEvent = eventResponse.data.data.results.find((event: { title: string }) =>
        event.title.toLowerCase().includes('avengers')
      );
      const xmenEvent = eventResponse.data.data.results.find((event: { title: string }) =>
        event.title.toLowerCase().includes('x-men')
      );

      if (avengersEvent && xmenEvent) {
        const [avengersCharactersResponse, xmenCharactersResponse] = await Promise.all([
          axios.get(`${BASE_URL}/${avengersEvent.id}/characters`, {
            params: { ts, apikey: API_KEY, hash, offset, limit },
            headers: { 'Content-Type': 'application/json' },
          }),
          axios.get(`${BASE_URL}/${xmenEvent.id}/characters`, {
            params: { ts, apikey: API_KEY, hash, offset, limit },
            headers: { 'Content-Type': 'application/json' },
          }),
        ]);

        const avengersCharacters = avengersCharactersResponse.data;
        const xmenCharacters = xmenCharactersResponse.data;

        console.log('Avengers Characters:', avengersCharacters);
        console.log('X-Men Characters:', xmenCharacters);

        return {
          avengers: avengersCharacters,
          xmen: xmenCharacters,
          avengersEvent: avengersEvent.title,
          xmenEvent: xmenEvent.title,
        };
      } else {
        throw new Error('Avengers or X-Men event not found');
      }
    } else {
      throw new Error('No events found or incorrect response format');
    }
  } catch (error) {
    console.error('Error fetching Marvel events or characters:', error);
    throw error;
  }
};