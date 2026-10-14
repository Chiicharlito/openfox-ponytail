# Validation locale — 12 octobre 2026

Environnement : macOS arm64, Node **24.21.0**, npm **11.19.0**, paquet npm Openfox **2.0.161**.
Le Node 22 du poste n'a pas servi aux validations. Le binaire Node 24 a été installé dans `/tmp`.
Les projets voisins et la configuration Openfox habituelle n'ont pas été modifiés.

## Cycle de développement

1. Dossier initial vide : création du socle TypeScript et d'un test du manifeste public v2.
2. Référence verte : build, un test, types et lint.
3. Huit tests de comportement ajoutés et exécutés en échec (`register` absent).
4. Implémentation puis tests verts.
5. Le test Openfox réel révèle que `registry.context` n'est accessible que pendant `register`.
   Ajout de cette contrainte au registre de test, échec constaté, puis correction en conservant
   le contexte pendant l'enregistrement. Réglages toujours relus à chaque appel.

## Contrôles

| Contrôle | Résultat |
| --- | --- |
| `npm run build` | ESM et déclarations générés par `tsc`. |
| `npm test` | 11 tests : contrat, provenance, équivalence amont des niveaux, contributions, défaut full, préservation, trois niveaux, changements/isolation/off/idempotence, réglage invalide, ressource manquante. |
| `npm run typecheck` | Réussi contre les types du paquet Openfox 2.0.161. |
| `npm run lint` | Zéro erreur, zéro warning. |
| `npm run test:integration` | Instance Openfox réelle, paquet construit extrait dans son répertoire de plugins temporaire. |
| `npm pack` | Archive distribuable avec ESM, ressources, attribution et licence. |

Le parcours d'intégration utilise une base SQLite persistante temporaire et un processus serveur distinct.
Un fournisseur HTTP local capture les vrais messages modèle. Il vérifie le défaut full, lite et ultra,
les modifications à chaud dans la même session, off, deux projets indépendants, la préservation d'une
instruction du projet, un seul bloc injecté, un redémarrage de processus, la désactivation et la réactivation.
Les six commandes et leurs prompts ainsi que les six skills sont accessibles via les API natives.
La désactivation retire les commandes, skills, réglages et l'injection ; le niveau revient à la réactivation.
Le compteur descriptif des contributions d'Openfox conserve son dernier inventaire même désactivé :
le test vérifie donc les API et le prompt réellement envoyé, plutôt que ce compteur.

Les warnings et erreurs console restent visibles et rendent les tests non réussis.
Aucune exception non interceptée n'est neutralisée. Aucun appel n'est envoyé à un fournisseur externe.
Openfox peut découvrir les skills globaux de l'utilisateur en lecture seule même en mode test ;
son stockage et les projets utilisés ici restent temporaires.

## Limites et contrôles non effectués

- Interface graphique non pilotée : les parcours ont été vérifiés par les API natives et les appels fournisseur.
- CI fournie mais non exécutée sur GitHub ; Linux et Windows non validés localement.
- Installation depuis une URL GitHub non testée : le dépôt n'est pas publié. Installation via copie du dossier
  source depuis l'interface non exercée ; l'archive construite a été installée par extraction et découverte native.
- Le champ npm de l'installateur Openfox 2.0.161 ne résout pas correctement un chemin d'archive locale.
  Le README documente l'installation du dossier source ou l'extraction de l'archive.
- L'installation des dépendances de développement a émis un avertissement de dépréciation pour
  `prebuild-install@7.1.3`, transitif d'Openfox. Le rebuild SQLite a aussi signalé les scripts d'installation
  non couverts par `allowScripts`. Ces avertissements npm ne sont pas des warnings applicatifs ou lint ;
  le module SQLite a été exécuté avec succès pendant le test réel.
- Aucune mesure d'efficacité des prompts ni d'économie sur un modèle réel. Les chiffres affichés par gain
  restent exclusivement ceux du benchmark amont embarqué.
- Publication, envoi de PR et acceptation au catalogue hors périmètre de cette livraison locale.
