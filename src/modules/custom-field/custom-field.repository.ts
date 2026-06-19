import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CustomFieldEntity } from './custom-field.entity';
import { SaveCustomFieldPayload } from './custom-field.types';

@Injectable()
export class CustomFieldRepository {
    public constructor(
        @InjectRepository(CustomFieldEntity)
        private readonly dataSource: DataSource,
    ) {}

    public async saveCustomFields(
        payloads: SaveCustomFieldPayload[],
    ): Promise<void> {
        if (payloads.length === 0) {
            return;
        }

        await this.dataSource.transaction(async (manager) => {
            await manager.upsert(CustomFieldEntity, payloads, {
                conflictPaths: ['accountId', 'entityType', 'fieldName'],
                skipUpdateIfNoValuesChanged: true,
            });
        });
    }
}
