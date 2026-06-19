import { Expose } from 'class-transformer';
import { IsString, MaxLength } from 'class-validator';

export class AmoOauthUninstallQueryDto {
    @Expose({ name: 'account_id' })
    @IsString()
    @MaxLength(64)
    public accountId: string;

    @Expose({ name: 'client_uuid' })
    @IsString()
    @MaxLength(255)
    public clientUuid: string;

    @IsString()
    @MaxLength(255)
    public signature: string;
}
