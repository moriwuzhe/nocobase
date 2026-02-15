# Workflow: Approval Engine

Professional approval workflow node with multi-strategy support.

## Features

- **4 Approval Strategies**: Sequential (one-by-one), Countersign (all must approve), Or-sign (any one), Vote percentage
- **7 Actions**: Approve, Reject, Return, Transfer, Add Approver, Delegate, Urge
- **Delegation**: Auto-delegate approval authority during absence (date range + scope)
- **Timeout**: Configurable auto-approve/reject/escalate/remind on timeout
- **Approval Center**: Dashboard with pending/processed/initiated tabs + statistics

## Collections

| Collection | Purpose |
|-----------|---------|
| `approvalTasks` | Individual approval tasks per approver |
| `approvalRecords` | Overall approval instances |
| `approvalDelegations` | Delegation rules |

## API

| Endpoint | Description |
|----------|-------------|
| `approvalTasks:listMine` | List current user's approval tasks |
| `approvalTasks:submit` | Submit approval decision |
| `approvalTasks:urge` | Send reminder to approver |
| `approvalTasks:stats` | Get approval statistics |
| `approvalRecords:withdraw` | Withdraw an approval (initiator only) |

## Workflow Node Config

```json
{
  "type": "approval",
  "config": {
    "mode": "sequential",
    "assignees": [1, 2, 3],
    "actions": ["approve", "reject", "return"],
    "allowWithdraw": true,
    "skipSelfApproval": false,
    "timeout": { "enabled": true, "duration": 1440, "action": "remind" }
  }
}
```
