import request from 'supertest';
import { Connection } from 'typeorm';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;

describe("Create Statement Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create deposit statement", async () => {
    await request(app)
      .post("/api/v1/users")
      .send({
        name: "testing controller",
        email: "testingController@test.com",
        password: "123"
      });

    const session = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: "testingController@test.com",
        password: "123"
      });

    const { token } = session.body;

    const deposit = await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 500,
        description: 'deposit value'
      })
      .set({
        authorization: `Bearer ${token}`,
      });

    expect(deposit.status).toEqual(201);
  });

  it("should be able to create withdraw statement", async () => {
    await request(app)
      .post("/api/v1/users")
      .send({
        name: "testing controller",
        email: "testingController@test.com",
        password: "123"
      });

    const session = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: "testingController@test.com",
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

    const deposit = await request(app)
      .post('/api/v1/statements/withdraw')
      .send({
        amount: 50,
        description: 'withdraw value'
      })
      .set({
        authorization: `Bearer ${token}`,
      });

    expect(deposit.status).toEqual(201);
  })

  it("should not be able to create a new statement with nonexistent user", async () => {
    const expectError = await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 500,
        description: 'deposit value'
      })
      .set({
        authorization: `Bearer token`,
      });

    expect(expectError.status).toEqual(401);
  })

  it("should not be able to generate a withdraw statement with balance insufficient", async () => {
    await request(app)
      .post("/api/v1/users")
      .send({
        name: "error",
        email: "error@test.com",
        password: "123"
      });

    const session = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: "error@test.com",
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

    const deposit = await request(app)
      .post('/api/v1/statements/withdraw')
      .send({
        amount: 250,
        description: 'withdraw value'
      })
      .set({
        authorization: `Bearer ${token}`,
      });

    expect(deposit.status).toEqual(400);
  })
});
