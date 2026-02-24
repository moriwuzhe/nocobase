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

interface TemplateInstallErrorDetail {
  step: string;
  message: string;
}

interface TemplateInstallResult {
  installed: boolean;
  error?: TemplateInstallErrorDetail;
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

function TemplateInstallErrorField() {
  const record = useRecord() as any;
  const templateInstallError = String(record?.options?.templateInstallError || '').trim();
  if (!templateInstallError) {
    return React.createElement(Typography.Text, { type: 'secondary' }, '-');
  }

  const shortError =
    templateInstallError.length > 96 ? `${templateInstallError.slice(0, 96).trimEnd()}...` : templateInstallError;

  return React.createElement(
    Tooltip,
    { title: templateInstallError },
    React.createElement(Typography.Text, { type: 'danger' }, shortError),
  );
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForAppReady(api: any, appName: string, timeoutMs = 6 * 60 * 1000): Promise<boolean> {
  const startAt = Date.now();
  let attempt = 0;

  while (Date.now() - startAt < timeoutMs) {
    attempt += 1;

    try {
      const appRes = await api.request({
        url: 'applications:get',
        method: 'get',
        params: {
          filterByTk: appName,
        },
      });
      const status = appRes?.data?.data?.status;
      if (APP_READY_STATUSES.has(status)) {
        return true;
      }
      if (status === 'error' || status === 'not_found') {
        return false;
      }
    } catch (e) {
      const status = (e as any)?.response?.status;
      if (status && !TRANSIENT_GATEWAY_STATUSES.has(status)) {
        // For non-gateway errors, continue trying until timeout.
      }
    }

    try {
      await api.request({
        url: 'app:getInfo',
        method: 'get',
        headers: {
          'X-App': appName,
        },
      });
      return true;
    } catch (e) {
      const status = (e as any)?.response?.status;
      // Cross-app token may be different. 401/403 indicates sub-app is up.
      if (APP_AUTH_READY_STATUSES.has(status)) {
        return true;
      }
      if (status && !TRANSIENT_GATEWAY_STATUSES.has(status) && status !== 404) {
        // Keep retrying until timeout, some intermediate statuses can be temporary.
      }
    }

    const delay = Math.min(6000, 1500 + attempt * 300);
    await sleep(delay);
  }

  return false;
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
): Promise<TemplateInstallResult> {
  let lastError: TemplateInstallErrorDetail | undefined;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const installed = await installTemplate(api, appName, templateKey, ui, {
      skipConfirm: true,
      onError: (detail) => {
        lastError = detail;
      },
    });
    if (installed) {
      return { installed: true };
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
    resetTemplateStatus: {
      type: 'void',
      title: `{{t("Clear template status", { ns: "${NAMESPACE}" })}}`,
      'x-component': 'Action.Link',
      'x-visible': `{{ !!($record && $record.options && ($record.options.templateInstallState || $record.options.templateInstallError)) }}`,
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
        });

        const result = await installTemplateWithRetry(api, record.name, templateKey, { modal, message }, 1);
        if (result.installed) {
          await updateApplicationTemplateOptions(api, record.name, {
            pendingTemplateKey: '',
            installedTemplateKey: templateKey,
            templateInstallState: 'installed',
            templateInstallError: '',
            templateInstallUpdatedAt: new Date().toISOString(),
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
      const hasState = Boolean(record?.options?.templateInstallState || record?.options?.templateInstallError);
      if (!hasState) {
        message.info(t('No template status to clear.'));
        return;
      }

      await updateApplicationTemplateOptions(api, record.name, {
        pendingTemplateKey: '',
        templateInstallState: '',
        templateInstallError: '',
        templateInstallUpdatedAt: new Date().toISOString(),
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
      });

      const result = await installTemplateWithRetry(api, record.name, templateKey, { modal, message });
      if (result.installed) {
        await updateApplicationTemplateOptions(api, record.name, {
          pendingTemplateKey: '',
          installedTemplateKey: templateKey,
          templateInstallState: 'installed',
          templateInstallError: '',
          templateInstallUpdatedAt: new Date().toISOString(),
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
          message.loading({
            content: t('Waiting for app {{name}} to initialize...', { name: values.displayName || appName }),
            key: 'tpl-wait',
            duration: 0,
          });

          await waitForAppReady(api, appName);

          message.destroy('tpl-wait');

          // Always attempt installation once to avoid "menu created but page blank" half-initialized state.
          // installTemplate has its own readiness retries and explicit failure feedback.
          await updateApplicationTemplateOptions(api, appName, {
            pendingTemplateKey: templateKey,
            templateInstallState: 'installing',
            templateInstallError: '',
            templateInstallUpdatedAt: new Date().toISOString(),
          });

          const result = await installTemplateWithRetry(api, appName, templateKey, { modal, message });
          if (result.installed) {
            await updateApplicationTemplateOptions(api, appName, {
              pendingTemplateKey: '',
              installedTemplateKey: templateKey,
              templateInstallState: 'installed',
              templateInstallError: '',
              templateInstallUpdatedAt: new Date().toISOString(),
            });
            refresh();
            return;
          }

          await updateApplicationTemplateOptions(api, appName, {
            pendingTemplateKey: templateKey,
            templateInstallState: 'failed',
            templateInstallError: stringifyTemplateInstallError(result.error),
            templateInstallUpdatedAt: new Date().toISOString(),
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
