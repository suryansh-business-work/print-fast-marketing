import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid2';
import PeopleIcon from '@mui/icons-material/People';
import StoreIcon from '@mui/icons-material/Store';
import CampaignIcon from '@mui/icons-material/Campaign';
import MailIcon from '@mui/icons-material/Mail';
import InventoryIcon from '@mui/icons-material/Inventory';
import GroupIcon from '@mui/icons-material/Group';
import { Breadcrumb } from '../../components/Breadcrumb';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types/user.types';
import { IVendorDashboardStats, IAdminDashboardStats } from '../../types/dashboard.types';
import * as dashboardService from '../../services/dashboard.service';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

const StatCard = ({ title, value, icon, color }: StatCardProps) => (
  <Card>
    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
      <Box
        sx={{
          backgroundColor: color,
          borderRadius: 2,
          p: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h5">{value}</Typography>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { user, hasRole } = useAuth();
  const isAdminOrGod = hasRole(UserRole.GOD_USER, UserRole.ADMIN_USER);
  const isVendor = hasRole(UserRole.VENDOR_USER);

  const [vendorStats, setVendorStats] = useState<IVendorDashboardStats | null>(null);
  const [adminStats, setAdminStats] = useState<IAdminDashboardStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await dashboardService.getDashboardStats();
        if (response.success && response.data) {
          if (isVendor) {
            setVendorStats(response.data as IVendorDashboardStats);
          } else {
            setAdminStats(response.data as IAdminDashboardStats);
          }
        }
      } catch {
        // Stats fetch failed silently
      }
    };
    fetchStats();
  }, [isVendor]);

  return (
    <Box>
      <Breadcrumb />
      <Typography variant="h5" sx={{ mb: 0.5 }}>
        Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Welcome back, {user?.firstName}!
      </Typography>

      <Grid container spacing={2}>
        {isAdminOrGod && (
          <>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Total Users"
                value={adminStats?.totalUsers?.toString() || '--'}
                icon={<PeopleIcon />}
                color="#1976d2"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Total Vendors"
                value={adminStats?.totalVendors?.toString() || '--'}
                icon={<StoreIcon />}
                color="#2e7d32"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Active Vendors"
                value={adminStats?.activeVendors?.toString() || '--'}
                icon={<StoreIcon />}
                color="#00897b"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Total Campaigns"
                value={adminStats?.totalCampaigns?.toString() || '--'}
                icon={<CampaignIcon />}
                color="#ed6c02"
              />
            </Grid>
          </>
        )}
        {isVendor && (
          <>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Campaigns"
                value={vendorStats?.totalCampaigns?.toString() || '--'}
                icon={<CampaignIcon />}
                color="#1976d2"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Clients"
                value={vendorStats?.totalClients?.toString() || '--'}
                icon={<GroupIcon />}
                color="#2e7d32"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Postcards"
                value={vendorStats?.totalPostcards?.toString() || '--'}
                icon={<MailIcon />}
                color="#ed6c02"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Products & Services"
                value={vendorStats?.totalProductServices?.toString() || '--'}
                icon={<InventoryIcon />}
                color="#7b1fa2"
              />
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard;
