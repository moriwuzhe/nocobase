/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

/**
 * Dictionary field interface definition.
 *
 * When a user configures a collection field with this interface,
 * it stores the dictionary item value as a string, and the UI
 * renders a Select/Radio/Tag component with options loaded from
 * the referenced dictionary.
 */
export const dictionaryFieldInterface = {
  name: 'dictionary',
  type: 'object',
  group: 'choices',
  order: 6,
  title: '{{t("Dictionary")}}',
  description: '{{t("Reference a data dictionary for options")}}',
  sortable: true,
  default: {
    type: 'string',
    uiSchema: {
      type: 'string',
      'x-component': 'DictionarySelect',
    },
  },
  availableTypes: ['string'],
  hasDefaultValue: true,
  properties: {
    'uiSchema.x-component-props.dictionaryCode': {
      type: 'string',
      title: '{{t("Dictionary Code")}}',
      required: true,
      'x-decorator': 'FormItem',
      'x-component': 'Input',
      description: '{{t("The code of the data dictionary to use as option source")}}',
    },
    'uiSchema.x-component-props.mode': {
      type: 'string',
      title: '{{t("Display Mode")}}',
      'x-decorator': 'FormItem',
      'x-component': 'Select',
      default: 'select',
      enum: [
        { label: '{{t("Select")}}', value: 'select' },
        { label: '{{t("Radio")}}', value: 'radio' },
        { label: '{{t("Tag")}}', value: 'tag' },
      ],
    },
    'uiSchema.x-component-props.allowMultiple': {
      type: 'boolean',
      title: '{{t("Allow Multiple")}}',
      'x-decorator': 'FormItem',
      'x-component': 'Checkbox',
      default: false,
    },
  },
  filterable: {
    operators: [
      { label: '{{t("is")}}', value: '$eq' },
      { label: '{{t("is not")}}', value: '$ne' },
      { label: '{{t("contains")}}', value: '$in', schema: { 'x-component': 'Select', 'x-component-props': { mode: 'tags' } } },
      { label: '{{t("does not contain")}}', value: '$notIn', schema: { 'x-component': 'Select', 'x-component-props': { mode: 'tags' } } },
      { label: '{{t("is empty")}}', value: '$empty', noValue: true },
      { label: '{{t("is not empty")}}', value: '$notEmpty', noValue: true },
    ],
  },
};
