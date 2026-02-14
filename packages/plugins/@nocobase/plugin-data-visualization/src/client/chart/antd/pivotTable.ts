/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Chart, ChartType, RenderProps } from '../chart';

/**
 * PivotTable — a cross-tab analysis chart.
 * Renders data in a pivot table format with row/column/value dimensions.
 *
 * Uses plain HTML <table> rendering (no external dependency).
 */
export class PivotTable extends Chart {
  constructor() {
    super({
      name: 'pivotTable',
      title: 'Pivot Table',
      enableAdvancedConfig: true,
      Component: PivotTableComponent,
      config: [
        {
          configType: 'field',
          name: 'rowField',
          title: 'Row Field',
          required: true,
        },
        {
          configType: 'field',
          name: 'columnField',
          title: 'Column Field',
          required: true,
        },
        {
          configType: 'field',
          name: 'valueField',
          title: 'Value Field',
          required: true,
        },
        {
          configType: 'select',
          name: 'aggregation',
          title: 'Aggregation',
          defaultValue: 'sum',
          options: [
            { label: 'Sum', value: 'sum' },
            { label: 'Count', value: 'count' },
            { label: 'Average', value: 'avg' },
            { label: 'Min', value: 'min' },
            { label: 'Max', value: 'max' },
          ],
        },
      ],
    });
  }

  init: ChartType['init'] = (fields, { measures, dimensions }) => {
    const { xField, yField, seriesField } = this.infer(fields, { measures, dimensions });
    return {
      general: {
        rowField: xField?.value,
        columnField: seriesField?.value || dimensions?.[1]?.field,
        valueField: yField?.value,
        aggregation: 'sum',
      },
    };
  };

  getProps({ data, general, advanced, fieldProps }: RenderProps) {
    const { rowField, columnField, valueField, aggregation = 'sum' } = general;

    // Build pivot data
    const rows = new Set<string>();
    const cols = new Set<string>();
    const cellMap: Record<string, number[]> = {};

    for (const item of data) {
      const rowVal = String(item[rowField] ?? '(empty)');
      const colVal = String(item[columnField] ?? '(empty)');
      const val = Number(item[valueField]) || 0;

      rows.add(rowVal);
      cols.add(colVal);

      const key = `${rowVal}::${colVal}`;
      if (!cellMap[key]) cellMap[key] = [];
      cellMap[key].push(val);
    }

    const aggregate = (values: number[]): number => {
      if (!values?.length) return 0;
      switch (aggregation) {
        case 'sum': return values.reduce((a, b) => a + b, 0);
        case 'count': return values.length;
        case 'avg': return values.reduce((a, b) => a + b, 0) / values.length;
        case 'min': return Math.min(...values);
        case 'max': return Math.max(...values);
        default: return values.reduce((a, b) => a + b, 0);
      }
    };

    return {
      rows: Array.from(rows).sort(),
      cols: Array.from(cols).sort(),
      cellMap,
      aggregate,
      rowField,
      columnField,
      valueField,
      aggregation,
      fieldProps,
      ...advanced,
    };
  }
}

/**
 * React component for rendering the pivot table.
 * Receives the processed pivot data from getProps().
 */
import React from 'react';

const PivotTableComponent: React.FC<any> = (props) => {
  const { rows, cols, cellMap, aggregate, rowField, columnField, valueField, aggregation, fieldProps } = props;

  if (!rows?.length || !cols?.length) {
    return <div style={{ padding: 20, textAlign: 'center', color: '#999' }}>Configure row, column, and value fields</div>;
  }

  const rowLabel = fieldProps?.[rowField]?.label || rowField;
  const colLabel = fieldProps?.[columnField]?.label || columnField;
  const valLabel = fieldProps?.[valueField]?.label || valueField;

  const formatValue = (v: number) => {
    const transformer = fieldProps?.[valueField]?.transformer;
    return transformer ? transformer(v) : (Number.isInteger(v) ? v : v.toFixed(2));
  };

  // Calculate row/column totals
  const rowTotals: Record<string, number> = {};
  const colTotals: Record<string, number> = {};
  let grandTotal = 0;

  for (const row of rows) {
    let rowSum = 0;
    for (const col of cols) {
      const val = aggregate(cellMap[`${row}::${col}`] || []);
      rowSum += val;
      colTotals[col] = (colTotals[col] || 0) + val;
    }
    rowTotals[row] = rowSum;
    grandTotal += rowSum;
  }

  return (
    <div style={{ overflow: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#fafafa' }}>
            <th style={thStyle}>{rowLabel} ╲ {colLabel}</th>
            {cols.map((col: string) => (
              <th key={col} style={thStyle}>{col}</th>
            ))}
            <th style={{ ...thStyle, background: '#f0f0f0' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row: string) => (
            <tr key={row}>
              <td style={{ ...tdStyle, fontWeight: 600, background: '#fafafa' }}>{row}</td>
              {cols.map((col: string) => {
                const val = aggregate(cellMap[`${row}::${col}`] || []);
                return <td key={col} style={tdStyle}>{val ? formatValue(val) : '-'}</td>;
              })}
              <td style={{ ...tdStyle, fontWeight: 600, background: '#f0f0f0' }}>{formatValue(rowTotals[row])}</td>
            </tr>
          ))}
          <tr style={{ background: '#f0f0f0' }}>
            <td style={{ ...tdStyle, fontWeight: 600 }}>Total</td>
            {cols.map((col: string) => (
              <td key={col} style={{ ...tdStyle, fontWeight: 600 }}>{formatValue(colTotals[col] || 0)}</td>
            ))}
            <td style={{ ...tdStyle, fontWeight: 700 }}>{formatValue(grandTotal)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const thStyle: React.CSSProperties = {
  border: '1px solid #e8e8e8',
  padding: '8px 12px',
  textAlign: 'center',
  fontWeight: 600,
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  border: '1px solid #e8e8e8',
  padding: '6px 12px',
  textAlign: 'right',
};
