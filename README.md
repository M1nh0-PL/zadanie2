# Zadanie 2 – Technologie Chmurowe

**Autor:** Ireneusz Witek

## Opis projektu

Projekt stanowi realizację Zadania 2 z przedmiotu Technologie Chmurowe.

Celem zadania było opracowanie łańcucha CI/CD w usłudze GitHub Actions, który automatycznie buduje obraz kontenera Docker na podstawie aplikacji Node.js przygotowanej w Zadaniu 1, przeprowadza skan bezpieczeństwa oraz publikuje obraz do GitHub Container Registry (GHCR).

## Zastosowane technologie

* Node.js
* Docker
* GitHub Actions
* GitHub Container Registry (GHCR)
* Docker Buildx
* Docker QEMU
* Trivy

## Funkcjonalność pipeline CI/CD

Pipeline realizuje następujące kroki:

1. Pobranie kodu źródłowego z repozytorium GitHub.
2. Logowanie do Docker Hub oraz GitHub Container Registry.
3. Generowanie metadanych i tagów obrazu.
4. Konfiguracja Buildx i QEMU.
5. Budowa lokalnego obrazu Docker.
6. Skanowanie obrazu pod kątem podatności bezpieczeństwa za pomocą Trivy.
7. Budowa obrazu wieloarchitekturowego.
8. Publikacja obrazu do GitHub Container Registry.

## Obsługa wielu architektur

Obraz budowany jest dla dwóch architektur:

* linux/amd64
* linux/arm64

Realizacja została wykonana przy użyciu:

* docker/setup-qemu-action
* docker/setup-buildx-action

## Skanowanie bezpieczeństwa

Do analizy podatności wykorzystano narzędzie Trivy.

Pipeline zostaje zatrzymany, jeśli wykryte zostaną podatności o poziomie:

* HIGH
* CRITICAL

Realizowane jest to poprzez konfigurację:

```yaml
exit-code: '1'
severity: CRITICAL,HIGH
```

Dzięki temu obraz zostanie opublikowany tylko wtedy, gdy przejdzie test bezpieczeństwa.

## Mechanizm cache

W celu skrócenia czasu kolejnych budowań wykorzystano cache przechowywany w publicznym repozytorium Docker Hub.

Wykorzystano:

* backend `registry`
* tryb `mode=max`

Przykładowa konfiguracja:

```yaml
cache-from:
  type=registry

cache-to:
  type=registry,mode=max
```

Dane cache przechowywane są w dedykowanym repozytorium Docker Hub i są automatycznie aktualizowane podczas kolejnych uruchomień pipeline'u.

## Strategia tagowania obrazów

Do automatycznego zarządzania tagami wykorzystano akcję `docker/metadata-action`.

Zastosowano podejście wieloschematowe (**SHA + SemVer**). Obrazy są automatycznie oznaczane zarówno skrótem identyfikatora commita Git, jak i numerem wersji zgodnym z SemVer. Dzięki temu możliwa jest identyfikacja zarówno konkretnej rewizji kodu źródłowego, jak i oficjalnych wydań aplikacji.

### Tag SHA

Tworzony automatycznie dla każdego commita:

```text
sha-<hash_commita>
```

Przykład:

```text
sha-fb01364
```

### Tag SemVer

Tworzony po utworzeniu tagu Git:

```text
v1.0.0
```

Po wypchnięciu tagu:

```bash
git tag v1.0.0
git push origin v1.0.0
```

workflow automatycznie publikuje obraz oznaczony numerem wersji.

## Repozytorium obrazu

Obraz publikowany jest do GitHub Container Registry:

```text
ghcr.io/m1nh0-pl/zadanie2-obraz
```

Przykład pobrania obrazu:

```bash
docker pull ghcr.io/m1nh0-pl/zadanie2-obraz:1.0.0
```

## Potwierdzenie działania

Workflow GitHub Actions został uruchomiony poprawnie dla:

* gałęzi `main`,
* tagu `v1.0.0`.

W wyniku działania pipeline obraz został opublikowany do GitHub Container Registry wraz z tagami SHA oraz SemVer.

## Źródła

* GitHub Actions Documentation: https://docs.github.com/actions
* Docker Build Documentation: https://docs.docker.com/build/
* Trivy Action: https://github.com/aquasecurity/trivy-action
* Docker Metadata Action: https://github.com/docker/metadata-action
