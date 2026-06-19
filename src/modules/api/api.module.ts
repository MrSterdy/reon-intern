import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AmoApiService } from './amo-api/amo-api.service';

@Module({
    imports: [HttpModule],
    providers: [AmoApiService],
    exports: [AmoApiService],
})
export class ApiModule {}
