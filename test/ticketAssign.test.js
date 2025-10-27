const ticketService = require('../services/ticket.service');

// Basic config mock
const config = {
  protocol: 'https',
  host: 'example.atlassian.net',
  apiVersion: '3',
  username: 'user@example.com',
  password: 'pass',
};

describe('ticketService.assignIssue', () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
  });

  test('returns success for 204 No Content', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 204,
      statusText: 'No Content',
      text: async () => '',
    });

    const result = await ticketService.assignIssue('TEST-1', 'acc-123', config);
    expect(result.success).toBe(true);
    expect(result.status).toBe(204);
    expect(result.data).toBeNull();
  });

  test('parses JSON body when present', async () => {
    const bodyObj = { result: 'ok' };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () => JSON.stringify(bodyObj),
    });

    const result = await ticketService.assignIssue('TEST-2', 'acc-456', config);
    expect(result.success).toBe(true);
    expect(result.status).toBe(200);
    expect(result.data).toEqual(bodyObj);
  });

  test('handles non-JSON body error', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () => 'not-json',
    });

    const result = await ticketService.assignIssue('TEST-3', 'acc-789', config);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Unexpected token|JSON/);
    expect(result.raw).toBe('not-json');
  });

  test('handles fetch failure', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network down'));
    const result = await ticketService.assignIssue('TEST-4', 'acc-000', config);
    expect(result.success).toBe(false);
    expect(result.error).toBe('network down');
  });
});
