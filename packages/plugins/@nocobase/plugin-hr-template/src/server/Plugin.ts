import { Plugin } from '@nocobase/server';

export default class PluginHrTemplateServer extends Plugin {
  async load() {
    this.app.acl.registerSnippet({
      name: `pm.${this.name}`,
      actions: ['hrEmployees:*', 'hrLeaveRequests:*', 'hrAttendance:*'],
    });
    this.app.acl.allow('hrEmployees', '*', 'loggedIn');
    this.app.acl.allow('hrLeaveRequests', '*', 'loggedIn');
    this.app.acl.allow('hrAttendance', '*', 'loggedIn');
  }
}
