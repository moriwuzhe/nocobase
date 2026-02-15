import { Plugin } from '@nocobase/server';
export default class extends Plugin {
  async load() {
    this.app.acl.allow('invProducts', '*', 'loggedIn');
    this.app.acl.allow('invStockMovements', '*', 'loggedIn');
    this.app.acl.registerSnippet({ name: `pm.${this.name}`, actions: ['invProducts:*', 'invStockMovements:*'] });
  }
}
