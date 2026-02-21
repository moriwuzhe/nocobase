export async function createOaRoles(app: any): Promise<number> {
  const roleRepo = app.db.getRepository('roles');
  if (!roleRepo) return 0;
  let created = 0;
  try {
    if (!(await roleRepo.findOne({ filter: { name: 'oa-admin' } }))) {
      await roleRepo.create({ values: { name: 'oa-admin', title: 'OA 管理员', hidden: false, strategy: { actions: ["oaAnnouncements:list", "oaAnnouncements:get", "oaAnnouncements:create", "oaAnnouncements:update", "oaAnnouncements:destroy", "oaMeetingRooms:list", "oaMeetingRooms:get", "oaMeetingRooms:create", "oaMeetingRooms:update", "oaMeetingRooms:destroy", "oaMeetingBookings:list", "oaMeetingBookings:get", "oaMeetingBookings:create", "oaMeetingBookings:update", "oaMeetingBookings:destroy", "oaAssets:list", "oaAssets:get", "oaAssets:create", "oaAssets:update", "oaAssets:destroy", "oaVisitors:list", "oaVisitors:get", "oaVisitors:create", "oaVisitors:update", "oaVisitors:destroy"] } } });
      created++;
    }
  } catch (e) { app.logger.debug(`[oa] Role skipped: ${(e as any).message}`); }
  try {
    if (!(await roleRepo.findOne({ filter: { name: 'oa-user' } }))) {
      await roleRepo.create({ values: { name: 'oa-user', title: 'OA 普通用户', hidden: false, strategy: { actions: ["oaAnnouncements:list", "oaAnnouncements:get", "oaMeetingRooms:list", "oaMeetingRooms:get", "oaMeetingBookings:list", "oaMeetingBookings:get", "oaMeetingBookings:create", "oaVisitors:list", "oaVisitors:get", "oaVisitors:create", "oaAssets:list", "oaAssets:get"] } } });
      created++;
    }
  } catch (e) { app.logger.debug(`[oa] Role skipped: ${(e as any).message}`); }
  return created;
}
