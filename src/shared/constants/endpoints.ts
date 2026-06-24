export const ENDPOINT_API_PREFIX = 'api';
export const DEFAULT_ENDPOINT_API_VERSION = '1';

export const ENDPOINTS = {
    amo: {
        oauth: {
            base: 'amo/oauth',
            install: 'install',
            uninstall: 'uninstall',
        },
        webhooks: {
            contacts: {
                base: 'amo/webhooks/contacts',
                created: 'created',
                updated: 'updated',
            },
            leads: {
                base: 'amo/webhooks/leads',
                created: 'created',
                updated: 'updated',
            },
        },
    },
} as const;
