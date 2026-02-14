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

const { Heatmap: G2Heatmap } = lazy(() => import('@ant-design/plots'), 'Heatmap');

export class Heatmap extends G2PlotChart {
  constructor() {
    super({
      name: 'heatmap',
      title: 'Heatmap',
      Component: G2Heatmap,
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
      {
        configType: 'field',
        name: 'colorField',
        title: 'colorField',
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
        colorField: yField?.value,
      },
    };
  };

  getProps({ data, general, advanced, fieldProps }: RenderProps) {
    return {
      data,
      xField: general.xField,
      yField: general.yField,
      colorField: general.colorField,
      mark: 'cell',
      animate: { enter: { type: false }, update: { type: false }, exit: { type: false } },
      ...advanced,
    };
  }

  getReference() {
    return {
      title: this.title,
      link: 'https://ant-design-charts-next.antgroup.com/examples#statistics-heatmap',
    };
  }
}
