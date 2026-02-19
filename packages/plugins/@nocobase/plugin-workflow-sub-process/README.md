# Workflow: Sub-process

Invoke another workflow as a child process within a parent workflow.

## Features

- **Sync mode**: Parent waits for child to complete, receives result
- **Async mode**: Parent continues immediately, child runs in background
- **Variable mapping**: Map parent context → child input, child result → parent output

## Workflow Node Config

```json
{
  "type": "sub-process",
  "config": {
    "workflowKey": "target-workflow-key",
    "mode": "sync",
    "inputMapping": { "orderId": "{{$context.data.id}}" },
    "outputMapping": { "result": "output.status" },
    "timeout": 300
  }
}
```
