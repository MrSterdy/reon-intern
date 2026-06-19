import { Expose, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class AmoOauthInstallQueryDto {
    @IsString()
    @MaxLength(1024)
    public code: string;

    @IsString()
    @MaxLength(255)
    public referer: string;

    @IsOptional()
    @IsString()
    @MaxLength(1024)
    public state?: string;

    @IsOptional()
    @Expose({ name: 'from_widget' })
    @IsString()
    @MaxLength(32)
    public fromWidget?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    public platform?: number;

    @IsOptional()
    @IsUrl({ require_protocol: true })
    @MaxLength(2048)
    public redirectUri?: string;
}
