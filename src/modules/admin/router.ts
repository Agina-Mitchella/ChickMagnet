import { Router } from 'express';
import { prisma } from '../../config/index.ts';
import { requireAuth, AuthRequest, requireRoles } from '../../middleware/index.ts';
import { tryCatch } from '../../utils/index.ts';
import { DevOpsService } from '../devops/devopsService.ts';

const adminRouter = Router();

// @route   GET /api/v1/admin/stats
adminRouter.get('/stats', requireAuth, requireRoles('ADMIN'), tryCatch(async (req: AuthRequest, res: any) => {
  const usersCount = await prisma.user.count();
  const makersCount = await prisma.keeperProfile.count();
  const productsCount = await prisma.product.count({ where: { deletedAt: null } });
  const ordersCount = await prisma.order.count();
  const disputesCount = await prisma.dispute.count();

  const totalPayments = await prisma.order.aggregate({
    where: { status: { notIn: ['CANCELLED'] } },
    _sum: { total: true }
  });

  res.json({
    success: true,
    data: {
      usersCount,
      makersCount,
      productsCount,
      ordersCount,
      disputesCount,
      totalVolume: totalPayments._sum.total || 0,
      systemUptime: '99.98%',
      serverTime: new Date()
    }
  });
}));

// @route   POST /api/v1/admin/verify-maker/:id
adminRouter.post('/verify-maker/:id', requireAuth, requireRoles('ADMIN'), tryCatch(async (req: AuthRequest, res: any) => {
  const { id } = req.params;

  const profile = await prisma.keeperProfile.update({
    where: { id },
    data: { shopStatus: 'LAUNCHED' }
  });

  DevOpsService.recordAuditLog(
    'KEEPER_VERIFY',
    req.user?.email || 'ADMIN',
    `Verified maker workshop id: ${id} (${profile.shopName}).`,
    req.ip || '127.0.0.1',
    'INFO'
  );

  res.json({ success: true, message: 'Maker workshop has been validated and fully launched.', data: profile });
}));

// @route   POST /api/v1/admin/suspend-user/:id
adminRouter.post('/suspend-user/:id', requireAuth, requireRoles('ADMIN'), tryCatch(async (req: AuthRequest, res: any) => {
  const { id } = req.params;

  await prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() } // Soft-delete represents suspension
  });

  DevOpsService.recordAuditLog(
    'USER_SUSPEND',
    req.user?.email || 'ADMIN',
    `Suspended user id: ${id}. Revoked all active sessions.`,
    req.ip || '127.0.0.1',
    'WARNING'
  );

  // Revoke active sessions
  await prisma.session.deleteMany({ where: { userId: id } });
  await prisma.refreshToken.deleteMany({ where: { userId: id } });

  res.json({ success: true, message: 'User suspended, all sessions and access credentials revoked.' });
}));

// @route   POST /api/v1/admin/gdpr/erase/:id
adminRouter.post('/gdpr/erase/:id', requireAuth, requireRoles('ADMIN'), tryCatch(async (req: AuthRequest, res: any) => {
  const { id } = req.params;

  // Redact personal details in database
  await prisma.user.update({
    where: { id },
    data: {
      email: `redacted_${id}@solhandmades.com`,
      name: 'Redacted Member',
      passwordHash: 'REDACTED',
    }
  });

  await prisma.address.deleteMany({ where: { userId: id } });
  await prisma.savedPaymentMethod.deleteMany({ where: { userId: id } });

  await prisma.gDPRRequest.create({
    data: {
      userId: id,
      type: 'ERASURE',
      status: 'COMPLETED',
      processedAt: new Date()
    }
  });

  DevOpsService.recordAuditLog(
    'GDPR_ERASURE_COMPLETE',
    req.user?.email || 'ADMIN',
    `Executed permanent redaction of personal records (GDPR Erasure) for user id: ${id}.`,
    req.ip || '127.0.0.1',
    'CRITICAL'
  );

  res.json({ success: true, message: 'User records permanently redacted for GDPR compliance.' });
}));

// ==========================================
// DEVOPS & SECURITY TELEMETRY ENDPOINTS
// ==========================================

// @route   GET /api/v1/admin/devops/logs
adminRouter.get('/devops/logs', requireAuth, requireRoles('ADMIN'), tryCatch(async (req: AuthRequest, res: any) => {
  res.json({ success: true, data: DevOpsService.getAuditLogs() });
}));

// @route   GET /api/v1/admin/devops/incidents
adminRouter.get('/devops/incidents', requireAuth, requireRoles('ADMIN'), tryCatch(async (req: AuthRequest, res: any) => {
  res.json({ success: true, data: DevOpsService.getIncidents() });
}));

// @route   GET /api/v1/admin/devops/metrics
adminRouter.get('/devops/metrics', requireAuth, requireRoles('ADMIN'), tryCatch(async (req: AuthRequest, res: any) => {
  res.json({ success: true, data: DevOpsService.getSystemMetrics() });
}));

// @route   POST /api/v1/admin/devops/clear-incidents
adminRouter.post('/devops/clear-incidents', requireAuth, requireRoles('ADMIN'), tryCatch(async (req: AuthRequest, res: any) => {
  DevOpsService.clearIncidents();
  DevOpsService.recordAuditLog(
    'INCIDENTS_RESET',
    req.user?.email || 'ADMIN',
    `Cleared security incidents ledger.`,
    req.ip || '127.0.0.1',
    'WARNING'
  );
  res.json({ success: true, message: 'Security incidents list cleared.' });
}));

export default adminRouter;
