import { AppError } from "../../../../shared/errors/AppError";

export namespace CreateTransferError {
  export class SenderUserNotFound extends AppError {
    constructor() {
      super('Sender user not found', 404);
    }
  }

  export class ReceiverUserNotFound extends AppError {
    constructor() {
      super('Receiver user not found', 404);
    }
  }

  export class InsufficientFunds extends AppError {
    constructor() {
      super('Insufficient funds', 400);
    }
  }
}
