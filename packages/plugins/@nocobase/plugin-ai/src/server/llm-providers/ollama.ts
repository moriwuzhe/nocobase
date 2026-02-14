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
import axios from 'axios';

/**
 * Ollama provider for local LLM models.
 * Ollama uses an OpenAI-compatible API at http://localhost:11434/v1
 */
export class OllamaProvider extends LLMProvider {
  get baseURL() {
    return 'http://localhost:11434/v1';
  }

  createModel() {
    const { ChatOpenAI } = require('@langchain/openai');
    const { baseURL } = this.serviceOptions || {};

    return new ChatOpenAI({
      apiKey: 'ollama', // Ollama doesn't require an API key
      ...this.modelOptions,
      configuration: {
        baseURL: baseURL || this.baseURL,
      },
    });
  }

  async listModels() {
    const baseURL = this.serviceOptions?.baseURL || 'http://localhost:11434';
    try {
      const res = await axios.get(`${baseURL}/api/tags`);
      const models = (res.data?.models || []).map((m: any) => ({
        id: m.name,
      }));
      return { models };
    } catch (e) {
      return { code: 500, errMsg: `Failed to connect to Ollama: ${e.message}` };
    }
  }
}

export const ollamaProviderOptions: LLMProviderOptions = {
  title: 'Ollama (Local)',
  provider: OllamaProvider,
};
