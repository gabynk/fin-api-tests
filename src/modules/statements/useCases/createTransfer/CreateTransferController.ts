import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { CreateTransferUseCase } from './CreateTransferUseCase';

class CreateTransferController {
  async execute(request: Request, response: Response): Promise<Response> {
    const { id } = request.user;
    const { user_id } = request.params;
    const { amount, description } = request.body;

    const createTransferUseCase = container.resolve(CreateTransferUseCase);

    const createTransfer = await createTransferUseCase.execute({
      user_id: id,
      sender_id: user_id,
      amount,
      description
    });

    return response.status(201).json(createTransfer);
  }
}

export { CreateTransferController }
