import { Request, Response, NextFunction } from 'express';
import * as dashboardService from './dashboard.services';
import { sendSuccess } from '../../utils/response';
import { UserRole } from '../../types/enums';

export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userRole = req.user!.role;

    if (userRole === UserRole.VENDOR_USER) {
      const vendorId = req.user!.vendorId;
      const stats = await dashboardService.getVendorDashboardStats(vendorId);
      sendSuccess(res, stats);
    } else {
      const stats = await dashboardService.getAdminDashboardStats();
      sendSuccess(res, stats);
    }
  } catch (error) {
    next(error);
  }
};
