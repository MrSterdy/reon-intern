import { RequiredCustomField } from './custom-field.types';

export const CUSTOM_FIELD_ENTITY_TYPES = ['contacts', 'leads'] as const;

export const CUSTOM_FIELD_NAMES = {
    BirthDate: 'Дата рождения',
    Age: 'Возраст',
    FaceLaserRejuvenation: 'Лазерное омоложение лица',
    UltrasoundLifting: 'Ультразвуковой лифтинг',
    VascularLaserRemoval: 'Лазерное удаление сосудов',
    MimicWrinkleCorrection: 'Коррекция мимических морщин',
    LaserEpilation: 'Лазерная эпиляция',
    Services: 'Услуги',
} as const;

export const SERVICE_CUSTOM_FIELD_NAMES = [
    CUSTOM_FIELD_NAMES.FaceLaserRejuvenation,
    CUSTOM_FIELD_NAMES.UltrasoundLifting,
    CUSTOM_FIELD_NAMES.VascularLaserRemoval,
    CUSTOM_FIELD_NAMES.MimicWrinkleCorrection,
    CUSTOM_FIELD_NAMES.LaserEpilation,
] as const;

export const REQUIRED_CUSTOM_FIELDS: RequiredCustomField[] = [
    {
        entityType: 'contacts',
        fieldName: CUSTOM_FIELD_NAMES.BirthDate,
        fieldType: 'date',
    },
    {
        entityType: 'contacts',
        fieldName: CUSTOM_FIELD_NAMES.Age,
        fieldType: 'numeric',
    },
    {
        entityType: 'contacts',
        fieldName: CUSTOM_FIELD_NAMES.FaceLaserRejuvenation,
        fieldType: 'numeric',
    },
    {
        entityType: 'contacts',
        fieldName: CUSTOM_FIELD_NAMES.UltrasoundLifting,
        fieldType: 'numeric',
    },
    {
        entityType: 'contacts',
        fieldName: CUSTOM_FIELD_NAMES.VascularLaserRemoval,
        fieldType: 'numeric',
    },
    {
        entityType: 'contacts',
        fieldName: CUSTOM_FIELD_NAMES.MimicWrinkleCorrection,
        fieldType: 'numeric',
    },
    {
        entityType: 'contacts',
        fieldName: CUSTOM_FIELD_NAMES.LaserEpilation,
        fieldType: 'numeric',
    },
    {
        entityType: 'leads',
        fieldName: CUSTOM_FIELD_NAMES.Services,
        fieldType: 'multiselect',
        enums: SERVICE_CUSTOM_FIELD_NAMES.map((fieldName, index) => ({
            value: fieldName,
            sort: index + 1,
        })),
    },
];
