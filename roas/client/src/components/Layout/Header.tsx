import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  drawerWidth: number;
  onMenuClick: () => void;
}

const Header = ({ drawerWidth, onMenuClick }: HeaderProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const formatRole = (role: string) => {
    return role
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : '';

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: `calc(100% - ${drawerWidth}px)`,
        ml: `${drawerWidth}px`,
        transition:
          'width 225ms cubic-bezier(0.4, 0, 0.6, 1), margin 225ms cubic-bezier(0.4, 0, 0.6, 1)',
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar variant="dense" sx={{ minHeight: 48 }}>
        <IconButton edge="start" onClick={onMenuClick} sx={{ mr: 1 }} size="small">
          <MenuIcon fontSize="small" />
        </IconButton>
        <Box sx={{ flexGrow: 1 }} />
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
              <Chip label={formatRole(user.role)} size="small" variant="outlined" color="primary" />
            </Box>
            <Avatar
              sx={{
                width: 28,
                height: 28,
                fontSize: '0.7rem',
                bgcolor: 'primary.main',
                cursor: 'pointer',
              }}
              onClick={() => navigate('/profile')}
            >
              {initials}
            </Avatar>
            <Typography
              variant="body2"
              sx={{ display: { xs: 'none', md: 'block' }, fontWeight: 500, fontSize: '0.8rem' }}
            >
              {user.firstName} {user.lastName}
            </Typography>
            <Button
              onClick={handleLogout}
              startIcon={<LogoutIcon sx={{ fontSize: '1rem !important' }} />}
              size="small"
              color="inherit"
              sx={{ ml: 0.5, fontSize: '0.75rem', minWidth: 'auto' }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                Logout
              </Box>
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
