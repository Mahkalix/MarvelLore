
import axios from 'axios';
import { MD5 } from 'crypto-js'; // Import MD5 from crypto-js
import { API_KEY, PRIVATE_KEY } from '@env';

const BASE_URL = 'https://gateway.marvel.com/v1/public';

// Function to get the current timestamp as a string
const getTimestamp = () => new Date().getTime().toString();

// Function to generate the MD5 hash required by the Marvel API
const getHash = (ts: string) => MD5(ts + PRIVATE_KEY + API_KEY).toString();

export const fetchCharacters = async (offset = 0, limit = 20) => {
  const ts = getTimestamp();
  const hash = getHash(ts); // Generate the hash for authentication

  try {
    const response = await axios.get(`${BASE_URL}/characters`, {
      params: {
        ts,
        apikey: API_KEY,
        hash, // Include the hash for authentication
        offset,
        limit,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching Marvel characters:', error);
    throw error;
  }
};
declare module '@env' {
  export const API_KEY: string;
  export const PRIVATE_KEY: string;
}
