export type LeadWebhookAction = 'add' | 'update';

export type AmoLeadWebhookEntry = {
    id: string | number;
    account_id: string | number;
    type?: 'lead';
};

export type AmoLeadWebhookBody = {
    leads: Record<LeadWebhookAction, Record<string, AmoLeadWebhookEntry>>;
};

export type LeadWebhookResult = {
    status: 'accepted';
};

export type LeadWebhookEntry = {
    leadId: string;
    accountId: string;
};

export type LeadPriceCalculationResult = {
    price: number;
    missingServiceNames: string[];
};
