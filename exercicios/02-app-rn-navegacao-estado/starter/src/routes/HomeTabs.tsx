// src/routes/HomeTabs.tsx
//
// ATIVIDADE 2 — bônus Bottom Tabs (Filmes + Favoritos).
// Fica DENTRO do RootStack: o Detail continua no Stack e abre por cima das abas.
// Doc: https://reactnavigation.org/docs/bottom-tab-navigator

import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MovieList from '@/screens/MovieList';
import FavoritesList from '@/screens/FavoritesList';
import { useFavoritesStore } from '@/store/favoritesStore';

export type HomeTabsParamList = {
  Movies: undefined;
  Favorites: undefined;
};

const Tab = createBottomTabNavigator<HomeTabsParamList>();

export default function HomeTabs() {
  const favCount = useFavoritesStore((s) => s.ids.length);

  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Movies"
        component={MovieList}
        options={{
          title: 'Filmes',
          tabBarIcon: ({ size }) => <Text style={{ fontSize: size - 4 }}>🎬</Text>,
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesList}
        options={{
          title: 'Favoritos',
          tabBarIcon: ({ size }) => <Text style={{ fontSize: size - 4 }}>❤️</Text>,
          tabBarBadge: favCount > 0 ? favCount : undefined,
        }}
      />
    </Tab.Navigator>
  );
}
