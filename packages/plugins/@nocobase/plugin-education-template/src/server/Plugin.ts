import { Plugin } from '@nocobase/server';
export default class extends Plugin {
  async load() {
    for (const c of ['eduStudents', 'eduCourses', 'eduGrades']) {
      this.app.acl.allow(c, '*', 'loggedIn');
    }
    this.app.acl.registerSnippet({ name: `pm.${this.name}`, actions: ['eduStudents:*', 'eduCourses:*', 'eduGrades:*'] });
  }
}
