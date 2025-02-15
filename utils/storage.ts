import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const getStoredData = async (key: string) => {
  try {
    const storedData = await AsyncStorage.getItem(key);
    if (storedData) {
      return JSON.parse(storedData);
    } else if (Platform.OS === 'web') {
      const storedDataWeb = localStorage.getItem(key);
      if (storedDataWeb) {
        return JSON.parse(storedDataWeb);
      }
    }
    return null;
  } catch (error) {
    console.error('Error retrieving stored data', error);
    return null;
  }
};

export const storeData = async (key: string, data: any) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
    if (Platform.OS === 'web') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  } catch (error) {
    console.error('Error storing data', error);
  }
};
