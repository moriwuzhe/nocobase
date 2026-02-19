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

const { Funnel: G2Funnel } = lazy(() => import('@ant-design/plots'), 'Funnel');

export class Funnel extends G2PlotChart {
  constructor() {
    super({
      name: 'funnel',
      title: 'Funnel',
      Component: G2Funnel,
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

  getProps({ data, general, advanced, fieldProps }: RenderProps) {
    const props = super.getProps({ data, general, advanced, fieldProps });
    return {
      ...props,
      shape: 'funnel',
    };
  }

  getReference() {
    return {
      title: this.title,
      link: 'https://ant-design-charts-next.antgroup.com/examples#statistics-funnel',
    };
  }
}
