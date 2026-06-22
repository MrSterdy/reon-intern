export type ContactWebhookAction = 'add' | 'update';

export type AmoContactWebhookEntry = {
    id: string | number;
    account_id: string | number;
    type: 'contact';
};

export type AmoContactWebhookBody = {
    contacts: Record<
        ContactWebhookAction,
        Record<string, AmoContactWebhookEntry>
    >;
};

export type ContactWebhookResult = {
    status: 'accepted';
};

export type ContactWebhookEntry = {
    contactId: string;
    accountId: string;
};
