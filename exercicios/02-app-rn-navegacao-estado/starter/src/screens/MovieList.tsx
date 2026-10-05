// src/screens/MovieList.tsx
//
// CAMADA SCREENS — UI pura. Consome queries + components.
// "Screen não deveria saber COMO buscar dados. Só renderiza estados da UI."
//
// HANDS-ON AULA 2 — Passo 5 (FlatList + usePopularMovies)
// ATIVIDADE 2 — usar MovieCard com favoritar

import { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { usePopularMovies } from '@/queries/movies/get-popular-movies';
import { isTokenError, isTokenMissing } from '@/services/api';
import TokenMissingScreen from '@/components/TokenMissingScreen';
import MovieCard from '@/components/MovieCard';
import SwipeableCard from '@/components/SwipeableCard';
import { useFavoritesStore } from '@/store/favoritesStore';

export default function MovieList() {
  const {
    data,
    isLoading,
    isRefetching,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePopularMovies();
  const toggle = useFavoritesStore((s) => s.toggle);
  // Descartados via swipe ← : só nesta sessão (estado local, não persistido).
  const [dismissed, setDismissed] = useState<number[]>([]);

  // Tela amigável quando token TMDB não foi configurado ou está inválido.
  if (isTokenMissing || isTokenError(error)) {
    return <TokenMissingScreen />;
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>Erro: {String(error)}</Text>
      </View>
    );
  }

  // Junta as páginas. A ordem de "popular" muda entre requests, então um filme
  // pode reaparecer na página seguinte — dedupe por id evita key duplicada.
  const seen = new Set<number>();
  const movies = (data?.pages ?? [])
    .flatMap((p) => p.results)
    .filter((m) => !seen.has(m.id) && seen.add(m.id) && !dismissed.includes(m.id));

  return (
    <FlatList
      data={movies}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <SwipeableCard
          onSwipeRight={() => toggle(item.id)}
          onSwipeLeft={() => setDismissed((d) => [...d, item.id])}
        >
          <MovieCard movie={item} />
        </SwipeableCard>
      )}
      onRefresh={refetch}
      // isRefetching (não isLoading): isLoading só é true na 1ª carga, sem cache
      refreshing={isRefetching}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
      }}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isFetchingNextPage ? <ActivityIndicator style={styles.footer} /> : null
      }
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  footer: { padding: 16 },
});
