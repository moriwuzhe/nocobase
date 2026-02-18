import { Plugin } from '@nocobase/server';

const CRM_COLLECTIONS = [
  'crmLeads', 'crmCustomers', 'crmContacts', 'crmDeals', 'crmActivities',
  'crmProducts', 'crmQuotes', 'crmQuoteItems', 'crmCampaigns',
  'crmContracts', 'crmPayments', 'crmCompetitors', 'crmSalesTargets',
  'crmEmailTemplates',
];

export default class PluginCrmTemplateServer extends Plugin {
  async load() {
    this.app.acl.registerSnippet({
      name: `pm.${this.name}`,
      actions: CRM_COLLECTIONS.map((c) => `${c}:*`),
    });
    for (const c of CRM_COLLECTIONS) {
      this.app.acl.allow(c, '*', 'loggedIn');
    }
  }
}
