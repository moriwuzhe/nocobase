import { Plugin, InstallOptions } from '@nocobase/server';
import { createTemplateUI } from './ui-schema-generator';
const COLLECTIONS = ['logShipments', 'logDrivers'];
export default class extends Plugin {
  async install(options?: InstallOptions) {
    if (this.app.name && this.app.name !== 'main') return;
    try { if ((await this.db.getRepository('logShipments').count()) === 0) {
      await this.db.getRepository('logShipments').create({ values: { sender: '上海仓库', senderAddress: '上海市浦东新区', receiver: '北京客户A', receiverAddress: '北京市朝阳区', receiverPhone: '13800001111', weight: 25.5, freight: 120, status: 'in_transit', driver: '张师傅', vehiclePlate: '沪A12345' } });
      await this.db.getRepository('logShipments').create({ values: { sender: '广州仓库', receiver: '深圳客户B', receiverAddress: '深圳市南山区', receiverPhone: '13800002222', weight: 8.2, freight: 35, status: 'delivered' } });
      await this.db.getRepository('logDrivers').create({ values: { name: '张师傅', phone: '13900001111', licenseNo: 'A2', vehiclePlate: '沪A12345', vehicleType: 'truck_m', status: 'on_route' } });
      await this.db.getRepository('logDrivers').create({ values: { name: '李师傅', phone: '13900002222', licenseNo: 'B2', vehiclePlate: '沪B67890', vehicleType: 'van', status: 'available' } });
    }} catch (e) { this.app.logger.warn(`[logistics] Seed: ${(e as any).message}`); }
    try { await createTemplateUI(this.app, '仓库物流', 'CarOutlined', [
      { title: '运单管理', icon: 'SendOutlined', collectionName: 'logShipments', fields: ['trackingNo','sender','receiver','receiverPhone','weight','freight','status','driver','vehiclePlate','shipDate'], formFields: ['sender','senderAddress','receiver','receiverAddress','receiverPhone','weight','freight','status','driver','vehiclePlate','shipDate','remark'] },
      { title: '司机管理', icon: 'UserOutlined', collectionName: 'logDrivers', fields: ['name','phone','licenseNo','vehiclePlate','vehicleType','status'], formFields: ['name','phone','licenseNo','vehiclePlate','vehicleType','status'] },
    ]); } catch (e) { this.app.logger.warn(`[logistics] UI: ${(e as any).message}`); }
  }
  async load() {
    for (const c of COLLECTIONS) this.app.acl.allow(c, '*', 'loggedIn');
    this.app.acl.registerSnippet({ name: `pm.${this.name}`, actions: COLLECTIONS.map((c) => `${c}:*`) });
    this.db.on('logShipments.beforeCreate', async (m: any) => { if (!m.get('trackingNo')) { const c = await this.db.getRepository('logShipments').count(); m.set('trackingNo', `SF${new Date().getFullYear()}${String(c+1).padStart(8,'0')}`); } });
  }
}
