import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Authenticate User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  })

  it("should be able to authenticate user", async() => {
    await createUserUseCase.execute({
      name: "Name test",
      email: "test@test.com",
      password: "123"
    });

    const sessionCreated = await authenticateUserUseCase.execute({
      email: "test@test.com",
      password: "123"
    });

    expect(sessionCreated).toHaveProperty("token");
  })

  it("should not be able to authenticate if nonexistent user", async() => {
    expect(async() => {
      await authenticateUserUseCase.execute({
        email: "nonexistent@test.com",
        password: "123"
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })

  it("should not be able to authenticate with incorrect password", async() => {
    expect(async() => {
      await createUserUseCase.execute({
        name: "Name test 2",
        email: "passwordIncorrect@test.com",
        password: "123"
      });

      await authenticateUserUseCase.execute({
        email: "passwordIncorrect@test.com",
        password: "1234"
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })
})
