import "reflect-metadata";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Get Statement Operation", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  })

  it("should be able to show statement operation", async () => {
    const createdUser = await createUserUseCase.execute({
      name: "Test statement",
      email: "statement@test.com",
      password: "1234"
    });

    const createdStatement = await createStatementUseCase.execute({
      user_id: createdUser?.id as string,
      type: 'deposit' as OperationType,
      amount: 500,
      description: 'deposit value'
    })

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: createdUser?.id as string,
      statement_id: createdStatement?.id as string
    })

    expect(statementOperation).toEqual(createdStatement)
  })

  it("should not be able to show balance with nonexistent user", async () => {
    await expect(async () => {
      const createdUser = await createUserUseCase.execute({
        name: "Test statement 2",
        email: "statement2@test.com",
        password: "1234"
      });

      const createdStatement = await createStatementUseCase.execute({
        user_id: createdUser?.id as string,
        type: 'deposit' as OperationType,
        amount: 500,
        description: 'deposit value'
      })

      await getStatementOperationUseCase.execute({
        user_id: "nonexistent-user",
        statement_id: createdStatement?.id as string
      })
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)
  })

  it("should not be able to show balance with nonexistent statement", async () => {
    await expect(async () => {
      const createdUser = await createUserUseCase.execute({
        name: "Test statement 3",
        email: "statement3@test.com",
        password: "1234"
      });

      await createStatementUseCase.execute({
        user_id: createdUser?.id as string,
        type: 'deposit' as OperationType,
        amount: 500,
        description: 'deposit value'
      })

      await getStatementOperationUseCase.execute({
        user_id: createdUser?.id as string,
        statement_id: "nonexistent-statement"
      })
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
  })
})
