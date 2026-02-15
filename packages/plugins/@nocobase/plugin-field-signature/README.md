# Field: Signature

Canvas-based hand-drawn signature field for forms.

## Features

- **Canvas drawing**: Mouse and touch (mobile) support
- **Export**: Stores as base64 PNG data URL
- **Configurable**: Width, height, pen color, pen width
- **Read-pretty**: Displays signature as image

## Field Config

```json
{
  "type": "text",
  "interface": "signature",
  "uiSchema": {
    "x-component": "SignaturePad",
    "x-component-props": { "width": 400, "height": 200, "penColor": "#000", "penWidth": 2 }
  }
}
```
