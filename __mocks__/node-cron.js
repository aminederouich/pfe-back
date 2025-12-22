/**
 * Mock node-cron
 */

const mockSchedule = jest.fn((cronExpression, callback) => {
  return {
    start: jest.fn(),
    stop: jest.fn(),
    destroy: jest.fn(),
  };
});

module.exports = {
  schedule: mockSchedule,
};
