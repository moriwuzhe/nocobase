import { Plugin } from '@nocobase/server';
export default class extends Plugin {
  async load() {
    const collections = 'ecOrders '.trim().split(' ').filter(Boolean);
    for (const c of collections) { this.app.acl.allow(c, '*', 'loggedIn'); }
    this.app.acl.registerSnippet({ name: `pm.${this.name}`, actions: collections.map(c => c + ':*') });
  }
}
