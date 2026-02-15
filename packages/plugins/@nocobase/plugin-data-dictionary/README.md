# Data Dictionary

Centralized management of enumeration/option data.

## Features

- **Dictionary CRUD**: Create named dictionaries with unique codes
- **Items management**: Ordered items with value/label/color/icon
- **Cascading**: Parent-child item hierarchy
- **DictionarySelect**: Formily component with Select/Radio/Tag modes
- **Field interface**: Register dictionary fields on any collection
- **Seed data**: 4 system dictionaries pre-installed (priority, status, gender, yes_no)

## API

| Endpoint | Description |
|----------|-------------|
| `dictionaries:getByCode` | Get dictionary + items by code |
| `dictionaries:list` | List all dictionaries |
| `dictionaryItems:list` | List items for a dictionary |

## Usage in Fields

Set field interface to `dictionary` and configure `dictionaryCode` to bind.
