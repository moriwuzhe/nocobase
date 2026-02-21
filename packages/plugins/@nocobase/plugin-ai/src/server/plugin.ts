/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin } from '@nocobase/server';
import { AIManager } from './manager/ai-manager';
import { openaiProviderOptions } from './llm-providers/openai';
import { deepseekProviderOptions } from './llm-providers/deepseek';
import { qwenProviderOptions } from './llm-providers/qwen';
import { claudeProviderOptions } from './llm-providers/claude';
import { geminiProviderOptions } from './llm-providers/gemini';
import { ollamaProviderOptions } from './llm-providers/ollama';
import { chatglmProviderOptions } from './llm-providers/chatglm';
import aiResource from './resource/ai';
import aiSearchResource from './resource/ai-search';
import aiAnalyticsResource from './resource/ai-analytics';
import aiFormAssistResource from './resource/ai-form-assist';
import PluginWorkflowServer from '@nocobase/plugin-workflow';
import { LLMInstruction } from './workflow/nodes/llm';

export class PluginAIServer extends Plugin {
  aiManager = new AIManager();

  async afterAdd() {}

  async beforeLoad() {}

  async load() {
    this.aiManager.registerLLMProvider('openai', openaiProviderOptions);
    this.aiManager.registerLLMProvider('deepseek', deepseekProviderOptions);
    this.aiManager.registerLLMProvider('qwen', qwenProviderOptions);
    this.aiManager.registerLLMProvider('claude', claudeProviderOptions);
    this.aiManager.registerLLMProvider('gemini', geminiProviderOptions);
    this.aiManager.registerLLMProvider('ollama', ollamaProviderOptions);
    this.aiManager.registerLLMProvider('chatglm', chatglmProviderOptions);

    this.app.resourceManager.define(aiResource);
    this.app.resourceManager.define(aiSearchResource);
    this.app.resourceManager.define(aiAnalyticsResource);
    this.app.resourceManager.define(aiFormAssistResource);
    this.app.acl.registerSnippet({
      name: `pm.${this.name}.llm-services`,
      actions: ['ai:*', 'llmServices:*', 'aiSearch:*', 'aiAnalytics:*', 'aiFormAssist:*'],
    });
    this.app.acl.allow('aiSearch', ['query', 'getSchema'], 'loggedIn');
    this.app.acl.allow('aiAnalytics', ['analyze', 'summarize'], 'loggedIn');
    this.app.acl.allow('aiFormAssist', ['suggest', 'classify'], 'loggedIn');
    const workflowSnippet = this.app.acl.snippetManager.snippets.get('pm.workflow.workflows');
    if (workflowSnippet) {
      workflowSnippet.actions.push('ai:listModels');
    }

    const workflow = this.app.pm.get('workflow') as PluginWorkflowServer;
    workflow.registerInstruction('llm', LLMInstruction);
  }

  async install() {}

  async afterEnable() {}

  async afterDisable() {}

  async remove() {}
}

export default PluginAIServer;
