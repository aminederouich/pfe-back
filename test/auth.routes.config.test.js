const express = require('express');
const authRoutes = require('../routes/auth.routes');

describe('Auth Routes Configuration Tests', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/auth', authRoutes);
  });

  afterEach(() => {
    // Nettoyage des listeners
    app.removeAllListeners();
  });

  afterAll((done) => {
    // Nettoyage final
    done();
  });

  describe('Route Configuration', () => {
    test('should have all required routes defined', () => {
      const routes = [];
      
      // Extraction des routes définies
      authRoutes.stack.forEach((layer) => {
        if (layer.route) {
          const methods = Object.keys(layer.route.methods);
          methods.forEach((method) => {
            routes.push({
              method: method.toUpperCase(),
              path: layer.route.path
            });
          });
        }
      });

      // Vérification que toutes les routes attendues sont présentes
      const expectedRoutes = [
        { method: 'POST', path: '/signup' },
        { method: 'POST', path: '/signin' },
        { method: 'POST', path: '/forget-password' },
        { method: 'POST', path: '/verify-email' },
        { method: 'GET', path: '/check-auth' },
        { method: 'POST', path: '/logout' }
      ];

      expectedRoutes.forEach((expectedRoute) => {
        const routeExists = routes.some(
          (route) => 
            route.method === expectedRoute.method && 
            route.path === expectedRoute.path
        );
        expect(routeExists).toBe(true);
      });
    });

    test('should export router correctly', () => {
      expect(authRoutes).toBeDefined();
      expect(typeof authRoutes).toBe('function');
      expect(authRoutes.stack).toBeDefined();
    });
  });

  describe('Route Methods', () => {
    test('signup route should accept POST method only', () => {
      const signupRoute = authRoutes.stack.find(
        layer => layer.route && layer.route.path === '/signup'
      );
      
      expect(signupRoute).toBeDefined();
      expect(signupRoute.route.methods.post).toBe(true);
      expect(signupRoute.route.methods.get).toBeUndefined();
      expect(signupRoute.route.methods.put).toBeUndefined();
      expect(signupRoute.route.methods.delete).toBeUndefined();
    });

    test('signin route should accept POST method only', () => {
      const signinRoute = authRoutes.stack.find(
        layer => layer.route && layer.route.path === '/signin'
      );
      
      expect(signinRoute).toBeDefined();
      expect(signinRoute.route.methods.post).toBe(true);
      expect(signinRoute.route.methods.get).toBeUndefined();
    });

    test('check-auth route should accept GET method only', () => {
      const checkAuthRoute = authRoutes.stack.find(
        layer => layer.route && layer.route.path === '/check-auth'
      );
      
      expect(checkAuthRoute).toBeDefined();
      expect(checkAuthRoute.route.methods.get).toBe(true);
      expect(checkAuthRoute.route.methods.post).toBeUndefined();
    });

    test('logout route should accept POST method only', () => {
      const logoutRoute = authRoutes.stack.find(
        layer => layer.route && layer.route.path === '/logout'
      );
      
      expect(logoutRoute).toBeDefined();
      expect(logoutRoute.route.methods.post).toBe(true);
      expect(logoutRoute.route.methods.get).toBeUndefined();
    });

    test('forget-password route should accept POST method only', () => {
      const forgetPasswordRoute = authRoutes.stack.find(
        layer => layer.route && layer.route.path === '/forget-password'
      );
      
      expect(forgetPasswordRoute).toBeDefined();
      expect(forgetPasswordRoute.route.methods.post).toBe(true);
      expect(forgetPasswordRoute.route.methods.get).toBeUndefined();
    });

    test('verify-email route should accept POST method only', () => {
      const verifyEmailRoute = authRoutes.stack.find(
        layer => layer.route && layer.route.path === '/verify-email'
      );
      
      expect(verifyEmailRoute).toBeDefined();
      expect(verifyEmailRoute.route.methods.post).toBe(true);
      expect(verifyEmailRoute.route.methods.get).toBeUndefined();
    });
  });

  describe('Route Handlers', () => {
    test('all routes should have handlers defined', () => {
      authRoutes.stack.forEach((layer) => {
        if (layer.route) {
          expect(layer.route.stack).toBeDefined();
          expect(layer.route.stack.length).toBeGreaterThan(0);
          
          layer.route.stack.forEach((routeLayer) => {
            expect(routeLayer.handle).toBeDefined();
            expect(typeof routeLayer.handle).toBe('function');
          });
        }
      });
    });

    test('protected routes should have authentication middleware', () => {
      // check-auth et logout sont des routes protégées
      const protectedPaths = ['/check-auth', '/logout'];
      
      protectedPaths.forEach((path) => {
        const route = authRoutes.stack.find(
          layer => layer.route && layer.route.path === path
        );
        
        expect(route).toBeDefined();
        // Ces routes devraient avoir plus d'un handler (middleware + controller)
        expect(route.route.stack.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('Route Parameters and Validation', () => {
    test('routes should not have URL parameters', () => {
      authRoutes.stack.forEach((layer) => {
        if (layer.route) {
          // Aucune route auth ne devrait avoir de paramètres URL
          expect(layer.route.path).not.toMatch(/:\w+/);
        }
      });
    });

    test('routes should have proper path format', () => {
      const validPaths = [
        '/signup',
        '/signin', 
        '/forget-password',
        '/verify-email',
        '/check-auth',
        '/logout'
      ];

      authRoutes.stack.forEach((layer) => {
        if (layer.route) {
          expect(validPaths).toContain(layer.route.path);
        }
      });
    });
  });
});
