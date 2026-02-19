/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { G2PlotChart } from './g2plot';
import { ChartType, RenderProps } from '../chart';
import { lazy } from '@nocobase/client';

const { WordCloud: G2WordCloud } = lazy(() => import('@ant-design/plots'), 'WordCloud');

export class WordCloud extends G2PlotChart {
  constructor() {
    super({
      name: 'wordCloud',
      title: 'Word Cloud',
      Component: G2WordCloud,
    });
    this.config = [
      {
        configType: 'field',
        name: 'textField',
        title: 'Text Field',
        required: true,
      },
      {
        configType: 'field',
        name: 'valueField',
        title: 'Value Field',
        required: true,
      },
      'size',
    ];
  }

  init: ChartType['init'] = (fields, { measures, dimensions }) => {
    const { xField, yField } = this.infer(fields, { measures, dimensions });
    return {
      general: {
        textField: xField?.value,
        valueField: yField?.value,
      },
    };
  };

  getProps({ data, general, advanced, fieldProps }: RenderProps) {
    return {
      data,
      textField: general.textField,
      valueField: general.valueField,
      colorField: general.textField,
      animate: { enter: { type: false }, update: { type: false }, exit: { type: false } },
      ...advanced,
    };
  }

  getReference() {
    return {
      title: this.title,
      link: 'https://ant-design-charts-next.antgroup.com/examples#more-word-cloud',
    };
  }
}
