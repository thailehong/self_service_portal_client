import { useState } from 'react';
import { Box, Drawer, useMediaQuery, useTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { selectSettings, toggleSidebarCollapsed } from '../../features/settings/settingsSlice';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { PageContainer } from './PageContainer';
import { SettingsSidebar } from './SettingsSidebar';
import { AppFooter } from './AppFooter';

const expandedWidth = 288;
const collapsedWidth = 96;

export function AppShell() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settings = useAppSelector(selectSettings);
  const dispatch = useAppDispatch();
  const drawerWidth = settings.sidebarCollapsed ? collapsedWidth : expandedWidth;

  const drawerContent = <Sidebar collapsed={isDesktop ? settings.sidebarCollapsed : false} />;

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      {isDesktop ? (
        <Drawer
          variant="permanent"
          open
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              bgcolor: 'background.paper',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': { width: expandedWidth, boxSizing: 'border-box' } }}
        >
          {drawerContent}
        </Drawer>
      )}

      <Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Topbar
          onMenuClick={() => setMobileOpen((current) => !current)}
          onSidebarToggle={() => dispatch(toggleSidebarCollapsed())}
          onOpenSettings={() => setSettingsOpen(true)}
        />
        <Box sx={{ flex: 1 }}>
          <PageContainer>
            <Outlet />
          </PageContainer>
        </Box>
        <AppFooter />
      </Box>
      <SettingsSidebar open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </Box>
  );
}
