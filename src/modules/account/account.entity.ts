import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../shared/abstractions/base.entity';
import { encryptedColumnTransformer } from '../../shared/transformers/encrypted-column.transformer';

@Entity('accounts')
export class AccountEntity extends BaseEntity {
    @Index({ unique: true })
    @Column({ name: 'account_id', type: 'varchar' })
    public accountId: string;

    @Column({ type: 'varchar' })
    public subdomain: string;

    @Column({
        name: 'access_token',
        type: 'text',
        nullable: true,
        transformer: encryptedColumnTransformer,
    })
    public accessToken: string | null;

    @Column({
        name: 'refresh_token',
        type: 'text',
        nullable: true,
        transformer: encryptedColumnTransformer,
    })
    public refreshToken: string | null;

    @Column({ name: 'is_installed', type: 'boolean', default: true })
    public isInstalled: boolean;
}
