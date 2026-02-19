# Global Search

Cross-collection full-text search with history and favorites.

## Features

- **Cross-collection search**: Searches all configured string/text fields
- **Auto-detection**: Automatically finds searchable fields if not configured
- **Search history**: Per-user, deduplicated
- **Favorites**: Bookmark search results
- **Autocomplete**: Suggestions from search history
- **Ctrl+K shortcut**: Opens search modal from anywhere

## API

| Endpoint | Description |
|----------|-------------|
| `globalSearch:search` | Full-text search across collections |
| `globalSearch:suggest` | Autocomplete suggestions |
| `globalSearch:getHistory` | Recent search history |
| `globalSearch:clearHistory` | Clear search history |
| `globalSearch:addFavorite` | Bookmark a result |
| `globalSearch:getFavorites` | List bookmarked results |
| `globalSearch:getConfig` | Get search scope config |
| `globalSearch:saveConfig` | Update search scope config |
