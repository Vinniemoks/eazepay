const request = require('supertest');
const app = require('../index');

describe('Health endpoint', () => {
  it('should return 200 OK', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });
});
