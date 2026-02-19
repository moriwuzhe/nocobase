# Integration: DingTalk

DingTalk (钉钉) SSO, contacts sync, and work notification push.

## Features

- **OAuth SSO**: Login button on NocoBase login page, registered as auth type `dingtalk-oauth`
- **Contacts Sync**: Recursive department + user sync from DingTalk organization
- **Notification Channel**: Work notification push registered with notification-manager
- **Admin Config**: App Key, App Secret, Agent ID, Corp ID

## Setup

1. Create a DingTalk enterprise application at [open.dingtalk.com](https://open.dingtalk.com)
2. Configure App Key, App Secret, Agent ID in plugin settings
3. Enable the `dingtalk-oauth` authenticator in Auth settings
