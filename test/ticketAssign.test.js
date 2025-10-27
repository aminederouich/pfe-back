const ticketService = require('../services/ticket.service');

const config = {
  protocol: 'https',
  host: 'example.atlassian.net',
  apiVersion: '3',
  username: 'user@example.com',
  password: 'pass',
};

describe('ticketService.getIssueDetails', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  test('returns parsed issue data when request succeeds', async () => {
    const payload = { key: 'TEST-1', fields: {} };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => payload,
    });

    const result = await ticketService.getIssueDetails('TEST-1', config);

    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.atlassian.net/rest/api/3/issue/TEST-1',
      {
        method: 'GET',
        headers: {
          Authorization: `Basic ${Buffer.from('user@example.com:pass').toString('base64')}`,
          Accept: 'application/json',
        },
      },
    );
    expect(result).toEqual(payload);
  });

  test('throws when Jira returns a non-OK status', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    await expect(ticketService.getIssueDetails('TEST-404', config)).rejects.toThrow(
      'Failed to fetch issue details: 404 Not Found',
    );
  });

  test('wraps fetch failures with Jira connection message', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network down'));

    await expect(ticketService.getIssueDetails('TEST-ERR', config)).rejects.toThrow(
      'Jira connection test failed: network down',
    );
  });
});
