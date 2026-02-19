import { Plugin } from '@nocobase/server';
export default class extends Plugin {
  async load() {
    for (const c of ['propOwners', 'propRepairRequests', 'propFees']) {
      this.app.acl.allow(c, '*', 'loggedIn');
    }
    this.app.acl.registerSnippet({ name: `pm.${this.name}`, actions: ['propOwners:*', 'propRepairRequests:*', 'propFees:*'] });
  }
}
