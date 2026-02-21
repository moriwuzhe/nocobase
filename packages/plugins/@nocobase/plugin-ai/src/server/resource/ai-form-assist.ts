/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

/**
 * AI Form Assist Resource
 *
 * Provides intelligent form filling suggestions:
 * - Auto-suggest field values based on partial input and context
 * - Smart categorization based on description text
 * - Address completion
 * - Historical pattern matching for similar records
 */

export default {
  name: 'aiFormAssist',
  actions: {
    /**
     * POST /api/aiFormAssist:suggest
     * Body: { collectionName, fieldName, currentValues, partialValue? }
     *
     * Returns suggested values for a form field based on context.
     */
    async suggest(ctx: any, next: any) {
      const { collectionName, fieldName, currentValues, partialValue } = ctx.action.params.values || {};

      if (!collectionName || !fieldName) {
        return ctx.throw(400, 'collectionName and fieldName are required');
      }

      const collection = ctx.db.getCollection(collectionName);
      if (!collection) return ctx.throw(404, `Collection "${collectionName}" not found`);

      const field = collection.getField(fieldName);
      if (!field) return ctx.throw(404, `Field "${fieldName}" not found`);

      const suggestions: string[] = [];

      if (field.options.uiSchema?.enum) {
        const options = field.options.uiSchema.enum
          .map((e: any) => e.value || e)
          .filter((v: any) => !partialValue || String(v).toLowerCase().includes(String(partialValue).toLowerCase()));
        suggestions.push(...options.slice(0, 10));
      } else {
        try {
          const repo = ctx.db.getRepository(collectionName);
          const recent = await repo.find({
            fields: [fieldName],
            sort: ['-createdAt'],
            limit: 50,
          });
          const values = recent
            .map((r: any) => r[fieldName])
            .filter((v: any) => v != null && v !== '')
            .filter((v: any) => !partialValue || String(v).toLowerCase().includes(String(partialValue).toLowerCase()));

          const unique = Array.from(new Set<string>(values.map((v: any) => String(v))));
          suggestions.push(...unique.slice(0, 10));
        } catch { /* ignore */ }
      }

      if (suggestions.length < 3) {
        try {
          const aiSuggestions = await getAISuggestions(ctx, collectionName, fieldName, currentValues, partialValue);
          if (aiSuggestions.length > 0) {
            suggestions.push(...aiSuggestions.filter((s) => !suggestions.includes(s)));
          }
        } catch { /* AI not available, use only DB suggestions */ }
      }

      ctx.body = {
        field: fieldName,
        suggestions: suggestions.slice(0, 10),
        source: suggestions.length > 0 ? 'hybrid' : 'empty',
      };
      await next();
    },

    /**
     * POST /api/aiFormAssist:classify
     * Body: { text, collectionName, fieldName }
     *
     * Uses AI to classify/categorize text into a field's options.
     */
    async classify(ctx: any, next: any) {
      const { text, collectionName, fieldName } = ctx.action.params.values || {};

      if (!text || !collectionName || !fieldName) {
        return ctx.throw(400, 'text, collectionName, and fieldName are required');
      }

      const collection = ctx.db.getCollection(collectionName);
      if (!collection) return ctx.throw(404, `Collection not found`);

      const field = collection.getField(fieldName);
      const options = field?.options?.uiSchema?.enum;

      if (!options || options.length === 0) {
        ctx.body = { classification: null, confidence: 0 };
        return next();
      }

      const aiPlugin = ctx.app.pm.get('ai') as any;
      if (!aiPlugin?.aiManager) {
        ctx.body = { classification: null, confidence: 0, error: 'AI not available' };
        return next();
      }

      try {
        const services = await ctx.db.getRepository('llmServices').find({ filter: { enabled: true }, limit: 1 });
        if (!services.length) {
          ctx.body = { classification: null, confidence: 0, error: 'No LLM service' };
          return next();
        }

        const service = services[0];
        const providerOpts = aiPlugin.aiManager.llmProviders.get(service.provider);
        if (!providerOpts) {
          ctx.body = { classification: null, confidence: 0 };
          return next();
        }

        const optionLabels = options.map((o: any) => `${o.value}: ${o.label}`).join('\n');
        const prompt = `Given this text: "${text}"
Classify it into ONE of these categories:
${optionLabels}

Respond with ONLY the value (not the label), nothing else.`;

        const provider = new providerOpts.provider({
          app: ctx.app,
          serviceOptions: service.options,
          chatOptions: {
            model: service.defaultModel || service.options?.defaultModel,
            messages: [{ role: 'user', content: prompt }],
          },
        });

        const response = await provider.invokeChat();
        const result = (response?.content || response?.text || '').trim();
        const matched = options.find((o: any) => o.value === result || o.label === result);

        ctx.body = {
          classification: matched?.value || result,
          label: matched?.label || result,
          confidence: matched ? 0.9 : 0.5,
        };
      } catch (err: any) {
        ctx.body = { classification: null, confidence: 0, error: err.message };
      }
      await next();
    },
  },
};

async function getAISuggestions(
  ctx: any,
  collectionName: string,
  fieldName: string,
  currentValues: any,
  partialValue: string | undefined,
): Promise<string[]> {
  const aiPlugin = ctx.app.pm.get('ai') as any;
  if (!aiPlugin?.aiManager) return [];

  const services = await ctx.db.getRepository('llmServices').find({ filter: { enabled: true }, limit: 1 });
  if (!services.length) return [];

  const service = services[0];
  const providerOpts = aiPlugin.aiManager.llmProviders.get(service.provider);
  if (!providerOpts) return [];

  const collection = ctx.db.getCollection(collectionName);
  const field = collection.getField(fieldName);
  const fieldTitle = field?.options?.uiSchema?.title || fieldName;

  const contextStr = currentValues ? JSON.stringify(currentValues) : 'empty form';
  const prompt = `For a "${collection.options.title || collectionName}" record, suggest 5 possible values for the "${fieldTitle}" field.
Current form data: ${contextStr}
${partialValue ? `User has typed: "${partialValue}"` : ''}
Respond with a JSON array of strings only, e.g. ["value1","value2","value3","value4","value5"]`;

  const provider = new providerOpts.provider({
    app: ctx.app,
    serviceOptions: service.options,
    chatOptions: {
      model: service.defaultModel || service.options?.defaultModel,
      messages: [{ role: 'user', content: prompt }],
    },
  });

  const response = await provider.invokeChat();
  const content = (response?.content || response?.text || '').trim();

  try {
    const match = content.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]).filter((v: any) => typeof v === 'string');
  } catch { /* ignore */ }

  return [];
}
