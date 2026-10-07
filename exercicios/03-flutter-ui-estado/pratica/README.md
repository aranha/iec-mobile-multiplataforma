# Filmes (Flutter) — pratica/ da Atividade 3

App de catálogo de filmes em **Flutter**. Já roda; você completa os scaffolds (UI, estado, Firebase e offline-first) até `flutter test` ficar **verde**.

## Rodar
```bash
cd exercicios/03-flutter-ui-estado/pratica   # confirme: ls lib
flutter pub get
flutter run -d chrome --web-port 5300   # PORTA FIXA (o cache offline fica no navegador, por porta)
# 💡 Atalho no VS Code: aperte F5 (o .vscode/launch.json já fixa a porta 5300)
#    ou Ctrl/Cmd+Shift+B (terminal integrado: r = hot reload) · ./rodar.sh (Mac/Linux) · rodar.bat (Windows)
```

## Testar (é o seu checklist)
```bash
flutter test                         # tudo: Ex1–Ex3 (UI/estado) + offline (TASKs 11–15) + checklist
flutter test test/offline_test.dart  # só offline-first — cada grupo = 1 TASK
flutter analyze                      # precisa ficar limpo
```
Comece com os testes **vermelhos**; deixe-os **verdes**. `test/checklist_test.dart` e `test/offline_test.dart` são a **spec** (não edite).

## O que completar (🧑‍🏫 aula · 🧑‍💻 casa)
| TASK | Arquivo | O quê | |
|---|---|---|---|
| 1 | `lib/widgets/movie_card.dart` | compor o card (título + ⭐ nota + ano) | 🧑‍🏫 |
| 2 | `lib/state/favorites.dart` | `favoritesProvider` (`toggle` + `clear`) | 🧑‍🏫 |
| 3 | `lib/main.dart` | projeto Firebase + `flutterfire configure` | 🧑‍🏫 |
| 10 | `lib/main.dart` | persistência offline do Firestore (1 linha) | 🧑‍🏫 fácil |
| 4 | `lib/widgets/movie_card.dart` | coração favoritando (`ConsumerWidget` + `ref`) | 🧑‍💻 |
| 5 | `lib/screens/home_screen.dart` | contador `♥ N` no header | 🧑‍💻 |
| 6 | `lib/screens/home_screen.dart` | botão **limpar** favoritos | 🧑‍💻 |
| 7 | `lib/state/favorites.dart` | persistir favoritos no **Firestore** | 🧑‍💻 médio |
| 8 | `lib/services/remote_config.dart` + home | banner via **Remote Config** | 🧑‍💻 médio |
| 9 | `test/favorites_test.dart` | **você escreve** um teste do provider | 🧑‍💻 |
| 11 | `lib/widgets/offline_banner.dart` | aviso "você está offline" | 🧑‍💻 fácil |
| 12 | `lib/models/movie.dart` | `toJson` / `fromJson` | 🧑‍💻 fácil |
| 13 | `lib/data/movie_repository.dart` | repositório **cache-first** | 🧑‍💻 médio |
| 14 | `lib/data/movie_repository.dart` | validade do cache (**TTL**) | 🧑‍💻 médio |
| 15 | `lib/data/sync_queue.dart` | **fila de sincronização** (conflitos + flush) | 🧑‍💻 🔴 difícil |

✈️ O botão de **avião** na barra do topo simula o modo offline. Veja o `guia-passo-a-passo.md` e o `enunciado.md` (rubrica).

## Entrega
Fork + PR no repo público; link no Canvas. O **J.A.R.V.I.S.** lê o seu código (estrutural) e posta uma nota **mínima**; a final sai no Canvas.
- ✏️ **Edite os arquivos dentro de `exercicios/03-flutter-ui-estado/pratica/` (no lugar)** — **não crie subpasta** `aluno-.../`.

