import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  })

  it("should be able to create a new user", async() => {
    const user = {
      name: "Name test 1",
      email: "name1@test.com",
      password: "123"
    };

    const userCreated = await createUserUseCase.execute({
      name: user.name,
      email: user.email,
      password: user.password
    });

    expect(userCreated).toHaveProperty("id");
  })

  it("should not be able to create if exists a same email", async() => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "Name test 2",
        email: "name2@test.com",
        password: "123"
      });

      await createUserUseCase.execute({
        name: "Name test 3",
        email: "name2@test.com",
        password: "1234"
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  })
})
