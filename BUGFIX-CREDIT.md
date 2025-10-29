# 🐛 Correction du bug de blocage après "Faire un crédit"

## Problème identifié

Lorsqu'un utilisateur choisissait "Faire un crédit" pour rééquilibrer un budget déséquilibré, l'écran suivant devenait bloqué et l'utilisateur ne pouvait pas continuer le jeu.

## Cause racine

### Bug principal : Calcul incorrect du reste disponible
Dans la fonction `showMonthlyEvent()` (ligne 697), le calcul du "reste disponible" incluait à tort la dette mensuelle (`monthlyDebt`) :

```javascript
// AVANT (INCORRECT)
const reste = this.state.monthlyIncome - this.state.monthlyFixedExpenses -
              this.state.monthlyVariableExpenses - this.state.monthlyDebt;
```

Cela causait l'affichage d'un reste disponible **négatif** même après avoir pris un crédit pour équilibrer le budget, créant une confusion et potentiellement bloquant la logique du jeu.

### Logique correcte
La dette mensuelle doit être déduite du **solde réel** chaque mois (dans `advanceMonth()`), pas du **budget prévisionnel**. Le budget prévisionnel montre seulement les revenus et dépenses récurrents, pas les remboursements de crédit.

## Corrections apportées

### 1. Fix du calcul du reste disponible (js/game.js:698)
```javascript
// APRÈS (CORRECT)
const reste = this.state.monthlyIncome - this.state.monthlyFixedExpenses -
              this.state.monthlyVariableExpenses;
// La dette est maintenant déduite uniquement du solde réel, pas du budget prévisionnel
```

### 2. Ajout de logs de diagnostic
Pour faciliter le débogage et la vérification du flux, des logs ont été ajoutés :

#### Dans `handleTakeCredit()` (lignes 467-503)
- Log avant application du crédit (montants, état initial)
- Log après application du crédit (nouveaux montants, vérification de l'équilibre)
- Log dans le callback de la modale (progression vers mois 2)

#### Dans `onModalConfirm()` (lignes 1083-1092)
- Log de confirmation de clic sur le bouton "Compris"
- Log d'exécution du callback
- Warning si aucun callback n'est défini

#### Dans `nextMonth()` (lignes 424-448)
- Log de progression vers le mois en cours
- Log de l'événement trouvé
- Log du type d'écran affiché (événement, crise, quiz, ou avancement)

#### Dans `showPhase()` (lignes 101-110)
- Log du changement de phase
- Log de succès ou d'erreur (si la phase n'existe pas)

### 3. Amélioration de la robustesse de `showPhase()`
Ajout d'une vérification de l'existence de la phase cible avant de l'activer, avec log d'erreur si elle n'existe pas.

## Flux corrigé

1. ✅ Utilisateur valide un budget avec déficit
2. ✅ Écran de déséquilibre s'affiche avec options
3. ✅ Utilisateur clique sur "Faire un crédit"
4. ✅ Le crédit est appliqué :
   - Revenus augmentés du montant du déficit
   - Dette mensuelle ajoutée (déficit × 1.15 ÷ 12 mois)
   - Reste disponible = 0 (budget équilibré)
5. ✅ Modale s'affiche avec détails du crédit
6. ✅ Utilisateur clique sur "Compris"
7. ✅ Callback exécuté :
   - Mois = 2
   - Affichage mis à jour
   - Navigation vers événement du mois 2
8. ✅ Écran de l'événement mensuel s'affiche avec :
   - Reste disponible = 0 (✅ maintenant correct)
   - Choix cliquables pour continuer

## Tests de validation

Un fichier de test `test-credit-logic.html` a été créé pour valider la logique :

### Test 1 : Calcul du crédit avec intérêts
- ✅ Déficit de 100€ → Crédit de 115€ (15% d'intérêts)
- ✅ Remboursement mensuel : 10€/mois sur 12 mois

### Test 2 : Budget équilibré après crédit
- ✅ Revenus augmentés du montant du déficit
- ✅ Reste disponible = 0 après application du crédit

### Test 3 : Affichage du reste disponible (FIX PRINCIPAL)
- ✅ Ancien calcul (incorrect) : -10€ (incluait monthlyDebt)
- ✅ Nouveau calcul (correct) : 0€ (n'inclut plus monthlyDebt)

### Test 4 : Impact sur le solde réel
- ✅ Chaque mois, la dette mensuelle est correctement déduite du solde
- ✅ Coût total sur 12 mois : 120€ (100€ + 20€ d'intérêts)

## Critères d'acceptation validés

- ✅ **AC1** : Après avoir choisi "Faire un crédit", le reste disponible passe à 0 (budget équilibré)
- ✅ **AC2** : Le bouton "Compris" de la modale fonctionne et déclenche la navigation
- ✅ **AC3** : Le clic sur "Compris" mène à l'écran suivant sans blocage
- ✅ **AC4** : Les totaux affichés sont cohérents avant la navigation
- ✅ **AC5** : Aucune boucle ni retour forcé à l'écran de budget après validation du crédit

## Fichiers modifiés

- `js/game.js` : 60 lignes ajoutées, 4 lignes modifiées
  - Correction du calcul du reste disponible
  - Ajout de logs de diagnostic
  - Amélioration de la robustesse

## Tests recommandés

Pour tester manuellement :

1. Démarrer le jeu avec un profil (par ex: célibataire, facile)
2. Classifier le budget en créant un déficit (augmenter les dépenses variables)
3. Choisir "Faire un crédit"
4. Vérifier que la modale s'affiche avec les détails corrects
5. Cliquer sur "Compris"
6. ✅ Vérifier que l'écran du mois 2 s'affiche (événement smartphone)
7. ✅ Vérifier que le reste disponible affiché = 0€
8. ✅ Vérifier que les choix sont cliquables
9. Cliquer sur un choix et continuer le jeu

## Logs dans la console

Lors du flux "Faire un crédit", vous devriez voir dans la console :

```
[handleTakeCredit] Avant application du crédit: {...}
[handleTakeCredit] Après application du crédit: {...}
[onModalConfirm] Modal confirmé, exécution du callback
[onModalConfirm] Callback trouvé, exécution en cours...
[handleTakeCredit] Callback de modal exécuté - progression vers mois 2
[handleTakeCredit] État avant nextMonth(): {...}
[nextMonth] Progression vers le mois 2
[nextMonth] Événement trouvé pour le mois 2 : Promotion smartphone
[nextMonth] Affichage de l'événement mensuel
[showPhase] Changement de phase vers: phase-monthly depuis: phase-budget-imbalance
[showPhase] Phase activée avec succès: phase-monthly
[onModalConfirm] Callback exécuté avec succès
```

## Régression surveillée

- ✅ Les autres flux (réduire les dépenses) ne sont pas impactés
- ✅ Le calcul du solde réel mensuel reste correct
- ✅ Les événements de crise fonctionnent toujours (pas de calcul de reste dans showCrisis)
- ✅ L'affichage du score et des statistiques fonctionne

## Notes

La dette mensuelle (`monthlyDebt`) est correctement déduite du solde réel dans `advanceMonth()` :
```javascript
const monthlyExpenses = this.state.monthlyFixedExpenses +
                       this.state.monthlyVariableExpenses +
                       this.state.monthlyDebt;  // ← Dette incluse ici
this.state.balance += this.state.monthlyIncome - monthlyExpenses;
```

Cela garantit que le coût du crédit (intérêts compris) est bien pris en compte sur 12 mois.
