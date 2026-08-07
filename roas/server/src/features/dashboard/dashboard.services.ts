import { CampaignModel } from '../campaigns/campaigns.models';
import { ClientModel } from '../clients/clients.models';
import { PostcardModel } from '../postcards/postcards.models';
import { ProductModel } from '../products/products.models';
import { VendorModel } from '../vendors/vendors.models';
import { UserModel } from '../users/users.models';

interface VendorDashboardStats {
  totalCampaigns: number;
  totalClients: number;
  totalPostcards: number;
  totalProductServices: number;
}

interface AdminDashboardStats {
  totalUsers: number;
  totalVendors: number;
  totalCampaigns: number;
  activeVendors: number;
}

export const getVendorDashboardStats = async (
  vendorId: string | null,
): Promise<VendorDashboardStats> => {
  if (!vendorId) {
    return {
      totalCampaigns: 0,
      totalClients: 0,
      totalPostcards: 0,
      totalProductServices: 0,
    };
  }

  const [totalCampaigns, totalClients, totalPostcards, totalProductServices] = await Promise.all([
    CampaignModel.countDocuments({ vendor: vendorId, isActive: true }),
    ClientModel.countDocuments({ vendor: vendorId, isActive: true }),
    PostcardModel.countDocuments({ vendor: vendorId, isActive: true }),
    ProductModel.countDocuments({ vendor: vendorId, isActive: true }),
  ]);

  return {
    totalCampaigns,
    totalClients,
    totalPostcards,
    totalProductServices,
  };
};

export const getAdminDashboardStats = async (): Promise<AdminDashboardStats> => {
  const [totalUsers, totalVendors, totalCampaigns, activeVendors] = await Promise.all([
    UserModel.countDocuments({ isActive: true }),
    VendorModel.countDocuments(),
    CampaignModel.countDocuments({ isActive: true }),
    VendorModel.countDocuments({ isActive: true }),
  ]);

  return {
    totalUsers,
    totalVendors,
    totalCampaigns,
    activeVendors,
  };
};
