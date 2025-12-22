/**
 * Script pour générer une interface de vérification JIRA en mode terminal
 */

const fs = require('fs');
const path = require('path');

// Fonction pour centrer le texte
function center(text, width = 80) {
  const spaces = Math.max(0, Math.floor((width - text.length) / 2));
  return ' '.repeat(spaces) + text;
}

// Fonction pour créer une ligne
function line(char = '═', width = 80) {
  return char.repeat(width);
}

console.log(`\n${line('═', 80)}`);
console.log(center('🔗 INTERFACE DE VÉRIFICATION ET SYNCHRONISATION JIRA', 80));
console.log(`${line('═', 80)}\n`);

// Section Configuration
console.log(`┌${line('─', 78)}┐`);
console.log(`│${center('CONFIGURATION JIRA', 78)}│`);
console.log(`├${line('─', 78)}┤`);
console.log('│                                                                              │');
console.log('│  📌 URL JIRA          : https://sesame-team-pfe.atlassian.net               │');
console.log('│  🔑 Project Key       : TAKEIT                                              │');
console.log('│  👤 Utilisateur       : mohamedamine.derouich@sesame.com.tn                 │');
console.log('│  🔐 Méthode Auth      : *********                                           │');
console.log('│  📊 Statut Connexion  : ● CONNECTÉ                                          │');
console.log('│                                                                              │');
console.log(`└${line('─', 78)}┘\n`);

// Section Statistiques de Synchronisation
console.log(`┌${line('─', 78)}┐`);
console.log(`│${center('STATISTIQUES DE SYNCHRONISATION', 78)}│`);
console.log(`├${line('─', 78)}┤`);
console.log('│                                                                              │');
console.log('│  🕐 Dernière synchronisation  : 19 novembre 2025 à 14:30:45                 │');
console.log('│  📦 Tickets synchronisés      : 1,247 tickets                               │');
console.log('│  ✅ Synchronisés avec succès  : 1,235 tickets (99.0%)                       │');
console.log('│  ⚠️  Erreurs de synchronisation: 12 tickets (1.0%)                          │');
console.log('│  ⏱️  Durée de synchronisation : 4 minutes 32 secondes                       │');
console.log('│  📈 Tickets mis à jour        : 156 tickets                                 │');
console.log('│  🆕 Nouveaux tickets          : 23 tickets                                  │');
console.log('│                                                                              │');
console.log(`└${line('─', 78)}┘\n`);

// Section Actions
console.log(`┌${line('─', 78)}┐`);
console.log(`│${center('ACTIONS DISPONIBLES', 78)}│`);
console.log(`├${line('─', 78)}┤`);
console.log('│                                                                              │');
console.log('│     [1] 🔍 Vérifier la cohérence des données                                │');
console.log('│     [2] 🔄 Synchroniser maintenant                                          │');
console.log('│     [3] 📊 Afficher le rapport détaillé                                     │');
console.log('│     [4] ⚙️  Modifier la configuration                                       │');
console.log('│     [5] 📜 Consulter l\'historique de synchronisation                        │');
console.log('│                                                                              │');
console.log(`└${line('─', 78)}┘\n`);

// Section Vérification de Cohérence (dernière exécution)
console.log(`┌${line('─', 78)}┐`);
console.log(`│${center('DERNIÈRE VÉRIFICATION DE COHÉRENCE', 78)}│`);
console.log(`├${line('─', 78)}┤`);
console.log('│                                                                              │');
console.log('│  🕐 Exécutée le               : 19 novembre 2025 à 10:00:00                 │');
console.log('│  ✅ Tickets cohérents         : 1,235 / 1,247 (99.0%)                       │');
console.log('│  ⚠️  Incohérences détectées   : 12 tickets                                  │');
console.log('│                                                                              │');
console.log('│  💡 Recommandation : Exécuter une synchronisation pour corriger             │');
console.log('│                                                                              │');
console.log(`└${line('─', 78)}┘\n`);

// Section Logs de Synchronisation
console.log(`┌${line('─', 78)}┐`);
console.log(`│${center('LOGS DE SYNCHRONISATION (5 DERNIÈRES ENTRÉES)', 78)}│`);
console.log(`├${line('─', 78)}┤`);
console.log('│                                                                              │');
console.log('│  [14:30:45] ✅ Synchronisation démarrée                                     │');
console.log('│  [14:31:12] 📥 Récupération de 1,247 tickets depuis JIRA...                │');
console.log('│  [14:32:45] 🔄 Mise à jour de 156 tickets dans Firebase...                 │');
console.log('│  [14:34:23] 🆕 Ajout de 23 nouveaux tickets...                             │');
console.log('│  [14:35:17] ✅ Synchronisation terminée avec succès (4m 32s)                │');
console.log('│                                                                              │');
console.log(`└${line('─', 78)}┘\n`);

// Section Performance
console.log(`┌${line('─', 78)}┐`);
console.log(`│${center('INDICATEURS DE PERFORMANCE', 78)}│`);
console.log(`├${line('─', 78)}┤`);
console.log('│                                                                              │');
console.log('│  Temps de réponse API JIRA    ████████████████████████░░░░░░  245 ms       │');
console.log('│  Vitesse de synchronisation   ███████████████████████████░░░  92%          │');
console.log('│  Taux de succès               ████████████████████████████░░  99%          │');
console.log('│  Utilisation de la bande pass ████████████████░░░░░░░░░░░░░  54%          │');
console.log('│                                                                              │');
console.log(`└${line('─', 78)}┘\n`);

console.log('✅ Interface de vérification JIRA générée avec succès!\n');
