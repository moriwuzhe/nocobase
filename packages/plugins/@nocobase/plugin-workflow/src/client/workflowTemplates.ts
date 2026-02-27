/**
 * Built-in workflow templates for quick creation.
 * AI Integration: When @nocobase/plugin-workflow-ai is available, add AI instruction nodes.
 */

import { NAMESPACE } from './locale';

export interface WorkflowTemplate {
  key: string;
  title: string;
  description: string;
  type: string;
  sync?: boolean;
  config: Record<string, any>;
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
];
