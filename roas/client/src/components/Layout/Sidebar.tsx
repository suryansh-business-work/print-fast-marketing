import { useLocation, useNavigate } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import StoreIcon from '@mui/icons-material/Store';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import CampaignIcon from '@mui/icons-material/Campaign';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import InventoryIcon from '@mui/icons-material/Inventory';
import MailIcon from '@mui/icons-material/Mail';
import GroupIcon from '@mui/icons-material/Group';
import BarChartIcon from '@mui/icons-material/BarChart';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types/user.types';

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  roles: UserRole[];
}

const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/dashboard',
    roles: [UserRole.GOD_USER, UserRole.ADMIN_USER, UserRole.VENDOR_USER],
  },
  {
    label: 'ROAS Dashboard',
    icon: <BarChartIcon />,
    path: '/roas-dashboard',
    roles: [UserRole.VENDOR_USER],
  },
  {
    label: 'Users',
    icon: <PeopleIcon />,
    path: '/users',
    roles: [UserRole.GOD_USER, UserRole.ADMIN_USER],
  },
  {
    label: 'Vendors',
    icon: <StoreIcon />,
    path: '/vendors',
    roles: [UserRole.GOD_USER, UserRole.ADMIN_USER],
  },
  {
    label: 'Campaigns',
    icon: <CampaignIcon />,
    path: '/campaigns',
    roles: [UserRole.GOD_USER, UserRole.ADMIN_USER, UserRole.VENDOR_USER],
  },
  {
    label: 'Products & Services',
    icon: <InventoryIcon />,
    path: '/products',
    roles: [UserRole.GOD_USER, UserRole.ADMIN_USER, UserRole.VENDOR_USER],
  },
  {
    label: 'Postcards',
    icon: <MailIcon />,
    path: '/postcards',
    roles: [UserRole.GOD_USER, UserRole.ADMIN_USER, UserRole.VENDOR_USER],
  },
  {
    label: 'Clients',
    icon: <GroupIcon />,
    path: '/clients',
    roles: [UserRole.GOD_USER, UserRole.ADMIN_USER, UserRole.VENDOR_USER],
  },
  {
    label: 'Integrations',
    icon: <IntegrationInstructionsIcon />,
    path: '/integrations',
    roles: [UserRole.GOD_USER, UserRole.ADMIN_USER, UserRole.VENDOR_USER],
  },
  {
    label: 'Reports',
    icon: <AssessmentIcon />,
    path: '/reports',
    roles: [UserRole.GOD_USER, UserRole.ADMIN_USER, UserRole.VENDOR_USER],
  },
  {
    label: 'Profile',
    icon: <PersonIcon />,
    path: '/profile',
    roles: [UserRole.GOD_USER, UserRole.ADMIN_USER, UserRole.VENDOR_USER],
  },
  {
    label: 'Settings',
    icon: <SettingsIcon />,
    path: '/settings',
    roles: [UserRole.GOD_USER],
  },
];

interface SidebarProps {
  drawerWidth: number;
  collapsedWidth: number;
  mobileOpen: boolean;
  collapsed: boolean;
  isMobile: boolean;
  onClose: () => void;
}

const Sidebar = ({
  drawerWidth,
  collapsedWidth,
  mobileOpen,
  collapsed,
  isMobile,
  onClose,
}: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const filteredItems = menuItems.filter((item) => hasRole(...item.roles));

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const drawerContent = (
    <>
      <Box
        sx={{
          height: 48,
          display: 'flex',
          alignItems: 'center',
          px: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        {!collapsed && (
          <Typography
            variant="subtitle1"
            noWrap
            sx={{ fontWeight: 700, color: 'primary.main', fontSize: '0.95rem' }}
          >
            ROAS PrintFast
          </Typography>
        )}
        {collapsed && (
          <Typography
            variant="subtitle1"
            noWrap
            sx={{ fontWeight: 700, color: 'primary.main', mx: 'auto' }}
          >
            RP
          </Typography>
        )}
      </Box>
      <Box sx={{ overflow: 'auto', pt: 0.5 }}>
        <List dense disablePadding>
          {filteredItems.map((item) => (
            <ListItemButton
              key={item.path}
              selected={
                location.pathname === item.path || location.pathname.startsWith(item.path + '/')
              }
              onClick={() => handleNavigation(item.path)}
              sx={{
                minHeight: 40,
                justifyContent: collapsed ? 'center' : 'initial',
                px: 2,
                py: 0.5,
                mx: 0.5,
                borderRadius: 1,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '& .MuiListItemIcon-root': { color: 'white' },
                  '&:hover': { backgroundColor: 'primary.dark' },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: collapsed ? 'auto' : 2,
                  justifyContent: 'center',
                  '& .MuiSvgIcon-root': { fontSize: '1.2rem' },
                }}
              >
                {item.icon}
              </ListItemIcon>
              {!collapsed && (
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: 500 }}
                />
              )}
            </ListItemButton>
          ))}
        </List>
      </Box>
    </>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: collapsed ? collapsedWidth : drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: collapsed ? collapsedWidth : drawerWidth,
          boxSizing: 'border-box',
          transition: 'width 225ms cubic-bezier(0.4, 0, 0.6, 1)',
          overflowX: 'hidden',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
