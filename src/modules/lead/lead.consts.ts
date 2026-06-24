import { CUSTOM_FIELD_NAMES } from '../custom-field/custom-field.consts';

export const REQUIRED_LEAD_FIELD_NAMES = [CUSTOM_FIELD_NAMES.Services] as const;

export const MISSING_SERVICE_FIELDS_TASK_TEXT_PREFIX =
    'У контакта не заполнены поля услуг: ';

export const UNKNOWN_AGE_TASK_TEXT = 'Возраст контакта неизвестен';

export const CHECK_SERVICE_PRICE_TASK_TEXT_PREFIX =
    'Проверить стоимость услуг для ';

export const LEAD_TASK_DEADLINE_SECONDS = 24 * 60 * 60;
