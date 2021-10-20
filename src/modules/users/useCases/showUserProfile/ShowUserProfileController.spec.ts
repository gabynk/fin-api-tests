import request from 'supertest';
import { Connection } from 'typeorm';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;

describe("Show User Profile Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to show user profile", async () => {
    await request(app)
      .post('/api/v1/users')
      .send({
        name: "Name 1",
        email: "name1@test.com",
        password: "123"
      });

    const session = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: "name1@test.com",
        password: "123"
      });

    const { token } = session.body;

    const profile = await request(app)
      .get('/api/v1/profile')
      .set({
        authorization: `Bearer ${token}`,
      });

    expect(profile.body.name).toEqual("Name 1");
  });
});
