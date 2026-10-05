// src/queries/movies/get-movie-by-id.ts
//
// CAMADA QUERIES — detalhe de 1 filme.
//
// Doc TanStack: https://tanstack.com/query/latest/docs/framework/react/guides/dependent-queries

import { queryOptions, useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import type { Movie } from '@/types/movie';

const fetchMovieById = async (id: number) => {
  const res = await api.get<Movie>(`/movie/${id}`);
  return res.data;
};

// Options compartilhadas: mesma queryKey/queryFn no hook, no prefetch (MovieCard)
// e no useQueries da aba Favoritos → todos leem/escrevem a mesma entrada de cache.
export const movieByIdQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ['movie', id],
    queryFn: () => fetchMovieById(id),
    enabled: Number.isFinite(id),
    staleTime: 1000 * 60 * 5, // 5min — detalhe de filme muda pouco
  });

// Usado na MovieDetail.
export const useMovieById = (id: number) => useQuery(movieByIdQueryOptions(id));
