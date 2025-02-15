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


// Fonction pour récupérer les personnages associés à l'événement Avengers
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
      console.log('Avengers Event:', avengersEvent);

      if (avengersEvent) {
        const avengersEventId = avengersEvent.id;
        console.log('Avengers Event ID:', avengersEventId);

        const avengersCharactersResponse = await axios.get(`${BASE_URL}/${avengersEventId}/characters`, {
          params: { ts, apikey: API_KEY, hash, offset, limit },
          headers: { 'Content-Type': 'application/json' },
        });

        const avengersCharacters = avengersCharactersResponse.data;
        console.log('Avengers Characters:', avengersCharacters);

        const xmenEventResponse = await axios.get(`${BASE_URL}`, {
          params: { ts, apikey: API_KEY, hash, offset, limit },
          headers: { 'Content-Type': 'application/json' },
        });

        console.log('X-Men Event Response:', xmenEventResponse.data);

        if (xmenEventResponse.data.data && xmenEventResponse.data.data.results) {
          console.log('All X-Men Events:', xmenEventResponse.data.data.results);

          const xmenEvent = xmenEventResponse.data.data.results.find((event: { title: string }) =>
            event.title.toLowerCase().includes('x-men')
          );
          console.log('X-Men Event:', xmenEvent);

          if (xmenEvent) {
            const xmenEventId = xmenEvent.id;
            console.log('X-Men Event ID:', xmenEventId);

            const xmenCharactersResponse = await axios.get(`${BASE_URL}/${xmenEventId}/characters`, {
              params: { ts, apikey: API_KEY, hash, offset, limit },
              headers: { 'Content-Type': 'application/json' },
            });

            const xmenCharacters = xmenCharactersResponse.data;
            console.log('X-Men Characters:', xmenCharacters);

            return { avengers: avengersCharacters, xmen: xmenCharacters };
          } else {
            throw new Error('X-Men event not found');
          }
        } else {
          throw new Error('No X-Men events found or incorrect response format');
        }
      } else {
        throw new Error('Avengers event not found');
      }
    } else {
      throw new Error('No events found or incorrect response format');
    }
  } catch (error) {
    console.error('Error fetching Marvel events or characters:', error);
    throw error;
  }
};