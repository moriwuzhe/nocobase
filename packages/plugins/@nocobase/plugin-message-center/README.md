# Message Center

Unified notification hub with multi-channel delivery and user preferences.

## Features

- **Unified inbox**: Aggregates messages from all plugins
- **6 categories**: system, approval, comment, workflow, mention, custom
- **Multi-channel**: In-app, email, DingTalk, WeCom, Feishu
- **Preferences**: Per-user channel toggle, category muting
- **Do Not Disturb**: Time window with overnight support
- **Unread counts**: Total + per-category

## API for Plugin Developers

```typescript
const messageCenter = app.pm.get('message-center');
await messageCenter.sendMessage({
  userId: [1, 2],
  category: 'approval',
  title: 'New approval task',
  content: 'Please review order #123',
  level: 'info',
  source: 'plugin-workflow-approval',
});
```

## Client Component

`<NotificationBell />` — renders a bell icon with unread badge in the navbar.
