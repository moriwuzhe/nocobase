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
 * Zhipu AI (智谱清言/ChatGLM) provider.
 * Uses OpenAI-compatible API.
 */
export class ChatGLMProvider extends LLMProvider {
  get baseURL() {
    return 'https://open.bigmodel.cn/api/paas/v4';
  }

  createModel() {
    const { ChatOpenAI } = require('@langchain/openai');
    const { baseURL, apiKey } = this.serviceOptions || {};

    return new ChatOpenAI({
      apiKey,
      ...this.modelOptions,
      configuration: {
        baseURL: baseURL || this.baseURL,
      },
    });
  }
}

export const chatglmProviderOptions: LLMProviderOptions = {
  title: 'ChatGLM (智谱清言)',
  provider: ChatGLMProvider,
};
