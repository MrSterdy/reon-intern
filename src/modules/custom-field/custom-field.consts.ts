import { RequiredCustomField } from './custom-field.types';

export const CUSTOM_FIELD_ENTITY_TYPES = ['contacts', 'leads'] as const;

export const CustomFieldName = {
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
    CustomFieldName.FaceLaserRejuvenation,
    CustomFieldName.UltrasoundLifting,
    CustomFieldName.VascularLaserRemoval,
    CustomFieldName.MimicWrinkleCorrection,
    CustomFieldName.LaserEpilation,
] as const;

export const REQUIRED_CUSTOM_FIELDS: RequiredCustomField[] = [
    {
        entityType: 'contacts',
        fieldName: CustomFieldName.BirthDate,
        fieldType: 'date',
    },
    {
        entityType: 'contacts',
        fieldName: CustomFieldName.Age,
        fieldType: 'numeric',
    },
    {
        entityType: 'contacts',
        fieldName: CustomFieldName.FaceLaserRejuvenation,
        fieldType: 'numeric',
    },
    {
        entityType: 'contacts',
        fieldName: CustomFieldName.UltrasoundLifting,
        fieldType: 'numeric',
    },
    {
        entityType: 'contacts',
        fieldName: CustomFieldName.VascularLaserRemoval,
        fieldType: 'numeric',
    },
    {
        entityType: 'contacts',
        fieldName: CustomFieldName.MimicWrinkleCorrection,
        fieldType: 'numeric',
    },
    {
        entityType: 'contacts',
        fieldName: CustomFieldName.LaserEpilation,
        fieldType: 'numeric',
    },
    {
        entityType: 'leads',
        fieldName: CustomFieldName.Services,
        fieldType: 'multiselect',
        enums: SERVICE_CUSTOM_FIELD_NAMES.map((fieldName, index) => ({
            value: fieldName,
            sort: index + 1,
        })),
    },
];
