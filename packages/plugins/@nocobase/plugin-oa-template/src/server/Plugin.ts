import { Plugin } from '@nocobase/server';

export default class PluginOaTemplateServer extends Plugin {
  async load() {
    this.app.acl.registerSnippet({
      name: `pm.${this.name}`,
      actions: ['oaAnnouncements:*', 'oaMeetingRooms:*', 'oaMeetingBookings:*', 'oaAssets:*'],
    });
    this.app.acl.allow('oaAnnouncements', ['list', 'get'], 'loggedIn');
    this.app.acl.allow('oaMeetingRooms', ['list', 'get'], 'loggedIn');
    this.app.acl.allow('oaMeetingBookings', '*', 'loggedIn');
    this.app.acl.allow('oaAssets', ['list', 'get'], 'loggedIn');
  }
}
