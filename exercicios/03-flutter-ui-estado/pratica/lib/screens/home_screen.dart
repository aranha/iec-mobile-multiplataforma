// lib/screens/home_screen.dart
//
// A lista já está pronta (usa o MovieCard).
// Ex2 (TASK 5): contador de favoritos no header.
// Ex2 (TASK 6): botão "limpar" favoritos.
// Ex5 (TASK 8): banner com Remote Config.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../state/favorites.dart';
import '../services/remote_config.dart';
import '../theme/app_theme.dart';
import '../widgets/movie_list.dart';
import '../widgets/offline_banner.dart';
import '../widgets/offline_toggle.dart';

// ConsumerStatefulWidget (e não ConsumerWidget): o banner do Remote Config é buscado UMA vez no
// initState. Num ConsumerWidget o Future seria recriado a cada rebuild — ou seja, a cada favorito.
class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  late final Future<String> _banner;

  @override
  void initState() {
    super.initState();
    _banner = fetchBannerMessage(); // TASK 8
  }

  @override
  Widget build(BuildContext context) {
    final count = ref.watch(favoritesProvider).length; // TASK 5: mesma fonte que o card usa

    return Scaffold(
      appBar: AppBar(
        title: const Text('Filmes'),
        actions: [
          const OfflineToggle(), // modo avião simulado (pronto)
          // TASK 6: limpar — escreve no mesmo provider; card e contador reagem sozinhos
          IconButton(
            tooltip: 'Limpar favoritos',
            icon: const Icon(Icons.delete_outline),
            onPressed: () => ref.read(favoritesProvider.notifier).clear(),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Center(child: Text('♥ $count')),
          ),
        ],
      ),
      body: Column(
        children: [
          const OfflineBanner(), // TASK 11 — aviso de offline
          // TASK 8: banner com o texto do Remote Config (muda no console, sem novo deploy)
          FutureBuilder<String>(
            future: _banner,
            builder: (context, snap) {
              final msg = snap.data;
              if (msg == null || msg.isEmpty) return const SizedBox.shrink();
              return Container(
                width: double.infinity,
                margin: const EdgeInsets.fromLTRB(16, 8, 16, 8),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  gradient: AppColors.brandGradient,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Text(
                  msg,
                  style: const TextStyle(fontWeight: FontWeight.w600, color: Colors.white),
                ),
              );
            },
          ),
          const Expanded(child: MovieList()), // lista vinda do repositório (cache-first)
        ],
      ),
    );
  }
}
