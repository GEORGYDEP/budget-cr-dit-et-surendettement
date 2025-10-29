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

        // Modal
        document.querySelector('.modal-close').addEventListener('click', () => {
            this.hideModal();
        });
        document.querySelector('.modal-ok').addEventListener('click', () => {
            this.hideModal();
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

        // Configuration selon la difficulté
        const diffConfig = GAME_DATA.difficulty[this.state.difficulty];
        this.state.monthlyIncome = diffConfig.salaire;
        this.state.balance = diffConfig.economiesBase;
        this.state.savings = diffConfig.economiesBase;

        // Ajuster les revenus selon la situation
        if (situation === 'famille') {
            this.state.monthlyIncome += 200; // Allocations familiales
        }

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

        // Ajuster le salaire dans les données
        const items = JSON.parse(JSON.stringify(GAME_DATA.budgetItems));
        const salaireItem = items.find(item => item.id === 'salaire');
        if (salaireItem) {
            salaireItem.amount = this.state.monthlyIncome;
        }

        // Ajuster selon la situation
        if (this.state.situation === 'seul') {
            // Retirer allocations familiales
            const index = items.findIndex(item => item.id === 'allocations');
            if (index > -1) items.splice(index, 1);
        }

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
        
        let message = `
            <p><strong>Ton budget prévisionnel est établi !</strong></p>
            <p>📊 Recettes totales : ${totals.totalRecettes} €</p>
            <p>🏠 Dépenses fixes : ${totals.totalFixes} €</p>
            <p>🛒 Dépenses variables : ${totals.totalVariables} €</p>
            <p><strong>Solde : ${reste} €</strong></p>
        `;

        if (reste < 0) {
            message += `<p style="color: #ef4444;">⚠️ Attention ! Tes dépenses dépassent tes revenus de ${Math.abs(reste)} €. Tu es en déficit budgétaire. Il faudra réduire les dépenses variables.</p>`;
            this.state.totalScore -= 20;
        } else if (reste > 0) {
            message += `<p style="color: #10b981;">✅ Parfait ! Tu dégages un excédent de ${reste} €. Tu peux épargner !</p>`;
            this.state.totalScore += 50;
        } else {
            message += `<p style="color: #f59e0b;">⚖️ Budget équilibré : recettes = dépenses.</p>`;
            this.state.totalScore += 30;
        }

        message += `
            <p><br><strong>💡 Points clés à retenir :</strong></p>
            <ul style="text-align: left; margin-left: 20px;">
                <li>Les <strong>dépenses fixes</strong> sont prioritaires (loyer, assurances...)</li>
                <li>Les <strong>dépenses variables</strong> peuvent être ajustées</li>
                <li>L'<strong>épargne</strong> doit être considérée comme une "dépense" obligatoire</li>
            </ul>
        `;

        this.showModal('Budget validé !', message);

        setTimeout(() => {
            this.state.currentMonth = 2;
            this.updateDisplay();
            this.nextMonth();
        }, 5000);
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

    showMonthlyEvent(event) {
        this.currentEvent = event;
        this.showPhase('phase-monthly');

        document.getElementById('monthly-title').textContent = `📅 Mois ${this.state.currentMonth} : ${event.title}`;
        
        // Récap budget
        document.getElementById('recap-revenus').textContent = this.state.monthlyIncome + ' €';
        document.getElementById('recap-fixes').textContent = this.state.monthlyFixedExpenses + ' €';
        const reste = this.state.monthlyIncome - this.state.monthlyFixedExpenses - this.state.monthlyDebt;
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

        // Afficher le feedback
        this.showModal('Résultat de ton choix', consequence.feedback);

        // Mettre à jour l'affichage
        this.updateDisplay();

        // Passer au mois suivant
        setTimeout(() => {
            this.hideModal();
            this.advanceMonth();
        }, 4000);
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
            feedback.textContent = '✅ Correct ! ' + this.currentQuiz.explanation;
            this.state.totalScore += 20;
            this.state.quizCorrect++;
        } else {
            btn.classList.add('incorrect');
            feedback.className = 'quiz-feedback show incorrect';
            feedback.textContent = '❌ Incorrect. ' + this.currentQuiz.explanation;
            
            // Montrer la bonne réponse
            document.querySelectorAll('.quiz-option')[this.currentQuiz.correct].classList.add('correct');
        }

        this.updateDisplay();

        setTimeout(() => {
            this.advanceMonth();
        }, 5000);
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

    showModal(title, content) {
        const modal = document.getElementById('info-modal');
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').innerHTML = content;
        modal.classList.add('show');
    }

    hideModal() {
        document.getElementById('info-modal').classList.remove('show');
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
document.addEventListener('DOMContentLoaded', () => {
    const game = new BudgetGame();
});
