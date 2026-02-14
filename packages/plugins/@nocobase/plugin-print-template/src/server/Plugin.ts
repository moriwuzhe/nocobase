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
 * Rendering pipeline: Template HTML → Variable interpolation → Loop expansion → Watermark → Output
 *
 * Supports:
 * - {{field}} — simple field interpolation
 * - {{relation.field}} — nested relation interpolation
 * - {{currentDate}}, {{currentUser.nickname}} — system variables
 * - {{#each items}}...{{/each}} — loop blocks for relation arrays
 * - {{#if field}}...{{/if}} — conditional blocks
 * - Watermark overlay
 * - Page CSS for paper size / orientation / margins
 */
export default class PluginPrintTemplateServer extends Plugin {
  async load() {
    this.app.resourceManager.define({
      name: 'printTemplates',
      actions: {
        render: this.renderTemplate.bind(this),
        renderPdf: this.renderPdf.bind(this),
        batchRender: this.batchRender.bind(this),
      },
    });

    this.app.acl.registerSnippet({
      name: `pm.${this.name}`,
      actions: ['printTemplates:*'],
    });
    this.app.acl.allow('printTemplates', ['list', 'get', 'render', 'renderPdf', 'batchRender'], 'loggedIn');
  }

  /**
   * Render a template with record data, returning full HTML with print styles.
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

    const html = this.renderFullHtml(template, record.toJSON(), ctx.state.currentUser);
    ctx.body = { html };
    await next();
  }

  /**
   * Render to PDF. Tries puppeteer if available, otherwise falls back to HTML with print instructions.
   */
  async renderPdf(ctx: any, next: any) {
    const { templateId, collectionName, recordId } = ctx.action.params;

    const template = await ctx.db.getRepository('printTemplates').findOne({ filterByTk: templateId });
    if (!template) return ctx.throw(404, 'Template not found');

    const record = await ctx.db.getRepository(collectionName).findOne({
      filterByTk: recordId,
      appends: template.appends || [],
    });
    if (!record) return ctx.throw(404, 'Record not found');

    const html = this.renderFullHtml(template, record.toJSON(), ctx.state.currentUser);

    // Try to use puppeteer for PDF generation
    try {
      const puppeteer = require('puppeteer');
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({
        format: template.paperSize || 'A4',
        landscape: template.orientation === 'landscape',
        margin: template.margins || { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
        printBackground: true,
      });
      await browser.close();

      ctx.set('Content-Type', 'application/pdf');
      ctx.set('Content-Disposition', `attachment; filename="${template.name || 'document'}.pdf"`);
      ctx.body = pdfBuffer;
    } catch {
      // puppeteer not available — return HTML with print meta tag
      ctx.body = {
        html,
        message: 'PDF generation requires puppeteer. Returning HTML for browser-side printing.',
      };
    }

    await next();
  }

  /**
   * Batch render multiple records.
   */
  async batchRender(ctx: any, next: any) {
    const { templateId, collectionName, recordIds } = ctx.action.params;

    const template = await ctx.db.getRepository('printTemplates').findOne({ filterByTk: templateId });
    if (!template) return ctx.throw(404, 'Template not found');

    const ids = Array.isArray(recordIds) ? recordIds : recordIds?.split(',');
    if (!ids?.length) return ctx.throw(400, 'recordIds is required');

    const records = await ctx.db.getRepository(collectionName).find({
      filter: { id: { $in: ids } },
      appends: template.appends || [],
    });

    const results = records.map((record: any) => ({
      recordId: record.id,
      html: this.renderFullHtml(template, record.toJSON(), ctx.state.currentUser),
    }));

    ctx.body = { results };
    await next();
  }

  // -----------------------------------------------------------------------
  // Template Engine
  // -----------------------------------------------------------------------

  /**
   * Render a complete HTML document with print styles, watermark, and interpolated content.
   */
  private renderFullHtml(template: any, data: Record<string, any>, currentUser: any): string {
    const now = new Date();
    const context = { currentUser, now };

    // Step 1: Process loop blocks {{#each items}}...{{/each}}
    let content = this.processLoops(template.content, data);

    // Step 2: Process conditional blocks {{#if field}}...{{/if}}
    content = this.processConditionals(content, data);

    // Step 3: Interpolate variables
    content = this.interpolate(content, data, context);

    // Step 4: Wrap in full HTML with print styles
    const margins = template.margins || { top: 20, right: 20, bottom: 20, left: 20 };
    const watermarkCss = template.showWatermark && template.watermarkText
      ? `
        body::after {
          content: '${template.watermarkText}';
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 80px;
          color: rgba(0, 0, 0, 0.06);
          pointer-events: none;
          z-index: 9999;
          white-space: nowrap;
        }
      `
      : '';

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${template.name || 'Print'}</title>
  <style>
    @page {
      size: ${template.paperSize || 'A4'} ${template.orientation || 'portrait'};
      margin: ${margins.top || 20}mm ${margins.right || 20}mm ${margins.bottom || 20}mm ${margins.left || 20}mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    table { border-collapse: collapse; width: 100%; }
    table th, table td { border: 1px solid #ddd; padding: 6px 10px; text-align: left; }
    table th { background-color: #f5f5f5; font-weight: 600; }
    ${watermarkCss}
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
${content}
</body>
</html>`;
  }

  /**
   * Process {{#each relation}}...{{/each}} loop blocks.
   * Renders the inner template for each item in the array field.
   */
  private processLoops(html: string, data: Record<string, any>): string {
    return html.replace(
      /\{\{#each\s+(\w+(?:\.\w+)*)\}\}([\s\S]*?)\{\{\/each\}\}/g,
      (match, path, innerTemplate) => {
        const items = path.split('.').reduce((obj: any, key: string) => obj?.[key], data);
        if (!Array.isArray(items)) return '';

        return items
          .map((item: any, index: number) => {
            let rendered = innerTemplate;
            // Replace {{@index}} with the loop index
            rendered = rendered.replace(/\{\{@index\}\}/g, String(index + 1));
            // Replace {{fieldName}} within the loop context
            rendered = rendered.replace(/\{\{(\w+)\}\}/g, (_: string, key: string) => {
              const val = item[key];
              if (val === null || val === undefined) return '';
              return String(val);
            });
            return rendered;
          })
          .join('');
      },
    );
  }

  /**
   * Process {{#if field}}...{{/if}} and {{#if field}}...{{else}}...{{/if}} blocks.
   */
  private processConditionals(html: string, data: Record<string, any>): string {
    // With else
    html = html.replace(
      /\{\{#if\s+(\w+(?:\.\w+)*)\}\}([\s\S]*?)\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g,
      (match, path, truePart, falsePart) => {
        const value = path.split('.').reduce((obj: any, key: string) => obj?.[key], data);
        return value ? truePart : falsePart;
      },
    );
    // Without else
    html = html.replace(
      /\{\{#if\s+(\w+(?:\.\w+)*)\}\}([\s\S]*?)\{\{\/if\}\}/g,
      (match, path, truePart) => {
        const value = path.split('.').reduce((obj: any, key: string) => obj?.[key], data);
        return value ? truePart : '';
      },
    );
    return html;
  }

  /**
   * Interpolate {{variable}} placeholders.
   */
  private interpolate(
    html: string,
    data: Record<string, any>,
    context: { currentUser: any; now: Date },
  ): string {
    return html.replace(/\{\{([^#/}][^}]*)\}\}/g, (match, path) => {
      const trimmed = path.trim();

      // System variables
      if (trimmed === 'currentDate') return context.now.toLocaleDateString();
      if (trimmed === 'currentTime') return context.now.toLocaleTimeString();
      if (trimmed === 'currentDateTime') return context.now.toLocaleString();
      if (trimmed === 'pageBreak') return '<div style="page-break-after: always;"></div>';
      if (trimmed.startsWith('currentUser.')) {
        return context.currentUser?.[trimmed.slice(12)] ?? '';
      }

      // Data field
      const value = trimmed.split('.').reduce((obj: any, key: string) => obj?.[key], data);
      if (value === null || value === undefined) return '';
      if (value instanceof Date) return value.toLocaleString();
      if (typeof value === 'boolean') return value ? 'Yes' : 'No';
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value);
    });
  }
}
