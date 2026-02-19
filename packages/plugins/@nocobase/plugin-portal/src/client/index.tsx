/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin, lazy } from '@nocobase/client';
import { tval } from '@nocobase/utils/client';

const { PortalManager } = lazy(() => import('./PortalManager'), 'PortalManager');

export class PluginPortalClient extends Plugin {
  async load() {
    this.app.pluginSettingsManager.add('portal', {
      icon: 'GlobalOutlined',
      title: tval('Portals'),
      aclSnippet: 'pm.plugin-portal',
    });
    this.app.pluginSettingsManager.add('portal.portals', {
      title: tval('Portal Management'),
      Component: PortalManager,
      aclSnippet: 'pm.plugin-portal',
    });
  }
}

export default PluginPortalClient;
