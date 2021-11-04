import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class alterStatementOperationType1635426234009 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      "statements",
      "type",
      new TableColumn({
        name: 'type',
        type: 'enum',
        enum: ['deposit', 'withdraw', 'transfer-in', 'transfer-out']
      }),
    )

  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'statements',
      'type',
      new TableColumn({
        name: 'type',
        type: 'enum',
        enum: ['deposit', 'withdraw'],
      }),
    );
  }

}
