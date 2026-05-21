import { useState } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import TipsAndUpdatesRoundedIcon from '@mui/icons-material/TipsAndUpdatesRounded';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../features/auth/authSlice';

const drawerWidth = 280;

export function DashboardLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, status } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const initials = user?.displayName
    ? user.displayName
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'EP';

  const navItems = [
    { label: 'Dashboard', icon: <DashboardRoundedIcon color="primary" /> },
    { label: 'Profile', icon: <PersonRoundedIcon color="primary" /> },
    { label: 'Security', icon: <ShieldRoundedIcon color="primary" /> },
    { label: 'Guidance', icon: <TipsAndUpdatesRoundedIcon color="primary" /> },
  ];

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login', { replace: true });
  };

  const drawer = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'linear-gradient(180deg, #ffffff 0%, #f6fbfc 100%)',
      }}
    >
      <Box sx={{ p: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: 'primary.main', width: 52, height: 52 }}>{initials}</Avatar>
          <Box>
            <Typography variant="h6">Employee Portal</Typography>
            <Typography variant="body2" color="text.secondary">
              Security-first workspace
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Divider />

      <List sx={{ px: 2, py: 2, flexGrow: 1 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.label}
            sx={{
              borderRadius: 3,
              mb: 1,
              '&.Mui-selected': {
                bgcolor: 'rgba(11,114,133,0.12)',
              },
            }}
            selected={item.label === 'Dashboard'}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} secondary={item.label === 'Dashboard' ? 'Live overview' : 'Placeholder section'} />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 4,
            bgcolor: 'rgba(11,114,133,0.08)',
          }}
        >
          <Typography variant="subtitle2">Signed in as</Typography>
          <Typography variant="body1" sx={{ fontWeight: 700, mt: 0.5 }}>
            {user?.displayName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.department || 'Employee Services'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          borderBottom: '1px solid rgba(16,42,67,0.08)',
          backdropFilter: 'blur(14px)',
          backgroundColor: 'rgba(255,255,255,0.82)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', gap: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <IconButton
              color="primary"
              edge="start"
              onClick={() => setMobileOpen((open) => !open)}
              sx={{ display: { sm: 'none' } }}
            >
              <MenuRoundedIcon />
            </IconButton>
            <Box>
              <Typography variant="h6">Secure Operations Dashboard</Typography>
              <Typography variant="body2" color="text.secondary">
                Monitor employee access, authentication health, and portal status.
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Chip
              color="success"
              variant="outlined"
              label={user?.authProvider === 'ActiveDirectory' ? 'AD session' : 'Local account'}
            />
            <Button
              color="inherit"
              variant="outlined"
              startIcon={<LogoutRoundedIcon />}
              onClick={handleLogout}
              disabled={status === 'loading'}
            >
              Logout
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: '1px solid rgba(16,42,67,0.08)',
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar />
        <Box sx={{ p: { xs: 2, md: 4 } }}>{children}</Box>
      </Box>
    </Box>
  );
}
