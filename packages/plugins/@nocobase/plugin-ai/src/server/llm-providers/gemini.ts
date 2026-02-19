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
 * Google Gemini provider.
 */
export class GeminiProvider extends LLMProvider {
  get baseURL() {
    return 'https://generativelanguage.googleapis.com/v1beta';
  }

  createModel() {
    const moduleName = '@langchain/google-genai';
    const { ChatGoogleGenerativeAI } = require(moduleName);
    const { apiKey } = this.serviceOptions || {};

    return new ChatGoogleGenerativeAI({
      apiKey,
      ...this.modelOptions,
    });
  }

  async listModels() {
    // Return known Gemini models
    return {
      models: [
        { id: 'gemini-2.5-pro' },
        { id: 'gemini-2.5-flash' },
        { id: 'gemini-2.0-flash' },
        { id: 'gemini-1.5-pro' },
        { id: 'gemini-1.5-flash' },
      ],
    };
  }
}

export const geminiProviderOptions: LLMProviderOptions = {
  title: 'Gemini (Google)',
  provider: GeminiProvider,
};
