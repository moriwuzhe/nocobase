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
 * Alibaba Qwen (通义千问) provider.
 * Uses OpenAI-compatible API via DashScope.
 */
export class QwenProvider extends LLMProvider {
  get baseURL() {
    return 'https://dashscope.aliyuncs.com/compatible-mode/v1';
  }

  createModel() {
    // Qwen uses OpenAI-compatible API, so we can use ChatOpenAI from LangChain
    const { ChatOpenAI } = require('@langchain/openai');
    const { baseURL, apiKey } = this.serviceOptions || {};
    const { responseFormat } = this.modelOptions || {};

    return new ChatOpenAI({
      apiKey,
      ...this.modelOptions,
      modelKwargs: {
        response_format: responseFormat ? { type: responseFormat } : undefined,
      },
      configuration: {
        baseURL: baseURL || this.baseURL,
      },
    });
  }
}

export const qwenProviderOptions: LLMProviderOptions = {
  title: 'Qwen (通义千问)',
  provider: QwenProvider,
};
