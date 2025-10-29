// Module métier : Règles de profil et de budget
// Centralise toutes les règles métier pour les profils et budgets

const ProfileRules = {
    /**
     * Applique les règles de revenu selon le profil
     * @param {string} situation - 'seul', 'couple', 'famille'
     * @param {string} difficulty - 'facile', 'moyen', 'difficile'
     * @param {number} nbEnfants - Nombre d'enfants (0 pour seul/couple sans enfant)
     * @param {boolean} hasSalary1 - Premier salaire actif
     * @param {boolean} hasSalary2 - Deuxième salaire actif (couple uniquement)
     * @param {boolean} hasChomage - Allocations chômage actives
     * @returns {Object} Configuration du revenu
     */
    applyIncomeRules(situation, difficulty, nbEnfants = 0, hasSalary1 = true, hasSalary2 = false, hasChomage = false) {
        const rules = {
            income: 0,
            allocations: 0,
            showAllocations: false,
            error: null,
            label: null
        };

        // Règle 1: Revenus par défaut selon le profil
        if (situation === 'seul') {
            // Personne seule: salaire = 1 800 €
            rules.income = 1800;
            rules.allocations = 0;
            rules.showAllocations = false;
        }
        else if (situation === 'couple') {
            if (nbEnfants === 0) {
                // Couple sans enfant: revenu ménage = 2 300 €
                rules.income = 2300;
                rules.allocations = 0;
                rules.showAllocations = false;
            } else {
                // Couple avec enfants
                const nbSalaries = (hasSalary1 ? 1 : 0) + (hasSalary2 ? 1 : 0);

                // Validation: zéro salaire exige chômage
                if (nbSalaries === 0 && !hasChomage) {
                    rules.error = "Un couple sans salaire doit avoir des allocations chômage.";
                    return rules;
                }

                // Calcul du revenu
                if (nbSalaries === 1) {
                    rules.income = 2700;
                    if (hasChomage) {
                        rules.income += 1755; // 65% de 2700
                    }
                    rules.label = "Couple avec une seule personne qui travaille";
                } else if (nbSalaries === 2) {
                    rules.income = 2700;
                } else if (nbSalaries === 0 && hasChomage) {
                    rules.income = 1755 + 1755; // 2 allocations chômage (65% de 2700)
                }

                // Allocations familiales selon nombre d'enfants
                rules.allocations = this.calculateAllocations(nbEnfants);
                rules.showAllocations = true;
            }
        }
        else if (situation === 'famille') {
            // Famille = couple avec enfants (compatibilité ancien code)
            const nbSalaries = (hasSalary1 ? 1 : 0) + (hasSalary2 ? 1 : 0);

            if (nbSalaries === 0 && !hasChomage) {
                rules.error = "Une famille sans salaire doit avoir des allocations chômage.";
                return rules;
            }

            if (nbSalaries === 1) {
                rules.income = 2700;
                if (hasChomage) {
                    rules.income += 1755; // 65% de 2700
                }
                rules.label = "Couple avec une seule personne qui travaille";
            } else if (nbSalaries === 2) {
                rules.income = 2700;
            } else if (nbSalaries === 0 && hasChomage) {
                rules.income = 1755 + 1755; // 2 allocations chômage (65% de 2700)
            }

            // Pour "famille", on suppose au moins 1 enfant
            const enfants = Math.max(nbEnfants, 1);
            rules.allocations = this.calculateAllocations(enfants);
            rules.showAllocations = true;
        }

        return rules;
    },

    /**
     * Calcule les allocations familiales selon le nombre d'enfants
     * Barème belge simplifié
     * @param {number} nbEnfants
     * @returns {number} Montant mensuel
     */
    calculateAllocations(nbEnfants) {
        if (nbEnfants === 0) return 0;
        if (nbEnfants === 1) return 160;
        if (nbEnfants === 2) return 320;
        if (nbEnfants >= 3) return 480;
        return 0;
    },

    /**
     * Applique les règles de dépenses variables selon le profil
     * @param {string} situation - 'seul', 'couple', 'famille'
     * @param {number} nbEnfants - Nombre d'enfants
     * @returns {Object} Montants des dépenses variables
     */
    applyExpenseRules(situation, nbEnfants = 0) {
        const expenses = {
            alimentation: 0,
            hygiene: 0,
            vetements: 0,
            sante: 0
        };

        // Règle 3: Dépenses variables par défaut selon composition
        if (situation === 'seul') {
            // Personne seule
            expenses.alimentation = 300;
            expenses.hygiene = 50;
            expenses.vetements = 50;
            expenses.sante = 50;
        }
        else if (situation === 'couple') {
            if (nbEnfants === 0) {
                // Couple sans enfant
                expenses.alimentation = 600;
                expenses.hygiene = 100;
                expenses.vetements = 100;
                expenses.sante = 100;
            } else {
                // Couple avec enfants
                // Pour 2 enfants (référence spec)
                expenses.alimentation = 900;
                expenses.hygiene = 150;
                expenses.vetements = 150;
                expenses.sante = 150;
            }
        }
        else if (situation === 'famille') {
            // Famille = couple avec enfants
            expenses.alimentation = 900;
            expenses.hygiene = 150;
            expenses.vetements = 150;
            expenses.sante = 150;
        }

        return expenses;
    },

    /**
     * Calcule le reste disponible
     * @param {number} revenus
     * @param {number} depensesFixes
     * @param {number} depensesVariables
     * @returns {number}
     */
    calculateResteDisponible(revenus, depensesFixes, depensesVariables) {
        return revenus - depensesFixes - depensesVariables;
    },

    /**
     * Retourne le message pédagogique sur l'épargne
     * @returns {string}
     */
    getSavingsMessage() {
        return "L'épargne doit être considérée comme une dépense importante, mais pas obligatoire.";
    },

    /**
     * Retourne le rappel sur l'épargne en cas de budget négatif
     * @returns {string}
     */
    getSavingsWarning() {
        return "Si ton budget est négatif, réduis l'épargne à zéro. Ne t'endette pas pour épargner.";
    }
};
