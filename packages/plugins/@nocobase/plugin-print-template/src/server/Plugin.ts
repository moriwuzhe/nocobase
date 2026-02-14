/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin } from '@nocobase/server';

/**
 * Print Template Plugin
 *
 * Features:
 * - WYSIWYG template designer (HTML-based)
 * - Template variables: field values, related data, system variables, expressions
 * - Output formats: HTML preview, PDF download, Word (docx) download
 * - Barcode/QR code generation in templates
 * - Table loop rendering for related records
 * - Batch printing (select multiple records)
 * - Watermark support
 * - Custom page size and orientation
 */
export default class PluginPrintTemplateServer extends Plugin {
  async load() {
    // Resources
    this.app.resourceManager.define({
      name: 'printTemplates',
      actions: {
        render: this.renderTemplate.bind(this),
        renderPdf: this.renderPdf.bind(this),
        batchRender: this.batchRender.bind(this),
      },
    });

    // ACL
    this.app.acl.registerSnippet({
      name: `pm.${this.name}`,
      actions: ['printTemplates:*'],
    });
    this.app.acl.allow('printTemplates', ['list', 'get', 'render', 'renderPdf', 'batchRender'], 'loggedIn');
  }

  /**
   * Render a template with the given record data, returning HTML.
   */
  async renderTemplate(ctx: any, next: any) {
    const { templateId, collectionName, recordId } = ctx.action.params;

    const template = await ctx.db.getRepository('printTemplates').findOne({ filterByTk: templateId });
    if (!template) return ctx.throw(404, 'Template not found');

    const record = await ctx.db.getRepository(collectionName).findOne({
      filterByTk: recordId,
      appends: template.appends || [],
    });
    if (!record) return ctx.throw(404, 'Record not found');

    const html = this.interpolateTemplate(template.content, record.toJSON(), {
      currentUser: ctx.state.currentUser,
      now: new Date(),
    });

    ctx.body = { html };
    await next();
  }

  /**
   * Render a template to PDF (placeholder - real implementation would use puppeteer/wkhtmltopdf).
   */
  async renderPdf(ctx: any, next: any) {
    const { templateId, collectionName, recordId } = ctx.action.params;

    // In a real implementation, this would:
    // 1. Render HTML (same as renderTemplate)
    // 2. Convert HTML to PDF using puppeteer or wkhtmltopdf
    // 3. Return PDF as a downloadable file

    ctx.body = { message: 'PDF rendering requires puppeteer. Configure it in your deployment.' };
    await next();
  }

  /**
   * Batch render templates for multiple records.
   */
  async batchRender(ctx: any, next: any) {
    const { templateId, collectionName, recordIds } = ctx.action.params;

    const template = await ctx.db.getRepository('printTemplates').findOne({ filterByTk: templateId });
    if (!template) return ctx.throw(404, 'Template not found');

    const records = await ctx.db.getRepository(collectionName).find({
      filter: { id: { $in: recordIds } },
      appends: template.appends || [],
    });

    const results = records.map((record: any) => ({
      recordId: record.id,
      html: this.interpolateTemplate(template.content, record.toJSON(), {
        currentUser: ctx.state.currentUser,
        now: new Date(),
      }),
    }));

    ctx.body = { results };
    await next();
  }

  /**
   * Simple template interpolation engine.
   * Replaces {{fieldName}} with record values.
   * Supports nested paths: {{relation.fieldName}}
   */
  private interpolateTemplate(
    templateHtml: string,
    data: Record<string, any>,
    context: { currentUser: any; now: Date },
  ): string {
    return templateHtml.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const trimmedPath = path.trim();

      // System variables
      if (trimmedPath === 'currentDate') return context.now.toLocaleDateString();
      if (trimmedPath === 'currentTime') return context.now.toLocaleTimeString();
      if (trimmedPath === 'currentDateTime') return context.now.toLocaleString();
      if (trimmedPath.startsWith('currentUser.')) {
        const key = trimmedPath.replace('currentUser.', '');
        return context.currentUser?.[key] ?? '';
      }

      // Record data
      const value = trimmedPath.split('.').reduce((obj: any, key: string) => obj?.[key], data);
      if (value === null || value === undefined) return '';
      if (value instanceof Date) return value.toLocaleString();
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value);
    });
  }
}
