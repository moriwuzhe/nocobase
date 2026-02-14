/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin } from '@nocobase/server';

/**
 * CRM Template Plugin
 *
 * Provides pre-built CRM collections:
 * - Customers: company records with stage tracking (lead→prospect→customer)
 * - Contacts: people associated with customers
 * - Deals: sales opportunities with pipeline stages and probability
 * - Activities: calls, emails, meetings, visits, tasks
 *
 * All collections come with proper field interfaces and UI schemas,
 * ready to use immediately after plugin activation.
 */
export default class PluginCrmTemplateServer extends Plugin {
  async load() {
    // Collections are auto-loaded from the collections directory.
    // No additional server logic needed — the template is purely data-model driven.

    this.app.acl.registerSnippet({
      name: `pm.${this.name}`,
      actions: ['crmCustomers:*', 'crmContacts:*', 'crmDeals:*', 'crmActivities:*'],
    });

    // Allow logged-in users full access to CRM data
    this.app.acl.allow('crmCustomers', '*', 'loggedIn');
    this.app.acl.allow('crmContacts', '*', 'loggedIn');
    this.app.acl.allow('crmDeals', '*', 'loggedIn');
    this.app.acl.allow('crmActivities', '*', 'loggedIn');
  }
}
