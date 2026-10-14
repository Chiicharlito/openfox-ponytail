# Provenance et adaptations

Ponytail est créé par DietrichGebert et distribué sous licence MIT.
Version embarquée : **5.1.0**, tag `v5.1.0`, commit
[`9cc65d03aa2da1db7121b912d03596409ee340b8`](https://github.com/DietrichGebert/ponytail/tree/9cc65d03aa2da1db7121b912d03596409ee340b8).

`vendor/ponytail/` conserve sans modification les six `skills/*/SKILL.md`,
`hooks/ponytail-instructions.js`, `hooks/ponytail-config.js`, `package.json`,
le benchmark `benchmarks/results/2026-10-07-agentic.md` et `LICENSE` de ce commit.
Le manifeste de hashes `vendor/SHA256SUMS` permet de contrôler ces copies.
La licence MIT et son copyright sont conservés dans `vendor/ponytail/LICENSE` et `LICENSE`.
L'adaptateur Openfox est également distribué sous MIT.

Adaptations dans `resources/` et `src/` :

- Retrait du frontmatter pour les prompts Openfox.
- Port TypeScript de la sélection des lignes par niveau, comparé à l'implémentation amont dans les tests.
- Remplacement des instructions d'activation, d'arrêt et de changement de niveau par les réglages natifs Openfox.
- Aide réécrite pour Openfox ; `/ponytail` affiche cette aide sans modifier le niveau.
- Diagnostics conservés comme rapports ; aucune écriture automatique du registre de dette.
- Lien immuable vers le benchmark et précision que ses chiffres ne mesurent pas Openfox.

Le code de configuration et les hooks amont sont archivés pour la provenance et les tests,
mais ne sont pas exécutés par le plugin. Les ressources sont embarquées ; aucune récupération au démarrage.
Cette intégration communautaire ne revendique pas l'aval de l'auteur de Ponytail.
