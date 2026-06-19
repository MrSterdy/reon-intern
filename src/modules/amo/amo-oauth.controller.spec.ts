import { Test, TestingModule } from '@nestjs/testing';
import { AccountService } from '../account/account.service';
import { AmoOauthController } from './amo-oauth.controller';

describe('AmoOauthController', () => {
    let controller: AmoOauthController;
    const accountService = {
        handleInstall: jest.fn(),
        handleUninstall: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AmoOauthController],
            providers: [
                {
                    provide: AccountService,
                    useValue: accountService,
                },
            ],
        }).compile();

        controller = module.get<AmoOauthController>(AmoOauthController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
