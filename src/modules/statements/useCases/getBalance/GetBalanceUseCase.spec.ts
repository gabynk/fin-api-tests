import "reflect-metadata";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { CreateTransferUseCase } from "../createTransfer/CreateTransferUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let getBalanceUseCase: GetBalanceUseCase;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let createTransferUseCase: CreateTransferUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Get Balance Statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createTransferUseCase = new CreateTransferUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  })

  it("should be able to show balance", async () => {
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

    const balance = await getBalanceUseCase.execute({
      user_id: createdUser?.id as string
    })

    expect(balance).toHaveProperty("balance")
    expect(balance).toHaveProperty("statement")
  })

  it("should be able to show balance if create transfer operation to sender user", async () => {
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

    await createTransferUseCase.execute({
      user_id: senderUser?.id as string,
      sender_id: receiverUser?.id as string,
      amount: 200,
      description: 'transfer value'
    })

    const balance = await getBalanceUseCase.execute({
      user_id: senderUser?.id as string
    })

    expect(balance).toHaveProperty("balance")
    expect(balance.balance).toEqual(300)
  })

  it("should be able to show balance if create transfer operation to receiver user", async () => {
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

    await createTransferUseCase.execute({
      user_id: senderUser?.id as string,
      sender_id: receiverUser?.id as string,
      amount: 200,
      description: 'transfer value'
    })

    const balance = await getBalanceUseCase.execute({
      user_id: receiverUser?.id as string
    })

    expect(balance).toHaveProperty("balance")
    expect(balance.balance).toEqual(200)
  })

  it("should not be able to show balance with nonexistent user", async () => {
    expect(async () => {
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

      await getBalanceUseCase.execute({
        user_id: 'nonexistent-user'
      })
    }).rejects.toBeInstanceOf(GetBalanceError)
  })
})
