import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomFieldEntity } from './custom-field.entity';
import { SaveCustomFieldPayload } from './custom-field.types';

@Injectable()
export class CustomFieldRepository {
    public constructor(
        @InjectRepository(CustomFieldEntity)
        private readonly repository: Repository<CustomFieldEntity>,
    ) {}

    public async saveCustomField(
        payload: SaveCustomFieldPayload,
    ): Promise<void> {
        await this.repository.upsert(payload, {
            conflictPaths: ['accountId', 'entityType', 'fieldName'],
            skipUpdateIfNoValuesChanged: true,
        });
    }
}
