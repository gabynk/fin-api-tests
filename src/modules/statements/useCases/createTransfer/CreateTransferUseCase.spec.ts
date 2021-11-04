import "reflect-metadata";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { CreateTransferError } from "./CreateTransferError";
import { CreateTransferUseCase } from "./CreateTransferUseCase";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let createTransferUseCase: CreateTransferUseCase;

describe("Create Transfer", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createTransferUseCase = new CreateTransferUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  })

  it("should be able to create transfer statement", async () => {
    const senderUser = await createUserUseCase.execute({
      name: "Test statement",
      email: "sender@test.com",
      password: "1234"
    });

    const receiverUser = await createUserUseCase.execute({
      name: "Test statement",
      email: "receiver@test.com",
      password: "1234"
    });

    await createStatementUseCase.execute({
      user_id: senderUser?.id as string,
      type: OperationType.DEPOSIT,
      amount: 500,
      description: 'deposit value'
    })

    const transferData = await createTransferUseCase.execute({
      user_id: senderUser?.id as string,
      sender_id: receiverUser?.id as string,
      amount: 200,
      description: 'transfer value'
    })

    expect(transferData).toHaveProperty('sender_id')
    expect(transferData).toHaveProperty('id')
  })

  it("should not be able to transfer statement with nonexistent receiver user", async () => {
    const senderUser = await createUserUseCase.execute({
      name: "Test statement",
      email: "sender1@test.com",
      password: "1234"
    });

    await createStatementUseCase.execute({
      user_id: senderUser?.id as string,
      type: OperationType.DEPOSIT,
      amount: 500,
      description: 'deposit value'
    })

    await expect(async () => {
      await createTransferUseCase.execute({
        user_id: senderUser?.id as string,
        sender_id: 'nonexist-receiver-user',
        amount: 200,
        description: 'transfer value'
      })
    }).rejects.toEqual(new CreateTransferError.ReceiverUserNotFound())
  })

  it("should not be able to transfer statement with nonexistent sender user", async () => {
    const receiverUser = await createUserUseCase.execute({
      name: "Test statement",
      email: "receiver12@test.com",
      password: "1234"
    });

    await expect(async () => {
      await createTransferUseCase.execute({
        user_id: 'nonexist-sender-user',
        sender_id: receiverUser?.id as string,
        amount: 200,
        description: 'transfer value'
      })
    }).rejects.toEqual(new CreateTransferError.SenderUserNotFound())
  })

  it("should not be able to transfer statement with balance insufficient", async() => {
    const senderUser = await createUserUseCase.execute({
      name: "Test statement",
      email: "senderError@test.com",
      password: "1234"
    });

    const receiverUser = await createUserUseCase.execute({
      name: "Test statement",
      email: "receiverError@test.com",
      password: "1234"
    });

    await createStatementUseCase.execute({
      user_id: senderUser?.id as string,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'deposit value'
    })

    await expect(async () => {
      await createTransferUseCase.execute({
        user_id: senderUser?.id as string,
        sender_id: receiverUser?.id as string,
        amount: 200,
        description: 'transfer value'
      })

    }).rejects.toEqual(new CreateTransferError.InsufficientFunds())
  })
})
