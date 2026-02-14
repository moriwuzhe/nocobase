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
import enUS from './locale/en-US';
import zhCN from './locale/zh-CN';

export class PluginCommentsClient extends Plugin {
  async load() {
    this.app.i18n.addResources('en-US', NAMESPACE, enUS);
    this.app.i18n.addResources('zh-CN', NAMESPACE, zhCN);

    // Register the comment block as a schema initializer item
    // so users can add it to any record detail page
    const blockInitializers = this.app.schemaInitializerManager.get('page:addBlock');
    if (blockInitializers) {
      blockInitializers.add('otherBlocks.comments', {
        title: '{{t("Comments")}}',
        Component: 'CommentBlockInitializer',
      });
    }
  }
}

export default PluginCommentsClient;
export { CommentBlock } from './components/CommentBlock';
export { CommentInput } from './components/CommentInput';
