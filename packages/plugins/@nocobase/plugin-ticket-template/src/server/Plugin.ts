import { Plugin } from '@nocobase/server';
export default class extends Plugin {
  async load() {
    this.app.acl.allow('tickets', '*', 'loggedIn');
    this.app.acl.allow('ticketKnowledgeBase', ['list', 'get'], 'loggedIn');
    this.app.acl.registerSnippet({ name: `pm.${this.name}`, actions: ['tickets:*', 'ticketKnowledgeBase:*'] });
  }
}
