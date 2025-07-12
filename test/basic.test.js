// Test simple pour vérifier que Jest fonctionne
describe('Test de base', () => {
  test('Jest fonctionne correctement', () => {
    expect(1 + 1).toBe(2);
  });

  test('Les mocks fonctionnent', () => {
    const mockFn = jest.fn();
    mockFn('test');
    expect(mockFn).toHaveBeenCalledWith('test');
  });
});
