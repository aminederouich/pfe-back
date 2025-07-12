// Utilitaire de nettoyage pour les tests
// À utiliser dans les tests qui manipulent des connexions externes

/* eslint-env jest */
/* eslint-disable no-unused-vars */

class TestCleanup {
  constructor() {
    this.cleanup = [];
  }

  // Ajouter une fonction de nettoyage
  add(cleanupFn) {
    this.cleanup.push(cleanupFn);
  }

  // Exécuter tous les nettoyages
  async run() {
    for (const cleanupFn of this.cleanup) {
      try {
        if (typeof cleanupFn === 'function') {
          await cleanupFn();
        }
      } catch (error) {
        // Ignorer les erreurs de nettoyage
        console.warn('Cleanup error:', error.message);
      }
    }
    this.cleanup = [];
  }

  // Nettoyer les timers actifs
  clearTimers() {
    // Nettoyer tous les timers Jest si Jest est disponible
    if (typeof jest !== 'undefined' && jest.clearAllTimers) {
      jest.clearAllTimers();
    }
    
    // Nettoyer les intervals et timeouts globaux
    const timers = global.setTimeout.toString().includes('[native code]') ? [] : global.setTimeout._timers || [];
    timers.forEach(timer => {
      try {
        clearTimeout(timer);
        clearInterval(timer);
      } catch (e) {
        // Ignorer les erreurs
      }
    });
  }

  // Fermer les connexions Express
  closeExpressApp(app) {
    if (app && typeof app.removeAllListeners === 'function') {
      app.removeAllListeners();
    }
  }

  // Nettoyage complet
  async fullCleanup(app = null) {
    this.clearTimers();
    if (app) {
      this.closeExpressApp(app);
    }
    await this.run();
    
    // Forcer le garbage collector si disponible
    if (global.gc) {
      global.gc();
    }
  }
}

module.exports = TestCleanup;
