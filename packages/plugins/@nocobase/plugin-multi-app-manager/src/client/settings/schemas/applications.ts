/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { ISchema, useForm } from '@formily/react';
import { useField } from '@formily/react';
import { uid } from '@formily/shared';
import { tval } from '@nocobase/utils/client';
import { App, Tag, Tooltip, Typography } from 'antd';
import {
  builtInTemplates,
  installTemplate,
  SchemaComponentOptions,
  useActionContext,
  useAPIClient,
  useRecord,
  useRequest,
  useResourceActionContext,
  useResourceContext,
  useFilterFieldProps,
  useFilterFieldOptions,
} from '@nocobase/client';
import React from 'react';
import { i18nText } from '../../utils';
import { NAMESPACE } from '../../../locale';
import { useTranslation } from 'react-i18next';

const collection = {
  name: 'applications',
  targetKey: 'name',
  fields: [
    {
      type: 'uid',
      name: 'name',
      primaryKey: true,
      prefix: 'a',
      interface: 'input',
      uiSchema: {
        type: 'string',
        title: i18nText('App ID'),
        required: true,
        'x-component': 'Input',
        'x-validator': 'uid',
      },
    },
    {
      type: 'string',
      name: 'displayName',
      interface: 'input',
      uiSchema: {
        type: 'string',
        title: i18nText('App display name'),
        required: true,
        'x-component': 'Input',
      },
    },
    {
      type: 'string',
      name: 'pinned',
      interface: 'checkbox',
      uiSchema: {
        type: 'boolean',
        'x-content': i18nText('Pin to menu'),
        'x-component': 'Checkbox',
      },
    },
    {
      type: 'string',
      name: 'status',
      interface: 'radioGroup',
      defaultValue: 'pending',
      uiSchema: {
        type: 'string',
        title: i18nText('App status'),
        enum: [
          { label: 'Initializing', value: 'initializing' },
          { label: 'Initialized', value: 'initialized' },
          { label: 'Running', value: 'running' },
          { label: 'Commanding', value: 'commanding' },
          { label: 'Stopped', value: 'stopped' },
          { label: 'Error', value: 'error' },
          { label: 'Not found', value: 'not_found' },
        ],
        'x-component': 'Radio.Group',
      },
    },
  ],
};

const TRANSIENT_GATEWAY_STATUSES = new Set([502, 503, 504]);
const APP_READY_STATUSES = new Set(['initialized', 'running']);
const APP_AUTH_READY_STATUSES = new Set([401, 403]);
const TEMPLATE_INSTALL_MAX_ATTEMPTS = 2;
const TEMPLATE_INSTALL_RETRY_BASE_DELAY = 3000;
const BULK_TEMPLATE_RETRY_CONCURRENCY = 3;

interface TemplateInstallErrorDetail {
  step: string;
  message: string;
}

interface TemplateInstallHealthReport {
  templateKey: string;
  expectedCollections: number;
  actualCollections: number;
  missingCollections: string[];
  expectedPages: number;
  actualPages: number;
  missingPages: string[];
  expectedWorkflows: number;
  actualWorkflows: number;
  missingWorkflows: string[];
  checkedAt: string;
}

interface TemplateInstallResult {
  installed: boolean;
  error?: TemplateInstallErrorDetail;
  healthReport?: TemplateInstallHealthReport;
}

interface AppReadyProgressDetail {
  attempt: number;
  elapsedMs: number;
  appStatus?: string;
  probeStatus?: number;
}

interface AppReadyWaitResult {
  ready: boolean;
  attempts: number;
  elapsedMs: number;
  appStatus?: string;
  probeStatus?: number;
  reason: 'ready' | 'timeout' | 'app_error' | 'app_not_found';
}

type TemplatePrecheckRecommendation =
  | 'healthy'
  | 'no_template'
  | 'app_not_ready'
  | 'retry_template_init'
  | 'manual_init_template'
  | 'review_template_error';

interface TemplatePrecheckReport {
  appName: string;
  appDisplayName: string;
  templateKey: string;
  appStatus: string;
  ready: boolean;
  waitReason: string;
  waitAttempts: number;
  waitElapsedMs: number;
  waitAppStatus: string;
  waitProbeStatus: string;
  templateInstallState: string;
  templateInstallError: string;
  templateInstallHealthReport: string;
  templateInstallHealthUpdatedAt: string;
  healthRecheckError: string;
  recommendation: TemplatePrecheckRecommendation;
  checkedAt: string;
}

interface BulkRetryFailureDetail {
  appName: string;
  templateKey: string;
  step: string;
  message: string;
}

interface BulkHealthRecheckFailureDetail {
  appName: string;
  templateKey: string;
  message: string;
}

function stringifyProbeValue(value: unknown): string {
  if (value === undefined || value === null || value === '') {
    return '-';
  }
  return String(value);
}

function parseTemplateInstallHealthReport(raw: unknown): TemplateInstallHealthReport | null {
  const text = String(raw || '').trim();
  if (!text) {
    return null;
  }
  try {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }
    const toSafeNumber = (value: unknown) => {
      const num = Number(value);
      return Number.isFinite(num) ? num : 0;
    };
    const toSafeStringArray = (value: unknown) =>
      Array.isArray(value) ? value.map((item) => String(item || '').trim()).filter(Boolean) : [];
    return {
      templateKey: String((parsed as any)?.templateKey || '').trim(),
      expectedCollections: toSafeNumber((parsed as any)?.expectedCollections),
      actualCollections: toSafeNumber((parsed as any)?.actualCollections),
      missingCollections: toSafeStringArray((parsed as any)?.missingCollections),
      expectedPages: toSafeNumber((parsed as any)?.expectedPages),
      actualPages: toSafeNumber((parsed as any)?.actualPages),
      missingPages: toSafeStringArray((parsed as any)?.missingPages),
      expectedWorkflows: toSafeNumber((parsed as any)?.expectedWorkflows),
      actualWorkflows: toSafeNumber((parsed as any)?.actualWorkflows),
      missingWorkflows: toSafeStringArray((parsed as any)?.missingWorkflows),
      checkedAt: String((parsed as any)?.checkedAt || '').trim(),
    };
  } catch {
    return null;
  }
}

function stringifyTemplateInstallHealthReport(report?: TemplateInstallHealthReport): string {
  if (!report) {
    return '';
  }
  try {
    return JSON.stringify(report);
  } catch {
    return '';
  }
}

function buildTemplateInstallHealthSummary(t: any, report: TemplateInstallHealthReport): string {
  return t('Template health: collections {{collections}}, pages {{pages}}, workflows {{workflows}}', {
    collections: `${report.actualCollections}/${report.expectedCollections}`,
    pages: `${report.actualPages}/${report.expectedPages}`,
    workflows: `${report.actualWorkflows}/${report.expectedWorkflows}`,
  });
}

function collectTemplatePageTitles(menu: any[]): string[] {
  const titles = new Set<string>();
  const walk = (items: any[]) => {
    for (const item of items || []) {
      const title = String(item?.title || '').trim();
      if (item?.type === 'page' && title) {
        titles.add(title);
      }
      if (Array.isArray(item?.children) && item.children.length > 0) {
        walk(item.children);
      }
    }
  };
  walk(menu || []);
  return Array.from(titles);
}

function collectDesktopRoutePageTitles(routes: any[]): string[] {
  const titles = new Set<string>();
  const walk = (items: any[]) => {
    for (const item of items || []) {
      const title = String(item?.title || '').trim();
      if (item?.type === 'page' && title) {
        titles.add(title);
      }
      if (Array.isArray(item?.children) && item.children.length > 0) {
        walk(item.children);
      }
    }
  };
  walk(routes || []);
  return Array.from(titles);
}

function TemplateKeyField() {
  const record = useRecord() as any;
  const { t } = useTranslation(NAMESPACE);
  const pendingTemplateKey = String(record?.options?.pendingTemplateKey || '').trim();
  const installedTemplateKey = String(record?.options?.installedTemplateKey || '').trim();

  if (pendingTemplateKey) {
    return React.createElement(Tag, { color: 'warning' }, `${t('Pending template')}: ${pendingTemplateKey}`);
  }

  if (installedTemplateKey) {
    return React.createElement(Tag, { color: 'default' }, `${t('Installed template')}: ${installedTemplateKey}`);
  }

  return React.createElement(Typography.Text, { type: 'secondary' }, '-');
}

function TemplateInstallStateField() {
  const record = useRecord() as any;
  const { t } = useTranslation(NAMESPACE);
  const state = record?.options?.templateInstallState;
  const hasPendingTemplate = Boolean(record?.options?.pendingTemplateKey);
  const hasInstalledTemplate = Boolean(record?.options?.installedTemplateKey);

  if (!state && !hasPendingTemplate && !hasInstalledTemplate) {
    return React.createElement(Typography.Text, { type: 'secondary' }, '-');
  }

  if (state === 'installing') {
    return React.createElement(Tag, { color: 'processing' }, t('Template installing'));
  }

  if (state === 'installed') {
    return React.createElement(Tag, { color: 'success' }, t('Template installed'));
  }

  if (state === 'failed') {
    return React.createElement(Tag, { color: 'error' }, t('Template failed'));
  }

  if (hasPendingTemplate) {
    return React.createElement(Tag, { color: 'warning' }, t('Template pending'));
  }

  if (hasInstalledTemplate) {
    return React.createElement(Tag, { color: 'default' }, t('Template installed'));
  }

  return React.createElement(Typography.Text, { type: 'secondary' }, t('Template not initialized'));
}

const TEMPLATE_INSTALL_STEP_KEYS: Record<string, string> = {
  waitForAppReady: 'Template install step: Waiting for app',
  authSignIn: 'Template install step: Authenticating',
  checkVersion: 'Template install step: Checking version',
  listCollectionFields: 'Template install step: Listing fields',
  createCollection: 'Template install step: Creating data table',
  repairCollection: 'Template install step: Repairing data table',
  repairCollectionField: 'Template install step: Repairing field',
  createRelation: 'Template install step: Creating relation',
  createMenuGroup: 'Template install step: Creating menu',
  createPageRoute: 'Template install step: Creating page',
  createWorkflowMenuLink: 'Template install step: Creating workflow link',
  validatePageRoute: 'Template install step: Validating page',
  refreshApp: 'Template install step: Refreshing app',
  insertSample: 'Template install step: Inserting sample data',
  createWorkflow: 'Template install step: Creating workflow',
  createWorkflowNode: 'Template install step: Creating workflow node',
  validateWorkflows: 'Template install step: Validating workflows',
  finalRefreshApp: 'Template install step: Final refresh',
};

