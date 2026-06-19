import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiModule } from '../api/api.module';
import { CustomFieldEntity } from './custom-field.entity';
import { CustomFieldRepository } from './custom-field.repository';
import { CustomFieldService } from './custom-field.service';

@Module({
    imports: [ApiModule, TypeOrmModule.forFeature([CustomFieldEntity])],
    providers: [CustomFieldRepository, CustomFieldService],
    exports: [CustomFieldService],
})
export class CustomFieldModule {}
