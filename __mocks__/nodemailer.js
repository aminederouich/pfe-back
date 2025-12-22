/**
 * Mock Nodemailer
 */

const mockSendMail = jest.fn(() => {
  return Promise.resolve({
    messageId: `test-message-id-${Date.now()}`,
    accepted: ['recipient@example.com'],
    rejected: [],
    response: '250 Message accepted',
  });
});

const mockTransporter = {
  sendMail: mockSendMail,
  verify: jest.fn(() => Promise.resolve(true)),
};

const createTransport = jest.fn(() => mockTransporter);

module.exports = {
  createTransport,
  mockTransporter,
  mockSendMail,
};
