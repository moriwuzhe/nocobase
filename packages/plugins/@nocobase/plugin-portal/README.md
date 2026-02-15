# Enterprise Portal

External-facing portals for customers, suppliers, and partners.

## Features

- **Multiple portals** with independent URLs (`/portal/:slug`)
- **External user auth**: JWT-based login/register, separate from internal users
- **Password reset**: Token-based reset flow with email notification
- **Data isolation**: Collection-level permission whitelist with filter injection
- **Custom branding**: Logo, colors, CSS per portal
- **Self-registration**: Configurable per portal

## API

| Endpoint | Auth | Description |
|----------|------|-------------|
| `portalAuth:login` | Public | Email/phone + password login |
| `portalAuth:register` | Public | Self-registration |
| `portalAuth:getPortalInfo` | Public | Portal branding + auth config |
| `portalAuth:getProfile` | Token | Current user profile |
| `portalAuth:changePassword` | Token | Change password |
| `portalAuth:requestPasswordReset` | Public | Request reset token |
| `portalAuth:resetPassword` | Public | Reset with token |
| `portalData:list` | Token | Query collection data with isolation |
