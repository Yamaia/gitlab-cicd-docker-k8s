const request = require('supertest');
const app = require('../src/app');

describe('API', () => {
  test('GET / retorna mensagem e hostname', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('mensagem');
    expect(res.body).toHaveProperty('hostname');
  });

  test('GET /health retorna status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  test('rota inexistente retorna 404', async () => {
    const res = await request(app).get('/nao-existe');
    expect(res.statusCode).toBe(404);
  });
});
