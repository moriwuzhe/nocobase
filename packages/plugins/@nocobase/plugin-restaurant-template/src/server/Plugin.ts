import { Plugin, InstallOptions } from '@nocobase/server';
import { createTemplateUI } from './ui-schema-generator';
const COLLECTIONS = ['restMenuItems', 'restOrders', 'restTables'];
export default class PluginRestaurantTemplateServer extends Plugin {
  async install(options?: InstallOptions) {
    if (this.app.name && this.app.name !== 'main') return;
    try { if ((await this.db.getRepository('restMenuItems').count()) === 0) {
      const items = [
        { name: '宫保鸡丁', category: 'hot', price: 38, cost: 12, isSpicy: true, preparationTime: 15 },
        { name: '糖醋里脊', category: 'hot', price: 42, cost: 15, preparationTime: 20 },
        { name: '凉拌黄瓜', category: 'cold', price: 18, cost: 5, preparationTime: 5 },
        { name: '番茄蛋汤', category: 'soup', price: 22, cost: 6, preparationTime: 10 },
        { name: '扬州炒饭', category: 'staple', price: 28, cost: 8, preparationTime: 12 },
      ];
      for (const i of items) await this.db.getRepository('restMenuItems').create({ values: i });
      const tables = [
        { tableNo: 'A1', capacity: 4, area: 'hall' }, { tableNo: 'A2', capacity: 4, area: 'hall' },
        { tableNo: 'B1', capacity: 8, area: 'private' }, { tableNo: 'C1', capacity: 2, area: 'terrace' },
      ];
      for (const t of tables) await this.db.getRepository('restTables').create({ values: t });
    }} catch (e) { this.app.logger.warn(`[restaurant] Seed skipped: ${(e as any).message}`); }
    try { await createTemplateUI(this.app, '餐饮管理', 'CoffeeOutlined', [
      { title: '菜品管理', icon: 'CoffeeOutlined', collectionName: 'restMenuItems', fields: ['name','category','price','status','isSpicy','preparationTime'], formFields: ['name','category','price','cost','status','description','isSpicy','preparationTime'] },
      { title: '订单管理', icon: 'ShoppingOutlined', collectionName: 'restOrders', fields: ['orderNo','tableNo','guestCount','totalAmount','status','paymentMethod','waiter'], formFields: ['tableNo','guestCount','totalAmount','status','paymentMethod','waiter','remark'] },
      { title: '餐桌管理', icon: 'TableOutlined', collectionName: 'restTables', fields: ['tableNo','capacity','area','status'], formFields: ['tableNo','capacity','area','status'] },
    ]); } catch (e) { this.app.logger.warn(`[restaurant] UI skipped: ${(e as any).message}`); }
  }
  async load() {
    for (const c of COLLECTIONS) this.app.acl.allow(c, '*', 'loggedIn');
    this.app.acl.registerSnippet({ name: `pm.${this.name}`, actions: COLLECTIONS.map((c) => `${c}:*`) });
    this.db.on('restOrders.beforeCreate', async (model: any) => {
      if (!model.get('orderNo')) { const c = await this.db.getRepository('restOrders').count(); model.set('orderNo', `ORD${String(c+1).padStart(6,'0')}`); }
    });
  }
}
