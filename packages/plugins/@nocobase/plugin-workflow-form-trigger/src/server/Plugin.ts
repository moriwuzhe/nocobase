import { Plugin } from '@nocobase/server';
import WorkflowPlugin from '@nocobase/plugin-workflow';
import FormTrigger from './FormTrigger';

export default class PluginWorkflowFormTriggerServer extends Plugin {
  async load() {
    const workflowPlugin = this.app.pm.get('workflow') as WorkflowPlugin;
    workflowPlugin.registerTrigger('form', FormTrigger);
  }
}
