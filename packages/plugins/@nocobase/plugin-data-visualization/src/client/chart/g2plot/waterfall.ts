/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { G2PlotChart } from './g2plot';
import { ChartType } from '../chart';
import { lazy } from '@nocobase/client';

const { Waterfall: G2Waterfall } = lazy(() => import('@ant-design/plots'), 'Waterfall');

export class Waterfall extends G2PlotChart {
  constructor() {
    super({
      name: 'waterfall',
      title: 'Waterfall',
      Component: G2Waterfall,
    });
    this.config = [
      {
        configType: 'field',
        name: 'xField',
        title: 'xField',
        required: true,
      },
      {
        configType: 'field',
        name: 'yField',
        title: 'yField',
        required: true,
      },
      'size',
    ];
  }

  init: ChartType['init'] = (fields, { measures, dimensions }) => {
    const { xField, yField } = this.infer(fields, { measures, dimensions });
    return {
      general: {
        xField: xField?.value,
        yField: yField?.value,
      },
    };
  };

  getReference() {
    return {
      title: this.title,
      link: 'https://ant-design-charts-next.antgroup.com/examples#statistics-waterfall',
    };
  }
}
