/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import WorkflowPlugin, { Trigger, WorkflowModel } from '@nocobase/plugin-workflow';

/**
 * Form Trigger — fires when a form (public or internal) is submitted.
 *
 * Unlike ActionTrigger which hooks into collection CRUD,
 * FormTrigger is explicitly invoked via a dedicated API endpoint,
 * allowing it to work with custom forms, public forms, and portal forms.
 *
 * Config:
 * - formKey: unique identifier for the form
 * - collection: optional, if the form creates a record
 * - appends: fields to load for the record
 */
export default class FormTrigger extends Trigger {
  static TYPE = 'form';

  /** Map of formKey → workflow configs */
  private formWorkflows = new Map<string, WorkflowModel[]>();

  constructor(workflow: WorkflowPlugin) {
    super(workflow);

    // Register the form submission endpoint
    workflow.app.resourceManager.define({
      name: 'formTrigger',
      actions: {
        submit: this.handleSubmit.bind(this),
      },
    });
    workflow.app.acl.allow('formTrigger', 'submit', 'loggedIn');
    workflow.app.acl.allow('formTrigger', 'submit', 'public'); // Allow public form submissions

    // Build the cache on start
    workflow.app.on('afterStart', () => this.buildCache());
  }

  private buildCache() {
    this.formWorkflows.clear();
    for (const wf of this.workflow.enabledCache.values()) {
      if (wf.type !== 'form') continue;
      const formKey = wf.config?.formKey;
      if (!formKey) continue;
      if (!this.formWorkflows.has(formKey)) {
        this.formWorkflows.set(formKey, []);
      }
      this.formWorkflows.get(formKey)!.push(wf);
    }
  }

  on(workflow: WorkflowModel) {
    const formKey = workflow.config?.formKey;
    if (!formKey) return;
    if (!this.formWorkflows.has(formKey)) {
      this.formWorkflows.set(formKey, []);
    }
    const list = this.formWorkflows.get(formKey)!;
    if (!list.find((w) => w.id === workflow.id)) {
      list.push(workflow);
    }
  }

  off(workflow: WorkflowModel) {
    const formKey = workflow.config?.formKey;
    if (!formKey) return;
    const list = this.formWorkflows.get(formKey);
    if (list) {
      const idx = list.findIndex((w) => w.id === workflow.id);
      if (idx >= 0) list.splice(idx, 1);
    }
  }

  /**
   * POST /api/formTrigger:submit
   * Body: { formKey, data, userId? }
   */
  private async handleSubmit(ctx: any, next: any) {
    const { formKey, data } = ctx.action.params.values || {};

    if (!formKey) {
      return ctx.throw(400, 'formKey is required');
    }

    const workflows = this.formWorkflows.get(formKey) || [];
    if (workflows.length === 0) {
      ctx.body = { success: true, message: 'No workflows configured for this form' };
      return next();
    }

    const { currentUser, currentRole } = ctx.state;
    const { model: UserModel } = this.workflow.db.getCollection('users');
    const userInfo = {
      user: currentUser ? UserModel.build(currentUser).toJSON() : null,
      roleName: currentRole,
    };

    const triggered: string[] = [];

    for (const workflow of workflows) {
      const syncMode = workflow.sync;

      if (syncMode) {
        const processor = await this.workflow.trigger(workflow, {
          data: data || {},
          ...userInfo,
          formKey,
        }, { httpContext: ctx });

        if (!processor) {
          return ctx.throw(500, 'Workflow trigger failed');
        }
        triggered.push(workflow.title || workflow.key);
      } else {
        this.workflow.trigger(workflow, {
          data: data || {},
          ...userInfo,
          formKey,
        });
        triggered.push(workflow.title || workflow.key);
      }
    }

    ctx.body = {
      success: true,
      triggered,
      message: `${triggered.length} workflow(s) triggered`,
    };
    await next();
  }

  async execute(workflow: WorkflowModel, values: any, options: any) {
    return this.workflow.trigger(workflow, values, options);
  }

  validateContext(values: any) {
    if (!values?.data) {
      return { data: 'Form data is required' };
    }
    return null;
  }
}