function formatTemplateInstallErrorForDisplay(raw: string, t: (key: string) => string): string {
  const colonIdx = raw.indexOf(': ');
  if (colonIdx <= 0) return raw;
  const step = raw.slice(0, colonIdx).trim();
  const message = raw.slice(colonIdx + 2).trim();
  const prefix = step.split(':')[0];
  const stepKey = TEMPLATE_INSTALL_STEP_KEYS[prefix];
  const stepLabel = stepKey ? t(stepKey) : step;
  return `${stepLabel}: ${message}`;
}

function TemplateInstallErrorField() {
  const record = useRecord() as any;
  const { t } = useTranslation(NAMESPACE);
  const templateInstallError = String(record?.options?.templateInstallError || '').trim();
  if (!templateInstallError) {
    return React.createElement(Typography.Text, { type: 'secondary' }, '-');
  }

  const displayText = formatTemplateInstallErrorForDisplay(templateInstallError, t);
  const shortError = displayText.length > 96 ? `${displayText.slice(0, 96).trimEnd()}...` : displayText;

  return React.createElement(
    Tooltip,
    { title: displayText },
    React.createElement(
      Typography.Text,
      {
        type: 'danger',
        copyable: {
          text: templateInstallError,
          tooltips: [t('Copy error'), t('Copied')],
        },
      },
      shortError,
    ),
  );
}

function TemplateInstallUpdatedAtField() {
  const record = useRecord() as any;
  const raw = record?.options?.templateInstallUpdatedAt;
  if (!raw) {
    return React.createElement(Typography.Text, { type: 'secondary' }, '-');
  }

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return React.createElement(Typography.Text, { type: 'secondary' }, String(raw));
  }

  return React.createElement(Typography.Text, null, date.toLocaleString());
}

function TemplateStartupProbeField() {
  const record = useRecord() as any;
  const { t } = useTranslation(NAMESPACE);
  const attempts = Number(record?.options?.templateStartupAttempts || 0);
  const elapsedMs = Number(record?.options?.templateStartupElapsedMs || 0);
  const appStatus = stringifyProbeValue(record?.options?.templateStartupLastAppStatus);
  const probeStatus = stringifyProbeValue(record?.options?.templateStartupLastProbeStatus);

  if (!attempts && !elapsedMs && appStatus === '-' && probeStatus === '-') {
    return React.createElement(Typography.Text, { type: 'secondary' }, '-');
  }

  const seconds = Math.max(0, Math.round(elapsedMs / 1000));
  const text = t('Startup attempts {{attempts}}, elapsed {{seconds}}s, app {{appStatus}}, probe {{probeStatus}}', {
    attempts,
    seconds,
    appStatus,
    probeStatus,
  });

  return React.createElement(
    Tooltip,
    { title: text },
    React.createElement(Typography.Text, { copyable: { text } }, text),
  );
}

function TemplateInstallHealthField() {
  const record = useRecord() as any;
  const { t } = useTranslation(NAMESPACE);
  const report = parseTemplateInstallHealthReport(record?.options?.templateInstallHealthReport);
  if (!report) {
    return React.createElement(Typography.Text, { type: 'secondary' }, '-');
  }

  const summary = buildTemplateInstallHealthSummary(t, report);
  const hasMissing =
    report.missingCollections.length > 0 || report.missingPages.length > 0 || report.missingWorkflows.length > 0;
  const detailText = JSON.stringify(report, null, 2);
  const copyableText = `${summary}\n${detailText}`;
  return React.createElement(
    Tooltip,
    { title: summary },
    React.createElement(
      Typography.Text,
      {
        type: hasMissing ? 'danger' : undefined,
        copyable: {
          text: copyableText,
          tooltips: [t('Copy template health report'), t('Copied')],
        },
      },
      summary,
    ),
  );
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForAppReady(
  api: any,
  appName: string,
  options?: {
    timeoutMs?: number;
    probeInterval?: number;
    onProgress?: (detail: AppReadyProgressDetail) => void;
  },
): Promise<AppReadyWaitResult> {
  const timeoutMs = options?.timeoutMs ?? 6 * 60 * 1000;
  const probeInterval = Math.max(1, options?.probeInterval ?? 4);
  const startAt = Date.now();
  let attempt = 0;
  let latestAppStatus: string | undefined;
  let latestProbeStatus: number | undefined;

  const emitProgress = () => {
    try {
      options?.onProgress?.({
        attempt,
        elapsedMs: Date.now() - startAt,
        appStatus: latestAppStatus,
        probeStatus: latestProbeStatus,
      });
    } catch {
      // Ignore observer callback failures.
    }
  };

  while (Date.now() - startAt < timeoutMs) {
    attempt += 1;
    let status: string | undefined;

    try {
      const appRes = await api.request({
        url: 'applications:get',
        method: 'get',
        params: {
          filterByTk: appName,
        },
      });
      status = appRes?.data?.data?.status;
      latestAppStatus = status;
      if (APP_READY_STATUSES.has(status)) {
        emitProgress();
        return {
          ready: true,
          attempts: attempt,
          elapsedMs: Date.now() - startAt,
          appStatus: latestAppStatus,
          probeStatus: latestProbeStatus,
          reason: 'ready',
        };
      }
      if (status === 'error' || status === 'not_found') {
        emitProgress();
        return {
          ready: false,
          attempts: attempt,
          elapsedMs: Date.now() - startAt,
          appStatus: latestAppStatus,
          probeStatus: latestProbeStatus,
          reason: status === 'error' ? 'app_error' : 'app_not_found',
        };
      }
    } catch (e) {
      const appStatus = (e as any)?.response?.status;
      latestAppStatus = appStatus ? `http_${appStatus}` : latestAppStatus;
      if (appStatus && !TRANSIENT_GATEWAY_STATUSES.has(appStatus)) {
        // For non-gateway errors, continue trying until timeout.
      }
    }

    // Probe sub-app info at low frequency to avoid flooding 503 logs while app is booting.
    const shouldProbeSubApp = attempt === 1 || attempt % probeInterval === 0;
    if (shouldProbeSubApp) {
      try {
        await api.silent().request({
          url: 'app:getInfo',
          method: 'get',
          headers: {
            'X-App': appName,
          },
          skipNotify: true,
        });
        latestProbeStatus = 200;
        emitProgress();
        return {
          ready: true,
          attempts: attempt,
          elapsedMs: Date.now() - startAt,
          appStatus: latestAppStatus,
          probeStatus: latestProbeStatus,
          reason: 'ready',
        };
      } catch (e) {
        const infoStatus = (e as any)?.response?.status;
        if (typeof infoStatus === 'number') {
          latestProbeStatus = infoStatus;
        }
        // Cross-app token may be different. 401/403 indicates sub-app is up.
        if (APP_AUTH_READY_STATUSES.has(infoStatus)) {
          emitProgress();
          return {
            ready: true,
            attempts: attempt,
            elapsedMs: Date.now() - startAt,
            appStatus: latestAppStatus,
            probeStatus: latestProbeStatus,
            reason: 'ready',
          };
        }
        if (status && APP_READY_STATUSES.has(status)) {
          emitProgress();
          return {
            ready: true,
            attempts: attempt,
            elapsedMs: Date.now() - startAt,
            appStatus: latestAppStatus,
            probeStatus: latestProbeStatus,
            reason: 'ready',
          };
        }
        if (infoStatus && !TRANSIENT_GATEWAY_STATUSES.has(infoStatus) && infoStatus !== 404) {
          // Keep retrying until timeout, some intermediate statuses can be temporary.
        }
      }
    }

    emitProgress();
    const delay = Math.min(8000, 1800 + attempt * 500);
    await sleep(delay);
  }

  emitProgress();
  return {
    ready: false,
    attempts: attempt,
    elapsedMs: Date.now() - startAt,
    appStatus: latestAppStatus,
    probeStatus: latestProbeStatus,
    reason: 'timeout',
  };
}

async function updateApplicationTemplateOptions(
  api: any,
  appName: string,
  patch: {
    pendingTemplateKey?: string;
    installedTemplateKey?: string;
    templateInstallState?: 'installing' | 'installed' | 'failed' | '';
    templateInstallError?: string;
    templateInstallUpdatedAt?: string;
    templateInstallHealthReport?: string;
    templateInstallHealthUpdatedAt?: string;
    templateStartupAttempts?: number;
    templateStartupElapsedMs?: number;
    templateStartupLastAppStatus?: string;
    templateStartupLastProbeStatus?: string;
  },
) {
  try {
    const appRes = await api.request({
      url: 'applications:get',
      method: 'get',
      params: {
        filterByTk: appName,
      },
    });
    const currentOptions = appRes?.data?.data?.options || {};
    const nextOptions = {
      ...currentOptions,
      ...patch,
    };
    await api.request({
      url: 'applications:update',
      method: 'post',
      params: {
        filterByTk: appName,
      },
      data: {
        values: {
          options: nextOptions,
        },
      },
    });
  } catch (error) {
    // Do not block main flow when status sync fails.
    void error;
  }
}

async function installTemplateWithRetry(
  api: any,
  appName: string,
  templateKey: string,
  ui: { modal: any; message: any },
  maxAttempts = TEMPLATE_INSTALL_MAX_ATTEMPTS,
  installOptions?: {
    messageKey?: string;
    skipAppReadyCheck?: boolean;
    t?: (key: string, options?: Record<string, any>) => string;
  },
): Promise<TemplateInstallResult> {
  let lastError: TemplateInstallErrorDetail | undefined;
  let latestHealthReport: TemplateInstallHealthReport | undefined;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const installed = await installTemplate(api, appName, templateKey, ui, {
      skipConfirm: true,
      messageKey: installOptions?.messageKey,
      skipAppReadyCheck: installOptions?.skipAppReadyCheck,
      t: installOptions?.t,
      onError: (detail) => {
        lastError = detail;
      },
      onHealthReport: (report) => {
        latestHealthReport = report;
      },
    });
    if (installed) {
      return { installed: true, healthReport: latestHealthReport };
    }
    if (attempt < maxAttempts) {
      await sleep(TEMPLATE_INSTALL_RETRY_BASE_DELAY * attempt);
    }
  }
  return {
    installed: false,
    error: lastError,
  };
}

function stringifyTemplateInstallError(error?: TemplateInstallErrorDetail): string {
  if (!error) {
    return 'install_failed';
  }
  return `${error.step}: ${error.message}`;
}

function normalizeTemplateInstallError(error?: TemplateInstallErrorDetail): TemplateInstallErrorDetail {
  if (!error) {
    return { step: 'unknown', message: 'install_failed' };
  }
  return {
    step: error.step || 'unknown',
    message: error.message || 'install_failed',
  };
}

