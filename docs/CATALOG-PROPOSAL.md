# Proposition locale au catalogue Openfox

Titre de PR proposé : `Add openfox-ponytail community integration`

Description proposée :

> Adds a community integration of Ponytail 5.1.0 using the public Openfox v2 API.
> It injects the selected project level before model calls (full by default),
> offers native persistent lite/full/ultra/off settings, and contributes six
> commands and skills. Diagnostic commands produce reports only.
> Bundled MIT sources include exact upstream provenance. Benchmark figures
> are upstream results, not measured Openfox savings. No Ponytail endorsement is claimed.

Entrée à ajouter à `plugins-registry.json` **après publication du code** :

```json
{
  "name": "openfox-ponytail",
  "displayName": "Ponytail (community)",
  "description": "Ponytail rules with persistent project levels and six diagnostic/help commands. Community integration, MIT.",
  "githubUrl": "https://github.com/Chiicharlito/openfox-ponytail"
}
```

Joindre les résultats de `npm run check` et `npm run test:integration` sous Node 24.21.0,
le lien vers la licence et ATTRIBUTION.md. Vérifier l'installation depuis l'URL GitHub réelle avant envoi.
Dépôt de distribution : https://github.com/Chiicharlito/openfox-ponytail. Aucune PR au catalogue n'a été envoyée. L'inclusion reste à la décision des mainteneurs.
