import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CustomFieldEntity } from './custom-field.entity';
import {
    AmoCustomFieldEntityType,
    SaveCustomFieldPayload,
} from './custom-field.types';

@Injectable()
export class CustomFieldRepository {
    public constructor(
        @InjectRepository(CustomFieldEntity)
        private readonly repository: Repository<CustomFieldEntity>,
    ) {}

    public async saveCustomFields(
        payloads: SaveCustomFieldPayload[],
    ): Promise<void> {
        if (payloads.length === 0) {
            return;
        }

        await this.repository.manager.transaction(async (manager) => {
            await manager.upsert(CustomFieldEntity, payloads, {
                conflictPaths: ['accountId', 'entityType', 'fieldName'],
                skipUpdateIfNoValuesChanged: true,
            });
        });
    }

    public async findFieldsByNames(
        accountId: string,
        entityType: AmoCustomFieldEntityType,
        fieldNames: string[],
    ): Promise<CustomFieldEntity[]> {
        if (fieldNames.length === 0) {
            return [];
        }

        return this.repository.find({
            where: {
                accountId,
                entityType,
                fieldName: In(fieldNames),
            },
        });
    }
}
