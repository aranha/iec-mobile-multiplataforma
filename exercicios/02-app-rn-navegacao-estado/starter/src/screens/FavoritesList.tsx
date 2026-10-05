// src/screens/FavoritesList.tsx
//
// ATIVIDADE 2 — bônus Bottom Tabs: aba Favoritos.
//
// O store guarda só ids (persistidos no MMKV). Os dados de cada filme vêm do
// TanStack Query via useQueries — mesma queryKey ['movie', id] do detalhe,
// então o que já foi aberto/prefetchado vem direto do cache.

import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useQueries } from '@tanstack/react-query';
import { useFavoritesStore } from '@/store/favoritesStore';
import { movieByIdQueryOptions } from '@/queries/movies/get-movie-by-id';
import { isTokenError } from '@/services/api';
import MovieCard from '@/components/MovieCard';
import TokenMissingScreen from '@/components/TokenMissingScreen';
import type { Movie } from '@/types/movie';

export default function FavoritesList() {
  const ids = useFavoritesStore((s) => s.ids);
  const clear = useFavoritesStore((s) => s.clear);

  const results = useQueries({
    queries: ids.map((id) => movieByIdQueryOptions(id)),
  });

  if (results.some((r) => isTokenError(r.error))) return <TokenMissingScreen />;

  if (ids.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyIcon}>🤍</Text>
        <Text style={styles.emptyText}>Nenhum favorito ainda.</Text>
        <Text style={styles.hint}>Toque no coração ou arraste um filme → na aba Filmes.</Text>
      </View>
    );
  }

  const movies = results.map((r) => r.data).filter((m): m is Movie => !!m);
  const pending = results.filter((r) => r.isLoading).length;
  const failed = results.filter((r) => r.isError).length;

  return (
    <FlatList
      data={movies}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => <MovieCard movie={item} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.hint}>
            {ids.length} favorito(s)
            {failed > 0 ? ` · ${failed} não carregou` : ''}
          </Text>
          <Pressable onPress={clear} style={styles.clearButton}>
            <Text style={styles.clearText}>Limpar todos</Text>
          </Pressable>
        </View>
      }
      ListFooterComponent={pending > 0 ? <ActivityIndicator style={styles.footer} /> : null}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 18, fontWeight: '600' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  hint: { color: '#666', fontSize: 12, textAlign: 'center' },
  clearButton: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, backgroundColor: '#f0f0f0' },
  clearText: { color: '#cc0033', fontWeight: '500' },
  footer: { padding: 16 },
});
