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

const { Histogram: G2Histogram } = lazy(() => import('@ant-design/plots'), 'Histogram');

export class Histogram extends G2PlotChart {
  constructor() {
    super({
      name: 'histogram',
      title: 'Histogram',
      Component: G2Histogram,
    });
    this.config = [
      {
        configType: 'field',
        name: 'binField',
        title: 'Bin Field',
        required: true,
      },
      'seriesField',
      'isStack',
      'size',
    ];
  }

  init: ChartType['init'] = (fields, { measures, dimensions }) => {
    const { yField, seriesField } = this.infer(fields, { measures, dimensions });
    return {
      general: {
        binField: yField?.value,
        seriesField: seriesField?.value,
      },
    };
  };

  getReference() {
    return {
      title: this.title,
      link: 'https://ant-design-charts-next.antgroup.com/examples#statistics-histogram',
    };
  }
}
