# Print Templates

WYSIWYG print template designer with variable interpolation and PDF export.

## Features

- **Template engine**: `{{field}}`, `{{relation.field}}`, `{{currentUser.name}}`
- **Loop blocks**: `{{#each items}}...{{/each}}` with `{{@index}}`
- **Conditional blocks**: `{{#if field}}...{{else}}...{{/if}}`
- **Page breaks**: `{{pageBreak}}`
- **PDF generation**: Puppeteer-based (graceful fallback to browser print)
- **Batch rendering**: Render multiple records at once
- **Watermark**: Configurable text watermark overlay
- **Print styles**: @page CSS with paper size, orientation, margins

## API

| Endpoint | Description |
|----------|-------------|
| `printTemplates:render` | Render template → HTML |
| `printTemplates:renderPdf` | Render template → PDF |
| `printTemplates:batchRender` | Render multiple records |

## Template Syntax

```html
<h1>Invoice #{{id}}</h1>
<p>Customer: {{customer.name}}</p>
<table>
  {{#each items}}
  <tr><td>{{@index}}</td><td>{{name}}</td><td>{{price}}</td></tr>
  {{/each}}
</table>
{{#if notes}}<p>Notes: {{notes}}</p>{{/if}}
<p>Date: {{currentDate}}</p>
```
