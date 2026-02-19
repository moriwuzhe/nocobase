# Comments & Discussions

Record-level comments with threading, @mentions, and rich text.

## Features

- **Polymorphic**: Attach comments to any collection's records
- **Threaded replies**: Unlimited nesting via parentId
- **@Mentions**: Tag users with notification push
- **Soft delete**: Comments are marked as deleted, not removed
- **Edit tracking**: Automatic `edited` flag and `editedAt` timestamp
- **Ownership**: Only authors (or admins) can edit/delete

## API

| Endpoint | Description |
|----------|-------------|
| `comments:listByRecord` | List comments for a specific record |
| `comments:mentionUsers` | Search mentionable users |
| `comments:create` | Add a comment |

## Schema Integration

Add the `CommentBlock` to any record detail page via the block initializer.
