import request from 'supertest';
import { Connection } from 'typeorm';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;

describe("Get Statement Operation Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to show statement operation", async () => {
    await request(app)
      .post("/api/v1/users")
      .send({
        name: "operation controller",
        email: "operationController@test.com",
        password: "123"
      });

    const session = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: "operationController@test.com",
        password: "123"
      });

    const { token } = session.body;

    const statement = await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 500,
        description: 'deposit value'
      })
      .set({
        authorization: `Bearer ${token}`,
      });

    const { id } = statement.body;

    const balance = await request(app)
      .get(`/api/v1/statements/${id}`)
      .set({
        authorization: `Bearer ${token}`,
      });

    expect(balance.status).toEqual(200);
  });

  it("should not be able to show statement operation with nonexistent user", async () => {
    const expectError = await request(app)
      .get(`/api/v1/statements/id-statement`)
      .set({
        authorization: `Bearer token`,
      });

    expect(expectError.status).toEqual(401);
  })

  it("should not be able to show statement operation with nonexistent statement", async () => {
    await request(app)
      .post("/api/v1/users")
      .send({
        name: "operation teste",
        email: "operation@test.com",
        password: "123"
      });

    const session = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: "operation@test.com",
        password: "123"
      });

    const { token } = session.body;

    await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 100,
        description: 'deposit value'
      })
      .set({
        authorization: `Bearer ${token}`,
      });

    const expectError = await request(app)
      .get(`/api/v1/statements/369f13b5-67cf-443d-9908-8fd9caa20d19`)
      .set({
        authorization: `Bearer ${token}`,
      });

    expect(expectError.status).toEqual(404);
  })
});
