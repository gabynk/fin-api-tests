import request from "supertest";
import { Connection } from "typeorm";
import { hash } from "bcryptjs";
import { v4 as uuid } from "uuid";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

let senderId: string;
let receiverId: string;

describe("CreateTransfer Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    senderId = uuid();
    receiverId = uuid();

    const statementId = uuid();
    const password = await hash("password", 8);

    await connection.query(
      `
        INSERT INTO USERS(id, name, email, password, created_at, updated_at)
        values('${senderId}', 'sender', 'sender@test.com', '${password}', 'now()', 'now()');
        INSERT INTO USERS(id, name, email, password, created_at, updated_at)
        values('${receiverId}', 'receiver', 'receiver@test.com', '${password}', 'now()', 'now()');
        INSERT INTO STATEMENTS(id, user_id, description, amount, type, created_at, updated_at)
        values('${statementId}', '${senderId}', 'deposit description', 300, 'deposit', 'now()', 'now()')
      `
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create transfer statement", async () => {
    const session = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "sender@test.com",
        password: "password",
      });

    const { token } = session.body;

    const response = await request(app)
      .post(`/api/v1/statements/transfer/${receiverId}`)
      .send({
        amount: 100,
        description: "transfer description",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("sender_id");
  });

  it("should not be able to transfer statement with nonexistent receiver user", async () => {
    const session = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "sender@test.com",
        password: "password",
      });

    const { token } = session.body;

    const response = await request(app)
      .post('/api/v1/statements/transfer/7972efd3-b99c-4bca-87b3-aab07cf73848')
      .send({
        amount: 100,
        description: "transfer description",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
  })

  it("should not be able to transfer statement with balance insufficient", async () => {
    const session = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "sender@test.com",
        password: "password",
      });

    const { token } = session.body;

    const response = await request(app)
      .post(`/api/v1/statements/transfer/${receiverId}`)
      .send({
        amount: 500,
        description: "transfer description",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
  })
});
