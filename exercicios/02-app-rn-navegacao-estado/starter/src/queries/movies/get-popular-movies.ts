// src/queries/movies/get-popular-movies.ts
//
// CAMADA QUERIES — gerencia cache + ciclo de vida dos dados do servidor.
// "Como gerenciar o ciclo de vida dos dados"
//
// HANDS-ON AULA 2 — Passo 4 (TanStack Query)
//
// Doc TanStack: https://tanstack.com/query/latest/docs/framework/react/overview
//
// Conceitos:
// - queryKey = identidade do cache (TanStack dedupe + invalidate por essa key)
// - queryFn = função pura que retorna Promise<dados>
// - staleTime = quanto tempo cache fica fresco antes de refetch background

import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import type { MoviesResponse } from '@/types/movie';

const fetchPopularMovies = async (page = 1) => {
  const res = await api.get<MoviesResponse>('/movie/popular', { params: { page } });
  return res.data;
};

// TASK 10 (bônus) — paginação infinita.
// Cada página é uma entrada em data.pages; a próxima é pedida pelo
// fetchNextPage() quando a FlatList chega no fim (onEndReached).
export const usePopularMovies = () =>
  useInfiniteQuery({
    queryKey: ['movies', 'popular'],
    queryFn: ({ pageParam }) => fetchPopularMovies(pageParam),
    initialPageParam: 1,
    // TMDB devolve page/total_pages; undefined = acabou (hasNextPage false)
    getNextPageParam: (last) => (last.page < last.total_pages ? last.page + 1 : undefined),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
