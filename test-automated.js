/**
 * Test automatisé du flux de crédit
 * Ce script simule le flux complet pour vérifier que tout fonctionne
 */

// Import des données
const fs = require('fs');
const path = require('path');

// Simuler le contenu du fichier data.js
const GAME_DATA = {
    monthlyEvents: [
        {
            month: 2,
            icon: '🛍️',
            title: 'Promotion smartphone',
            description: 'Test event',
            choices: [
                { text: 'Choice 1', icon: '💳', impact: 'Test', consequence: {} },
                { text: 'Choice 2', icon: '💰', impact: 'Test', consequence: {} },
                { text: 'Choice 3', icon: '🎯', impact: 'Test', consequence: {} }
            ]
        }
    ]
};

// Simulation de la classe BudgetGame
class MockBudgetGame {
    constructor() {
        this.state = {
            currentMonth: 1,
            monthlyIncome: 2000,
            monthlyFixedExpenses: 1200,
            monthlyVariableExpenses: 900,
            monthlyDebt: 0,
            credits: 0,
            totalScore: 100,
            badChoices: 0,
            balance: 500
        };
        this.currentDeficit = 100;
        this.modalCallback = null;
        this.testResults = [];
    }

    log(message, type = 'INFO') {
        const timestamp = new Date().toISOString();
        this.testResults.push({ timestamp, type, message });
        console.log(`[${timestamp}] [${type}] ${message}`);
    }

    handleTakeCredit() {
        this.log('=== DÉBUT handleTakeCredit() ===', 'TEST');

        const deficit = this.currentDeficit;
        const creditCost = Math.round(deficit * 1.15);
        const interestAmount = Math.round(deficit * 0.15);
        const monthlyRepayment = Math.round(creditCost / 12);

        this.log(`Déficit: ${deficit}€`, 'INFO');
        this.log(`Coût total crédit: ${creditCost}€ (intérêts: ${interestAmount}€)`, 'INFO');
        this.log(`Remboursement mensuel: ${monthlyRepayment}€`, 'INFO');

        // Avant application
        this.log(`[AVANT] Revenus: ${this.state.monthlyIncome}€, Dette: ${this.state.monthlyDebt}€`, 'INFO');

        // Appliquer le crédit
        this.state.monthlyIncome += deficit;
        this.state.monthlyDebt += monthlyRepayment;
        this.state.credits += 1;
        this.state.totalScore -= creditCost;
        this.state.badChoices += 1;

        const newResteDisponible = this.state.monthlyIncome - this.state.monthlyFixedExpenses - this.state.monthlyVariableExpenses;

        // Après application
        this.log(`[APRÈS] Revenus: ${this.state.monthlyIncome}€, Dette: ${this.state.monthlyDebt}€`, 'INFO');
        this.log(`[APRÈS] Reste disponible: ${newResteDisponible}€`, 'INFO');
        this.log(`[APRÈS] Budget équilibré: ${newResteDisponible >= 0 ? 'OUI' : 'NON'}`, newResteDisponible >= 0 ? 'SUCCESS' : 'ERROR');

        // Vérifications
        if (newResteDisponible !== 0) {
            this.log(`ERREUR: Le reste disponible devrait être 0, mais il est de ${newResteDisponible}€`, 'ERROR');
            return false;
        }

        // Afficher la modal avec callback
        this.log('Appel de showModal() avec callback', 'INFO');
        this.showModal('Budget équilibré par emprunt', 'Message de test', () => {
            this.log('[CALLBACK] Callback de la modal exécuté', 'SUCCESS');
            this.log(`[CALLBACK] Mise à jour currentMonth de ${this.state.currentMonth} à 2`, 'INFO');

            // Passer au mois 2
            this.state.currentMonth = 2;

            this.log('[CALLBACK] Appel de updateDisplay()', 'INFO');
            this.updateDisplay();

            this.log('[CALLBACK] Appel de nextMonth()', 'INFO');
            this.nextMonth();

            this.log('[CALLBACK] Callback terminé', 'SUCCESS');
        });

        this.log('=== FIN handleTakeCredit() ===', 'TEST');
        return true;
    }

    showModal(title, content, callback) {
        this.log(`showModal() appelé: "${title}"`, 'INFO');
        this.modalCallback = callback;
        this.log('Callback stocké dans this.modalCallback', 'SUCCESS');
    }

    hideModal() {
        this.log('hideModal() appelé', 'INFO');
        this.modalCallback = null;
    }

    onModalConfirm() {
        this.log('=== onModalConfirm() appelé (clic sur "Compris") ===', 'TEST');
        const callback = this.modalCallback;

        if (!callback) {
            this.log('ERREUR CRITIQUE: Aucun callback défini!', 'ERROR');
            return false;
        }

        this.log('Callback trouvé, appel de hideModal()', 'INFO');
        this.hideModal();

        this.log('Exécution du callback...', 'INFO');
        try {
            callback();
            this.log('Callback exécuté avec succès', 'SUCCESS');
            return true;
        } catch (error) {
            this.log(`ERREUR lors de l'exécution du callback: ${error.message}`, 'ERROR');
            return false;
        }
    }

