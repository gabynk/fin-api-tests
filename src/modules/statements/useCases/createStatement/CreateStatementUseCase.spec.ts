import "reflect-metadata";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  })

  it("should be able to create deposit statement", async() => {
    const createdUser = await createUserUseCase.execute({
      name: "Test statement",
      email: "statement@test.com",
      password: "1234"
    });

    const statementeCreated = await createStatementUseCase.execute({
      user_id: createdUser?.id as string,
      type: 'deposit' as OperationType,
      amount: 500,
      description: 'deposit value'
    })

    expect(statementeCreated).toEqual(
      expect.objectContaining({
        user_id: createdUser?.id as string,
        type: 'deposit',
        amount: 500,
        description: 'deposit value'
      })
    )
  })

  it("should be able to create withdraw statement", async() => {
    const createdUser = await createUserUseCase.execute({
      name: "Test statement",
      email: "statement@test.com",
      password: "1234"
    });

    await createStatementUseCase.execute({
      user_id: createdUser?.id as string,
      type: 'deposit' as OperationType,
      amount: 500,
      description: 'deposit value'
    })

    const statementeCreated = await createStatementUseCase.execute({
      user_id: createdUser?.id as string,
      type: 'withdraw' as OperationType,
      amount: 50,
      description: 'withdraw value'
    })

    expect(statementeCreated).toEqual(
      expect.objectContaining({
        user_id: createdUser?.id as string,
        type: 'withdraw' as OperationType,
        amount: 50,
        description: 'withdraw value'
      })
    )
  })

  it("should not be able to create a new statement with nonexistent user", async() => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: 'nonexistent-user',
        type: 'deposit' as OperationType,
        amount: 50,
        description: 'deposit value'
      })
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  })

  it("should not be able to generate a withdraw statement with balance insufficient", async() => {
    expect(async () => {
      const createdUser = await createUserUseCase.execute({
        name: "Test statement",
        email: "statement@test.com",
        password: "1234"
      });

      await createStatementUseCase.execute({
        user_id: createdUser?.id as string,
        type: 'withdraw' as OperationType,
        amount: 1000,
        description: 'withdraw value'
      })
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  })
})
