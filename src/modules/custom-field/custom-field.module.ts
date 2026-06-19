import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomFieldEntity } from './custom-field.entity';
import { CustomFieldRepository } from './custom-field.repository';

@Module({
    imports: [TypeOrmModule.forFeature([CustomFieldEntity])],
    providers: [CustomFieldRepository],
    exports: [],
})
export class CustomFieldModule {}
