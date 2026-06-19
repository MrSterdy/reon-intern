import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCustomFields1781882752166 implements MigrationInterface {
    name = 'CreateCustomFields1781882752166'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "custom_fields" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "account_id" uuid NOT NULL, "entity_type" character varying NOT NULL, "field_name" character varying NOT NULL, "field_type" character varying NOT NULL, "field_id" character varying NOT NULL, CONSTRAINT "PK_35ab958a0baec2e0b2b2b875fdb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_7dab3c543d6a92637db3b5b635" ON "custom_fields" ("account_id", "entity_type", "field_name") `);
        await queryRunner.query(`ALTER TABLE "custom_fields" ADD CONSTRAINT "FK_99642bfea1e84b214ec43eed854" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "custom_fields" DROP CONSTRAINT "FK_99642bfea1e84b214ec43eed854"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7dab3c543d6a92637db3b5b635"`);
        await queryRunner.query(`DROP TABLE "custom_fields"`);
    }

}
