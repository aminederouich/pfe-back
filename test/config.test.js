// Test minimal pour vérifier la configuration
describe('Configuration Test', () => {
  test('Jest configuration works', () => {
    expect(1 + 1).toBe(2);
  });

  test('Mocks work correctly', () => {
    const mockFn = jest.fn();
    mockFn('test');
    expect(mockFn).toHaveBeenCalledWith('test');
  });

  test('Async operations work', async () => {
    const promise = Promise.resolve('success');
    const result = await promise;
    expect(result).toBe('success');
  });
});

// Test que les hooks de nettoyage fonctionnent
describe('Cleanup Test', () => {
  let cleanup = [];

  beforeEach(() => {
    cleanup = [];
  });

  afterEach(() => {
    // Exécuter le nettoyage
    cleanup.forEach(fn => {
      try {
        fn();
      } catch (e) {
        // Ignorer les erreurs
      }
    });
    cleanup = [];
  });

  test('Cleanup hooks work', () => {
    let cleaned = false;
    cleanup.push(() => {
      cleaned = true;
    });
    expect(cleaned).toBe(false);
  });
});
