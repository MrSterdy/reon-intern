import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { AccountEntity } from '../account/account.entity';
import { BaseEntity } from '../../shared/abstractions/base.entity';
import type {
    AmoCustomFieldEntityType,
    AmoCustomFieldType,
} from './custom-field.types';

@Entity('custom_fields')
@Index(['accountId', 'entityType', 'fieldName'], { unique: true })
export class CustomFieldEntity extends BaseEntity {
    @Column({ name: 'account_id', type: 'uuid' })
    public accountId: string;

    @ManyToOne(() => AccountEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'account_id' })
    public account: AccountEntity;

    @Column({ name: 'entity_type', type: 'varchar' })
    public entityType: AmoCustomFieldEntityType;

    @Column({ name: 'field_name', type: 'varchar' })
    public fieldName: string;

    @Column({ name: 'field_type', type: 'varchar' })
    public fieldType: AmoCustomFieldType;

    @Column({ name: 'field_id', type: 'varchar' })
    public fieldId: string;
}
