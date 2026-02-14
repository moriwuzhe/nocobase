/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Chart, ChartType, RenderProps } from '../chart';
import { getAntChart } from './AntChart';
import { lazy } from '@nocobase/client';

const { Gauge: G2Gauge } = lazy(() => import('@ant-design/plots'), 'Gauge');

export class Gauge extends Chart {
  constructor() {
    super({
      name: 'gauge',
      title: 'Gauge',
      enableAdvancedConfig: true,
      Component: getAntChart(G2Gauge),
      config: [
        {
          configType: 'field',
          name: 'targetField',
          title: 'Target Field',
          required: true,
        },
        {
          configType: 'percent',
          name: 'maxValue',
          title: 'Max Value',
          defaultValue: 100,
        },
      ],
    });
  }

  init: ChartType['init'] = (fields, { measures }) => {
    const targetField = measures?.[0];
    return {
      general: {
        targetField: targetField?.field,
      },
    };
  };

  getProps({ data, general, advanced, fieldProps }: RenderProps) {
    const { targetField, maxValue = 100 } = general;
    const value = data?.[0]?.[targetField] ?? 0;
    const percent = Math.min(value / maxValue, 1);

    return {
      data: {
        target: percent,
        total: 1,
        name: fieldProps[targetField]?.label || targetField,
      },
      animate: { enter: { type: false }, update: { type: false }, exit: { type: false } },
      ...advanced,
    };
  }

  getReference() {
    return {
      title: this.title,
      link: 'https://ant-design-charts-next.antgroup.com/examples#progress-gauge',
    };
  }
}
