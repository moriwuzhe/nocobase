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

const { RadialBar: G2RadialBar } = lazy(() => import('@ant-design/plots'), 'RadialBar');

export class RadialBar extends G2PlotChart {
  constructor() {
    super({
      name: 'radialBar',
      title: 'Radial Bar',
      Component: G2RadialBar,
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
      link: 'https://ant-design-charts-next.antgroup.com/examples#statistics-radial-bar',
    };
  }
}
