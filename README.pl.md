[🇬🇧 English](./README.md) | 🇵🇱 Polski

# Optymalizacja Trasy

Aplikacja full-stack do rozwiązywania problemu trasowania pojazdów (VRP) z oknami czasowymi (VRPTW), wieloma pojazdami i zgodnością z przepisami UE dotyczącymi czasu pracy kierowców (Rozporządzenie 561/2006). Projekt portfolio stworzony w celu poznania heurystyk optymalizacji trasy, architektury backend/frontend oraz wzorców autoryzacji i bezpieczeństwa na poziomie produkcyjnym.

**Live demo:** [route-optimization-ashy.vercel.app](https://route-optimization-ashy.vercel.app)

## Co robi aplikacja

Na podstawie lokalizacji depot i zestawu punktów dostawy, aplikacja wyznacza near-optymalne trasy dla jednego lub wielu pojazdów, uwzględniając:

- Okna czasowe punktów i czas obsługi każdego przystanku
- Maksymalny dzienny czas pracy
- Przepisy UE dotyczące jazdy/odpoczynku (przerwy przy jeździe ciągłej, dzienny odpoczynek — Faza 1)
- Opcjonalny wymóg powrotu do depot

Aplikacja raportuje całkowity koszt, wykonalność trasy (feasibility), dystans/czas zaoszczędzony względem trasy naiwnej oraz statystyki per pojazd (czas jazdy, czas obsługi, dystans, szacowana cena).

## Stack technologiczny

| Warstwa | Technologia |
|---|---|
| Framework | Next.js 16 (App Router), TypeScript |
| Autoryzacja | Clerk |
| Baza danych | PostgreSQL (Neon) przez Prisma ORM |
| Rate limiting | Upstash Redis (`@upstash/ratelimit`) |
| Formularze i walidacja | react-hook-form, Zod |
| UI | shadcn/ui, Tailwind CSS |
| Mapy | Leaflet, react-leaflet |
| Routing/geokodowanie | OSRM (serwer publiczny), Nominatim (OpenStreetMap) |
| Fetching danych | TanStack Query |
| Testy | Vitest |
| Deployment | Vercel |

## Kluczowe decyzje architektoniczne

- **Izolacja solvera:** silnik optymalizacji (`multiStartSolver` → `nearestNeighborMultiRandom` → `localSearch` z operatorami relocate/swap) operuje wyłącznie na abstrakcyjnych macierzach, punktach i ograniczeniach — nie ma żadnej wiedzy o walucie, jednostkach dystansu, HTTP czy bazie danych. Całe wzbogacanie wyniku (ceny, KPI, zapis do bazy) dzieje się po optymalizacji, w warstwie serwisowej.
- **Warstwowy backend:** Schema/DTO → Repository → Service → Route Handler, z mapperami tłumaczącymi między rekordami z bazy a typami domenowymi.
- **Sprawdzanie właściciela zasobu na każdym endpoincie:** każdy handler API (trasy, punkty, rozwiązania) weryfikuje, że zalogowany użytkownik jest właścicielem zasobu, zanim go odczyta lub zmodyfikuje (ochrona przed IDOR).
- **Rate limiting na endpoincie optymalizacji:** limitowanie typu sliding-window per użytkownik przez Upstash Redis, ponieważ optymalizacja trasy jest najbardziej kosztowną operacją w aplikacji.

Zobacz [`ARCHITECTURE.md`](./ARCHITECTURE.md) po głębszy opis architektury, [`SOLVER.md`](./SOLVER.md) po opis algorytmu optymalizacji oraz [`API.md`](./API.md) po dokumentację endpointów.

## Uruchomienie lokalnie

### Wymagania

- Node.js 20+
- Baza PostgreSQL (np. [Neon](https://neon.tech))
- Konto [Clerk](https://clerk.com) (instancja Development jest wystarczająca do dev)
- Baza Redis na [Upstash](https://upstash.com)

### Konfiguracja

```bash
git clone <repo-url>
cd optymalizacja-trasy
npm install
```

Stwórz `.env.local`:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Baza danych (Neon)
DATABASE_URL=postgresql://...          # połączenie pooled, używane w runtime
DIRECT_URL=postgresql://...            # połączenie direct, używane do migracji

# Rate limiting
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Routing
MATRIX_PROVIDER=osrm
OSRM_URL=http://router.project-osrm.org
```

Uruchom migracje i serwer dev:

```bash
npx prisma migrate dev
npm run dev
```

Aplikacja działa na [http://localhost:3000](http://localhost:3000).

> **Uwaga:** `npm run dev` odpala Next.js z flagą `--webpack`, nie domyślnym Turbopackiem. Projekt trafił na powtarzalny bug, gdzie cache'owanie Turbopacka w dev-mode wchodziło w konflikt z odświeżaniem tokena sesji Clerka, powodując nieskończoną pętlę przekierowań przy logowaniu. Webpack nie ma tego problemu; buildy produkcyjne (`next build` / `next start`) nie są tym objęte niezależnie od tej flagi.

## Znane ograniczenia

- **Publiczny serwer OSRM:** dystanse/czasy routingu są pobierane z darmowego, publicznego serwera demo OSRM, który nie ma SLA i ma nieformalne limity zapytań. Wystarczające dla dema portfolio; wdrożenie produkcyjne wymagałoby własnego hostowanego OSRM albo płatnego providera (np. Mapbox, OpenRouteService).
- **Przepisy UE o czasie jazdy — tylko Faza 1:** zaimplementowane są dzienne limity jazdy, reguła przerwy po 4,5h jazdy ciągłej i dzienny odpoczynek. Limity tygodniowe/dwutygodniowe oraz przerwa dzielona (15+30 min) nie są jeszcze zaimplementowane — patrz roadmap w [`ARCHITECTURE.md`](./ARCHITECTURE.md).
- **Brak synchronizacji użytkownika z lokalną tabelą:** aplikacja traktuje Clerk jako jedyne źródło prawdy o tożsamości użytkownika (`Route.userId` jest zwykłym stringiem, nie foreign key) — nie ma lokalnej tabeli `User` do synchronizacji.

## Testy

```bash
npm run test
```

Testy jednostkowe i integracyjne obejmują komponenty solvera (ewaluatory kosztu, operatory, stan symulacji) na minimalnych, syntetycznych danych — współrzędne są nieistotne dla solvera, bo konsumuje on wyłącznie macierze czasu/dystansu.

## Licencja

Osobisty projekt portfolio — nieudostępniony do ponownego użycia bez zgody.
