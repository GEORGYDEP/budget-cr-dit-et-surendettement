// Budget Life Simulator - Logique du jeu
// Gestion complète de la simulation budgétaire

class BudgetGame {
    constructor() {
        this.state = {
            playerName: '',
            difficulty: '',
            situation: '',
            job: '',
            currentMonth: 1,
            balance: 0,
            totalScore: 0,
            monthlyIncome: 0,
            monthlyFixedExpenses: 0,
            monthlyVariableExpenses: 0,
            monthlyDebt: 0,
            savings: 0,
            credits: 0,
            goodChoices: 0,
            badChoices: 0,
            badges: [],
            budgetClassified: false,
            quizAnswered: 0,
            quizCorrect: 0,
            eventHistory: []
        };

        this.currentPhase = 'welcome';
        this.currentEvent = null;
        this.currentQuiz = null;
        this.quizQuestions = [];
        this.modalCallback = null; // Callback à exécuter lors du clic sur "Compris"

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showScreen('welcome-screen');
    }

    setupEventListeners() {
        // Écran d'accueil - Sélection de difficulté
        document.querySelectorAll('.btn-difficulty').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.state.difficulty = e.currentTarget.dataset.level;
                this.showScreen('character-screen');
            });
        });

        // Écran de création de personnage
        document.getElementById('start-game-btn').addEventListener('click', () => {
            this.startGame();
        });

        // Validation du budget
        document.getElementById('validate-budget-btn').addEventListener('click', () => {
            this.validateBudget();
        });

        // Gestion du déséquilibre budgétaire
        document.getElementById('reduce-expenses-btn').addEventListener('click', () => {
            this.showReduceExpenses();
        });
        document.getElementById('take-credit-btn').addEventListener('click', () => {
            this.handleTakeCredit();
        });

        // Réduction des dépenses
        document.getElementById('revalidate-budget-btn').addEventListener('click', () => {
            this.revalidateBudget();
        });
        document.getElementById('cancel-reduction-btn').addEventListener('click', () => {
            this.cancelReduction();
        });

        // Modal - Bouton "Compris"
        document.querySelector('.modal-close').addEventListener('click', () => {
            this.hideModal();
        });
        document.querySelector('.modal-ok').addEventListener('click', () => {
            this.onModalConfirm();
        });

        // Boutons finaux
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restart();
        });
        document.getElementById('print-btn').addEventListener('click', () => {
            window.print();
        });
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    }

    showPhase(phaseId) {
        document.querySelectorAll('.phase-content').forEach(p => p.classList.remove('active'));
        document.getElementById(phaseId).classList.add('active');
        this.currentPhase = phaseId;
    }

    startGame() {
        const name = document.getElementById('player-name').value.trim();
        const situation = document.getElementById('player-situation').value;
        const job = document.getElementById('player-job').value;

        if (!name) {
            this.showNotification('Entre ton adresse e-mail pour commencer !', 'warning');
            return;
        }

        // Valider le format email @istlm.org
        if (!name.match(/.+@istlm\.org$/)) {
            this.showNotification('Utilise ton adresse e-mail @istlm.org !', 'warning');
            return;
        }

        this.state.playerName = name;
        this.state.situation = situation;
        this.state.job = job;

        // Configuration selon la difficulté (pour épargne initiale)
        const diffConfig = GAME_DATA.difficulty[this.state.difficulty];
        this.state.balance = diffConfig.economiesBase;
        this.state.savings = diffConfig.economiesBase;

        // Appliquer les règles de revenu selon le profil
        // Pour simplification, on suppose : famille = 2 enfants, couple = 0 enfants
        const nbEnfants = situation === 'famille' ? 2 : 0;
        const incomeRules = ProfileRules.applyIncomeRules(
            situation,
            this.state.difficulty,
            nbEnfants,
            true, // hasSalary1
            false, // hasSalary2 (par défaut)
            false  // hasChomage
        );

        if (incomeRules.error) {
            this.showNotification(incomeRules.error, 'error');
            return;
        }

        this.state.monthlyIncome = incomeRules.income + incomeRules.allocations;

        // Afficher le nom
        document.getElementById('display-name').textContent = name;

        this.showScreen('game-screen');
        this.updateDisplay();
        this.startBudgetPhase();
    }

    startBudgetPhase() {
        this.showPhase('phase-budget');

        // Créer les éléments à classer
        const itemsPool = document.getElementById('items-pool');
        itemsPool.innerHTML = '';

        // Appliquer les règles de profil
        const nbEnfants = this.state.situation === 'famille' ? 2 : 0;
        const incomeRules = ProfileRules.applyIncomeRules(
            this.state.situation,
            this.state.difficulty,
            nbEnfants,
            true, false, false
        );
        const expenseRules = ProfileRules.applyExpenseRules(
            this.state.situation,
            nbEnfants
        );

        // Ajuster les montants dans les données
        const items = JSON.parse(JSON.stringify(GAME_DATA.budgetItems));

        // Recettes
        const salaireItem = items.find(item => item.id === 'salaire');
        if (salaireItem) {
            salaireItem.amount = incomeRules.income;
        }

        const allocationsItem = items.find(item => item.id === 'allocations');
        if (allocationsItem) {
            allocationsItem.amount = incomeRules.allocations;
        }

        // Dépenses variables selon profil
        const alimentationItem = items.find(item => item.id === 'alimentation');
        if (alimentationItem) {
            alimentationItem.amount = expenseRules.alimentation;
        }

        const hygieneItem = items.find(item => item.id === 'hygiene');
        if (hygieneItem) {
            hygieneItem.amount = expenseRules.hygiene;
        }

        const vetementsItem = items.find(item => item.id === 'vetements');
        if (vetementsItem) {
            vetementsItem.amount = expenseRules.vetements;
        }

        const santeItem = items.find(item => item.id === 'sante-var');
        if (santeItem) {
            santeItem.amount = expenseRules.sante;
        }

        // Retirer les éléments qui ne doivent pas être affichés
        const itemsToRemove = [];

        // Retirer allocations si pas affichées
        if (!incomeRules.showAllocations) {
            itemsToRemove.push('allocations');
        }

        // Retirer chômage par défaut
        itemsToRemove.push('chomage');

        // Supprimer les items à retirer
        itemsToRemove.forEach(id => {
            const index = items.findIndex(item => item.id === id);
            if (index > -1) items.splice(index, 1);
        });

        items.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'budget-item';
            itemEl.draggable = true;
            itemEl.dataset.id = item.id;
            itemEl.dataset.type = item.type;
            itemEl.dataset.amount = item.amount;
            itemEl.innerHTML = `
                ${item.label}
                <span class="item-amount">${item.amount} €</span>
            `;
            itemsPool.appendChild(itemEl);

            // Drag & Drop
            itemEl.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', item.id);
                e.dataTransfer.effectAllowed = 'move';
                itemEl.style.opacity = '0.5';
            });

            itemEl.addEventListener('dragend', (e) => {
                itemEl.style.opacity = '1';
            });

            // Support tactile pour tablettes
            let touchStartX, touchStartY, originalParent;
            itemEl.addEventListener('touchstart', (e) => {
                const touch = e.touches[0];
                touchStartX = touch.clientX;
                touchStartY = touch.clientY;
                originalParent = itemEl.parentElement;
                itemEl.style.opacity = '0.5';
                itemEl.style.position = 'fixed';
                itemEl.style.zIndex = '1000';
                itemEl.style.pointerEvents = 'none';
            });

            itemEl.addEventListener('touchmove', (e) => {
                e.preventDefault();
                const touch = e.touches[0];
                itemEl.style.left = touch.clientX - 50 + 'px';
                itemEl.style.top = touch.clientY - 20 + 'px';
            });

            itemEl.addEventListener('touchend', (e) => {
                itemEl.style.opacity = '1';
                itemEl.style.position = 'static';
                itemEl.style.pointerEvents = 'auto';

                const touch = e.changedTouches[0];
                const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
                const dropZone = dropTarget?.closest('.drop-zone');

                if (dropZone && !itemEl.classList.contains('placed')) {
                    const expectedType = dropZone.dataset.type;
                    const itemType = itemEl.dataset.type;

                    if (itemType === expectedType) {
                        dropZone.appendChild(itemEl);
                        itemEl.classList.add('placed');
                        this.updateBudgetTotals();
                        this.showNotification('✅ Bien placé !', 'success');
                    } else {
                        this.showNotification('❌ Mauvaise catégorie ! Réessaie.', 'error');
                    }
                }
            });
        });

        // Setup drop zones
        this.setupDropZones();
    }

    setupDropZones() {
        const zones = document.querySelectorAll('.drop-zone');
        
        zones.forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                zone.classList.add('drag-over');
            });

            zone.addEventListener('dragleave', (e) => {
                zone.classList.remove('drag-over');
            });

            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('drag-over');

                const itemId = e.dataTransfer.getData('text/plain');
                const itemEl = document.querySelector(`[data-id="${itemId}"]`);
                
                if (itemEl && !itemEl.classList.contains('placed')) {
                    const expectedType = zone.dataset.type;
                    const itemType = itemEl.dataset.type;
                    
                    // Vérifier si c'est la bonne catégorie
                    if (itemType === expectedType) {
                        zone.appendChild(itemEl);
                        itemEl.classList.add('placed');
                        this.updateBudgetTotals();
                        this.showNotification('✅ Bien placé !', 'success');
                    } else {
                        this.showNotification('❌ Mauvaise catégorie ! Réessaie.', 'error');
                    }
                }
            });
        });
    }

    updateBudgetTotals() {
        let totalRecettes = 0;
        let totalFixes = 0;
        let totalVariables = 0;

        document.querySelectorAll('#recettes-zone .budget-item').forEach(item => {
            totalRecettes += parseInt(item.dataset.amount);
        });

        document.querySelectorAll('#fixes-zone .budget-item').forEach(item => {
            totalFixes += parseInt(item.dataset.amount);
        });

        document.querySelectorAll('#variables-zone .budget-item').forEach(item => {
            totalVariables += parseInt(item.dataset.amount);
        });

        document.getElementById('total-recettes').textContent = totalRecettes;
        document.getElementById('total-fixes').textContent = totalFixes;
        document.getElementById('total-variables').textContent = totalVariables;

        // Activer le bouton de validation si tout est classé
        const itemsPool = document.getElementById('items-pool');
        const remainingItems = itemsPool.querySelectorAll('.budget-item:not(.placed)').length;
        
        if (remainingItems === 0) {
            document.getElementById('validate-budget-btn').disabled = false;
            this.showNotification('🎉 Tous les éléments sont classés ! Tu peux valider.', 'success');
        }

        return { totalRecettes, totalFixes, totalVariables };
    }

    validateBudget() {
        const totals = this.updateBudgetTotals();

        this.state.monthlyIncome = totals.totalRecettes;
        this.state.monthlyFixedExpenses = totals.totalFixes;
        this.state.monthlyVariableExpenses = totals.totalVariables;
        this.state.budgetClassified = true;

        const reste = totals.totalRecettes - totals.totalFixes - totals.totalVariables;

        // Si déficit, afficher l'écran de déséquilibre
        if (reste < 0) {
            this.showBudgetImbalance(Math.abs(reste));
            return;
        }

        // Si équilibré ou excédent, afficher le message de validation
        let message = `
            <p><strong>Ton budget prévisionnel est établi !</strong></p>
            <p>📊 Recettes totales : ${totals.totalRecettes} €</p>
            <p>🏠 Dépenses fixes : ${totals.totalFixes} €</p>
            <p>🛒 Dépenses variables : ${totals.totalVariables} €</p>
            <p><strong>Solde : ${reste} €</strong></p>
        `;

        if (reste > 0) {
            message += `<p style="color: #10b981;">✅ Parfait ! Tu dégages un excédent de ${reste} €. Tu peux épargner !</p>`;
        } else {
            message += `<p style="color: #f59e0b;">⚖️ Budget équilibré : recettes = dépenses.</p>`;
        }

        message += `
            <p><br><strong>💡 Points clés à retenir :</strong></p>
            <ul style="text-align: left; margin-left: 20px;">
                <li>Les <strong>dépenses fixes</strong> sont prioritaires (loyer, assurances...)</li>
                <li>Les <strong>dépenses variables</strong> peuvent être ajustées</li>
                <li>${ProfileRules.getSavingsMessage()}</li>
            </ul>
        `;

        this.showModal('Budget validé !', message, () => {
            this.state.currentMonth = 2;
            this.updateDisplay();
            this.nextMonth();
        });
    }

    nextMonth() {
        // Vérifier s'il y a un événement ce mois
        const event = GAME_DATA.monthlyEvents.find(e => e.month === this.state.currentMonth);

        if (event) {
            if (event.isCrisis) {
                this.showCrisis(event);
            } else {
                this.showMonthlyEvent(event);
            }
        } else {
            // Parfois un quiz
            if (Math.random() < 0.3 && this.state.quizAnswered < 5) {
                this.showQuiz();
            } else {
                this.advanceMonth();
            }
        }
    }

    // ========================================
    // GESTION DU DÉSÉQUILIBRE BUDGÉTAIRE
    // ========================================

    showBudgetImbalance(deficit) {
        this.currentDeficit = deficit;
        this.showPhase('phase-budget-imbalance');

        // Afficher le montant du déficit
        document.getElementById('deficit-amount').textContent = deficit;

        // Calculer le coût total du crédit (déficit + 15%)
        const creditCost = deficit * 1.15;
        document.getElementById('credit-details').textContent =
            `Coût total avec intérêts (15%) : ${Math.round(creditCost)} €`;
    }

    handleTakeCredit() {
        const deficit = this.currentDeficit;
        const creditCost = Math.round(deficit * 1.15);
        const interestAmount = Math.round(deficit * 0.15);

        // Ajouter le montant du déficit au solde (crédit accordé)
        this.state.balance += deficit;

        // Ajouter la dette mensuelle (à rembourser sur 12 mois par exemple)
        // Pour simplifier, on ajoute la dette totale au remboursement mensuel
        // Dans un vrai système, on répartirait sur plusieurs mois
        this.state.monthlyDebt += Math.round(creditCost / 12);

        // Augmenter le compteur de crédits
        this.state.credits += 1;

        // Appliquer un score négatif
        this.state.totalScore -= creditCost;

        // Compter comme mauvaise décision
        this.state.badChoices += 1;

        // Stocker les dépenses variables ajustées (aucun changement dans ce cas)
        // car l'utilisateur n'a pas réduit les dépenses

        // Message de feedback
        const message = `
            <p><strong>Crédit accordé</strong></p>
            <p>💳 Montant emprunté : ${deficit} €</p>
            <p>💰 Intérêts (15%) : ${interestAmount} €</p>
            <p><strong>⚠️ Coût total : ${creditCost} €</strong></p>
            <p>📉 Impact sur ton score : -${creditCost} points</p>
            <p><br><em>Le remboursement mensuel de ${Math.round(creditCost / 12)} € sera ajouté à tes dépenses fixes.</em></p>
            <p style="color: #ef4444;"><strong>⚠️ Attention :</strong> Contracter un crédit pour un déficit budgétaire n'est généralement pas une bonne solution à long terme. Il est préférable d'ajuster ses dépenses.</p>
        `;

        this.showModal('Crédit contracté', message, () => {
            this.state.currentMonth = 2;
            this.updateDisplay();
            this.nextMonth();
        });
    }

    showReduceExpenses() {
        this.showPhase('phase-reduce-expenses');

        // Afficher le déficit à combler
        document.getElementById('deficit-to-cover').textContent = this.currentDeficit;

        // Afficher le récapitulatif
        document.getElementById('reduce-revenus').textContent = this.state.monthlyIncome + ' €';
        document.getElementById('reduce-fixes').textContent = this.state.monthlyFixedExpenses + ' €';

        // Créer la liste des dépenses variables modifiables
        this.populateVariableExpenses();
        this.updateReduceExpensesDisplay();
    }

    populateVariableExpenses() {
        const variablesZone = document.getElementById('variables-zone');
        const variableItems = Array.from(variablesZone.querySelectorAll('.budget-item'));

        // Stocker les dépenses variables avec leurs montants actuels
        this.variableExpenses = variableItems.map(item => ({
            name: item.textContent.split('\n')[0].trim(),
            originalAmount: parseInt(item.dataset.amount),
            currentAmount: parseInt(item.dataset.amount),
            element: item
        }));

        // Afficher les contrôles d'ajustement
        const container = document.getElementById('variable-expenses-list');
        container.innerHTML = '';

        this.variableExpenses.forEach((expense, index) => {
            const expenseDiv = document.createElement('div');
            expenseDiv.className = 'expense-item';
            expenseDiv.innerHTML = `
                <div class="expense-info">
                    <span class="expense-name">${expense.name}</span>
                </div>
                <div class="expense-controls">
                    <input type="number"
                           class="expense-input"
                           value="${expense.currentAmount}"
                           min="0"
                           max="${expense.originalAmount}"
                           data-index="${index}"
                           onchange="game.updateExpenseValue(${index}, this.value)">
                    <span class="expense-currency">€</span>
                    <button onclick="game.adjustExpense(${index}, -10)" aria-label="Réduire de 10€">-</button>
                    <button onclick="game.adjustExpense(${index}, 10)" aria-label="Augmenter de 10€">+</button>
                </div>
            `;
            container.appendChild(expenseDiv);
        });
    }

    adjustExpense(index, amount) {
        const expense = this.variableExpenses[index];
        let newAmount = expense.currentAmount + amount;

        // Limiter entre 0 et le montant original
        newAmount = Math.max(0, Math.min(expense.originalAmount, newAmount));

        expense.currentAmount = newAmount;

        // Mettre à jour l'affichage
        const input = document.querySelector(`input[data-index="${index}"]`);
        if (input) {
            input.value = newAmount;
        }

        this.updateReduceExpensesDisplay();
    }

    updateExpenseValue(index, value) {
        const expense = this.variableExpenses[index];
        let newAmount = parseInt(value) || 0;

        // Limiter entre 0 et le montant original
        newAmount = Math.max(0, Math.min(expense.originalAmount, newAmount));

        expense.currentAmount = newAmount;
        this.updateReduceExpensesDisplay();
    }

    updateReduceExpensesDisplay() {
        // Calculer le nouveau total des dépenses variables
        const newVariablesTotal = this.variableExpenses.reduce((sum, exp) => sum + exp.currentAmount, 0);

        // Calculer le nouveau solde
        const newSolde = this.state.monthlyIncome - this.state.monthlyFixedExpenses - newVariablesTotal;

        // Mettre à jour l'affichage
        document.getElementById('reduce-variables-total').textContent = newVariablesTotal + ' €';

        const soldeElement = document.getElementById('reduce-solde');
        soldeElement.textContent = newSolde + ' €';

        // Changer la couleur selon le solde
        soldeElement.className = 'amount-neutral';
        if (newSolde < 0) {
            soldeElement.className = 'amount-negative';
            soldeElement.style.color = '#ef4444';
        } else if (newSolde > 0) {
            soldeElement.className = 'amount-positive';
            soldeElement.style.color = '#10b981';
        } else {
            soldeElement.style.color = '#f59e0b';
        }
    }

    revalidateBudget() {
        // Calculer le nouveau total des dépenses variables
        const newVariablesTotal = this.variableExpenses.reduce((sum, exp) => sum + exp.currentAmount, 0);

        // Calculer le nouveau solde
        const newSolde = this.state.monthlyIncome - this.state.monthlyFixedExpenses - newVariablesTotal;

        if (newSolde < 0) {
            // Toujours en déficit, retourner à l'écran de choix
            this.showBudgetImbalance(Math.abs(newSolde));
        } else {
            // Budget équilibré ou excédentaire
            // Mettre à jour les montants dans les éléments du budget
            this.variableExpenses.forEach(expense => {
                expense.element.dataset.amount = expense.currentAmount;
                // Mettre à jour le texte affiché
                const lines = expense.element.textContent.split('\n');
                expense.element.textContent = `${lines[0]}\n${expense.currentAmount} €`;
            });

            // Mettre à jour l'état
            this.state.monthlyVariableExpenses = newVariablesTotal;

            // Recalculer les totaux affichés
            this.updateBudgetTotals();

            // Message de succès
            let message = `
                <p><strong>✅ Budget équilibré avec succès !</strong></p>
                <p>📊 Recettes totales : ${this.state.monthlyIncome} €</p>
                <p>🏠 Dépenses fixes : ${this.state.monthlyFixedExpenses} €</p>
                <p>🛒 Dépenses variables : ${newVariablesTotal} €</p>
                <p><strong>Solde : ${newSolde} €</strong></p>
            `;

            if (newSolde > 0) {
                message += `<p style="color: #10b981;">✅ Parfait ! Tu as réussi à dégager un excédent de ${newSolde} €.</p>`;
                // Bonus pour avoir bien géré le budget
                this.state.totalScore += 50;
                this.state.goodChoices += 1;
                message += `<p style="color: #10b981;">🎉 Bonus : +50 points pour avoir équilibré ton budget !</p>`;
            } else {
                message += `<p style="color: #f59e0b;">⚖️ Budget équilibré : recettes = dépenses.</p>`;
                this.state.goodChoices += 1;
            }

            this.showModal('Budget validé !', message, () => {
                this.state.currentMonth = 2;
                this.updateDisplay();
                this.nextMonth();
            });
        }
    }

    cancelReduction() {
        // Retourner à l'écran de déséquilibre
        this.showBudgetImbalance(this.currentDeficit);
    }

    showMonthlyEvent(event) {
        this.currentEvent = event;
        this.showPhase('phase-monthly');

        document.getElementById('monthly-title').textContent = `📅 Mois ${this.state.currentMonth} : ${event.title}`;

        // Récap budget
        document.getElementById('recap-revenus').textContent = this.state.monthlyIncome + ' €';
        document.getElementById('recap-fixes').textContent = this.state.monthlyFixedExpenses + ' €';
        document.getElementById('recap-variables').textContent = this.state.monthlyVariableExpenses + ' €';
        const reste = this.state.monthlyIncome - this.state.monthlyFixedExpenses - this.state.monthlyVariableExpenses - this.state.monthlyDebt;
        document.getElementById('recap-reste').textContent = reste + ' €';

        // Événement
        document.querySelector('.event-icon').textContent = event.icon;
        document.getElementById('event-title').textContent = event.title;
        document.getElementById('event-description').textContent = event.description;

        // Choix
        const choicesContainer = document.getElementById('event-choices');
        choicesContainer.innerHTML = '';

        event.choices.forEach((choice, index) => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.innerHTML = `
                <span class="choice-icon">${choice.icon}</span>
                ${choice.text}
                <span class="choice-impact">${choice.impact}</span>
            `;
            btn.addEventListener('click', () => {
                this.handleChoice(choice);
            });
            choicesContainer.appendChild(btn);
        });
    }

    showCrisis(event) {
        this.currentEvent = event;
        this.showPhase('phase-crisis');

        document.getElementById('crisis-title').textContent = event.title;
        document.getElementById('crisis-description').textContent = event.description;

        // Impact
        const impactDetails = document.getElementById('crisis-impact-details');
        impactDetails.innerHTML = `
            <p>💰 Ton solde actuel : ${this.state.balance} €</p>
            <p>💎 Ton épargne : ${this.state.savings} €</p>
            <p>💳 Tes crédits en cours : ${this.state.credits}</p>
        `;

        // Choix
        const choicesContainer = document.getElementById('crisis-choices');
        choicesContainer.innerHTML = '';

        event.choices.forEach((choice) => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.innerHTML = `
                <span class="choice-icon">${choice.icon}</span>
                ${choice.text}
                <span class="choice-impact">${choice.impact}</span>
            `;
            btn.addEventListener('click', () => {
                this.handleChoice(choice);
            });
            choicesContainer.appendChild(btn);
        });
    }

    handleChoice(choice) {
        const consequence = choice.consequence;

        // Appliquer les conséquences
        if (consequence.balance !== undefined) {
            this.state.balance += consequence.balance;
        }
        if (consequence.monthlyDebt !== undefined) {
            this.state.monthlyDebt += consequence.monthlyDebt;
        }
        if (consequence.credits !== undefined) {
            this.state.credits += consequence.credits;
        }
        if (consequence.savings !== undefined) {
            this.state.savings += consequence.savings;
        }
        if (consequence.score !== undefined) {
            this.state.totalScore += consequence.score;
        }
        if (consequence.futureIncome !== undefined) {
            // Augmentation future du revenu
            setTimeout(() => {
                this.state.monthlyIncome += consequence.futureIncome;
                this.showNotification(`🎉 Ton salaire augmente de ${consequence.futureIncome} € !`, 'success');
            }, 3000);
        }

        // Badge débloqué ?
        if (consequence.badge) {
            this.unlockBadge(consequence.badge);
        }

        // Compter les bons/mauvais choix
        if (consequence.score > 0) {
            this.state.goodChoices++;
        } else if (consequence.score < 0) {
            this.state.badChoices++;
        }

        // Enregistrer dans l'historique
        this.state.eventHistory.push({
            month: this.state.currentMonth,
            event: this.currentEvent.title,
            choice: choice.text,
            consequence: consequence
        });

        // Mettre à jour l'affichage
        this.updateDisplay();

        // Afficher le feedback avec callback pour avancer au mois suivant
        this.showModal('Résultat de ton choix', consequence.feedback, () => {
            this.advanceMonth();
        });
    }

    showQuiz() {
        this.showPhase('phase-quiz');

        // Sélectionner une question aléatoire
        const availableQuestions = GAME_DATA.quizQuestions.filter(q => 
            !this.quizQuestions.includes(q)
        );

        if (availableQuestions.length === 0) {
            this.advanceMonth();
            return;
        }

        this.currentQuiz = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        this.quizQuestions.push(this.currentQuiz);
        this.state.quizAnswered++;

        document.getElementById('quiz-current').textContent = this.state.quizAnswered;
        document.getElementById('quiz-total').textContent = '5';
        document.getElementById('quiz-question').textContent = this.currentQuiz.question;

        const optionsContainer = document.getElementById('quiz-options');
        optionsContainer.innerHTML = '';

        this.currentQuiz.options.forEach((option, index) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option';
            btn.textContent = option;
            btn.addEventListener('click', () => {
                this.handleQuizAnswer(index, btn);
            });
            optionsContainer.appendChild(btn);
        });

        document.getElementById('quiz-feedback').classList.remove('show');
    }

    handleQuizAnswer(answerIndex, btn) {
        const isCorrect = answerIndex === this.currentQuiz.correct;
        const feedback = document.getElementById('quiz-feedback');

        // Désactiver tous les boutons
        document.querySelectorAll('.quiz-option').forEach(b => {
            b.style.pointerEvents = 'none';
        });

        if (isCorrect) {
            btn.classList.add('correct');
            feedback.className = 'quiz-feedback show correct';
            feedback.innerHTML = '✅ Correct ! ' + this.currentQuiz.explanation;
            this.state.totalScore += 20;
            this.state.quizCorrect++;
        } else {
            btn.classList.add('incorrect');
            feedback.className = 'quiz-feedback show incorrect';
            feedback.innerHTML = '❌ Incorrect. ' + this.currentQuiz.explanation;

            // Montrer la bonne réponse
            document.querySelectorAll('.quiz-option')[this.currentQuiz.correct].classList.add('correct');
        }

        // Ajouter le bouton "Compris"
        const comprisBtn = document.createElement('button');
        comprisBtn.className = 'btn-primary quiz-continue';
        comprisBtn.textContent = 'Compris';
        comprisBtn.style.marginTop = '20px';
        comprisBtn.addEventListener('click', () => {
            this.advanceMonth();
        });
        feedback.appendChild(comprisBtn);

        // Focus sur le bouton pour l'accessibilité
        setTimeout(() => {
            comprisBtn.focus();
        }, 100);

        this.updateDisplay();
    }

    advanceMonth() {
        // Déduire les dépenses mensuelles
        const monthlyExpenses = this.state.monthlyFixedExpenses + 
                               this.state.monthlyVariableExpenses + 
                               this.state.monthlyDebt;
        
        this.state.balance += this.state.monthlyIncome - monthlyExpenses;

        this.state.currentMonth++;

        if (this.state.currentMonth > 12) {
            this.showFinalReport();
        } else {
            this.updateDisplay();
            this.nextMonth();
        }
    }

    unlockBadge(badgeId) {
        if (!this.state.badges.includes(badgeId)) {
            this.state.badges.push(badgeId);
            
            const badgeEl = document.getElementById(`badge-${badgeId}`);
            if (badgeEl) {
                badgeEl.classList.remove('locked');
                badgeEl.classList.add('unlocked');
            }

            const badge = GAME_DATA.badges[badgeId];
            this.showNotification(`🏆 Badge débloqué : ${badge.name}`, 'success');
            this.state.totalScore += 50;
        }
    }

    showFinalReport() {
        this.showPhase('phase-final');

        // Score final
        document.getElementById('final-score-display').textContent = this.state.totalScore;

        // Rang
        let rank = '';
        if (this.state.totalScore >= 500) {
            rank = '🌟 Expert en gestion budgétaire !';
        } else if (this.state.totalScore >= 300) {
            rank = '👍 Bon gestionnaire !';
        } else if (this.state.totalScore >= 100) {
            rank = '😊 En apprentissage...';
        } else {
            rank = '⚠️ À revoir...';
        }
        document.getElementById('score-rank').textContent = rank;

        // Statistiques
        document.getElementById('stat-balance').textContent = this.state.balance + ' €';
        document.getElementById('stat-credits').textContent = this.state.credits;
        document.getElementById('stat-savings').textContent = this.state.savings + ' €';
        document.getElementById('stat-good-choices').textContent = this.state.goodChoices;

        // Badges
        const badgesList = document.getElementById('badges-final-list');
        badgesList.innerHTML = '';

        if (this.state.badges.length === 0) {
            badgesList.innerHTML = '<p>Aucun badge débloqué. Réessaie pour en obtenir !</p>';
        } else {
            this.state.badges.forEach(badgeId => {
                const badge = GAME_DATA.badges[badgeId];
                const badgeEl = document.createElement('div');
                badgeEl.className = 'final-badge';
                badgeEl.title = badge.description;
                badgeEl.innerHTML = badge.name.split(' ')[0] + '<span class="badge-name">' + badge.name.split(' ').slice(1).join(' ') + '</span>';
                badgesList.appendChild(badgeEl);
            });
        }

        // Feedback personnalisé
        let feedback = '';

        if (this.state.balance < 0) {
            feedback += '<p>🚨 Tu termines avec un <strong>solde négatif</strong>. Tu es en situation de surendettement. Il faut immédiatement contacter un <strong>médiateur de dettes</strong> (CPAS) ou envisager une procédure de <strong>règlement collectif de dettes</strong>.</p>';
        } else if (this.state.balance < 500) {
            feedback += '<p>⚠️ Ton solde est faible. Tu es vulnérable aux imprévus. Augmente ton <strong>épargne de précaution</strong> dès que possible.</p>';
        } else {
            feedback += '<p>✅ Bon solde final ! Tu as bien géré tes finances.</p>';
        }

        if (this.state.credits > 2) {
            feedback += '<p>💳 Tu as pris <strong>' + this.state.credits + ' crédits</strong>. Attention à ne pas tomber dans le piège du surendettement. Rappel : <strong>JAMAIS prendre un crédit pour en rembourser un autre</strong>.</p>';
        }

        if (this.state.savings > 1000) {
            feedback += '<p>💎 Excellente épargne ! C\'est ton <strong>coussin de sécurité</strong> pour les imprévus.</p>';
        }

        if (this.state.goodChoices > 8) {
            feedback += '<p>🎯 Tu as fait <strong>' + this.state.goodChoices + ' bons choix</strong> ! Tu maîtrises bien les principes de gestion budgétaire.</p>';
        }

        feedback += '<p><br><strong>📍 Pour aller plus loin :</strong></p>';
        feedback += '<ul style="text-align: left; margin-left: 20px;">';
        feedback += '<li>Consulte <strong>Wikifin.be</strong> (outil budgétaire gratuit)</li>';
        feedback += '<li>En cas de difficulté, contacte le <strong>service de médiation de dettes</strong> de ton CPAS</li>';
        feedback += '<li>Utilise la règle des <strong>5 règles d\'or</strong> au quotidien</li>';
        feedback += '<li>En Belgique, <strong>18% de la population</strong> est en risque de pauvreté. Une bonne gestion budgétaire est une protection essentielle.</li>';
        feedback += '</ul>';

        document.getElementById('final-feedback').innerHTML = feedback;
    }

    updateDisplay() {
        // Mois
        document.getElementById('current-month').textContent = this.state.currentMonth;

        // Solde
        document.getElementById('current-balance').textContent = this.state.balance + ' €';

        // Jauge
        const gaugeFill = document.getElementById('gauge-fill');
        const maxBalance = 3000;
        const percentage = Math.max(0, Math.min(100, (this.state.balance / maxBalance) * 100));
        gaugeFill.style.width = percentage + '%';

        // Couleur selon le solde
        gaugeFill.classList.remove('warning', 'danger');
        if (this.state.balance < 500) {
            gaugeFill.classList.add('danger');
        } else if (this.state.balance < 1000) {
            gaugeFill.classList.add('warning');
        }

        // Score
        document.getElementById('total-score').textContent = this.state.totalScore;
    }

    showModal(title, content, callback = null) {
        const modal = document.getElementById('info-modal');
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').innerHTML = content;
        this.modalCallback = callback;
        modal.classList.add('show');

        // Focus sur le bouton "Compris" pour l'accessibilité
        setTimeout(() => {
            document.querySelector('.modal-ok').focus();
        }, 100);
    }

    hideModal() {
        document.getElementById('info-modal').classList.remove('show');
        this.modalCallback = null;
    }

    onModalConfirm() {
        const callback = this.modalCallback;
        this.hideModal();
        if (callback) {
            callback();
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = 'notification show ' + type;
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    restart() {
        location.reload();
    }
}

// Initialiser le jeu au chargement
let game; // Variable globale pour accéder au jeu depuis les boutons
document.addEventListener('DOMContentLoaded', () => {
    game = new BudgetGame();
    window.game = game; // Rendre accessible globalement pour les onclick
});
