// Données du jeu Budget Life Simulator

const GAME_DATA = {
    // Difficulté et revenus de base
    difficulty: {
        facile: {
            salaire: 2500,
            allocations: 200,
            economiesBase: 500
        },
        moyen: {
            salaire: 1800,
            allocations: 150,
            economiesBase: 200
        },
        difficile: {
            salaire: 1400,
            allocations: 200,
            economiesBase: 0
        }
    },

    // Éléments à classer pour le budget prévisionnel
    // Les montants seront ajustés selon le profil dans game.js
    budgetItems: [
        // Recettes
        { id: 'salaire', label: 'Salaire mensuel', amount: 0, type: 'recettes', category: 'travail' },
        { id: 'allocations', label: 'Allocations familiales', amount: 0, type: 'recettes', category: 'social' },
        { id: 'chomage', label: 'Allocations chômage', amount: 0, type: 'recettes', category: 'social' },
        { id: 'interets', label: 'Intérêts reçus de notre épargne', amount: 15, type: 'recettes', category: 'financier' },

        // Dépenses fixes
        { id: 'loyer', label: 'Loyer', amount: 750, type: 'fixes', category: 'logement' },
        { id: 'electricite', label: 'Électricité & Gaz', amount: 180, type: 'fixes', category: 'energie' },
        { id: 'eau', label: 'Eau', amount: 50, type: 'fixes', category: 'energie' },
        { id: 'internet', label: 'Internet & Téléphone', amount: 65, type: 'fixes', category: 'communication' },
        { id: 'assurance-hab', label: 'Assurance habitation', amount: 35, type: 'fixes', category: 'assurance' },
        { id: 'assurance-auto', label: 'Assurance auto', amount: 80, type: 'fixes', category: 'assurance' },
        { id: 'mutuelle', label: 'Mutuelle', amount: 45, type: 'fixes', category: 'sante' },

        // Dépenses variables (ajustées selon profil)
        { id: 'alimentation', label: 'Alimentation', amount: 0, type: 'variables', category: 'courante' },
        { id: 'hygiene', label: 'Hygiène & Entretien', amount: 0, type: 'variables', category: 'courante' },
        { id: 'vetements', label: 'Vêtements', amount: 0, type: 'variables', category: 'courante' },
        { id: 'transport', label: 'Transport (carburant)', amount: 150, type: 'variables', category: 'courante' },
        { id: 'sante-var', label: 'Santé (non remboursé)', amount: 0, type: 'variables', category: 'courante' },
        { id: 'loisirs', label: 'Loisirs & Sorties', amount: 120, type: 'variables', category: 'occasionnel' },
        { id: 'epargne', label: 'Épargne mensuelle', amount: 100, type: 'variables', category: 'epargne' }
    ],

    // Événements mensuels (mois 2-12)
    monthlyEvents: [
        {
            month: 2,
            icon: '🛍️',
            title: 'Promotion smartphone',
            description: 'Tu passes devant un magasin : le dernier smartphone est en promo à -30% (encore 600€). Tu en as envie mais ton téléphone actuel fonctionne bien.',
            choices: [
                {
                    text: 'Acheter à crédit (70€/mois pendant 12 mois)',
                    icon: '💳',
                    impact: '+840€ de dette (intérêts inclus)',
                    consequence: {
                        balance: 0,
                        monthlyDebt: 70,
                        credits: 1,
                        score: -30,
                        feedback: '⚠️ Attention ! Tu viens de contracter un crédit pour un achat non essentiel. Le coût total sera de 840€ (intérêts compris) au lieu de 600€. C\'est le début du piège du surendettement.'
                    }
                },
                {
                    text: 'Acheter comptant (puiser dans l\'épargne)',
                    icon: '💰',
                    impact: '-600€ d\'épargne',
                    consequence: {
                        balance: -600,
                        score: -10,
                        feedback: '⚠️ Tu as utilisé ton épargne de précaution pour un achat non essentiel. Si un imprévu arrive maintenant, tu seras en difficulté.'
                    }
                },
                {
                    text: 'Ne pas acheter et épargner à la place',
                    icon: '🎯',
                    impact: '+50€ d\'épargne',
                    consequence: {
                        balance: 50,
                        savings: 50,
                        score: 50,
                        badge: 'prudent',
                        feedback: '✅ Excellent choix ! Tu distingues un BESOIN d\'une ENVIE. Ton téléphone fonctionne, l\'achat peut attendre. Tu renforces ton épargne de précaution.'
                    }
                }
            ]
        },
        {
            month: 3,
            icon: '🍕',
            title: 'Sorties entre amis',
            description: 'Tes amis te proposent des sorties chaque week-end ce mois-ci : restaurants, cinéma, bowling. Budget prévu : 50€ de plus que d\'habitude.',
            choices: [
                {
                    text: 'Accepter toutes les sorties (200€ au total)',
                    icon: '🎉',
                    impact: '+80€ de dépassement',
                    consequence: {
                        balance: -80,
                        score: -20,
                        feedback: '⚠️ Tu as dépassé ton budget loisirs de 80€. Il faudra réduire d\'autres dépenses ou puiser dans l\'épargne.'
                    }
                },
                {
                    text: 'Sélectionner 2-3 sorties (150€)',
                    icon: '😊',
                    impact: '+30€ de dépassement',
                    consequence: {
                        balance: -30,
                        score: 20,
                        feedback: '👍 Bon compromis ! Tu profites de la vie sociale tout en restant raisonnable. Léger dépassement gérable.'
                    }
                },
                {
                    text: 'Proposer des alternatives gratuites (pique-nique, soirée ciné maison)',
                    icon: '🏡',
                    impact: 'Budget respecté',
                    consequence: {
                        balance: 0,
                        score: 40,
                        badge: 'economie',
                        feedback: '✅ Super ! Tu montres qu\'on peut profiter sans dépenser. Les vrais amis comprennent les contraintes budgétaires.'
                    }
                }
            ]
        },
        {
            month: 4,
            icon: '⚡',
            title: 'Factures d\'énergie',
            description: 'Ta facture d\'électricité est 40€ plus élevée que prévu (utilisation du chauffage). En parallèle, tu vois une pub pour un nouveau crédit "facile" : 1000€ tout de suite, remboursables en petites mensualités.',
            choices: [
                {
                    text: 'Prendre le crédit pour compenser',
                    icon: '💳',
                    impact: '+1000€ immédiat, puis -120€/mois',
                    consequence: {
                        balance: 1000,
                        monthlyDebt: 120,
                        credits: 1,
                        score: -50,
                        feedback: '❌ ERREUR ! Prendre un crédit pour payer des factures courantes est le début de la spirale du surendettement. Le coût total sera bien supérieur à 1000€ avec les intérêts.'
                    }
                },
                {
                    text: 'Payer la facture et réduire le chauffage d\'un degré',
                    icon: '🌡️',
                    impact: '-40€ maintenant, économie future',
                    consequence: {
                        balance: -40,
                        savings: 15,
                        score: 40,
                        feedback: '✅ Bonne décision ! Réduire le chauffage d\'un degré économise 7% d\'énergie. Tu gères l\'imprévu sans créer de dette.'
                    }
                },
                {
                    text: 'Étaler le paiement en contactant le fournisseur',
                    icon: '📞',
                    impact: 'Plan de paiement accepté',
                    consequence: {
                        balance: -20,
                        score: 30,
                        feedback: '👍 Intelligent ! Les fournisseurs d\'énergie proposent souvent des plans de paiement sans frais. Mieux que de s\'endetter.'
                    }
                }
            ]
        },
        {
            month: 5,
            icon: '🏪',
            title: 'Supermarché : Choix de consommation',
            description: 'Tu fais tes courses. Pour un même panier, tu as le choix : marques premium (500€), marques classiques (400€), ou marques distributeur + promotions (320€).',
            choices: [
                {
                    text: 'Marques premium (500€)',
                    icon: '🌟',
                    impact: '+100€ de dépenses',
                    consequence: {
                        balance: -100,
                        score: -20,
                        feedback: '⚠️ Les marques premium coûtent 56% plus cher que les marques distributeur pour une qualité souvent similaire.'
                    }
                },
                {
                    text: 'Marques classiques (400€)',
                    icon: '🛒',
                    impact: 'Budget prévu respecté',
                    consequence: {
                        balance: 0,
                        score: 20,
                        feedback: '👍 Choix standard, budget respecté. C\'est correct mais tu peux optimiser davantage.'
                    }
                },
                {
                    text: 'Marques distributeur + promotions (320€)',
                    icon: '🎯',
                    impact: '+80€ d\'économie',
                    consequence: {
                        balance: 80,
                        savings: 80,
                        score: 50,
                        badge: 'comparateur',
                        feedback: '✅ Excellent ! En Belgique, l\'alimentation représente 14% du budget. Tu viens d\'économiser 180€ sur l\'année. Les comparateurs de prix sont tes alliés !'
                    }
                }
            ]
        },
        {
            month: 6,
            icon: '📊',
            title: 'Bilan mi-parcours',
            description: 'C\'est le moment de comparer ton budget prévisionnel au budget réel. Tu remarques plusieurs écarts entre ce que tu avais prévu et ce que tu as vraiment dépensé.',
            choices: [
                {
                    text: 'Ignorer les écarts et continuer comme avant',
                    icon: '🙈',
                    impact: 'Pas d\'amélioration',
                    consequence: {
                        balance: 0,
                        score: -20,
                        feedback: '❌ Erreur ! Analyser les écarts budget prévisionnel vs réel est essentiel pour s\'améliorer. Sans cette analyse, tu répètes les mêmes erreurs.'
                    }
                },
                {
                    text: 'Analyser les écarts et ajuster le budget',
                    icon: '📈',
                    impact: 'Meilleure gestion future',
                    consequence: {
                        balance: 50,
                        score: 50,
                        badge: 'prevoyant',
                        feedback: '✅ Parfait ! Tu comprends maintenant où partait vraiment ton argent. Par exemple, si tu dépenses systématiquement 450€ en courses au lieu de 400€ prévus, il faut soit augmenter la prévision, soit chercher à réduire.'
                    }
                },
                {
                    text: 'Demander conseil (service budgétaire gratuit)',
                    icon: '🤝',
                    impact: 'Accompagnement professionnel',
                    consequence: {
                        balance: 0,
                        score: 40,
                        feedback: '👍 Sage décision ! Le CPAS, Wikifin et d\'autres organismes proposent des conseils budgétaires gratuits. Pas besoin d\'être surendetté pour demander de l\'aide.'
                    }
                }
            ]
        },
        {
            month: 7,
            icon: '💼',
            title: 'Opportunité professionnelle',
            description: 'On te propose une formation professionnelle payante (300€) qui pourrait t\'aider à obtenir une promotion dans 6 mois (+200€/mois de salaire).',
            choices: [
                {
                    text: 'Refuser (trop cher)',
                    icon: '❌',
                    impact: 'Pas d\'investissement',
                    consequence: {
                        balance: 0,
                        score: -10,
                        feedback: '⚠️ Parfois, investir en soi est rentable. Cette formation aurait été amortie en 2 mois avec l\'augmentation de salaire.'
                    }
                },
                {
                    text: 'Prendre un crédit pour financer',
                    icon: '💳',
                    impact: '+350€ de dette totale',
                    consequence: {
                        balance: -50,
                        credits: 1,
                        score: -30,
                        feedback: '⚠️ Pour 300€, un crédit n\'est pas nécessaire. Mieux vaut épargner quelques mois ou négocier un paiement en plusieurs fois.'
                    }
                },
                {
                    text: 'Épargner 2 mois et payer comptant',
                    icon: '💪',
                    impact: 'Investissement maîtrisé',
                    consequence: {
                        balance: -300,
                        futureIncome: 200,
                        score: 60,
                        feedback: '✅ Excellente stratégie ! Tu planifies un investissement en l\'épargnant d\'abord. Résultat : formation payée sans dette, et bientôt une augmentation de 200€/mois !'
                    }
                }
            ]
        },
        {
            month: 8,
            icon: '🚗',
            title: 'CRISE : Panne de voiture',
            description: 'Ta voiture tombe en panne. Réparation : 600€. Tu as besoin de ta voiture pour aller travailler. Ton épargne actuelle te permettra-t-elle de faire face ?',
            isCrisis: true,
            choices: [
                {
                    text: 'Payer comptant avec l\'épargne',
                    icon: '💰',
                    impact: '-600€ d\'épargne',
                    consequence: {
                        balance: -600,
                        score: 40,
                        feedback: '✅ C\'est exactement l\'utilité de l\'épargne de précaution ! Tu gères l\'imprévu sans t\'endetter. Ta voiture est réparée, tu peux continuer à travailler.'
                    }
                },
                {
                    text: 'Prendre un crédit réparation auto',
                    icon: '💳',
                    impact: '+700€ de dette (avec intérêts)',
                    consequence: {
                        balance: 0,
                        monthlyDebt: 80,
                        credits: 1,
                        score: -40,
                        feedback: '⚠️ Tu n\'avais pas d\'épargne de précaution. Avec un crédit à 10% sur 12 mois, la réparation te coûtera finalement 700€. Leçon : TOUJOURS avoir une épargne de secours.'
                    }
                },
                {
                    text: 'Reporter la réparation (utiliser les transports en commun)',
                    icon: '🚌',
                    impact: 'Économies mais perte de temps',
                    consequence: {
                        balance: -100,
                        score: 10,
                        feedback: '🤔 Solution temporaire. Les transports en commun coûtent moins cher mais tu perds du temps. Il faudra réparer la voiture tôt ou tard.'
                    }
                }
            ]
        },
        {
            month: 9,
            icon: '📉',
            title: 'CRISE : Perte d\'emploi temporaire',
            description: 'Ton contrat n\'est pas renouvelé. Tu touches maintenant les allocations de chômage (65% de ton ancien salaire). Cette situation durera 3 mois.',
            isCrisis: true,
            choices: [
                {
                    text: 'Paniquer et prendre plusieurs crédits',
                    icon: '😱',
                    impact: 'Endettement multiple',
                    consequence: {
                        balance: 1500,
                        monthlyDebt: 200,
                        credits: 3,
                        score: -80,
                        feedback: '❌ DANGER ! C\'est l\'une des principales causes de surendettement en Belgique. Tu accumules les crédits par panique. Tu devras bientôt contacter un médiateur de dettes.'
                    }
                },
                {
                    text: 'Réduire drastiquement toutes les dépenses variables',
                    icon: '✂️',
                    impact: 'Économies importantes',
                    consequence: {
                        balance: -200,
                        score: 50,
                        feedback: '✅ Réaction intelligente ! Tu coupes les loisirs, limites les sorties, achètes en promo... Les dépenses FIXES ne peuvent pas être réduites rapidement, mais les VARIABLES oui. Tu tiens le coup sans t\'endetter.'
                    }
                },
                {
                    text: 'Contacter le CPAS et négocier avec les créanciers',
                    icon: '🤝',
                    impact: 'Soutien social + délais',
                    consequence: {
                        balance: 0,
                        score: 60,
                        badge: 'survivor',
                        feedback: '✅ Excellent réflexe ! Le CPAS peut : 1) T\'aider financièrement temporairement, 2) Te mettre en contact avec un médiateur de dettes. Les créanciers acceptent souvent des plans de paiement si tu les contactes AVANT d\'être en retard.'
                    }
                }
            ]
        },
        {
            month: 10,
            icon: '📱',
            title: 'Tentation crédit revolving',
            description: 'Tu reçois une offre de crédit revolving (carte de crédit permanente) : 2000€ disponibles immédiatement, "tu rembourses quand tu veux". Taux d\'intérêt : 15%/an.',
            choices: [
                {
                    text: 'Accepter "au cas où"',
                    icon: '💳',
                    impact: 'Tentation permanente',
                    consequence: {
                        balance: 0,
                        score: -40,
                        feedback: '⚠️ Le crédit revolving est l\'un des crédits les plus chers (jusqu\'à 15-20% d\'intérêts) et le plus dangereux. Beaucoup de personnes surendettées ont commencé par un crédit revolving "au cas où". Mieux vaut renforcer ton épargne.'
                    }
                },
                {
                    text: 'Refuser et renforcer l\'épargne à la place',
                    icon: '🛡️',
                    impact: '+100€ d\'épargne',
                    consequence: {
                        balance: 100,
                        savings: 100,
                        score: 50,
                        feedback: '✅ Sage décision ! L\'épargne de précaution est un crédit gratuit que tu te fais à toi-même. Si tu épargnes 100€/mois, tu auras 1200€ au bout d\'un an, SANS payer d\'intérêts.'
                    }
                },
                {
                    text: 'Consulter la Centrale des Crédits avant de décider',
                    icon: '🔍',
                    impact: 'Information éclairée',
                    consequence: {
                        balance: 0,
                        score: 40,
                        feedback: '👍 Bonne pratique ! La Centrale des Crédits (CCP) de la Banque Nationale enregistre TOUS les crédits en Belgique. Les prêteurs doivent la consulter avant d\'accorder un crédit, pour éviter le surendettement.'
                    }
                }
            ]
        },
        {
            month: 11,
            icon: '🎄',
            title: 'Fêtes de fin d\'année',
            description: 'Noël approche : cadeaux, repas, décorations... Tu avais prévu 200€ mais les tentations sont partout. Tes enfants/proches attendent des cadeaux.',
            choices: [
                {
                    text: 'Dépenser 500€ (carte de crédit)',
                    icon: '🎁',
                    impact: '+300€ de dette',
                    consequence: {
                        balance: -300,
                        credits: 1,
                        score: -30,
                        feedback: '⚠️ Les fêtes sont une période critique pour le budget. Beaucoup de ménages s\'endettent en décembre et mettent des mois à s\'en remettre.'
                    }
                },
                {
                    text: 'Respecter le budget de 200€ (cadeaux faits maison + repas simple)',
                    icon: '🏡',
                    impact: 'Budget respecté',
                    consequence: {
                        balance: 0,
                        score: 40,
                        feedback: '✅ Belle maîtrise ! Les cadeaux faits maison ont souvent plus de valeur sentimentale. Un repas simple en famille vaut mieux qu\'un festin acheté à crédit.'
                    }
                },
                {
                    text: 'Planifier : mettre 50€ de côté chaque mois toute l\'année',
                    icon: '📅',
                    impact: '600€ disponibles l\'an prochain',
                    consequence: {
                        balance: 0,
                        score: 60,
                        feedback: '✅ Stratégie d\'expert ! En épargnant 50€/mois toute l\'année, tu auras 600€ pour Noël prochain SANS stress ni dette. Les dépenses occasionnelles (Noël, vacances...) se PRÉVOIENT.'
                    }
                }
            ]
        },
        {
            month: 12,
            icon: '📊',
            title: 'Bilan de l\'année',
            description: 'L\'année se termine. Tu fais le point sur ta gestion budgétaire. Certaines situations ont été difficiles. Que retiens-tu de cette année ?',
            choices: [
                {
                    text: 'Continuer à vivre au jour le jour sans planification',
                    icon: '🎲',
                    impact: 'Risque de répéter les erreurs',
                    consequence: {
                        balance: 0,
                        score: -20,
                        feedback: '⚠️ Sans planification budgétaire, tu es à la merci des imprévus. En Belgique, 18% de la population est en risque de pauvreté ou d\'exclusion sociale. Un budget bien géré est la meilleure protection.'
                    }
                },
                {
                    text: 'Mettre en place un budget prévisionnel mensuel',
                    icon: '📋',
                    impact: 'Meilleur contrôle',
                    consequence: {
                        balance: 0,
                        score: 50,
                        feedback: '✅ C\'est la base ! Un budget prévisionnel te permet d\'anticiper, de prioriser et d\'épargner. Outils gratuits : Wikifin, applications mobiles, ou simple tableau Excel.'
                    }
                },
                {
                    text: 'Appliquer les 5 règles d\'or de la gestion budgétaire',
                    icon: '⭐',
                    impact: 'Maîtrise totale',
                    consequence: {
                        balance: 100,
                        score: 80,
                        feedback: '✅ PARFAIT ! Les 5 règles d\'or : 1) Tenir ses comptes mensuellement, 2) Prioriser besoins sur envies, 3) Comparer les offres, 4) Ne JAMAIS prendre un crédit pour en rembourser un autre, 5) Constituer une épargne de précaution. Tu maîtrises ta vie financière !'
                    }
                }
            ]
        }
    ],

    // Questions de quiz (intégrées aléatoirement)
    quizQuestions: [
        {
            question: 'En Belgique, quel est le poste de dépense le plus important dans le budget des ménages ?',
            options: [
                'L\'alimentation (50% du budget)',
                'Le logement (environ 30% du budget)',
                'Les loisirs (25% du budget)',
                'Le transport (40% du budget)'
            ],
            correct: 1,
            explanation: 'Le LOGEMENT représente environ 30% du budget des ménages belges (loyer ou crédit hypothécaire). C\'est de loin le poste le plus important. L\'alimentation vient en 2e position avec 14%.'
        },
        {
            question: 'Quelle est la différence entre une dépense FIXE et une dépense VARIABLE ?',
            options: [
                'Les dépenses fixes changent chaque mois, les variables sont stables',
                'Les dépenses fixes sont obligatoires et stables, les variables peuvent être ajustées',
                'Il n\'y a pas de différence, c\'est la même chose',
                'Les dépenses fixes coûtent toujours plus cher'
            ],
            correct: 1,
            explanation: 'Les dépenses FIXES sont obligatoires et leur montant est stable (loyer, assurances, abonnements). Les dépenses VARIABLES peuvent être ajustées selon nos choix (alimentation, loisirs, vêtements).'
        },
        {
            question: 'Qu\'est-ce qu\'un budget prévisionnel ?',
            options: [
                'C\'est le budget du gouvernement pour l\'année prochaine',
                'C\'est planifier à l\'avance ses recettes et dépenses sur une période donnée',
                'C\'est le montant d\'argent qu\'on a dans notre compte en banque',
                'C\'est le salaire qu\'on espère avoir dans le futur'
            ],
            correct: 1,
            explanation: 'Un budget PRÉVISIONNEL est un document où on estime à l\'avance combien d\'argent entrera (recettes) et sortira (dépenses). On le compare ensuite au budget RÉEL pour voir les écarts et s\'améliorer.'
        },
        {
            question: 'En cas de surendettement en Belgique, vers qui peut-on se tourner pour obtenir de l\'aide ?',
            options: [
                'Personne, il faut se débrouiller seul',
                'Uniquement les banques',
                'Le médiateur de dettes (CPAS ou associations), la procédure de règlement collectif de dettes',
                'Seulement la police'
            ],
            correct: 2,
            explanation: 'En Belgique, le MÉDIATEUR DE DETTES (via le CPAS ou des associations) aide gratuitement les personnes surendettées. Si nécessaire, il existe aussi une procédure judiciaire : le RÈGLEMENT COLLECTIF DE DETTES (RCD) devant le tribunal du travail.'
        },
        {
            question: 'Pourquoi est-il dangereux de prendre un crédit pour rembourser un autre crédit ?',
            options: [
                'Ce n\'est pas dangereux, c\'est même recommandé',
                'Cela crée un effet boule de neige : on accumule les dettes et les intérêts',
                'C\'est interdit par la loi belge',
                'Cela n\'a aucun impact sur le budget'
            ],
            correct: 1,
            explanation: 'Prendre un crédit pour rembourser un autre crédit est une des causes principales de SURENDETTEMENT. On entre dans une spirale : les dettes s\'accumulent, les intérêts s\'additionnent, et on perd le contrôle de son budget.'
        },
        {
            question: 'Qu\'est-ce que l\'épargne de précaution et à quoi sert-elle ?',
            options: [
                'C\'est de l\'argent mis de côté pour acheter des objets de luxe',
                'C\'est une réserve d\'argent pour faire face aux imprévus (panne, maladie, perte d\'emploi)',
                'C\'est l\'argent qu\'on prête à ses amis',
                'C\'est un compte bancaire bloqué jusqu\'à la retraite'
            ],
            correct: 1,
            explanation: 'L\'ÉPARGNE DE PRÉCAUTION est un coussin de sécurité : une réserve d\'argent qu\'on garde pour les IMPRÉVUS (panne de voiture, frais médicaux, perte d\'emploi temporaire). Elle permet d\'éviter de s\'endetter en cas de coup dur.'
        },
        {
            question: 'Quel est le taux de risque de pauvreté en Belgique en 2024 ?',
            options: [
                'Environ 2% de la population',
                'Environ 11-12% de la population',
                'Environ 50% de la population',
                'Il n\'y a pas de pauvreté en Belgique'
            ],
            correct: 1,
            explanation: 'En Belgique en 2024, environ 11-12% de la population vit sous le seuil de pauvreté (soit plus d\'1 personne sur 10). Le seuil de pauvreté pour une personne seule est d\'environ 1520€/mois. Environ 18% de la population est en risque de pauvreté ou d\'exclusion sociale.'
        },
        {
            question: 'Qu\'est-ce que la Centrale des Crédits aux Particuliers (CCP) ?',
            options: [
                'C\'est un magasin qui vend des crédits',
                'C\'est un registre national (Banque Nationale) qui enregistre tous les crédits des Belges',
                'C\'est une association d\'aide aux personnes surendettées',
                'C\'est le nom d\'une banque belge'
            ],
            correct: 1,
            explanation: 'La CENTRALE DES CRÉDITS AUX PARTICULIERS (CCP) est gérée par la Banque Nationale de Belgique. Elle enregistre TOUS les crédits pris par les particuliers. Avant d\'accorder un crédit, les prêteurs DOIVENT consulter la CCP pour vérifier que la personne peut rembourser (lutte contre le surendettement).'
        },
        {
            question: 'Quelle est la meilleure stratégie pour gérer les dépenses occasionnelles (Noël, vacances, anniversaires) ?',
            options: [
                'Utiliser sa carte de crédit le moment venu',
                'Ne rien prévoir et s\'adapter au dernier moment',
                'Épargner un petit montant chaque mois toute l\'année',
                'Demander de l\'argent à sa famille'
            ],
            correct: 2,
            explanation: 'Les dépenses OCCASIONNELLES doivent être ANTICIPÉES. La meilleure stratégie : épargner régulièrement toute l\'année. Exemple : pour avoir 600€ à Noël, il suffit d\'épargner 50€/mois. Ainsi, pas de stress ni de dette quand arrive la période de fêtes.'
        },
        {
            question: 'Quelle affirmation est VRAIE concernant le crédit à la consommation ?',
            options: [
                'Il est toujours gratuit, il n\'y a jamais d\'intérêts',
                'On peut en prendre autant qu\'on veut sans conséquence',
                'Le coût total du crédit (avec intérêts) est toujours supérieur au prix d\'achat initial',
                'C\'est la solution recommandée pour tous les achats'
            ],
            correct: 2,
            explanation: 'Un crédit à la consommation a TOUJOURS un coût : les INTÉRÊTS. Résultat : on paye plus cher au total qu\'en achetant comptant. Exemple : un smartphone à 600€ acheté à crédit sur 12 mois peut coûter 840€ au final (intérêts compris). Il faut l\'utiliser seulement si vraiment nécessaire.'
        }
    ],

    // Badges disponibles
    badges: {
        economie: {
            id: 'economie',
            name: '🏆 Roi de l\'épargne',
            description: 'Tu as constitué une belle épargne',
            condition: 'Épargner au moins 500€'
        },
        prudent: {
            id: 'prudent',
            name: '🛡️ Acheteur prudent',
            description: 'Tu réfléchis avant d\'acheter',
            condition: 'Refuser au moins 2 achats impulsifs'
        },
        comparateur: {
            id: 'comparateur',
            name: '🔍 Expert comparaison',
            description: 'Tu compares toujours les prix',
            condition: 'Choisir les options économiques'
        },
        prevoyant: {
            id: 'prevoyant',
            name: '📊 Maître de la prévoyance',
            description: 'Tu planifies ton budget',
            condition: 'Analyser les écarts budget prévisionnel/réel'
        },
        survivor: {
            id: 'survivor',
            name: '💪 Survivant financier',
            description: 'Tu as surmonté une crise financière',
            condition: 'Gérer la perte d\'emploi sans s\'endetter'
        }
    },

    // Statistiques belges (pour affichage pédagogique)
    belgiumStats: {
        housing: 30,        // % du budget pour le logement
        food: 14,           // % pour l'alimentation
        transport: 11,      // % pour le transport
        leisure: 8,         // % pour les loisirs
        health: 5,          // % pour la santé
        clothing: 4,        // % pour les vêtements
        povertyRate: 11.4,  // % de pauvreté monétaire
        povertyThresholdSingle: 1522,  // € par mois pour une personne seule
        povertyThresholdFamily: 3197   // € par mois pour 2 adultes + 2 enfants
    }
};
