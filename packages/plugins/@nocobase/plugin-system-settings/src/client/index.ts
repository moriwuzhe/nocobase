/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin, lazy } from '@nocobase/client';

const { SystemStatus } = lazy(() => import('./SystemStatus'), 'SystemStatus');

class PluginSystemSettingClient extends Plugin {
  async load() {
    this.app.pluginSettingsManager.add('system-settings.status', {
      title: '{{t("System Status")}}',
      icon: 'DashboardOutlined',
      Component: SystemStatus,
      aclSnippet: 'pm.system-settings.system-status',
    });
  }
}

export default PluginSystemSettingClient;
