import { Plugin, InstallOptions } from '@nocobase/server';
import { createTemplateUI } from './ui-schema-generator';
const COLLECTIONS = ['legalCases', 'legalDocuments'];
export default class PluginLegalTemplateServer extends Plugin {
  async install(options?: InstallOptions) {
    if (this.app.name && this.app.name !== 'main') return;
    try { if ((await this.db.getRepository('legalCases').count()) === 0) {
      await this.db.getRepository('legalCases').create({ values: { title: '张某 vs 李某 借款纠纷', caseType: 'civil', status: 'open', priority: 'high', lawyer: '王律师', client: '张某', opponent: '李某', court: '北京市海淀区人民法院', claimAmount: 500000 } });
      await this.db.getRepository('legalCases').create({ values: { title: '某科技公司知识产权侵权案', caseType: 'ip', status: 'trial', priority: 'urgent', lawyer: '刘律师', client: '某科技公司', opponent: '某竞争公司', court: '北京知识产权法院', claimAmount: 2000000 } });
    }} catch (e) { this.app.logger.warn(`[legal] Seed skipped: ${(e as any).message}`); }
    try { await createTemplateUI(this.app, '法务管理', 'AuditOutlined', [
      { title: '案件管理', icon: 'AuditOutlined', collectionName: 'legalCases', fields: ['caseNo','title','caseType','status','priority','lawyer','client','opponent','claimAmount'], formFields: ['title','caseType','status','priority','lawyer','client','opponent','court','claimAmount','filingDate','trialDate','description'] },
      { title: '法律文书', icon: 'FileTextOutlined', collectionName: 'legalDocuments', fields: ['title','docType','status','author','reviewer'], formFields: ['title','docType','status','content','author','reviewer'] },
    ]); } catch (e) { this.app.logger.warn(`[legal] UI skipped: ${(e as any).message}`); }
  }
  async load() {
    for (const c of COLLECTIONS) this.app.acl.allow(c, '*', 'loggedIn');
    this.app.acl.registerSnippet({ name: `pm.${this.name}`, actions: COLLECTIONS.map((c) => `${c}:*`) });
    this.db.on('legalCases.beforeCreate', async (model: any) => {
      if (!model.get('caseNo')) { const c = await this.db.getRepository('legalCases').count(); model.set('caseNo', `CASE-${new Date().getFullYear()}-${String(c+1).padStart(4,'0')}`); }
    });
  }
}
