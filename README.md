<div align="center">

# 🦊 OpenFox × Ponytail

**Résoudre complètement le problème. Écrire le minimum de code nécessaire.**

Intégration communautaire de [Ponytail](https://github.com/DietrichGebert/ponytail) pour [OpenFox](https://github.com/co-l/openfox).

![Version](https://img.shields.io/badge/version-0.1.0-6366f1)
![Ponytail](https://img.shields.io/badge/Ponytail-5.1.0-f59e0b)
![OpenFox](https://img.shields.io/badge/OpenFox-API_v2-0ea5e9)
[![Licence MIT](https://img.shields.io/badge/licence-MIT-22c55e)](LICENSE)

[Installation](#installation) · [Niveaux](#utilisation) · [Commandes](#commandes-et-skills) · [Développement](#développement-et-vérification)

</div>

---

Ponytail donne à votre agent une ligne de conduite : réutiliser ce qui existe,
choisir la solution la plus simple qui couvre le besoin et vérifier le résultat.
Ce plugin applique ces instructions automatiquement dans OpenFox.

- **Automatique** : le niveau `full` s'applique dès l'activation.
- **Par projet** : choisissez `lite`, `full`, `ultra` ou `off` dans les réglages natifs.
- **Six commandes et skills** : aide, revue de code, audit et inventaire de dette.
- **Ressources embarquées** : aucune dépendance d'exécution ajoutée, aucun téléchargement à l'activation ou lors d'un appel au modèle.

> Les instructions guident le modèle ; elles ne garantissent ni un résultat ni une économie de tokens.
> Cette intégration communautaire ne revendique ni affiliation ni aval de l'auteur de Ponytail.

## Installation

Version testée : **OpenFox 2.0.161**, API publique **v2**, avec **Node 24.21.0**.

1. Ouvrir **Réglages → Plugins** dans OpenFox.
2. Installer depuis cette URL GitHub :

   ```text
   https://github.com/Chiicharlito/openfox-ponytail
   ```

3. Activer **Ponytail (community)** si nécessaire. Le niveau `full` est le défaut.

OpenFox clone le dépôt, installe les dépendances de développement et exécute le build.
Les mises à jour passent par la gestion native des plugins OpenFox.

## Utilisation

Quand le plugin est activé, le niveau **full** s'applique automatiquement avant chaque appel au modèle.
Dans un projet, ouvrir **Réglages → Plugins → Ponytail (community)**, choisir **Ce projet** puis le niveau :

| Niveau | Comportement |
| --- | --- |
| `lite` | Réaliser la demande et indiquer une option plus simple. |
| `full` | Faire le plus petit changement complet, le vérifier et signaler les limites. Défaut. |
| `ultra` | Questionner aussi les parties non justifiées de la demande. |
| `off` | Arrêter l'injection automatique ; conserver les commandes et skills. |

Le réglage est conservé dans la base OpenFox, isolé par identifiant de projet et relu à chaque appel.
Sans projet identifié, `full` s'applique. Les réglages globaux n'affectent pas ce défaut.
Un changement prend effet au prochain appel, sans redémarrage. Les instructions existantes sont conservées.
Désactiver le plugin dans OpenFox retire toutes ses contributions ; le réactiver conserve les choix enregistrés.

## Commandes et skills

| Commande et skill | Fonction |
| --- | --- |
| `/ponytail` | Afficher l'utilisation et la manière de régler le niveau. |
| `/ponytail-review` | Rapport sur un changement et le code qu'il touche. |
| `/ponytail-audit` | Rapport sur l'ensemble du dépôt. |
| `/ponytail-debt` | Inventaire des commentaires `shortcut:` et `ponytail:`. |
| `/ponytail-gain` | Résultats du benchmark amont, jamais des économies mesurées dans OpenFox. |
| `/ponytail-help` | Référence des commandes et réglages. |

Les commandes de diagnostic demandent uniquement un rapport, sans modifications automatiques.
`/ponytail ultra`, `/ponytail off`, « stop ponytail » ou une phrase conversationnelle **ne changent pas le réglage persistant**.
Seuls les réglages natifs le font. Aucun fichier de drapeau ni variable `PONYTAIL_DEFAULT_MODE` n'est utilisé.
Les commandes et skills sont des instructions au modèle : leur efficacité dépend du modèle utilisé.

## Installation locale

Prérequis : Node **24.21.0 LTS**, npm et OpenFox **2.0.161**.

```sh
git clone https://github.com/Chiicharlito/openfox-ponytail.git
cd openfox-ponytail
nvm install
nvm use
npm ci
npm run check
npm run test:integration
```

Dans **Réglages → Plugins**, installer à partir du chemin absolu de ce dossier source, puis activer le plugin si nécessaire.
L'installateur OpenFox copie le dossier, installe les outils de développement et exécute `npm run build`.
Pour produire l'archive distribuable : `npm pack`. Elle contient les fichiers ESM compilés, les ressources et les licences.
Pour l'installer sans outils de développement, extraire son contenu `package/` dans
`<répertoire de configuration OpenFox>/plugins/openfox-ponytail/` puis redémarrer OpenFox.
Le bouton d'ouverture du dossier des plugins dans OpenFox permet de trouver ce répertoire.
Ne pas passer un chemin `.tgz` au champ npm : OpenFox 2.0.161 y attend un nom de paquet.

## Développement et vérification

`npm run check` exécute le build ESM avec `tsc`, les tests `node:test`, les types et ESLint avec zéro warning.
`npm run test:integration` construit une archive à partir du build existant, l'installe dans un dossier temporaire,
démarre OpenFox avec une base dédiée et capture les appels HTTP adressés à un fournisseur local.
Il teste les niveaux, les changements à chaud, deux projets, le redémarrage et le cycle désactivation/réactivation.
Les tests échouent sur les erreurs et warnings console applicatifs ; aucun fournisseur payant n'est appelé.
Exécuter `npm run build` avant le test d'intégration si les sources ont changé.

TypeScript **6.0.3**, ESLint **10.12.0**, typescript-eslint **8.71.1** : versions stables verrouillées.
TypeScript 7 n'est pas retenu car la [compatibilité annoncée par typescript-eslint](https://typescript-eslint.io/users/dependency-versions/)
s'arrête avant 6.1. La compilation suit le [mode NodeNext documenté](https://www.typescriptlang.org/tsconfig/module.html).

Une ressource manquante fait échouer l'activation explicitement avant toute contribution.
Une valeur de niveau invalide provoque une erreur explicite ; le [contrat OpenFox](https://github.com/co-l/openfox/blob/develop/docs/PLUGINS.md)
prévoit alors un warning et la poursuite de l'appel sans la transformation en échec.

Voir [ATTRIBUTION.md](ATTRIBUTION.md), [le rapport de validation](docs/VALIDATION.md)
et [la proposition au catalogue](docs/CATALOG-PROPOSAL.md).

## Licence et crédits

Distribué sous [licence MIT](LICENSE). Ponytail est créé par
[DietrichGebert](https://github.com/DietrichGebert/ponytail) ; cette intégration embarque la version **5.1.0**.
Les sources amont, leur licence et leurs hashes sont conservés dans `vendor/`.
Les adaptations sont détaillées dans [ATTRIBUTION.md](ATTRIBUTION.md).

Un problème ou une suggestion ? [Ouvrir une issue](https://github.com/Chiicharlito/openfox-ponytail/issues).
Le référencement au catalogue reste soumis à l'acceptation des mainteneurs OpenFox.
