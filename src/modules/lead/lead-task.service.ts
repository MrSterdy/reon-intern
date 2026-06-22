import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccountEntity } from '../account/account.entity';
import { AmoApiService } from '../api/amo-api/amo-api.service';
import { AmoTaskResponse } from '../api/amo-api/amo-api.types';
import {
    CHECK_SERVICE_PRICE_TASK_TEXT_PREFIX,
    LEAD_TASK_DEADLINE_SECONDS,
    MISSING_SERVICE_FIELDS_TASK_TEXT_PREFIX,
    UNKNOWN_AGE_TASK_TEXT,
} from './lead.consts';

type UpsertTaskPayload = {
    account: AccountEntity;
    leadId: string;
    taskTypeId: number;
    text: string;
    textPrefix: string;
};

@Injectable()
export class LeadTaskService {
    private readonly logger = new Logger(LeadTaskService.name);

    public constructor(
        private readonly amoApiService: AmoApiService,
        private readonly configService: ConfigService,
    ) {}

    public async upsertMissingServiceFieldsTask(
        account: AccountEntity,
        leadId: string,
        missingServiceNames: string[],
    ): Promise<void> {
        const text = `${MISSING_SERVICE_FIELDS_TASK_TEXT_PREFIX}${missingServiceNames.join(', ')}`;
        const taskTypeId = this.configService.getOrThrow<number>(
            'amo.tasks.errorTaskTypeId',
        );

        await this.upsertTask({
            account,
            leadId,
            taskTypeId,
            text,
            textPrefix: MISSING_SERVICE_FIELDS_TASK_TEXT_PREFIX,
        });
    }

    public async upsertUnknownAgeTask(
        account: AccountEntity,
        leadId: string,
    ): Promise<void> {
        const taskTypeId = this.configService.getOrThrow<number>(
            'amo.tasks.errorTaskTypeId',
        );

        await this.upsertTask({
            account,
            leadId,
            taskTypeId,
            text: UNKNOWN_AGE_TASK_TEXT,
            textPrefix: UNKNOWN_AGE_TASK_TEXT,
        });
    }

    public async upsertCheckServicePriceTask(
        account: AccountEntity,
        leadId: string,
        contactName: string,
        age: number,
    ): Promise<void> {
        const taskTypeId = this.configService.getOrThrow<number>(
            'amo.tasks.checkTaskTypeId',
        );
        const text = `${CHECK_SERVICE_PRICE_TASK_TEXT_PREFIX}${contactName}, возраст: ${age}`;

        await this.upsertTask({
            account,
            leadId,
            taskTypeId,
            text,
            textPrefix: CHECK_SERVICE_PRICE_TASK_TEXT_PREFIX,
        });
    }

    private async upsertTask(payload: UpsertTaskPayload): Promise<void> {
        const { account, leadId, taskTypeId, text, textPrefix } = payload;

        if (account.accessToken === null) {
            return;
        }

        const numericLeadId = this.parseAmoId(leadId);

        if (numericLeadId === null) {
            this.logger.warn(`Invalid amoCRM lead ID ${leadId}`);
            return;
        }

        const existingTasks = await this.amoApiService.getLeadTasks(
            account.subdomain,
            account.accessToken,
            leadId,
            taskTypeId,
        );
        const existingTask = this.findExistingTask(existingTasks, textPrefix);

        if (existingTask === null) {
            await this.amoApiService.createTask(
                account.subdomain,
                account.accessToken,
                {
                    entity_id: numericLeadId,
                    entity_type: 'leads',
                    task_type_id: taskTypeId,
                    text,
                    complete_till: this.buildCompleteTill(),
                },
            );
            return;
        }

        if (existingTask.text === text) {
            return;
        }

        await this.amoApiService.updateTask(
            account.subdomain,
            account.accessToken,
            String(existingTask.id),
            {
                task_type_id: taskTypeId,
                text,
                complete_till: this.buildCompleteTill(),
            },
        );
    }

    private findExistingTask(
        tasks: AmoTaskResponse[],
        textPrefix: string,
    ): AmoTaskResponse | null {
        return tasks.find((task) => task.text.startsWith(textPrefix)) ?? null;
    }

    private buildCompleteTill(): number {
        return Math.floor(Date.now() / 1000) + LEAD_TASK_DEADLINE_SECONDS;
    }

    private parseAmoId(id: string): number | null {
        const numericId = Number(id);

        if (!Number.isInteger(numericId) || numericId <= 0) {
            return null;
        }

        return numericId;
    }
}