function isTemplateRetryable(appRecord: any): boolean {
  const templateKey = appRecord?.options?.pendingTemplateKey || appRecord?.options?.installedTemplateKey;
  if (!templateKey) {
    return false;
  }

  return Boolean(
    appRecord?.options?.pendingTemplateKey ||
      appRecord?.options?.templateInstallState === 'failed' ||
      appRecord?.options?.templateInstallError,
  );
}

function hasTemplateBinding(appRecord: any): boolean {
  const templateKey = String(
    appRecord?.options?.pendingTemplateKey || appRecord?.options?.installedTemplateKey || '',
  ).trim();
  return Boolean(templateKey);
}

function isTemplateHealthUnhealthy(appRecord: any): boolean {
  if (!hasTemplateBinding(appRecord)) {
    return false;
  }
  const installState = String(appRecord?.options?.templateInstallState || '').trim();
  const installError = String(appRecord?.options?.templateInstallError || '').trim();
  if (installState === 'failed' || !!installError || !!appRecord?.options?.pendingTemplateKey) {
    return true;
  }
  const report = parseTemplateInstallHealthReport(appRecord?.options?.templateInstallHealthReport);
  if (!report) {
    return false;
  }
  return Boolean(
    report.missingCollections.length > 0 || report.missingPages.length > 0 || report.missingWorkflows.length > 0,
  );
}

function normalizeApplicationRows(payload: any): any[] {
  if (Array.isArray(payload?.data?.data?.rows)) {
    return payload.data.data.rows;
  }
  if (Array.isArray(payload?.data?.data)) {
    return payload.data.data;
  }
  if (Array.isArray(payload?.data?.rows)) {
    return payload.data.rows;
  }
  return [];
}

