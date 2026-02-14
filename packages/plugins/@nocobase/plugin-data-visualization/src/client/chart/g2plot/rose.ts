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

const { Rose: G2Rose } = lazy(() => import('@ant-design/plots'), 'Rose');

export class Rose extends G2PlotChart {
  constructor() {
    super({
      name: 'rose',
      title: 'Rose',
      Component: G2Rose,
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
      'seriesField',
      'isStack',
      'size',
    ];
  }

  init: ChartType['init'] = (fields, { measures, dimensions }) => {
    const { xField, yField, seriesField } = this.infer(fields, { measures, dimensions });
    return {
      general: {
        xField: xField?.value,
        yField: yField?.value,
        seriesField: seriesField?.value,
      },
    };
  };

  getReference() {
    return {
      title: this.title,
      link: 'https://ant-design-charts-next.antgroup.com/examples#statistics-rose',
    };
  }
}
