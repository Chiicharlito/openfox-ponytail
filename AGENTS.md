# Consignes de développement persistantes

- Consulter la documentation officielle avant de choisir ou configurer une technologie.
- Vérifier les versions stables récentes et leurs compatibilités ; exclure les préversions et verrouiller les dépendances retenues.
- Appliquer un TDD orienté régressions : établir une référence verte, écrire un test de comportement, constater son échec attendu, implémenter, puis refactoriser avec les tests verts.
- Ne pas masquer les erreurs, warnings applicatifs ni exceptions non interceptées. Le lint doit terminer avec zéro warning ; les parcours testés échouent sur toute erreur ou warning console applicatif.
- Exécuter les tests pertinents, la vérification des types, le build et le lint avant livraison. Signaler précisément tout contrôle bloqué ou non effectué ; ne pas annoncer une validation complète dans ce cas.
- Préserver les instructions existantes et le travail non commité de l’utilisateur.
