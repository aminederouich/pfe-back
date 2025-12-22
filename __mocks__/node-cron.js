/**
 * Mock node-cron
 */

const mockSchedule = jest.fn(() => {
  return {
    start: jest.fn(),
    stop: jest.fn(),
    destroy: jest.fn(),
  };
});

module.exports = {
  schedule: mockSchedule,
};
