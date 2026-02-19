# Workflow: Form Trigger

Trigger workflows when forms are submitted via a dedicated API endpoint.

## Features

- Works with public forms, portal forms, and internal forms
- Dedicated endpoint: `POST /api/formTrigger:submit`
- Supports sync and async workflow execution
- formKey-based routing for fast matching

## API

```bash
POST /api/formTrigger:submit
Content-Type: application/json

{
  "formKey": "contact-us",
  "data": {
    "name": "John",
    "email": "john@example.com",
    "message": "Hello"
  }
}
```

## Workflow Config

Set trigger type to `form` and configure `formKey` to match.
