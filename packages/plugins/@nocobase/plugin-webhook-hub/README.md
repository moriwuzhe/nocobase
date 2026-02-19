# Webhook Hub

Inbound and outbound webhooks with HMAC signing, retry, and logging.

## Features

- **Outbound**: Subscribe to collection CRUD events, POST to external URLs
- **Inbound**: Receive external POSTs, auto-create records
- **HMAC signing**: SHA-256 signature in `X-Webhook-Signature` header
- **Retry**: Exponential backoff (configurable max retries)
- **Logging**: Full request/response logs with duration and status
- **Test**: Send test payload to verify webhook connectivity

## API

| Endpoint | Description |
|----------|-------------|
| `webhooks:list/create/update/destroy` | CRUD |
| `webhooks:test` | Send test webhook |
| `webhookReceiver:receive/:id` | Inbound endpoint (public) |
| `webhookLogs:list` | View delivery logs |

## Outbound Event Format

```json
{
  "event": "orders.afterCreate",
  "timestamp": "2025-01-15T10:30:00Z",
  "data": { "id": 42, "title": "Order #42", ... }
}
```
