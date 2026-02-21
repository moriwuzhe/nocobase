/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { LLMProvider } from './provider';
import { LLMProviderOptions } from '../manager/ai-manager';

/**
 * Anthropic Claude provider.
 */
export class ClaudeProvider extends LLMProvider {
  get baseURL() {
    return 'https://api.anthropic.com';
  }

  createModel() {
    const moduleName = '@langchain/anthropic';
    const { ChatAnthropic } = require(moduleName);
    const { baseURL, apiKey } = this.serviceOptions || {};

    return new ChatAnthropic({
      anthropicApiKey: apiKey,
      ...this.modelOptions,
      anthropicApiUrl: baseURL || this.baseURL,
    });
  }

  async listModels() {
    // Claude doesn't have a public models listing endpoint; return known models
    return {
      models: [
        { id: 'claude-sonnet-4-20250514' },
        { id: 'claude-3-5-sonnet-20241022' },
        { id: 'claude-3-5-haiku-20241022' },
        { id: 'claude-3-opus-20240229' },
      ],
    };
  }
}

export const claudeProviderOptions: LLMProviderOptions = {
  title: 'Claude (Anthropic)',
  provider: ClaudeProvider,
};
