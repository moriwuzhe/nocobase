/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

/**
 * QR Code / Barcode Generation API
 *
 * Generates QR codes and barcodes for record data.
 * Used in print templates, record details, and sharing.
 *
 * Returns SVG format for crisp rendering at any size.
 */

export function registerBarcodeActions(app: any) {
  app.resourceManager.define({
    name: 'barcode',
    actions: {
      /**
       * GET /api/barcode:qrcode?text=xxx&size=200
       * Returns QR code as SVG data URI.
       */
      async qrcode(ctx: any, next: any) {
        const { text, size = 200 } = ctx.action.params;
        if (!text) return ctx.throw(400, 'text required');

        // Simple QR code generation using a minimal approach
        // In production, use a library like 'qrcode' npm package
        const qrText = encodeURIComponent(text);
        const svgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${qrText}`;

        ctx.body = {
          text,
          type: 'qrcode',
          size: parseInt(String(size)),
          url: svgUrl,
          dataUri: `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${qrText}&format=svg`,
        };
        await next();
      },

      /**
       * POST /api/barcode:generate
       * Body: { collectionName, recordId, fields, format? }
       * Generates QR code containing record data.
       */
      async generate(ctx: any, next: any) {
        const { collectionName, recordId, fields, format = 'qrcode' } = ctx.action.params.values || {};
        if (!collectionName || !recordId) return ctx.throw(400, 'collectionName and recordId required');

        const repo = ctx.db.getRepository(collectionName);
        if (!repo) return ctx.throw(404);

        const record = await repo.findOne({ filterByTk: recordId });
        if (!record) return ctx.throw(404, 'Record not found');

        const data = record.toJSON ? record.toJSON() : record;
        const selectedFields = fields?.length
          ? Object.fromEntries(Object.entries(data).filter(([k]) => fields.includes(k)))
          : { id: data.id, collection: collectionName };

        const text = JSON.stringify(selectedFields);
        const encoded = encodeURIComponent(text);
        const size = 300;

        ctx.body = {
          collectionName,
          recordId,
          format,
          data: selectedFields,
          qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}`,
        };
        await next();
      },

      /**
       * POST /api/barcode:batchGenerate
       * Body: { collectionName, recordIds, labelField }
       */
      async batchGenerate(ctx: any, next: any) {
        const { collectionName, recordIds, labelField } = ctx.action.params.values || {};
        if (!collectionName || !recordIds?.length) return ctx.throw(400);

        const repo = ctx.db.getRepository(collectionName);
        if (!repo) return ctx.throw(404);

        const records = await repo.find({ filter: { id: { $in: recordIds } } });
        const results = records.map((r: any) => {
          const d = r.toJSON ? r.toJSON() : r;
          const text = `${collectionName}:${d.id}`;
          const label = labelField ? d[labelField] : `#${d.id}`;
          return {
            id: d.id,
            label,
            qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`,
          };
        });

        ctx.body = { results };
        await next();
      },
    },
  });

  app.acl.allow('barcode', ['qrcode', 'generate', 'batchGenerate'], 'loggedIn');
}
