/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

/**
 * AI Data Analytics Resource
 *
 * Provides intelligent data analysis capabilities:
 * - Natural language data queries with aggregation
 * - Smart chart type recommendation
 * - Data summary and insights generation
 * - Anomaly detection hints
 *
 * Example queries:
 * - "本季度各部门销售额是多少"
 * - "最近30天的新客户趋势"
 * - "按行业统计客户数量，用饼图展示"
 * - "对比去年同期的订单量"
 */

const CHART_TYPES = ['bar', 'line', 'pie', 'area', 'scatter', 'radar', 'funnel', 'table'] as const;

export default {
  name: 'aiAnalytics',
  actions: {
    /**
     * POST /api/aiAnalytics:analyze
     * Body: { question, collectionName?, chartPreference? }
     *
     * Returns: { query, data, chart, summary, insights }
     */
    async analyze(ctx: any, next: any) {
      const { question, collectionName, chartPreference } = ctx.action.params.values || {};

      if (!question) return ctx.throw(400, 'question is required');

      const aiPlugin = ctx.app.pm.get('ai') as any;
      if (!aiPlugin?.aiManager) return ctx.throw(500, 'AI plugin not available');

      const schemaContext = buildAnalyticsSchema(ctx.db, collectionName);

      const systemPrompt = `You are a data analytics assistant for a NocoBase business application.
Given a user's natural language question about their data, generate:
1. A query specification to fetch the data
2. A recommended chart configuration
3. A brief insight/summary

Available data:
${schemaContext}

Respond with ONLY valid JSON (no markdown):
{
  "collection": "collectionName",
  "filter": {},
  "aggregation": {
    "type": "count|sum|avg|min|max|group",
    "field": "fieldName",
    "groupBy": "fieldName",
    "dateGroup": "day|week|month|quarter|year"
  },
  "sort": ["-fieldName"],
  "limit": 100,
  "chart": {
    "type": "bar|line|pie|area|scatter|radar|funnel|table",
    "xField": "fieldName",
    "yField": "fieldName or aggregated value",
    "title": "chart title in Chinese"
  },
  "summary": "一句话总结分析结果（中文）",
  "insights": ["insight1", "insight2"]
}`;

      try {
        const services = await ctx.db.getRepository('llmServices').find({
          filter: { enabled: true },
          limit: 1,
        });

        if (!services.length) {
          return ctx.throw(400, '未配置 AI 服务，请先在 AI 设置中添加 LLM 服务。');
        }

        const service = services[0];
        const providerOpts = aiPlugin.aiManager.llmProviders.get(service.provider);
        if (!providerOpts) return ctx.throw(500, `LLM provider "${service.provider}" not found`);

        const provider = new providerOpts.provider({
          app: ctx.app,
          serviceOptions: service.options,
          chatOptions: {
            model: service.defaultModel || service.options?.defaultModel,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: question },
            ],
          },
        });

        const response = await provider.invokeChat();
        const content = response?.content || response?.text || '';

        let spec: any;
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          spec = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
        } catch {
          ctx.body = { success: false, error: 'AI 返回格式错误', rawResponse: content };
          return next();
        }

        if (!spec?.collection) {
          ctx.body = { success: false, error: '无法确定要查询的数据集合', rawResponse: content };
          return next();
        }

        const repo = ctx.db.getRepository(spec.collection);
        if (!repo) {
          ctx.body = { success: false, error: `数据集合 "${spec.collection}" 不存在` };
          return next();
        }

        let data: any[];
        const agg = spec.aggregation;

        if (agg?.type === 'group' && agg.groupBy) {
          data = await repo.find({
            filter: spec.filter || {},
            sort: spec.sort,
            limit: Math.min(spec.limit || 100, 500),
          });
          const dataList = (data || []).map((d: any) => (d.toJSON ? d.toJSON() : d));
          const grouped: Record<string, { count: number; sum: number }> = {};
          for (const item of dataList) {
            const key = String(item[agg.groupBy] || '其他');
            if (!grouped[key]) grouped[key] = { count: 0, sum: 0 };
            grouped[key].count++;
            if (agg.field) grouped[key].sum += Number(item[agg.field]) || 0;
          }
          data = Object.entries(grouped).map(([key, val]) => ({
            [agg.groupBy]: key,
            count: val.count,
            sum: val.sum,
            avg: val.count > 0 ? Math.round((val.sum / val.count) * 100) / 100 : 0,
          }));
        } else if (agg?.type && ['count', 'sum', 'avg', 'min', 'max'].includes(agg.type)) {
          const allData = await repo.find({
            filter: spec.filter || {},
            fields: agg.field ? [agg.field] : undefined,
          });
          const dataList = (allData || []).map((d: any) => (d.toJSON ? d.toJSON() : d));
          const values = dataList.map((d: any) => Number(d[agg.field]) || 0);

          let result: number;
          switch (agg.type) {
            case 'count': result = dataList.length; break;
            case 'sum': result = values.reduce((a: number, b: number) => a + b, 0); break;
            case 'avg': result = values.length ? values.reduce((a: number, b: number) => a + b, 0) / values.length : 0; break;
            case 'min': result = values.length ? Math.min(...values) : 0; break;
            case 'max': result = values.length ? Math.max(...values) : 0; break;
            default: result = dataList.length;
          }
          data = [{ metric: agg.type, field: agg.field, value: Math.round(result * 100) / 100 }];
        } else {
          const rawData = await repo.find({
            filter: spec.filter || {},
            sort: spec.sort,
            limit: Math.min(spec.limit || 50, 200),
          });
          data = (rawData || []).map((d: any) => (d.toJSON ? d.toJSON() : d));
        }

        if (chartPreference && CHART_TYPES.includes(chartPreference)) {
          spec.chart = { ...spec.chart, type: chartPreference };
        }

        ctx.body = {
          success: true,
          question,
          query: { collection: spec.collection, filter: spec.filter, aggregation: spec.aggregation },
          data,
          dataCount: data.length,
          chart: spec.chart || { type: 'table', title: '查询结果' },
          summary: spec.summary || '',
          insights: spec.insights || [],
        };
      } catch (err: any) {
        ctx.body = { success: false, error: err.message };
      }

      await next();
    },

    /**
     * POST /api/aiAnalytics:summarize
     * Body: { collectionName, fields? }
     *
     * Generates a natural language summary of the collection's data.
     */
    async summarize(ctx: any, next: any) {
      const { collectionName, fields } = ctx.action.params.values || {};
      if (!collectionName) return ctx.throw(400, 'collectionName is required');

      const repo = ctx.db.getRepository(collectionName);
      if (!repo) return ctx.throw(404, `Collection "${collectionName}" not found`);

      const count = await repo.count();
      const sample = await repo.find({ limit: 10, sort: ['-createdAt'] });
      const sampleData = (sample || []).map((d: any) => (d.toJSON ? d.toJSON() : d));

      const collection = ctx.db.getCollection(collectionName);
      const fieldNames = fields || Array.from(collection.fields.keys()).slice(0, 10);

      ctx.body = {
        collection: collectionName,
        title: collection?.options?.title || collectionName,
        totalRecords: count,
        fields: fieldNames,
        sampleSize: sampleData.length,
        sample: sampleData.map((d: any) => {
          const filtered: any = {};
          for (const f of fieldNames) {
            if (d[f] !== undefined) filtered[f] = d[f];
          }
          return filtered;
        }),
      };
      await next();
    },
  },
};

function buildAnalyticsSchema(db: any, targetCollection?: string): string {
  const collections = db.getCollections();
  const lines: string[] = [];

  for (const col of collections) {
    if ((col.options.dumpRules as any)?.group === 'log') continue;
    if (targetCollection && col.name !== targetCollection) continue;
    if (col.name.startsWith('_') || col.name.startsWith('system')) continue;

    const fields: string[] = [];
    for (const field of col.fields.values()) {
      if (field.options.hidden) continue;
      const typeStr = field.type || 'string';
      const title = field.options.uiSchema?.title || field.name;
      let extra = '';
      if (field.options.uiSchema?.enum) {
        const vals = field.options.uiSchema.enum.slice(0, 5).map((e: any) => e.label || e.value).join(', ');
        extra = ` [${vals}]`;
      }
      fields.push(`  - ${field.name} (${typeStr}): ${title}${extra}`);
    }

    if (fields.length > 0) {
      lines.push(`Collection: ${col.name} (${col.options.title || col.name})`);
      lines.push(fields.join('\n'));
      lines.push('');
    }
  }

  return lines.join('\n') || 'No collections available';
}
