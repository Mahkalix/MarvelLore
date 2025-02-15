import { Tabs } from 'expo-router';

export default function RootLayout() {
  return (
    <Tabs>
      {/* Onglet principal */}
      <Tabs.Screen 
        name="(tabs)" 
        options={{ tabBarLabel: 'Home', headerShown: false }} 
      />
      
      <Tabs.Screen 
        name="character-list" 
        options={{ tabBarLabel: 'Characters' }} 
      />
    </Tabs>
  );
}
