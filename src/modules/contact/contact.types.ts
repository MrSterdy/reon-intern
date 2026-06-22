export type ContactWebhookAction = 'add' | 'update';

export type ContactWebhookBody = Record<string, unknown>;

export type ContactWebhookResult = {
    status: 'accepted';
};

export type ContactWebhookEntry = {
    contactId: string;
    accountId: string;
};
