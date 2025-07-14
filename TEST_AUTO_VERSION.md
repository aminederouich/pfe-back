# Test Auto-Versioning System

Ce fichier teste le nouveau système d'auto-versioning après merge de PR.

## Fonctionnalités testées
- ✅ Détection automatique du merge PR
- ✅ Analyse des commits conventionnels
- ✅ Mise à jour directe de package.json et package-lock.json
- ✅ Création automatique de tag et release

## Version actuelle
La version actuelle devrait être 1.0.0 et devrait passer à 2.0.0 après le merge de cette PR (car le commit précédent était un BREAKING CHANGE avec feat!).

Date du test: $(date)