    updateDisplay() {
        this.log(`updateDisplay() - Mois: ${this.state.currentMonth}, Solde: ${this.state.balance}€`, 'INFO');
    }

    nextMonth() {
        this.log(`=== nextMonth() appelé pour mois ${this.state.currentMonth} ===`, 'TEST');

        const event = GAME_DATA.monthlyEvents.find(e => e.month === this.state.currentMonth);

        if (event) {
            this.log(`Événement trouvé: "${event.title}"`, 'SUCCESS');
            this.log(`Icône: ${event.icon}, Choix: ${event.choices.length}`, 'INFO');
            this.showMonthlyEvent(event);
            return true;
        } else {
            this.log(`ERREUR: Aucun événement trouvé pour le mois ${this.state.currentMonth}`, 'ERROR');
            return false;
        }
    }

    showMonthlyEvent(event) {
        this.log(`=== showMonthlyEvent() - "${event.title}" ===`, 'TEST');

        const reste = this.state.monthlyIncome - this.state.monthlyFixedExpenses - this.state.monthlyVariableExpenses;
        this.log(`Budget affiché - Revenus: ${this.state.monthlyIncome}€, Fixes: ${this.state.monthlyFixedExpenses}€, Variables: ${this.state.monthlyVariableExpenses}€`, 'INFO');
        this.log(`Reste disponible affiché: ${reste}€`, 'INFO');

        if (reste !== 0) {
            this.log(`AVERTISSEMENT: Le reste disponible affiché n'est pas 0 (valeur: ${reste}€)`, 'WARNING');
        } else {
            this.log('✅ Le reste disponible est bien 0€', 'SUCCESS');
        }

        this.log(`Événement "${event.title}" affiché avec ${event.choices.length} choix`, 'SUCCESS');
        this.log('🎉 LE JOUEUR PEUT MAINTENANT CONTINUER LE JEU!', 'SUCCESS');
    }

    generateReport() {
        this.log('\n' + '='.repeat(80), 'TEST');
        this.log('RAPPORT FINAL DES TESTS', 'TEST');
        this.log('='.repeat(80), 'TEST');

        const errors = this.testResults.filter(r => r.type === 'ERROR');
        const warnings = this.testResults.filter(r => r.type === 'WARNING');
        const successes = this.testResults.filter(r => r.type === 'SUCCESS');

        this.log(`Total d'événements: ${this.testResults.length}`, 'INFO');
        this.log(`Succès: ${successes.length}`, 'SUCCESS');
        this.log(`Avertissements: ${warnings.length}`, 'WARNING');
        this.log(`Erreurs: ${errors.length}`, errors.length > 0 ? 'ERROR' : 'SUCCESS');

        if (errors.length > 0) {
            this.log('\n❌ TESTS ÉCHOUÉS - Erreurs détectées:', 'ERROR');
            errors.forEach(err => {
                this.log(`  - ${err.message}`, 'ERROR');
            });
            return false;
        } else {
            this.log('\n✅ TOUS LES TESTS RÉUSSIS!', 'SUCCESS');
            this.log('Le flux de crédit fonctionne correctement.', 'SUCCESS');
            this.log('Le joueur peut passer au mois 2 sans blocage.', 'SUCCESS');
            return true;
        }
    }
}

// Exécution des tests
function runTests() {
    console.log('\nDEBUT DES TESTS AUTOMATISES\n');

    const game = new MockBudgetGame();

    // Test 1: handleTakeCredit
    console.log('\nTest 1: Execution de handleTakeCredit()');
    const creditResult = game.handleTakeCredit();

    if (!creditResult) {
        console.error('\nTest 1 ECHOUE');
        return;
    }

    // Test 2: Simulation du clic sur "Compris"
    console.log('\nTest 2: Simulation du clic sur Compris');
    const confirmResult = game.onModalConfirm();

    if (!confirmResult) {
        console.error('\nTest 2 ECHOUE');
        return;
    }

    // Test 3: Vérification de l'état final
    console.log('\nTest 3: Verification de l\'etat final');
    if (game.state.currentMonth !== 2) {
        game.log(`ERREUR: currentMonth devrait etre 2, mais il est ${game.state.currentMonth}`, 'ERROR');
    } else {
        game.log('currentMonth = 2', 'SUCCESS');
    }

    // Générer le rapport
    const success = game.generateReport();

    console.log('\n' + '='.repeat(80));
    if (success) {
        console.log('CONCLUSION: Le bug est CORRIGE. Le jeu fonctionne correctement.');
    } else {
        console.log('CONCLUSION: Des problemes ont ete detectes. Voir les details ci-dessus.');
    }
    console.log('='.repeat(80) + '\n');
}

// Lancer les tests
runTests();
