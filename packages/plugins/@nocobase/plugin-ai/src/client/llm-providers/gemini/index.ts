/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { LLMProviderOptions } from '../../manager/ai-manager';
import { ProviderSettingsForm } from '../openai/ProviderSettings';
import { ModelSettingsForm } from '../openai/ModelSettings';

// Gemini provider client settings
export const geminiProviderOptions: LLMProviderOptions = {
  components: {
    ProviderSettingsForm,
    ModelSettingsForm,
  },
};
