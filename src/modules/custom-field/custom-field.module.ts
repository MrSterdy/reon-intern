import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomFieldEntity } from './custom-field.entity';

@Module({
    imports: [TypeOrmModule.forFeature([CustomFieldEntity])],
    providers: [],
    exports: [],
})
export class CustomFieldModule {}
