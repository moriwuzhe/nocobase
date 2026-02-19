import { Plugin } from '@nocobase/server';

export default class PluginFieldRatingServer extends Plugin {
  async load() {
    this.db.interfaceManager?.registerInterfaceType?.('rating', {
      name: 'rating',
      type: 'object',
      group: 'choices',
      order: 7,
      title: '{{t("Rating")}}',
      default: {
        type: 'float',
        uiSchema: { type: 'number', 'x-component': 'RatingStars' },
      },
      availableTypes: ['float', 'integer'],
      hasDefaultValue: true,
      properties: {
        'uiSchema.x-component-props.count': {
          type: 'number', title: '{{t("Max Stars")}}',
          'x-decorator': 'FormItem', 'x-component': 'InputNumber', default: 5,
        },
        'uiSchema.x-component-props.allowHalf': {
          type: 'boolean', title: '{{t("Allow Half Star")}}',
          'x-decorator': 'FormItem', 'x-component': 'Checkbox', default: true,
        },
        'uiSchema.x-component-props.color': {
          type: 'string', title: '{{t("Color")}}',
          'x-decorator': 'FormItem', 'x-component': 'Input', default: '#fadb14',
        },
      },
      filterable: {
        operators: [
          { label: '{{t("=")}}', value: '$eq' },
          { label: '{{t("≠")}}', value: '$ne' },
          { label: '{{t("≥")}}', value: '$gte' },
          { label: '{{t("≤")}}', value: '$lte' },
          { label: '{{t(">")}}', value: '$gt' },
          { label: '{{t("<")}}', value: '$lt' },
        ],
      },
    });
  }
}
