# Realtime Updates

WebSocket-based real-time data push for live dashboards and notifications.

## Features

- **WebSocket server**: Shared with HTTP server on `/ws` path
- **Channel pub/sub**: Subscribe to named channels
- **Auto-broadcast**: Collection CRUD events on `collection:xxx` channels
- **User channels**: `user:N:notifications` for personal push
- **Heartbeat**: Stale connection cleanup every 30s
- **React hooks**: `useRealtime()`, `useRealtimeChannel()`
- **Auto-reconnect**: Client reconnects after 3s on disconnect

## Client Usage

```tsx
import { useRealtimeChannel } from '@nocobase/plugin-realtime/client';

function OrderList() {
  const { data } = useRealtimeChannel('collection:orders');
  // data updates whenever an order is created/updated/deleted
}
```

## Server API

```typescript
const realtime = app.pm.get('realtime');
realtime.broadcast('dashboard:refresh', { signal: 'update' });
realtime.sendToUser(5, { type: 'notification', title: 'Hello' });
```
