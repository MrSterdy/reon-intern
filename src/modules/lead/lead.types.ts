export type LeadWebhookAction = 'add' | 'update';

export type LeadWebhookBody = Record<string, unknown>;

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
