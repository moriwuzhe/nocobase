/**
 * Built-in workflow templates for quick creation.
 * AI Integration: When @nocobase/plugin-workflow-ai is available, add AI instruction nodes.
 */

import { NAMESPACE } from './locale';

export interface WorkflowNodeDef {
  type: string;
  config?: Record<string, any>;
}

export interface WorkflowTemplate {
  key: string;
  title: string;
  description: string;
  type: string;
  sync?: boolean;
  config: Record<string, any>;
  /** Optional: nodes to create after workflow (trigger + these nodes) */
  nodes?: WorkflowNodeDef[];
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    key: 'collection-create-notify',
    title: `{{t("Data change notification", { ns: "${NAMESPACE}" })}}`,
    description: `{{t("Triggered when data is created/updated/deleted, can send notifications", { ns: "${NAMESPACE}" })}}`,
    type: 'collection',
    sync: false,
    config: {
      collection: null,
      mode: 7, // CREATE | UPDATE | DESTROY
      condition: null,
    },
  },
  {
    key: 'collection-create',
    title: `{{t("Create record trigger", { ns: "${NAMESPACE}" })}}`,
    description: `{{t("Triggered when a new record is created in a collection", { ns: "${NAMESPACE}" })}}`,
    type: 'collection',
    sync: false,
    config: {
      collection: null,
      mode: 1, // CREATE
      condition: null,
    },
  },
  {
    key: 'collection-update',
    title: `{{t("Update record trigger", { ns: "${NAMESPACE}" })}}`,
    description: `{{t("Triggered when a record is updated in a collection", { ns: "${NAMESPACE}" })}}`,
    type: 'collection',
    sync: false,
    config: {
      collection: null,
      mode: 2, // UPDATE
      condition: null,
    },
  },
  {
    key: 'collection-destroy',
    title: `{{t("Delete record trigger", { ns: "${NAMESPACE}" })}}`,
    description: `{{t("Triggered when a record is deleted from a collection", { ns: "${NAMESPACE}" })}}`,
    type: 'collection',
    sync: false,
    config: {
      collection: null,
      mode: 4, // DESTROY
      condition: null,
    },
  },
  {
    key: 'collection-create-with-echo',
    title: `{{t("Create trigger with echo node", { ns: "${NAMESPACE}" })}}`,
    description: `{{t("Create record trigger + echo node for testing and extending", { ns: "${NAMESPACE}" })}}`,
    type: 'collection',
    sync: false,
    config: {
      collection: null,
      mode: 1,
      condition: null,
    },
    nodes: [{ type: 'echo', config: {} }],
  },
  {
    key: 'schedule-daily',
    title: `{{t("Daily scheduled task", { ns: "${NAMESPACE}" })}}`,
    description: `{{t("Runs at a fixed time every day", { ns: "${NAMESPACE}" })}}`,
    type: 'schedule',
    sync: false,
    config: {
      mode: 0, // static
      cron: '0 9 * * *', // 9:00 daily
    },
  },
  {
    key: 'schedule-hourly',
    title: `{{t("Hourly scheduled task", { ns: "${NAMESPACE}" })}}`,
    description: `{{t("Runs every hour", { ns: "${NAMESPACE}" })}}`,
    type: 'schedule',
    sync: false,
    config: {
      mode: 0,
      cron: '0 * * * *',
    },
  },
  {
    key: 'schedule-every-15min',
    title: `{{t("Every 15 minutes", { ns: "${NAMESPACE}" })}}`,
    description: `{{t("Runs every 15 minutes", { ns: "${NAMESPACE}" })}}`,
    type: 'schedule',
    sync: false,
    config: {
      mode: 0,
      cron: '*/15 * * * *',
    },
  },
  {
    key: 'schedule-every-5min',
    title: `{{t("Every 5 minutes", { ns: "${NAMESPACE}" })}}`,
    description: `{{t("Runs every 5 minutes for frequent checks", { ns: "${NAMESPACE}" })}}`,
    type: 'schedule',
    sync: false,
    config: {
      mode: 0,
      cron: '*/5 * * * *',
    },
  },
  {
    key: 'schedule-weekly',
    title: `{{t("Weekly scheduled task", { ns: "${NAMESPACE}" })}}`,
    description: `{{t("Runs every Monday at 9:00", { ns: "${NAMESPACE}" })}}`,
    type: 'schedule',
    sync: false,
    config: {
      mode: 0,
      cron: '0 9 * * 1',
    },
  },
  {
    key: 'schedule-monthly',
    title: `{{t("Monthly scheduled task", { ns: "${NAMESPACE}" })}}`,
    description: `{{t("Runs on the 1st of every month at 9:00", { ns: "${NAMESPACE}" })}}`,
    type: 'schedule',
    sync: false,
    config: {
      mode: 0,
      cron: '0 9 1 * *',
    },
  },
  {
    key: 'schedule-daily-with-echo',
    title: `{{t("Daily task with echo node", { ns: "${NAMESPACE}" })}}`,
    description: `{{t("Daily schedule + echo node for extending with create/update/condition", { ns: "${NAMESPACE}" })}}`,
    type: 'schedule',
    sync: false,
    config: {
      mode: 0,
      cron: '0 9 * * *',
    },
    nodes: [{ type: 'echo', config: {} }],
  },
  {
    key: 'collection-create-condition-echo',
    title: `{{t("Create trigger + condition + echo", { ns: "${NAMESPACE}" })}}`,
    description: `{{t("Create trigger with condition branch and echo, for complex logic", { ns: "${NAMESPACE}" })}}`,
    type: 'collection',
    sync: false,
    config: {
      collection: null,
      mode: 1,
      condition: null,
    },
    nodes: [
      { type: 'condition', config: { engine: 'math.js', expression: '1 == 1' } },
      { type: 'echo', config: {} },
    ],
  },
  {
    key: 'schedule-condition-echo',
    title: `{{t("Daily task + condition + echo", { ns: "${NAMESPACE}" })}}`,
    description: `{{t("Schedule with condition branch for branching logic", { ns: "${NAMESPACE}" })}}`,
    type: 'schedule',
    sync: false,
    config: {
      mode: 0,
      cron: '0 9 * * *',
    },
    nodes: [
      { type: 'condition', config: { engine: 'math.js', expression: '1 == 1' } },
      { type: 'echo', config: {} },
    ],
  },
];
