// src/components/MovieCard.tsx
//
// CAMADA COMPONENTS — componente reutilizável de card de filme.
// ATIVIDADE 2 — integrar com useFavoritesStore + HeartButton

import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import type { Movie } from '@/types/movie';
import { posterUrl } from '@/utils/poster-url';
import type { RootStackParamList } from '@/routes/RootStack';
import { useFavoritesStore } from '@/store/favoritesStore';
import { movieByIdQueryOptions } from '@/queries/movies/get-movie-by-id';
import HeartButton from './HeartButton';
import { useSwipeGuard } from './SwipeableCard';

type Props = { movie: Movie };

export default function MovieCard({ movie }: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const queryClient = useQueryClient();
  const poster = posterUrl(movie.poster_path, 'w185');

  // Seletores: o card só re-renderiza quando o favorito DESTE filme muda.
  const isFav = useFavoritesStore((s) => s.isFavorite(movie.id));
  const toggle = useFavoritesStore((s) => s.toggle);
  // null fora de um SwipeableCard (ex.: aba Favoritos)
  const swipeGuard = useSwipeGuard();

  return (
    <Pressable
      // Prefetch no início do toque: o detalhe começa a carregar antes da navegação.
      onPressIn={() => queryClient.prefetchQuery(movieByIdQueryOptions(movie.id))}
      onPress={() => {
        // fim de um arrasto (swipe) não conta como toque no card
        if (swipeGuard?.wasSwiping()) return;
        navigation.navigate('Detail', { id: movie.id, title: movie.title });
      }}
      style={styles.card}
    >
      {poster && <Image source={{ uri: poster }} style={styles.poster} />}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {movie.title}
        </Text>
        <Text style={styles.meta}>⭐ {movie.vote_average.toFixed(1)}</Text>
      </View>

      <HeartButton active={isFav} onPress={() => toggle(movie.id)} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  poster: { width: 60, height: 90, borderRadius: 4 },
  info: { flex: 1, gap: 4 },
  title: { fontSize: 16, fontWeight: '600' },
  meta: { color: '#666', fontSize: 12 },
});
