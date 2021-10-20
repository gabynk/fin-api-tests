import request from 'supertest';
import { Connection } from 'typeorm';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;

describe("Get Balance Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to show statement balance", async () => {
    await request(app)
      .post("/api/v1/users")
      .send({
        name: "balance controller",
        email: "balanceController@test.com",
        password: "123"
      });

    const session = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: "balanceController@test.com",
        password: "123"
      });

    const { token } = session.body;

    await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 500,
        description: 'deposit value'
      })
      .set({
        authorization: `Bearer ${token}`,
      });

    const balance = await request(app)
      .get('/api/v1/statements/balance')
      .set({
        authorization: `Bearer ${token}`,
      });

    expect(balance.status).toEqual(200);
  });

  it("should not be able to show statement balance with nonexistent user", async () => {
    const expectError = await request(app)
      .get('/api/v1/statements/balance')
      .set({
        authorization: `Bearer token`,
      });

    expect(expectError.status).toEqual(401);
  })
});
