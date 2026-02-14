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

const { Treemap: G2Treemap } = lazy(() => import('@ant-design/plots'), 'Treemap');

export class Treemap extends G2PlotChart {
  constructor() {
    super({
      name: 'treemap',
      title: 'Treemap',
      Component: G2Treemap,
    });
    this.config = [
      {
        configType: 'field',
        name: 'valueField',
        title: 'Value Field',
        required: true,
      },
      {
        configType: 'field',
        name: 'colorField',
        title: 'Color/Category Field',
        required: true,
      },
      'size',
    ];
  }

  init: ChartType['init'] = (fields, { measures, dimensions }) => {
    const { xField, yField } = this.infer(fields, { measures, dimensions });
    return {
      general: {
        colorField: xField?.value,
        valueField: yField?.value,
      },
    };
  };

  getProps({ data, general, advanced, fieldProps }: RenderProps) {
    return {
      data: {
        name: 'root',
        children: data.map((item) => ({
          name: item[general.colorField],
          value: item[general.valueField],
        })),
      },
      valueField: 'value',
      colorField: general.colorField,
      animate: { enter: { type: false }, update: { type: false }, exit: { type: false } },
      ...advanced,
    };
  }

  getReference() {
    return {
      title: this.title,
      link: 'https://ant-design-charts-next.antgroup.com/examples#hierarchy-treemap',
    };
  }
}
