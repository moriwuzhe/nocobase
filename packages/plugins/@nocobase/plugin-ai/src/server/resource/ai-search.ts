/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

/**
 * AI Natural Language Search Resource
 *
 * Allows users to query data using natural language:
 * - "Show me all orders from last month with total > 1000"
 * - "Find customers in Shanghai who haven't ordered in 30 days"
 * - "What's our top selling product this quarter?"
 *
 * Flow:
 * 1. User sends a natural language query
 * 2. LLM translates it into a NocoBase filter JSON
 * 3. System executes the filter and returns results
 * 4. Optionally, LLM generates a summary/chart recommendation
 */
export default {
  name: 'aiSearch',
  actions: {
    /**
     * POST /api/aiSearch:query
     * Body: { question, collectionName?, llmService? }
     */
    async query(ctx: any, next: any) {
      const { question, collectionName, llmService } = ctx.action.params.values || {};

      if (!question) {
        return ctx.throw(400, 'question is required');
      }

      const aiPlugin = ctx.app.pm.get('ai') as any;
      if (!aiPlugin?.aiManager) {
        return ctx.throw(500, 'AI plugin is not available');
      }

      // Build the schema context: list of collections and their fields
      const schemaContext = buildSchemaContext(ctx.db, collectionName);

      const systemPrompt = `You are a data query assistant for a NocoBase application.
Given a user's natural language question, translate it into a NocoBase query specification.

Available collections and fields:
${schemaContext}

Respond with ONLY a JSON object in this exact format (no markdown, no explanation):
{
  "collection": "collectionName",
  "filter": { /* NocoBase filter object using operators like $eq, $ne, $gt, $lt, $gte, $lte, $includes, $in, $and, $or */ },
  "sort": ["-fieldName"],
  "limit": 20,
  "fields": ["field1", "field2"],
  "summary": "A brief description of what this query returns"
}`;

      try {
        // Find a configured LLM service
        const services = await ctx.db.getRepository('llmServices').find({
          filter: llmService ? { name: llmService } : { enabled: true },
          limit: 1,
        });

        if (!services.length) {
          return ctx.throw(400, 'No LLM service configured. Go to AI settings to add one.');
        }

        const service = services[0];
        const providerOpts = aiPlugin.aiManager.llmProviders.get(service.provider);
        if (!providerOpts) {
          return ctx.throw(500, `LLM provider "${service.provider}" not found`);
        }

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

        // Parse the JSON response
        let querySpec: any;
        try {
          // Extract JSON from the response (in case LLM adds markdown)
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          querySpec = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
        } catch {
          ctx.body = {
            success: false,
            error: 'Failed to parse AI response',
            rawResponse: content,
          };
          return next();
        }

        if (!querySpec?.collection) {
          ctx.body = {
            success: false,
            error: 'AI could not determine which collection to query',
            rawResponse: content,
          };
          return next();
        }

        // Execute the query
        const repo = ctx.db.getRepository(querySpec.collection);
        if (!repo) {
          ctx.body = {
            success: false,
            error: `Collection "${querySpec.collection}" not found`,
          };
          return next();
        }

        const data = await repo.find({
          filter: querySpec.filter || {},
          sort: querySpec.sort,
          limit: Math.min(querySpec.limit || 20, 100),
          fields: querySpec.fields,
        });

        ctx.body = {
          success: true,
          question,
          query: querySpec,
          summary: querySpec.summary,
          data,
          count: data.length,
        };
      } catch (err: any) {
        ctx.body = {
          success: false,
          error: err.message,
        };
      }

      await next();
    },

    /**
     * GET /api/aiSearch:getSchema
     * Returns the schema context for the AI to understand available data.
     */
    async getSchema(ctx: any, next: any) {
      const { collectionName } = ctx.action.params;
      ctx.body = buildSchemaContext(ctx.db, collectionName);
      await next();
    },
  },
};

/**
 * Build a text description of the database schema for LLM context.
 */
function buildSchemaContext(db: any, targetCollection?: string): string {
  const collections = db.getCollections();
  const lines: string[] = [];

  for (const col of collections) {
    // Skip system/log collections
    if (col.options.dumpRules?.group === 'log') continue;
    if (targetCollection && col.name !== targetCollection) continue;

    const fields: string[] = [];
    for (const field of col.fields.values()) {
      if (field.options.hidden) continue;
      const typeStr = field.type || 'string';
      const title = field.options.uiSchema?.title || field.name;
      fields.push(`  - ${field.name} (${typeStr}): ${title}`);
    }

    if (fields.length > 0) {
      lines.push(`Collection: ${col.name} (${col.options.title || col.name})`);
      lines.push(fields.join('\n'));
      lines.push('');
    }
  }

  return lines.join('\n');
}