> **CI no seu fork (opcional):** habilite o *Actions* do fork — o workflow *Flutter test — Atividade 3* roda `flutter analyze` + `flutter test` a cada push.
> **Versões:** precisa de Flutter **3.27+** (o `pubspec` já avisa se for mais antigo).

> **Não comite** `.dart_tool/`, `build/`, `pubspec.lock` (já no `.gitignore`).

## Dados reais do TMDB (opcional)

Sem chave, o app usa a lista simulada (5 filmes). Para filmes reais: copie `.env.local.example` → `.env.local`,
cole sua chave do TMDB (`TMDB_KEY=...`) e rode `./rodar.sh` / `rodar.bat` (ou F5 → "dados reais TMDB").
O `.env.local` não vai pro git. Os testes (`flutter test`) nunca usam a chave.

---

## Entrega — Paulo Aranha

### Como rodar
```bash
cd exercicios/03-flutter-ui-estado/pratica
flutter pub get
flutter run -d chrome --web-port 5300   # ou ./rodar.sh · F5 no VS Code
flutter test                            # 29 testes verdes (Ex1–Ex3 + offline TASKs 11–15 + checklist)
flutter analyze                         # No issues found!
```
O Firebase já vem configurado (`lib/firebase_options.dart`, projeto pessoal `aula-3-flutter`, plano Spark):
os favoritos ficam no documento `favorites/meus-favoritos` do Firestore e o texto do banner vem do
parâmetro `banner_message` do Remote Config.

### Local × cloud × offline-first (trade-offs)
O estado **local** (TASK 2, `Notifier<Set<int>>` em memória) é o mais simples e instantâneo — não depende de rede
nem de latência —, mas fica preso àquela execução: um F5 apaga tudo e nada é compartilhado entre abas ou aparelhos.
O estado **cloud** (TASK 7, Firestore) resolve isso: o documento remoto vira a fonte da verdade, os favoritos
sobrevivem ao reload e aparecem em qualquer dispositivo, ao custo de depender de rede, de lidar com latência
(por isso a atualização é **otimista**: a UI muda na hora e a gravação vai em paralelo) e de configurar regras de acesso.
O **offline-first** (TASKs 10–15) combina os dois: a tela sempre lê primeiro o que está **no aparelho** (cache com TTL,
emitido na hora) e revalida com a rede quando ela existe; as escritas feitas sem conexão entram numa **fila**
persistida que é enviada na ordem quando a rede volta. O preço é complexidade: o dado pode estar **desatualizado**
(consistência eventual) e é preciso decidir regras de conflito — ex.: favoritar e desfavoritar o mesmo filme offline
se cancelam, e o envio para no primeiro erro para não embaralhar a ordem no servidor.

### Prints
**Favorito sobrevivendo ao F5 (Firestore)** — zerado → favorito Matrix e Cidade de Deus → F5: continuam lá.

![favorito após refresh](docs/favorito-refresh.gif)

**Banner vindo do Remote Config** — o texto `(via Remote Config)` vem do parâmetro `banner_message` publicado no console, não do código (o padrão do código é só `Bem-vindo ao app de filmes!`).

![banner remote config](docs/remote-config.png)

**App offline** (✈️ ligado) — banner de offline + lista vinda do cache.

![offline](docs/offline.png)

### Decisões além do modelo do enunciado
- `HomeScreen` é `ConsumerStatefulWidget`: o Remote Config é buscado **uma vez** no `initState`
  (num `ConsumerWidget` o `Future` seria recriado a cada rebuild, ou seja, a cada favorito).
- `fetchBannerMessage()` tem `try/catch` com o texto padrão: sem rede ou no `flutter test` (Firebase não sobe) o banner não quebra a tela.
- Ids lidos do Firestore com `(e as num).toInt()`: na web os números chegam do JavaScript e podem não ser `int` em Dart.
- `Movie.toJson` inclui `posterPath` só quando existe — o pôster dos dados reais do TMDB sobrevive offline e a lista simulada continua com os 4 campos.
