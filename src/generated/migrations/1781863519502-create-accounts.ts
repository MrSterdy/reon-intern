import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAccounts1781863519502 implements MigrationInterface {
    name = 'CreateAccounts1781863519502'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "accounts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "account_id" character varying NOT NULL, "subdomain" character varying NOT NULL, "access_token" text, "refresh_token" text, "is_installed" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_abcd260aa34b3ad2c0ff663dc2" ON "accounts" ("account_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_abcd260aa34b3ad2c0ff663dc2"`);
        await queryRunner.query(`DROP TABLE "accounts"`);
    }

}