async function listDesktopRouteRows(api: any, appName: string): Promise<any[]> {
  const headers = { 'X-App': appName };
  const listConfigs = [
    { url: 'desktopRoutes:list', params: { paginate: false } },
    { url: 'desktopRoutes:list', params: { filter: { type: 'page' }, paginate: false } },
    { url: 'routes:list', params: { paginate: false } },
    { url: 'routes:list', params: { filter: { type: 'page' }, paginate: false } },
  ];
  let lastError: any;
  for (const config of listConfigs) {
    try {
      const routeRes = await api.request({
        url: config.url,
        method: 'get',
        headers,
        params: config.params,
      });
      return normalizeApplicationRows(routeRes);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('list_routes_failed');
}

async function runTemplateHealthRecheck(
  api: any,
  appName: string,
  templateKey: string,
): Promise<TemplateInstallHealthReport> {
  const template = builtInTemplates.find((item: any) => String(item?.key || '').trim() === templateKey);
  if (!template) {
    throw new Error(`template_not_found: ${templateKey}`);
  }
  const headers = { 'X-App': appName };

  const expectedCollectionNames = Array.from(
    new Set(
      (Array.isArray(template?.collections) ? template.collections : [])
        .map((collection: any) => String(collection?.name || '').trim())
        .filter(Boolean),
    ),
  );
  const expectedPageTitles = collectTemplatePageTitles(Array.isArray(template?.menu) ? template.menu : []);
  const expectedWorkflowTitles = Array.from(
    new Set(
      (Array.isArray(template?.workflows) ? template.workflows : [])
        .map((workflow: any) => String(workflow?.title || '').trim())
        .filter(Boolean),
    ),
  );

  const collectionRes = await api.request({
    url: 'collections:list',
    method: 'get',
    headers,
    params: {
      paginate: false,
    },
  });
  const collectionRows = normalizeApplicationRows(collectionRes);
  const existingCollectionNames = new Set(
    collectionRows.map((row: any) => String(row?.name || '').trim()).filter(Boolean),
  );
  const missingCollections = expectedCollectionNames.filter((name) => !existingCollectionNames.has(name));

  const desktopRouteRows = await listDesktopRouteRows(api, appName);
  const existingPageTitles = new Set(collectDesktopRoutePageTitles(desktopRouteRows));
  const missingPages = expectedPageTitles.filter((title) => !existingPageTitles.has(title));

  const missingWorkflows: string[] = [];
  if (expectedWorkflowTitles.length > 0) {
    const workflowRes = await api.request({
      url: 'workflows:list',
      method: 'get',
      headers,
      params: {
        paginate: false,
      },
    });
    const workflowRows = normalizeApplicationRows(workflowRes);
    const existingWorkflowTitles = new Set(
      workflowRows.map((row: any) => String(row?.title || '').trim()).filter(Boolean),
    );
    for (const title of expectedWorkflowTitles) {
      if (!existingWorkflowTitles.has(title)) {
        missingWorkflows.push(title);
      }
    }
  }

  return {
    templateKey,
    expectedCollections: expectedCollectionNames.length,
    actualCollections: expectedCollectionNames.length - missingCollections.length,
    missingCollections,
    expectedPages: expectedPageTitles.length,
    actualPages: expectedPageTitles.length - missingPages.length,
    missingPages,
    expectedWorkflows: expectedWorkflowTitles.length,
    actualWorkflows: expectedWorkflowTitles.length - missingWorkflows.length,
    missingWorkflows,
    checkedAt: new Date().toISOString(),
  };
}

function resolveTemplatePrecheckRecommendation(t: any, recommendation: TemplatePrecheckRecommendation): string {
  if (recommendation === 'healthy') {
    return t('Healthy');
  }
  if (recommendation === 'no_template') {
    return t('No template bound');
  }
  if (recommendation === 'app_not_ready') {
    return t('App not ready');
  }
  if (recommendation === 'retry_template_init') {
    return t('Retry template initialization');
  }
  if (recommendation === 'manual_init_template') {
    return t('Manual template initialization required');
  }
  return t('Review template error logs');
}

function buildTemplatePrecheckReportText(t: any, report: TemplatePrecheckReport): string {
  const payload = {
    ...report,
    recommendationText: resolveTemplatePrecheckRecommendation(t, report.recommendation),
  };
  return JSON.stringify(payload, null, 2);
}

async function runTemplatePrecheck(
  api: any,
  appName: string,
  precheckOptions?: {
    recheckHealth?: boolean;
    persistHealthReport?: boolean;
  },
): Promise<TemplatePrecheckReport> {
  const appRes = await api.request({
    url: 'applications:get',
    method: 'get',
    params: {
      filterByTk: appName,
    },
  });
  const appRecord = appRes?.data?.data || {};
  const appOptions = appRecord?.options || {};
  const templateKey = String(appOptions?.pendingTemplateKey || appOptions?.installedTemplateKey || '').trim();
  const appStatus = String(appRecord?.status || '');
  const templateInstallState = String(appOptions?.templateInstallState || '').trim();
  const templateInstallError = String(appOptions?.templateInstallError || '').trim();
  let templateInstallHealthReport = String(appOptions?.templateInstallHealthReport || '').trim();
  let templateInstallHealthUpdatedAt = String(appOptions?.templateInstallHealthUpdatedAt || '').trim();
  let healthRecheckError = '';

  let waitResult: AppReadyWaitResult = {
    ready: false,
    attempts: 0,
    elapsedMs: 0,
    appStatus: '',
    probeStatus: undefined,
    reason: 'timeout',
  };
  if (templateKey) {
    waitResult = await waitForAppReady(api, appName, { timeoutMs: 45 * 1000, probeInterval: 2 });
  }

  if (templateKey && waitResult.ready && precheckOptions?.recheckHealth !== false) {
    try {
      const report = await runTemplateHealthRecheck(api, appName, templateKey);
      templateInstallHealthReport = stringifyTemplateInstallHealthReport(report);
      templateInstallHealthUpdatedAt = String(report?.checkedAt || '').trim() || new Date().toISOString();
      if (precheckOptions?.persistHealthReport !== false) {
        await updateApplicationTemplateOptions(api, appName, {
          templateInstallHealthReport,
          templateInstallHealthUpdatedAt,
        });
      }
    } catch (error: any) {
      healthRecheckError = String(error?.message || 'health_recheck_failed');
    }
  }

  const parsedHealthReport = parseTemplateInstallHealthReport(templateInstallHealthReport);
  const hasMissingHealthItems = Boolean(
    parsedHealthReport &&
      (parsedHealthReport.missingCollections.length > 0 ||
        parsedHealthReport.missingPages.length > 0 ||
        parsedHealthReport.missingWorkflows.length > 0),
  );

  let recommendation: TemplatePrecheckRecommendation = 'healthy';
  if (!templateKey) {
    recommendation = 'no_template';
  } else if (!waitResult.ready) {
    recommendation = 'app_not_ready';
  } else if (templateInstallState === 'failed') {
    recommendation = 'retry_template_init';
  } else if (appOptions?.pendingTemplateKey) {
    recommendation = 'manual_init_template';
  } else if (hasMissingHealthItems) {
    recommendation = 'retry_template_init';
  } else if (templateInstallError || healthRecheckError) {
    recommendation = 'review_template_error';
  }

  return {
    appName: String(appRecord?.name || appName),
    appDisplayName: String(appRecord?.displayName || ''),
    templateKey,
    appStatus,
    ready: waitResult.ready,
    waitReason: waitResult.reason,
    waitAttempts: waitResult.attempts,
    waitElapsedMs: waitResult.elapsedMs,
    waitAppStatus: stringifyProbeValue(waitResult.appStatus),
    waitProbeStatus: stringifyProbeValue(waitResult.probeStatus),
    templateInstallState,
    templateInstallError,
    templateInstallHealthReport,
    templateInstallHealthUpdatedAt,
    healthRecheckError,
    recommendation,
    checkedAt: new Date().toISOString(),
  };
}

export const useDestroy = () => {
  const { refresh } = useResourceActionContext();
  const { resource, targetKey } = useResourceContext();
  const { [targetKey]: filterByTk } = useRecord();
  return {
    async run() {
      await resource.destroy({ filterByTk });
      refresh();
    },
  };
};

export const useDestroyAll = () => {
  const { state, setState, refresh } = useResourceActionContext();
  const { resource } = useResourceContext();
  return {
    async run() {
      await resource.destroy({
        filterByTk: state?.selectedRowKeys || [],
      });
      setState?.({ selectedRowKeys: [] });
      refresh();
    },
  };
};

export const useRetrySelectedTemplateInitsAction = () => {
  const { state, setState, refresh } = useResourceActionContext();
  const api = useAPIClient();
  const { message, modal } = App.useApp();
  const { t } = useTranslation(NAMESPACE);

  return {
    async run() {
      const selectedRowKeys: string[] = ((state?.selectedRowKeys || []) as Array<string | number>)
        .map((key) => String(key))
        .filter(Boolean);
      const appNames: string[] = Array.from(new Set(selectedRowKeys));
      if (!appNames.length) {
        message.warning(t('Please select applications first'));
        return;
      }

      let successCount = 0;
      let failedCount = 0;
      let skippedCount = 0;
      let ignoredCount = 0;
      let completedCount = 0;
      const failedDetails: BulkRetryFailureDetail[] = [];

      const renderBulkProgress = () => {
        message.loading({
          content: t(
            'Bulk retry progress: {{done}}/{{total}} (success {{success}}, failed {{failed}}, skipped {{skipped}}, ignored {{ignored}})',
            {
              done: completedCount,
              total: appNames.length,
              success: successCount,
              failed: failedCount,
              skipped: skippedCount,
              ignored: ignoredCount,
            },
          ),
          key: 'tpl-bulk-retry',
          duration: 0,
        });
      };

      const retrySingleApp = async (
        appName: string,
      ): Promise<{ status: 'success' | 'failed' | 'skipped' | 'ignored'; failureDetail?: BulkRetryFailureDetail }> => {
        try {
          const appRes = await api.request({
            url: 'applications:get',
            method: 'get',
            params: {
              filterByTk: appName,
            },
          });
          const appRecord = appRes?.data?.data;
          const templateKey = appRecord?.options?.pendingTemplateKey || appRecord?.options?.installedTemplateKey;

          if (!templateKey) {
            return { status: 'skipped' };
          }

          if (!isTemplateRetryable(appRecord)) {
            return { status: 'ignored' };
          }

          await updateApplicationTemplateOptions(api, appName, {
            pendingTemplateKey: templateKey,
            templateInstallState: 'installing',
            templateInstallError: '',
            templateInstallUpdatedAt: new Date().toISOString(),
            templateInstallHealthReport: '',
            templateInstallHealthUpdatedAt: '',
          });

          const result = await installTemplateWithRetry(
            api,
            appName,
            templateKey,
            { modal, message },
            TEMPLATE_INSTALL_MAX_ATTEMPTS,
            { messageKey: `tpl-${appName}`, t },
          );
          if (result.installed) {
            await updateApplicationTemplateOptions(api, appName, {
              pendingTemplateKey: '',
              installedTemplateKey: templateKey,
              templateInstallState: 'installed',
              templateInstallError: '',
              templateInstallUpdatedAt: new Date().toISOString(),
              templateInstallHealthReport: stringifyTemplateInstallHealthReport(result.healthReport),
              templateInstallHealthUpdatedAt: new Date().toISOString(),
            });
            return { status: 'success' };
          }

          const detail = normalizeTemplateInstallError(result.error);
          await updateApplicationTemplateOptions(api, appName, {
            pendingTemplateKey: templateKey,
            templateInstallState: 'failed',
            templateInstallError: stringifyTemplateInstallError(result.error),
            templateInstallUpdatedAt: new Date().toISOString(),
            templateInstallHealthReport: '',
            templateInstallHealthUpdatedAt: '',
          });
          return {
            status: 'failed',
            failureDetail: {
              appName,
              templateKey,
              step: detail.step,
              message: detail.message,
            },
          };
        } catch (error: any) {
          const errorMessage = String(error?.message || 'install_failed');
          await updateApplicationTemplateOptions(api, appName, {
            templateInstallState: 'failed',
            templateInstallError: errorMessage,
            templateInstallUpdatedAt: new Date().toISOString(),
            templateInstallHealthReport: '',
            templateInstallHealthUpdatedAt: '',
          });
          return {
            status: 'failed',
            failureDetail: {
              appName,
              templateKey: '',
              step: 'unknown',
              message: errorMessage,
            },
          };
        }
      };

      renderBulkProgress();

      try {
        let nextIndex = 0;
        const workerCount = Math.min(BULK_TEMPLATE_RETRY_CONCURRENCY, appNames.length);
        const getNextAppName = () => {
          if (nextIndex >= appNames.length) {
            return undefined;
          }
          const appName = appNames[nextIndex];
          nextIndex += 1;
          return appName;
        };

        const workers = Array.from({ length: workerCount }, () =>
          (async () => {
            let appName = getNextAppName();
            while (appName) {
              const result = await retrySingleApp(appName);
              if (result.status === 'success') {
                successCount += 1;
              } else if (result.status === 'failed') {
                failedCount += 1;
                if (result.failureDetail) {
                  failedDetails.push(result.failureDetail);
                }
              } else if (result.status === 'skipped') {
                skippedCount += 1;
              } else {
                ignoredCount += 1;
              }

              completedCount += 1;
              renderBulkProgress();
              appName = getNextAppName();
            }
          })(),
        );

        await Promise.all(workers);
      } finally {
        message.destroy('tpl-bulk-retry');
      }

      message.info(
        t(
          'Bulk template retry finished: {{success}} succeeded, {{failed}} failed, {{skipped}} skipped, {{ignored}} ignored.',
          {
            success: successCount,
            failed: failedCount,
            skipped: skippedCount,
            ignored: ignoredCount,
          },
        ),
      );

      if (failedDetails.length > 0) {
        const header = [t('App'), t('Template'), t('Step'), t('Message')].join('\t');
        const rows = failedDetails.map((detail) =>
          [
            detail.appName,
            detail.templateKey || '-',
            detail.step || 'unknown',
            detail.message || 'install_failed',
          ].join('\t'),
        );
        const failedReport = [header, ...rows].join('\n');
        modal.info({
          width: 920,
          title: t('Bulk retry result details'),
          content: React.createElement(
            'div',
            { style: { maxHeight: 420, overflow: 'auto' } },
            React.createElement(
              Typography.Paragraph,
              null,
              t('Failed apps: {{count}}', { count: failedDetails.length }),
            ),
            React.createElement(
              Typography.Paragraph,
              {
                copyable: {
                  text: failedReport,
                  tooltips: [t('Copy failed list'), t('Copied')],
                },
              },
              t('Copy failed list'),
            ),
            React.createElement(
              'pre',
              {
                style: {
                  margin: 0,
                  padding: 12,
                  borderRadius: 6,
                  background: '#f7f7f7',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                },
              },
              failedReport,
            ),
          ),
        });
      }

      setState?.({ selectedRowKeys: [] });
      refresh();
    },
  };
};

export const useSelectRetryableTemplateAppsAction = () => {
  const { data, setState } = useResourceActionContext();
  const { message } = App.useApp();
  const { t } = useTranslation(NAMESPACE);

  return {
    async run() {
      const rows = normalizeApplicationRows(data);
      const retryableKeys = rows
        .filter((row) => isTemplateRetryable(row))
        .map((row) => row?.name)
        .filter(Boolean);

      if (!retryableKeys.length) {
        message.info(t('No retryable applications in current page.'));
        return;
      }

      setState?.({ selectedRowKeys: retryableKeys });
      message.success(t('Selected {{count}} retryable applications.', { count: retryableKeys.length }));
    },
  };
};

export const useSelectTemplateBoundAppsAction = () => {
  const { data, setState } = useResourceActionContext();
  const { message } = App.useApp();
  const { t } = useTranslation(NAMESPACE);

  return {
    async run() {
      const rows = normalizeApplicationRows(data);
      const templateBoundKeys = rows
        .filter((row) => hasTemplateBinding(row))
        .map((row) => row?.name)
        .filter(Boolean);

      if (!templateBoundKeys.length) {
        message.info(t('No template-bound applications in current page.'));
        return;
      }

      setState?.({ selectedRowKeys: templateBoundKeys });
      message.success(t('Selected {{count}} template-bound applications.', { count: templateBoundKeys.length }));
    },
  };
};

export const useSelectUnhealthyTemplateAppsAction = () => {
  const { data, setState } = useResourceActionContext();
  const { message } = App.useApp();
  const { t } = useTranslation(NAMESPACE);

  return {
    async run() {
      const rows = normalizeApplicationRows(data);
      const unhealthyKeys = rows
        .filter((row) => isTemplateHealthUnhealthy(row))
        .map((row) => row?.name)
        .filter(Boolean);

      if (!unhealthyKeys.length) {
        message.info(t('No unhealthy template applications in current page.'));
        return;
      }

      setState?.({ selectedRowKeys: unhealthyKeys });
      message.success(t('Selected {{count}} unhealthy template applications.', { count: unhealthyKeys.length }));
    },
  };
};

export const usePrecheckSelectedTemplateAppsAction = () => {
  const { state } = useResourceActionContext();
  const api = useAPIClient();
  const { message, modal } = App.useApp();
  const { t } = useTranslation(NAMESPACE);

  return {
    async run() {
      const selectedRowKeys: string[] = ((state?.selectedRowKeys || []) as Array<string | number>)
        .map((key) => String(key))
        .filter(Boolean);
      const appNames: string[] = Array.from(new Set(selectedRowKeys));
      if (!appNames.length) {
        message.warning(t('No app selected for precheck.'));
        return;
      }

      let healthyCount = 0;
      let warningCount = 0;
      let failedCount = 0;
      let completedCount = 0;
      const reports: TemplatePrecheckReport[] = [];

      const renderProgress = () => {
        message.loading({
          content: t(
            'Bulk precheck progress: {{done}}/{{total}} (healthy {{healthy}}, warning {{warning}}, failed {{failed}})',
            {
              done: completedCount,
              total: appNames.length,
              healthy: healthyCount,
              warning: warningCount,
              failed: failedCount,
            },
          ),
          key: 'tpl-precheck-bulk',
          duration: 0,
        });
      };

      const classify = (report: TemplatePrecheckReport) => {
        if (report.recommendation === 'healthy') {
          healthyCount += 1;
          return;
        }
        if (report.recommendation === 'app_not_ready') {
          failedCount += 1;
          return;
        }
        warningCount += 1;
      };

      renderProgress();
      try {
        let nextIndex = 0;
        const workerCount = Math.min(BULK_TEMPLATE_RETRY_CONCURRENCY, appNames.length);
        const getNextAppName = () => {
          if (nextIndex >= appNames.length) {
            return undefined;
          }
          const appName = appNames[nextIndex];
          nextIndex += 1;
          return appName;
        };
        const workers = Array.from({ length: workerCount }, () =>
          (async () => {
            let currentAppName = getNextAppName();
            while (currentAppName) {
              try {
                const report = await runTemplatePrecheck(api, currentAppName, {
                  recheckHealth: true,
                  persistHealthReport: true,
                });
                reports.push(report);
                classify(report);
              } catch (error: any) {
                const fallbackReport: TemplatePrecheckReport = {
                  appName: currentAppName,
                  appDisplayName: '',
                  templateKey: '',
                  appStatus: '',
                  ready: false,
                  waitReason: 'precheck_failed',
                  waitAttempts: 0,
                  waitElapsedMs: 0,
                  waitAppStatus: '-',
                  waitProbeStatus: '-',
                  templateInstallState: '',
                  templateInstallError: String(error?.message || 'precheck_failed'),
                  templateInstallHealthReport: '',
                  templateInstallHealthUpdatedAt: '',
                  healthRecheckError: '',
                  recommendation: 'app_not_ready',
                  checkedAt: new Date().toISOString(),
                };
                reports.push(fallbackReport);
                failedCount += 1;
              }

              completedCount += 1;
              renderProgress();
              currentAppName = getNextAppName();
            }
          })(),
        );
        await Promise.all(workers);
      } finally {
        message.destroy('tpl-precheck-bulk');
      }

      message.info(
        t('Bulk precheck finished: {{healthy}} healthy, {{warning}} warning, {{failed}} failed.', {
          healthy: healthyCount,
          warning: warningCount,
          failed: failedCount,
        }),
      );

      const header = [
        t('App'),
        t('Template'),
        t('Recommendation'),
        t('App status'),
        t('Probe status'),
        t('Reason'),
      ].join('\t');
      const rows = reports.map((report) =>
        [
          report.appName,
          report.templateKey || '-',
          resolveTemplatePrecheckRecommendation(t, report.recommendation),
          report.appStatus || '-',
          report.waitProbeStatus || '-',
          report.waitReason || '-',
        ].join('\t'),
      );
      const detailsText = [header, ...rows].join('\n');

      modal.info({
        width: 920,
        title: t('Bulk precheck result details'),
        content: React.createElement(
          'div',
          { style: { maxHeight: 420, overflow: 'auto' } },
          React.createElement(
            Typography.Paragraph,
            null,
            t('Bulk precheck finished: {{healthy}} healthy, {{warning}} warning, {{failed}} failed.', {
              healthy: healthyCount,
              warning: warningCount,
              failed: failedCount,
            }),
          ),
          React.createElement(
            Typography.Paragraph,
            {
              copyable: {
                text: detailsText,
                tooltips: [t('Copy failed list'), t('Copied')],
              },
            },
            t('Copy failed list'),
          ),
          React.createElement(
            'pre',
            {
              style: {
                margin: 0,
                padding: 12,
                borderRadius: 6,
                background: '#f7f7f7',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              },
            },
            detailsText,
          ),
        ),
      });
    },
  };
};

export const useRecheckSelectedTemplateHealthAction = () => {
  const { state, setState, refresh } = useResourceActionContext();
  const api = useAPIClient();
  const { message, modal } = App.useApp();
  const { t } = useTranslation(NAMESPACE);

  return {
    async run() {
      const selectedRowKeys: string[] = ((state?.selectedRowKeys || []) as Array<string | number>)
        .map((key) => String(key))
        .filter(Boolean);
      const appNames: string[] = Array.from(new Set(selectedRowKeys));
      if (!appNames.length) {
        message.warning(t('Please select applications first'));
        return;
      }

      let successCount = 0;
      let failedCount = 0;
      let skippedCount = 0;
      let completedCount = 0;
      const failedDetails: BulkHealthRecheckFailureDetail[] = [];

      const renderProgress = () => {
        message.loading({
          content: t(
            'Bulk template health recheck progress: {{done}}/{{total}} (success {{success}}, failed {{failed}}, skipped {{skipped}})',
            {
              done: completedCount,
              total: appNames.length,
              success: successCount,
              failed: failedCount,
              skipped: skippedCount,
            },
          ),
          key: 'tpl-health-recheck-bulk',
          duration: 0,
        });
      };

      const recheckSingleApp = async (
        appName: string,
      ): Promise<{ status: 'success' | 'failed' | 'skipped'; failureDetail?: BulkHealthRecheckFailureDetail }> => {
        let templateKey = '';
        try {
          const appRes = await api.request({
            url: 'applications:get',
            method: 'get',
            params: {
              filterByTk: appName,
            },
          });
          const appRecord = appRes?.data?.data;
          templateKey = String(
            appRecord?.options?.pendingTemplateKey || appRecord?.options?.installedTemplateKey || '',
          ).trim();
          if (!templateKey) {
            return { status: 'skipped' };
          }

          const report = await runTemplateHealthRecheck(api, appName, templateKey);
          await updateApplicationTemplateOptions(api, appName, {
            templateInstallHealthReport: stringifyTemplateInstallHealthReport(report),
            templateInstallHealthUpdatedAt: new Date().toISOString(),
          });
          return { status: 'success' };
        } catch (error: any) {
          const errorMessage = String(error?.message || 'health_recheck_failed');
          return {
            status: 'failed',
            failureDetail: {
              appName,
              templateKey,
              message: errorMessage,
            },
          };
        }
      };

      renderProgress();
      try {
        let nextIndex = 0;
        const workerCount = Math.min(BULK_TEMPLATE_RETRY_CONCURRENCY, appNames.length);
        const getNextAppName = () => {
          if (nextIndex >= appNames.length) {
            return undefined;
          }
          const appName = appNames[nextIndex];
          nextIndex += 1;
          return appName;
        };
        const workers = Array.from({ length: workerCount }, () =>
          (async () => {
            let currentAppName = getNextAppName();
            while (currentAppName) {
              const result = await recheckSingleApp(currentAppName);
              if (result.status === 'success') {
                successCount += 1;
              } else if (result.status === 'failed') {
                failedCount += 1;
                if (result.failureDetail) {
                  failedDetails.push(result.failureDetail);
                }
              } else {
                skippedCount += 1;
              }
              completedCount += 1;
              renderProgress();
              currentAppName = getNextAppName();
            }
          })(),
        );
        await Promise.all(workers);
      } finally {
        message.destroy('tpl-health-recheck-bulk');
      }

      message.info(
        t('Bulk template health recheck finished: {{success}} succeeded, {{failed}} failed, {{skipped}} skipped.', {
          success: successCount,
          failed: failedCount,
          skipped: skippedCount,
        }),
      );

      if (failedDetails.length > 0) {
        const header = [t('App'), t('Template'), t('Message')].join('\t');
        const rows = failedDetails.map((detail) =>
          [detail.appName, detail.templateKey || '-', detail.message || 'health_recheck_failed'].join('\t'),
        );
        const failedReport = [header, ...rows].join('\n');
        modal.info({
          width: 920,
          title: t('Bulk template health recheck details'),
          content: React.createElement(
            'div',
            { style: { maxHeight: 420, overflow: 'auto' } },
            React.createElement(
              Typography.Paragraph,
              {
                copyable: {
                  text: failedReport,
                  tooltips: [t('Copy failed list'), t('Copied')],
                },
              },
              t('Copy failed list'),
            ),
            React.createElement(
              'pre',
              {
                style: {
                  margin: 0,
                  padding: 12,
                  borderRadius: 6,
                  background: '#f7f7f7',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                },
              },
              failedReport,
            ),
          ),
        });
      }

      setState?.({ selectedRowKeys: [] });
      refresh();
    },
  };
};

export const formSchema: ISchema = {
  type: 'void',
  'x-component': 'div',
  properties: {
    displayName: {
      'x-component': 'CollectionField',
      'x-decorator': 'FormItem',
    },
    name: {
      'x-component': 'CollectionField',
      'x-decorator': 'FormItem',
      'x-disabled': '{{ !createOnly }}',
    },
    // 'options.standaloneDeployment': {
    //   'x-component': 'Checkbox',
    //   'x-decorator': 'FormItem',
    //   'x-content': i18nText('Standalone deployment'),
    // },
    'options.autoStart': {
      title: tval('Start mode', { ns: '@nocobase/plugin-multi-app-manager' }),
      'x-component': 'Radio.Group',
      'x-decorator': 'FormItem',
      default: false,
      enum: [
        { label: tval('Start on first visit', { ns: '@nocobase/plugin-multi-app-manager' }), value: false },
        { label: tval('Start with main application', { ns: '@nocobase/plugin-multi-app-manager' }), value: true },
      ],
    },
    cname: {
      title: i18nText('Custom domain'),
      'x-component': 'Input',
      'x-decorator': 'FormItem',
    },
    pinned: {
      'x-component': 'CollectionField',
      'x-decorator': 'FormItem',
    },
    'options.authManager': {
      type: 'object',
      'x-decorator': 'FormItem',
      'x-component': 'Fieldset',
      title: `{{t("Authentication options", { ns: "${NAMESPACE}" })}}`,
      properties: {
        'jwt.secret': {
          type: 'string',
          title: `{{t("JWT secret", { ns: "${NAMESPACE}" })}}`,
          description: `{{t("An independent JWT secret ensures data and session isolation from other applications.", { ns: "${NAMESPACE}" })}}`,
          'x-decorator': 'FormItem',
          'x-component': 'JwtSecretInput',
        },
      },
    },
  },
};

export const createFormSchema: ISchema = {
  type: 'void',
  'x-component': 'div',
  properties: {
    displayName: {
      'x-component': 'CollectionField',
      'x-decorator': 'FormItem',
    },
    name: {
      'x-component': 'CollectionField',
      'x-decorator': 'FormItem',
    },
    'options.templateKey': {
      type: 'string',
      title: tval('App template', { ns: '@nocobase/plugin-multi-app-manager' }),
      'x-decorator': 'FormItem',
      'x-component': 'TemplateRadio',
      default: '',
    },
    'options.autoStart': {
      title: tval('Start mode', { ns: '@nocobase/plugin-multi-app-manager' }),
      'x-component': 'Radio.Group',
      'x-decorator': 'FormItem',
      default: false,
      enum: [
        { label: tval('Start on first visit', { ns: '@nocobase/plugin-multi-app-manager' }), value: false },
        { label: tval('Start with main application', { ns: '@nocobase/plugin-multi-app-manager' }), value: true },
      ],
    },
    pinned: {
      'x-component': 'CollectionField',
      'x-decorator': 'FormItem',
    },
  },
};

export const manualTemplateFormSchema: ISchema = {
  type: 'void',
  'x-component': 'div',
  properties: {
    templateKey: {
      type: 'string',
      title: tval('App template', { ns: '@nocobase/plugin-multi-app-manager' }),
      'x-decorator': 'FormItem',
      'x-component': 'TemplateRadio',
      default: '',
    },
  },
};

export const tableActionColumnSchema: ISchema = {
  properties: {
    view: {
      type: 'void',
      'x-component': 'AppVisitor',
      'x-component-props': {},
    },
    update: {
      type: 'void',
      title: '{{t("Edit")}}',
      'x-component': 'Action.Link',
      'x-component-props': {},
      properties: {
        drawer: {
          type: 'void',
          'x-component': 'Action.Drawer',
          'x-decorator': 'Form',
          'x-decorator-props': {
            useValues: '{{ cm.useValuesFromRecord }}',
          },
          title: '{{t("Edit")}}',
          properties: {
            formSchema,
            footer: {
              type: 'void',
              'x-component': 'Action.Drawer.Footer',
              properties: {
                cancel: {
                  title: '{{t("Cancel")}}',
                  'x-component': 'Action',
                  'x-component-props': {
                    useAction: '{{ cm.useCancelAction }}',
                  },
                },
                submit: {
                  title: '{{t("Submit")}}',
                  'x-component': 'Action',
                  'x-component-props': {
                    type: 'primary',
                    useAction: '{{ cm.useUpdateAction }}',
                  },
                },
              },
            },
          },
        },
      },
    },
    initTemplate: {
      type: 'void',
      title: `{{t("Initialize template", { ns: "${NAMESPACE}" })}}`,
      'x-component': 'Action.Link',
      properties: {
        drawer: {
          type: 'void',
          'x-component': 'Action.Drawer',
          'x-decorator': 'Form',
          'x-decorator-props': {
            useValues(options) {
              const ctx = useActionContext();
              const record = useRecord();
              return useRequest(
                () =>
                  Promise.resolve({
                    data: {
                      templateKey: record?.options?.pendingTemplateKey || record?.options?.installedTemplateKey || '',
                    },
                  }),
                {
                  ...options,
                  refreshDeps: [
                    ctx.visible,
                    record?.options?.pendingTemplateKey,
                    record?.options?.installedTemplateKey,
                  ],
                },
              );
            },
          },
          title: `{{t("Manual template initialization", { ns: "${NAMESPACE}" })}}`,
          properties: {
            manualTemplateFormSchema,
            footer: {
              type: 'void',
              'x-component': 'Action.Drawer.Footer',
              properties: {
                cancel: {
                  title: '{{t("Cancel")}}',
                  'x-component': 'Action',
                  'x-component-props': {
                    useAction: '{{ cm.useCancelAction }}',
                  },
                },
                submit: {
                  title: `{{t("Initialize template now", { ns: "${NAMESPACE}" })}}`,
                  'x-component': 'Action',
                  'x-component-props': {
                    type: 'primary',
                    useAction: useManualInstallTemplateAction,
                  },
                },
              },
            },
          },
        },
      },
    },
    retryTemplate: {
      type: 'void',
      title: `{{t("Retry template init", { ns: "${NAMESPACE}" })}}`,
      'x-component': 'Action.Link',
      'x-visible': `{{ !!($record && $record.options && ($record.options.pendingTemplateKey || $record.options.templateInstallState === "failed")) }}`,
      'x-component-props': {
        useAction: useRetryTemplateInstallAction,
      },
    },
    templatePrecheck: {
      type: 'void',
      title: `{{t("Template precheck", { ns: "${NAMESPACE}" })}}`,
      'x-component': 'Action.Link',
      'x-visible': `{{ !!($record && $record.options && ($record.options.pendingTemplateKey || $record.options.installedTemplateKey || $record.options.templateInstallState || $record.options.templateInstallError || $record.options.templateInstallHealthReport)) }}`,
      'x-component-props': {
        useAction: useTemplatePrecheckAction,
      },
    },
    templateHealthRecheck: {
      type: 'void',
      title: `{{t("Template health recheck", { ns: "${NAMESPACE}" })}}`,
      'x-component': 'Action.Link',
      'x-visible': `{{ !!($record && $record.options && ($record.options.pendingTemplateKey || $record.options.installedTemplateKey)) }}`,
      'x-component-props': {
        useAction: useTemplateHealthRecheckAction,
      },
    },
    copyTemplateDiagnostics: {
      type: 'void',
      title: `{{t("Copy template diagnostics", { ns: "${NAMESPACE}" })}}`,
      'x-component': 'Action.Link',
      'x-visible': `{{ !!($record && $record.options && ($record.options.templateInstallState || $record.options.templateInstallError || $record.options.pendingTemplateKey || $record.options.installedTemplateKey || $record.options.templateInstallHealthReport)) }}`,
      'x-component-props': {
        useAction: useCopyTemplateDiagnosticsAction,
      },
    },
    resetTemplateStatus: {
      type: 'void',
      title: `{{t("Clear template status", { ns: "${NAMESPACE}" })}}`,
      'x-component': 'Action.Link',
      'x-visible': `{{ !!($record && $record.options && ($record.options.templateInstallState || $record.options.templateInstallError || $record.options.templateInstallHealthReport)) }}`,
      'x-component-props': {
        useAction: useResetTemplateInstallStatusAction,
        confirm: {
          title: `{{t("Clear template status", { ns: "${NAMESPACE}" })}}`,
          content: `{{t("Are you sure you want to clear template status and error logs?", { ns: "${NAMESPACE}" })}}`,
        },
      },
    },
    delete: {
      type: 'void',
      title: '{{ t("Delete") }}',
      'x-component': 'Action.Link',
      'x-component-props': {
        confirm: {
          title: "{{t('Delete')}}",
          content: "{{t('Are you sure you want to delete it?')}}",
        },
        useAction: '{{cm.useDestroyAction}}',
      },
    },
  },
};

export function useManualInstallTemplateAction() {
  const form = useForm();
  const field = useField();
  const record = useRecord();
  const ctx = useActionContext();
  const { refresh } = useResourceActionContext();
  const api = useAPIClient();
  const { message, modal } = App.useApp();
  const { t } = useTranslation(NAMESPACE);

  return {
    async run() {
      try {
        await form.submit();
        field.data = field.data || {};
        field.data.loading = true;

        const templateKey = form.values?.templateKey;
        if (!templateKey) {
          message.warning(t('Please select a template first'));
          return;
        }

        await updateApplicationTemplateOptions(api, record.name, {
          pendingTemplateKey: templateKey,
          templateInstallState: 'installing',
          templateInstallError: '',
          templateInstallUpdatedAt: new Date().toISOString(),
          templateInstallHealthReport: '',
          templateInstallHealthUpdatedAt: '',
        });

        const result = await installTemplateWithRetry(api, record.name, templateKey, { modal, message }, 1, { t });
        if (result.installed) {
          await updateApplicationTemplateOptions(api, record.name, {
            pendingTemplateKey: '',
            installedTemplateKey: templateKey,
            templateInstallState: 'installed',
            templateInstallError: '',
            templateInstallUpdatedAt: new Date().toISOString(),
            templateInstallHealthReport: stringifyTemplateInstallHealthReport(result.healthReport),
            templateInstallHealthUpdatedAt: new Date().toISOString(),
          });
          ctx.setVisible(false);
          await form.reset();
          refresh();
          return;
        }

        await updateApplicationTemplateOptions(api, record.name, {
          pendingTemplateKey: templateKey,
          templateInstallState: 'failed',
          templateInstallError: stringifyTemplateInstallError(result.error),
          templateInstallUpdatedAt: new Date().toISOString(),
          templateInstallHealthReport: '',
          templateInstallHealthUpdatedAt: '',
        });

        const detail = normalizeTemplateInstallError(result.error);
        message.error(
          t('Template initialization failed at {{step}}: {{message}}', {
            step: detail.step,
            message: detail.message,
          }),
        );
      } finally {
        field.data.loading = false;
      }
    },
  };
}

export function useResetTemplateInstallStatusAction() {
  const record = useRecord() as any;
  const api = useAPIClient();
  const { refresh } = useResourceActionContext();
  const { message } = App.useApp();
  const { t } = useTranslation(NAMESPACE);

  return {
    async run() {
      const hasState = Boolean(
        record?.options?.templateInstallState ||
          record?.options?.templateInstallError ||
          record?.options?.templateInstallHealthReport,
      );
      if (!hasState) {
        message.info(t('No template status to clear.'));
        return;
      }

      await updateApplicationTemplateOptions(api, record.name, {
        pendingTemplateKey: '',
        templateInstallState: '',
        templateInstallError: '',
        templateInstallUpdatedAt: new Date().toISOString(),
        templateInstallHealthReport: '',
        templateInstallHealthUpdatedAt: '',
        templateStartupAttempts: 0,
        templateStartupElapsedMs: 0,
        templateStartupLastAppStatus: '',
        templateStartupLastProbeStatus: '',
      });
      message.success(t('Template status has been cleared.'));
      refresh();
    },
  };
}

export function useRetryTemplateInstallAction() {
  const record = useRecord() as any;
  const api = useAPIClient();
  const { refresh } = useResourceActionContext();
  const { message, modal } = App.useApp();
  const { t } = useTranslation(NAMESPACE);

  return {
    async run() {
      const templateKey = record?.options?.pendingTemplateKey || record?.options?.installedTemplateKey;
      if (!templateKey) {
        message.warning(t('No template available to retry.'));
        return;
      }

      await updateApplicationTemplateOptions(api, record.name, {
        pendingTemplateKey: templateKey,
        templateInstallState: 'installing',
        templateInstallError: '',
        templateInstallUpdatedAt: new Date().toISOString(),
        templateInstallHealthReport: '',
        templateInstallHealthUpdatedAt: '',
      });

      const result = await installTemplateWithRetry(api, record.name, templateKey, { modal, message }, undefined, { t });
      if (result.installed) {
        await updateApplicationTemplateOptions(api, record.name, {
          pendingTemplateKey: '',
          installedTemplateKey: templateKey,
          templateInstallState: 'installed',
          templateInstallError: '',
          templateInstallUpdatedAt: new Date().toISOString(),
          templateInstallHealthReport: stringifyTemplateInstallHealthReport(result.healthReport),
          templateInstallHealthUpdatedAt: new Date().toISOString(),
        });
        message.success(t('Template initialized successfully.'));
        refresh();
        return;
      }

      await updateApplicationTemplateOptions(api, record.name, {
        pendingTemplateKey: templateKey,
        templateInstallState: 'failed',
        templateInstallError: stringifyTemplateInstallError(result.error),
        templateInstallUpdatedAt: new Date().toISOString(),
        templateInstallHealthReport: '',
        templateInstallHealthUpdatedAt: '',
      });
      const detail = normalizeTemplateInstallError(result.error);
      message.error(
        t('Template initialization failed at {{step}}: {{message}}', {
          step: detail.step,
          message: detail.message,
        }),
      );
    },
  };
}

export function useTemplatePrecheckAction() {
  const record = useRecord() as any;
  const api = useAPIClient();
  const { message, modal } = App.useApp();
  const { t } = useTranslation(NAMESPACE);

  return {
    async run() {
      const appName = String(record?.name || '').trim();
      if (!appName) {
        message.error(t('Unable to locate app record.'));
        return;
      }

      const messageKey = `tpl-precheck-${appName}`;
      message.loading({
        content: t('Running template precheck...'),
        key: messageKey,
        duration: 0,
      });
      try {
        const report = await runTemplatePrecheck(api, appName, {
          recheckHealth: true,
          persistHealthReport: true,
        });
        const recommendationText = resolveTemplatePrecheckRecommendation(t, report.recommendation);
        const reportText = buildTemplatePrecheckReportText(t, report);

        modal.info({
          width: 920,
          title: t('Template precheck report'),
          content: React.createElement(
            'div',
            { style: { maxHeight: 420, overflow: 'auto' } },
            React.createElement(
              Typography.Paragraph,
              null,
              t('Recommendation: {{text}}', {
                text: recommendationText,
              }),
            ),
            React.createElement(
              Typography.Paragraph,
              {
                copyable: {
                  text: reportText,
                  tooltips: [t('Copy failed list'), t('Copied')],
                },
              },
              t('Copy failed list'),
            ),
            React.createElement(
              'pre',
              {
                style: {
                  margin: 0,
                  padding: 12,
                  borderRadius: 6,
                  background: '#f7f7f7',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                },
              },
              reportText,
            ),
          ),
        });
      } catch (error) {
        void error;
        message.error(t('Failed to run template precheck.'));
      } finally {
        message.destroy(messageKey);
      }
    },
  };
}

export function useTemplateHealthRecheckAction() {
  const record = useRecord() as any;
  const api = useAPIClient();
  const { refresh } = useResourceActionContext();
  const { message, modal } = App.useApp();
  const { t } = useTranslation(NAMESPACE);

  return {
    async run() {
      const appName = String(record?.name || '').trim();
      if (!appName) {
        message.error(t('Unable to locate app record.'));
        return;
      }

      const templateKey = String(
        record?.options?.pendingTemplateKey || record?.options?.installedTemplateKey || '',
      ).trim();
      if (!templateKey) {
        message.warning(t('No template available for health recheck.'));
        return;
      }

      const messageKey = `tpl-health-recheck-${appName}`;
      message.loading({
        content: t('Running template health recheck...'),
        key: messageKey,
        duration: 0,
      });
      try {
        const report = await runTemplateHealthRecheck(api, appName, templateKey);
        await updateApplicationTemplateOptions(api, appName, {
          templateInstallHealthReport: stringifyTemplateInstallHealthReport(report),
          templateInstallHealthUpdatedAt: new Date().toISOString(),
        });

        const summary = buildTemplateInstallHealthSummary(t, report);
        const reportText = JSON.stringify(
          {
            ...report,
            summary,
          },
          null,
          2,
        );

        modal.info({
          width: 920,
          title: t('Template health recheck report'),
          content: React.createElement(
            'div',
            { style: { maxHeight: 420, overflow: 'auto' } },
            React.createElement(Typography.Paragraph, null, summary),
            React.createElement(
              Typography.Paragraph,
              {
                copyable: {
                  text: reportText,
                  tooltips: [t('Copy template health report'), t('Copied')],
                },
              },
              t('Copy template health report'),
            ),
            React.createElement(
              'pre',
              {
                style: {
                  margin: 0,
                  padding: 12,
                  borderRadius: 6,
                  background: '#f7f7f7',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                },
              },
              reportText,
            ),
          ),
        });
        message.success({
          content: t('Template health recheck completed.'),
          key: messageKey,
        });
        refresh();
      } catch (error: any) {
        message.error({
          content: t('Template health recheck failed: {{message}}', {
            message: String(error?.message || 'health_recheck_failed'),
          }),
          key: messageKey,
        });
      }
    },
  };
}

export function useCopyTemplateDiagnosticsAction() {
  const record = useRecord() as any;
  const { message } = App.useApp();
  const { t } = useTranslation(NAMESPACE);

  return {
    async run() {
      const diagnostics = {
        appName: record?.name || '',
        appDisplayName: record?.displayName || '',
        pendingTemplateKey: record?.options?.pendingTemplateKey || '',
        installedTemplateKey: record?.options?.installedTemplateKey || '',
        templateInstallState: record?.options?.templateInstallState || '',
        templateInstallError: record?.options?.templateInstallError || '',
        templateInstallUpdatedAt: record?.options?.templateInstallUpdatedAt || '',
        templateInstallHealthReport: record?.options?.templateInstallHealthReport || '',
        templateInstallHealthUpdatedAt: record?.options?.templateInstallHealthUpdatedAt || '',
        templateStartupAttempts: record?.options?.templateStartupAttempts || 0,
        templateStartupElapsedMs: record?.options?.templateStartupElapsedMs || 0,
        templateStartupLastAppStatus: record?.options?.templateStartupLastAppStatus || '',
        templateStartupLastProbeStatus: record?.options?.templateStartupLastProbeStatus || '',
      };

      const hasDiagnostics = Object.values(diagnostics).some((value) => {
        if (typeof value === 'number') {
          return value > 0;
        }
        return String(value || '').trim() !== '';
      });
      if (!hasDiagnostics) {
        message.info(t('No template diagnostics to copy.'));
        return;
      }

      const diagnosticsText = JSON.stringify(diagnostics, null, 2);
      try {
        await navigator.clipboard.writeText(diagnosticsText);
        message.success(t('Template diagnostics copied.'));
      } catch (error) {
        void error;
        message.error(t('Failed to copy template diagnostics.'));
      }
    },
  };
}

export const useCreateActionWithTemplate = () => {
  const form = useForm();
  const field = useField();
  const ctx = useActionContext();
  const { refresh } = useResourceActionContext();
  const { resource } = useResourceContext();
  const api = useAPIClient();
  const { message, modal } = App.useApp();
  const { t } = useTranslation(NAMESPACE);

  return {
    async run() {
      try {
        await form.submit();
        field.data = field.data || {};
        field.data.loading = true;

        const values = { ...form.values };
        const templateKey = values?.options?.templateKey;
        if (values?.options?.templateKey) {
          delete values.options.templateKey;
          values.options.pendingTemplateKey = templateKey;
        }

        await resource.create({ values });
        ctx.setVisible(false);
        await form.reset();
        refresh();

        if (templateKey) {
          const appName = values.name;
          await updateApplicationTemplateOptions(api, appName, {
            pendingTemplateKey: templateKey,
            templateInstallState: 'installing',
            templateInstallError: '',
            templateInstallUpdatedAt: new Date().toISOString(),
            templateInstallHealthReport: '',
            templateInstallHealthUpdatedAt: '',
            templateStartupAttempts: 0,
            templateStartupElapsedMs: 0,
            templateStartupLastAppStatus: '',
            templateStartupLastProbeStatus: '',
          });
          message.loading({
            content: t('Waiting for app {{name}} to initialize...', { name: values.displayName || appName }),
            key: 'tpl-wait',
            duration: 0,
          });

          const readyResult = await waitForAppReady(api, appName, {
            onProgress: (progress) => {
              message.loading({
                content: t(
                  'Waiting for app startup: attempt {{attempt}}, elapsed {{seconds}}s, app {{appStatus}}, probe {{probeStatus}}',
                  {
                    attempt: progress.attempt,
                    seconds: Math.max(0, Math.round(progress.elapsedMs / 1000)),
                    appStatus: stringifyProbeValue(progress.appStatus),
                    probeStatus: stringifyProbeValue(progress.probeStatus),
                  },
                ),
                key: 'tpl-wait',
                duration: 0,
              });
            },
          });

          message.destroy('tpl-wait');
          if (!readyResult.ready) {
            await updateApplicationTemplateOptions(api, appName, {
              pendingTemplateKey: templateKey,
              templateInstallState: 'failed',
              templateInstallError: `waitForAppReady: ${readyResult.reason}`,
              templateInstallUpdatedAt: new Date().toISOString(),
              templateInstallHealthReport: '',
              templateInstallHealthUpdatedAt: '',
              templateStartupAttempts: readyResult.attempts,
              templateStartupElapsedMs: readyResult.elapsedMs,
              templateStartupLastAppStatus: stringifyProbeValue(readyResult.appStatus),
              templateStartupLastProbeStatus: stringifyProbeValue(readyResult.probeStatus),
            });
            message.error(
              t(
                'App startup timeout after {{attempts}} attempts ({{seconds}}s), app {{appStatus}}, probe {{probeStatus}}.',
                {
                  attempts: readyResult.attempts,
                  seconds: Math.max(0, Math.round(readyResult.elapsedMs / 1000)),
                  appStatus: stringifyProbeValue(readyResult.appStatus),
                  probeStatus: stringifyProbeValue(readyResult.probeStatus),
                },
              ),
            );
            refresh();
            return;
          }

          await updateApplicationTemplateOptions(api, appName, {
            pendingTemplateKey: templateKey,
            templateInstallState: 'installing',
            templateInstallError: '',
            templateInstallUpdatedAt: new Date().toISOString(),
            templateInstallHealthReport: '',
            templateInstallHealthUpdatedAt: '',
            templateStartupAttempts: readyResult.attempts,
            templateStartupElapsedMs: readyResult.elapsedMs,
            templateStartupLastAppStatus: stringifyProbeValue(readyResult.appStatus),
            templateStartupLastProbeStatus: stringifyProbeValue(readyResult.probeStatus),
          });
          message.success(
            t('App startup ready after {{attempts}} attempts ({{seconds}}s).', {
              attempts: readyResult.attempts,
              seconds: Math.max(0, Math.round(readyResult.elapsedMs / 1000)),
            }),
          );

          // Always attempt installation once to avoid "menu created but page blank" half-initialized state.
          // installTemplate has its own readiness retries and explicit failure feedback.
          await updateApplicationTemplateOptions(api, appName, {
            pendingTemplateKey: templateKey,
            templateInstallState: 'installing',
            templateInstallError: '',
            templateInstallUpdatedAt: new Date().toISOString(),
            templateInstallHealthReport: '',
            templateInstallHealthUpdatedAt: '',
          });

          const result = await installTemplateWithRetry(
            api,
            appName,
            templateKey,
            { modal, message },
            TEMPLATE_INSTALL_MAX_ATTEMPTS,
            { skipAppReadyCheck: true, t },
          );
          if (result.installed) {
            await updateApplicationTemplateOptions(api, appName, {
              pendingTemplateKey: '',
              installedTemplateKey: templateKey,
              templateInstallState: 'installed',
              templateInstallError: '',
              templateInstallUpdatedAt: new Date().toISOString(),
              templateInstallHealthReport: stringifyTemplateInstallHealthReport(result.healthReport),
              templateInstallHealthUpdatedAt: new Date().toISOString(),
            });
            refresh();
            return;
          }

          await updateApplicationTemplateOptions(api, appName, {
            pendingTemplateKey: templateKey,
            templateInstallState: 'failed',
            templateInstallError: stringifyTemplateInstallError(result.error),
            templateInstallUpdatedAt: new Date().toISOString(),
            templateInstallHealthReport: '',
            templateInstallHealthUpdatedAt: '',
          });
          const detail = normalizeTemplateInstallError(result.error);
          message.error(
            t('Template initialization failed at {{step}}: {{message}}', {
              step: detail.step,
              message: detail.message,
            }),
          );
          message.error(t('Automatic template initialization failed, please retry from action column.'));
        }
      } finally {
        field.data.loading = false;
      }
    },
  };
};

export const useFilterActionProps = () => {
  const { collection } = useResourceContext();
  const options = useFilterFieldOptions(collection.fields);
  const service = useResourceActionContext();
  return useFilterFieldProps({
    options: options,
    params: service.state?.params?.[0] || service.params,
    service,
  });
};
export const schema: ISchema = {
  type: 'object',
  properties: {
    [uid()]: {
      type: 'void',
      'x-decorator': 'ResourceActionProvider',
      'x-decorator-props': {
        collection,
        resourceName: 'applications',
        request: {
          resource: 'applications',
          action: 'list',
          params: {
            pageSize: 50,
            sort: ['-createdAt'],
            appends: [],
          },
        },
      },
      'x-component': 'CollectionProvider_deprecated',
      'x-component-props': {
        collection,
      },
      properties: {
        actions: {
          type: 'void',
          'x-component': 'ActionBar',
          'x-component-props': {
            style: {
              marginBottom: 16,
            },
          },
          properties: {
            filter: {
              'x-component': 'Filter.Action',
              'x-use-component-props': useFilterActionProps,
              default: {
                $and: [{ displayName: { $includes: '' } }, { name: { $includes: '' } }],
              },
              title: "{{t('Filter')}}",
              'x-component-props': {
                icon: 'FilterOutlined',
              },
              'x-align': 'left',
            },
            delete: {
              type: 'void',
              title: '{{ t("Delete") }}',
              'x-component': 'Action',
              'x-component-props': {
                icon: 'DeleteOutlined',
                useAction: useDestroyAll,
                confirm: {
                  title: "{{t('Delete')}}",
                  content: "{{t('Are you sure you want to delete it?')}}",
                },
              },
            },
            selectRetryableTemplateApps: {
              type: 'void',
              title: `{{t("Select retryable apps", { ns: "${NAMESPACE}" })}}`,
              'x-component': 'Action',
              'x-component-props': {
                icon: 'CheckSquareOutlined',
                useAction: useSelectRetryableTemplateAppsAction,
              },
            },
            selectTemplateBoundApps: {
              type: 'void',
              title: `{{t("Select template-bound apps", { ns: "${NAMESPACE}" })}}`,
              'x-component': 'Action',
              'x-component-props': {
                icon: 'AppstoreOutlined',
                useAction: useSelectTemplateBoundAppsAction,
              },
            },
            selectUnhealthyTemplateApps: {
              type: 'void',
              title: `{{t("Select unhealthy template apps", { ns: "${NAMESPACE}" })}}`,
              'x-component': 'Action',
              'x-component-props': {
                icon: 'WarningOutlined',
                useAction: useSelectUnhealthyTemplateAppsAction,
              },
            },
            precheckSelectedTemplateApps: {
              type: 'void',
              title: `{{t("Precheck selected template apps", { ns: "${NAMESPACE}" })}}`,
              'x-component': 'Action',
              'x-component-props': {
                icon: 'SearchOutlined',
                useAction: usePrecheckSelectedTemplateAppsAction,
              },
            },
            recheckSelectedTemplateHealth: {
              type: 'void',
              title: `{{t("Recheck selected template health", { ns: "${NAMESPACE}" })}}`,
              'x-component': 'Action',
              'x-component-props': {
                icon: 'SafetyOutlined',
                useAction: useRecheckSelectedTemplateHealthAction,
              },
            },
            retrySelectedTemplateInits: {
              type: 'void',
              title: `{{t("Retry selected template inits", { ns: "${NAMESPACE}" })}}`,
              'x-component': 'Action',
              'x-component-props': {
                icon: 'SyncOutlined',
                useAction: useRetrySelectedTemplateInitsAction,
              },
            },
            create: {
              type: 'void',
              title: '{{t("Add new")}}',
              'x-decorator': (props) =>
                React.createElement(SchemaComponentOptions, { ...props, scope: { createOnly: true } }),
              'x-component': 'Action',
              'x-component-props': {
                type: 'primary',
                icon: 'PlusOutlined',
              },
              properties: {
                drawer: {
                  type: 'void',
                  'x-component': 'Action.Drawer',
                  'x-decorator': 'Form',
                  'x-decorator-props': {
                    useValues(options) {
                      const ctx = useActionContext();
                      return useRequest(
                        () =>
                          Promise.resolve({
                            data: {
                              name: `a_${uid()}`,
                            },
                          }),
                        { ...options, refreshDeps: [ctx.visible] },
                      );
                    },
                  },
                  title: '{{t("Add new")}}',
                  properties: {
                    createFormSchema,
                    footer: {
                      type: 'void',
                      'x-component': 'Action.Drawer.Footer',
                      properties: {
                        cancel: {
                          title: '{{t("Cancel")}}',
                          'x-component': 'Action',
                          'x-component-props': {
                            useAction: '{{ cm.useCancelAction }}',
                          },
                        },
                        submit: {
                          title: '{{t("Submit")}}',
                          'x-component': 'Action',
                          'x-component-props': {
                            type: 'primary',
                            useAction: useCreateActionWithTemplate,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        table: {
          type: 'void',
          'x-uid': 'input',
          'x-component': 'Table.Void',
          'x-component-props': {
            rowKey: 'name',
            rowSelection: {
              type: 'checkbox',
            },
            useDataSource: '{{ cm.useDataSourceFromRAC }}',
          },
          properties: {
            displayName: {
              type: 'void',
              'x-decorator': 'Table.Column.Decorator',
              'x-component': 'Table.Column',
              properties: {
                displayName: {
                  type: 'string',
                  'x-component': 'CollectionField',
                  'x-read-pretty': true,
                },
              },
            },
            name: {
              type: 'void',
              'x-decorator': 'Table.Column.Decorator',
              'x-component': 'Table.Column',
              properties: {
                name: {
                  type: 'string',
                  'x-component': 'CollectionField',
                  'x-read-pretty': true,
                },
              },
            },
            pinned: {
              type: 'void',
              title: i18nText('Pin to menu'),
              'x-decorator': 'Table.Column.Decorator',
              'x-component': 'Table.Column',
              properties: {
                pinned: {
                  type: 'string',
                  'x-component': 'CollectionField',
                  'x-read-pretty': true,
                },
              },
            },
            status: {
              type: 'void',
              'x-decorator': 'Table.Column.Decorator',
              'x-component': 'Table.Column',
              properties: {
                status: {
                  type: 'string',
                  'x-component': 'CollectionField',
                  'x-read-pretty': true,
                },
              },
            },
            templateKey: {
              type: 'void',
              title: `{{t("Template key", { ns: "${NAMESPACE}" })}}`,
              'x-decorator': 'Table.Column.Decorator',
              'x-component': 'Table.Column',
              'x-component-props': {
                width: 220,
              },
              properties: {
                templateKey: {
                  type: 'string',
                  'x-component': TemplateKeyField,
                  'x-read-pretty': true,
                },
              },
            },
            templateInstallState: {
              type: 'void',
              title: `{{t("Template init status", { ns: "${NAMESPACE}" })}}`,
              'x-decorator': 'Table.Column.Decorator',
              'x-component': 'Table.Column',
              properties: {
                templateInstallState: {
                  type: 'string',
                  'x-component': TemplateInstallStateField,
                  'x-read-pretty': true,
                },
              },
            },
            templateInstallError: {
              type: 'void',
              title: `{{t("Template init error", { ns: "${NAMESPACE}" })}}`,
              'x-decorator': 'Table.Column.Decorator',
              'x-component': 'Table.Column',
              'x-component-props': {
                width: 320,
              },
              properties: {
                templateInstallError: {
                  type: 'string',
                  'x-component': TemplateInstallErrorField,
                  'x-read-pretty': true,
                },
              },
            },
            templateInstallUpdatedAt: {
              type: 'void',
              title: `{{t("Template init updated at", { ns: "${NAMESPACE}" })}}`,
              'x-decorator': 'Table.Column.Decorator',
              'x-component': 'Table.Column',
              'x-component-props': {
                width: 220,
              },
              properties: {
                templateInstallUpdatedAt: {
                  type: 'string',
                  'x-component': TemplateInstallUpdatedAtField,
                  'x-read-pretty': true,
                },
              },
            },
            templateStartupProbe: {
              type: 'void',
              title: `{{t("Template startup probe", { ns: "${NAMESPACE}" })}}`,
              'x-decorator': 'Table.Column.Decorator',
              'x-component': 'Table.Column',
              'x-component-props': {
                width: 320,
              },
              properties: {
                templateStartupProbe: {
                  type: 'string',
                  'x-component': TemplateStartupProbeField,
                  'x-read-pretty': true,
                },
              },
            },
            templateInstallHealth: {
              type: 'void',
              title: `{{t("Template health", { ns: "${NAMESPACE}" })}}`,
              'x-decorator': 'Table.Column.Decorator',
              'x-component': 'Table.Column',
              'x-component-props': {
                width: 360,
              },
              properties: {
                templateInstallHealth: {
                  type: 'string',
                  'x-component': TemplateInstallHealthField,
                  'x-read-pretty': true,
                },
              },
            },
            actions: {
              type: 'void',
              title: '{{t("Actions")}}',
              'x-component': 'Table.Column',
              properties: {
                actions: {
                  type: 'void',
                  'x-component': 'Space',
                  'x-component-props': {
                    split: '|',
                  },
                  ...tableActionColumnSchema,
                },
              },
            },
          },
        },
      },
    },
  },
};
