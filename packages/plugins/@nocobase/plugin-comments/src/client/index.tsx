/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin } from '@nocobase/client';
import { NAMESPACE } from '../common/constants';
import { CommentBlock } from './components/CommentBlock';
import { CommentInput } from './components/CommentInput';
import { CommentBlockInitializer } from './CommentBlockInitializer';
import enUS from './locale/en-US';
import zhCN from './locale/zh-CN';

export class PluginCommentsClient extends Plugin {
  async load() {
    // i18n
    this.app.i18n.addResources('en-US', NAMESPACE, enUS);
    this.app.i18n.addResources('zh-CN', NAMESPACE, zhCN);

    // Register components globally for schema rendering
    this.app.addComponents({
      CommentBlock,
      CommentInput,
      CommentBlockInitializer,
    });

    // Add "Comments" block option to the detail page block initializer
    this.app.schemaInitializerManager.addItem(
      'popup:common:addBlock',
      'otherBlocks.comments',
      {
        title: '{{t("Comments")}}',
        Component: 'CommentBlockInitializer',
      },
    );

    // Also add to the record detail page
    this.app.schemaInitializerManager.addItem(
      'details:configureActions',
      'enableActions.comments',
      {
        title: '{{t("Comments")}}',
        Component: 'CommentBlockInitializer',
      },
    );
  }
}

export default PluginCommentsClient;
export { CommentBlock } from './components/CommentBlock';
export { CommentInput } from './components/CommentInput';
export { CommentBlockInitializer } from './CommentBlockInitializer';
