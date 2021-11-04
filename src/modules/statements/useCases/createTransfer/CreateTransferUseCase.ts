import { IUsersRepository } from "fin-api-tests/src/modules/users/repositories/IUsersRepository";
import { inject, injectable } from "tsyringe";
import { OperationType } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateTransferError } from "./CreateTransferError";
import { ICreateTransfer } from "./ICreateTransferDTO";

@injectable()
class CreateTransferUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository
  ) { }

  async execute({
    user_id,
    sender_id,
    amount,
    description,
  }: ICreateTransfer) {
    const senderUser = await this.usersRepository.findById(user_id);
    if (!senderUser) {
      throw new CreateTransferError.SenderUserNotFound();
    }

    const receiverUser = await this.usersRepository.findById(sender_id);
    if (!receiverUser) {
      throw new CreateTransferError.ReceiverUserNotFound();
    }

    const { balance } = await this.statementsRepository.getUserBalance({ user_id });

    if (balance < amount) {
      throw new CreateTransferError.InsufficientFunds()
    }

    await this.statementsRepository.create({
      user_id: sender_id,
      sender_id: user_id,
      amount,
      description,
      type: OperationType.TRANSFERIN,
    });

    const transferOperation = await this.statementsRepository.create({
      user_id: user_id,
      sender_id,
      amount,
      description,
      type: OperationType.TRANSFEROUT,
    });

    return transferOperation;
  }
}

export { CreateTransferUseCase }
