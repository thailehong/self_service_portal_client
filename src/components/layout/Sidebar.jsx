import { useEffect, useMemo, useState } from "react";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import FiberManualRecordRoundedIcon from "@mui/icons-material/FiberManualRecordRounded";
import {
  alpha,
  Box,
  Collapse,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  Tooltip,
  Typography,
} from "@mui/material";
import { matchPath, NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  getNavigationLabel,
  getSidebarNavigationForUser,
} from "../../app/navigation";
import { launchExternalApplication } from "../../app/applicationLaunch";
import { selectAuth } from "../../features/auth/authSlice";
import { useAppSelector } from "../../hooks/useAppSelector";
import { AppLogo } from "../common/AppLogo";
import { VersionHistoryLauncher } from "./VersionHistoryLauncher";

function isItemActive(item, pathname) {
  if (item.to) {
    return Boolean(
      matchPath({ path: item.to, end: item.end ?? true }, pathname),
    );
  }

  return item.children?.some((child) => isItemActive(child, pathname)) || false;
}

export function Sidebar({ collapsed = false }) {
  const { t } = useTranslation();
  const location = useLocation();
  const auth = useAppSelector(selectAuth);
  const navigation = useMemo(
    () => getSidebarNavigationForUser(auth.user),
    [auth.user],
  );
  const [expandedGroups, setExpandedGroups] = useState(() =>
    Object.fromEntries(
      navigation
        .filter((item) => item.children?.length)
        .map((item) => [item.id, false]),
    ),
  );
  const [flyout, setFlyout] = useState({ anchorEl: null, itemId: null });

  useEffect(() => {
    setExpandedGroups((current) => {
      const next = Object.fromEntries(
        navigation
          .filter((item) => item.children?.length)
          .map((item) => [item.id, Boolean(current[item.id])]),
      );
      navigation.forEach((item) => {
        if (item.children?.length && isItemActive(item, location.pathname)) {
          next[item.id] = true;
        }
      });
      return next;
    });
  }, [location.pathname, navigation]);

  useEffect(() => {
    if (!collapsed) {
      setFlyout({ anchorEl: null, itemId: null });
    }
  }, [collapsed]);

  const activeFlyoutItem =
    navigation.find((item) => item.id === flyout.itemId) || null;

  const handleGroupClick = (event, item) => {
    if (collapsed) {
      setFlyout((current) => ({
        anchorEl: current.itemId === item.id ? null : event.currentTarget,
        itemId: current.itemId === item.id ? null : item.id,
      }));
      return;
    }

    setExpandedGroups((current) => ({
      ...current,
      [item.id]: !current[item.id],
    }));
  };

  const handleNavigationClick = (item, afterClick) => (event) => {
    if (item.type !== "external") {
      return;
    }

    event.preventDefault();
    void launchExternalApplication(item);
    afterClick?.();
  };

  const closeFlyout = () => {
    setFlyout({ anchorEl: null, itemId: null });
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        px: collapsed ? 1.25 : 1.75,
        pt: 2,
        pb: 1,
      }}
    >
      <Box sx={{ px: collapsed ? 0.5 : 1, pb: 2.5 }}>
        <AppLogo compact={collapsed} />
      </Box>
      <Divider />
      <List sx={{ pt: 2, flexGrow: 1 }}>
        {navigation.map((item) => {
          const Icon = item.icon;
          const itemLabel = getNavigationLabel(item, t);
          const active = isItemActive(item, location.pathname);
          const expanded = !collapsed && Boolean(expandedGroups[item.id]);

          const button = (
            <ListItemButton
              component={item.children?.length ? "button" : NavLink}
              to={item.children?.length ? undefined : item.to}
              end={item.children?.length ? undefined : item.end}
              onClick={
                item.children?.length
                  ? (event) => handleGroupClick(event, item)
                  : handleNavigationClick(item)
              }
              sx={{
                width: "100%",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                minHeight: 48,
                mb: item.children?.length && expanded ? 0.5 : 0.75,
                px: collapsed ? 1.25 : 1.5,
                borderRadius: 3,
                justifyContent: collapsed ? "center" : "flex-start",
                ...(item.children?.length
                  ? {
                      bgcolor: active
                        ? (theme) => alpha(theme.palette.primary.main, 0.1)
                        : "transparent",
                      color: active ? "primary.main" : "text.primary",
                    }
                  : {
                      "&.active": {
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                        "& .MuiListItemIcon-root": {
                          color: "inherit",
                        },
                      },
                    }),
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: collapsed ? 0 : 38,
                  flexShrink: 0,
                  color:
                    item.children?.length && active
                      ? "inherit"
                      : "text.secondary",
                  justifyContent: "center",
                }}
              >
                <Icon />
              </ListItemIcon>
              {!collapsed && (
                <Box
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <ListItemText
                    primary={itemLabel}
                    sx={{ flex: 1, minWidth: 0, my: 0 }}
                    primaryTypographyProps={{ noWrap: true }}
                  />
                  {item.children?.length ? (
                    <Box
                      sx={{
                        width: 24,
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        color: "inherit",
                      }}
                    >
                      {expanded ? (
                        <ExpandLessRoundedIcon fontSize="small" />
                      ) : (
                        <ExpandMoreRoundedIcon fontSize="small" />
                      )}
                    </Box>
                  ) : null}
                </Box>
              )}
            </ListItemButton>
          );

          return (
            <Box key={item.id} sx={{ width: "100%" }}>
              {collapsed ? (
                <Tooltip title={itemLabel} placement="right">
                  {button}
                </Tooltip>
              ) : (
                button
              )}
              {item.children?.length && !collapsed ? (
                <Collapse in={expanded} timeout="auto" unmountOnExit>
                  <List disablePadding sx={{ mb: 1 }}>
                    {item.children.map((child) => {
                      const ChildIcon = child.icon || FiberManualRecordRoundedIcon;
                      return (
                      <ListItemButton
                        key={child.id}
                        component={child.type === "external" ? "button" : NavLink}
                        to={child.type === "external" ? undefined : child.to}
                        end
                        onClick={handleNavigationClick(child)}
                        sx={{
                          minHeight: 40,
                          ml: 1,
                          mb: 0.5,
                          pl: 4.25,
                          pr: 1.5,
                          borderRadius: 3,
                          "&.active": {
                            bgcolor: (theme) =>
                              alpha(theme.palette.primary.main, 0.12),
                            color: "primary.main",
                            "& .MuiListItemIcon-root": {
                              color: "primary.main",
                            },
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{ minWidth: 24, color: "text.disabled" }}
                        >
                          <ChildIcon sx={{ fontSize: child.icon ? 18 : 10 }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={getNavigationLabel(child, t)}
                          primaryTypographyProps={{ variant: "body2" }}
                        />
                      </ListItemButton>
                      );
                    })}
                  </List>
                </Collapse>
              ) : null}
            </Box>
          );
        })}
      </List>

      <Divider sx={{ mb: 1 }} />
      <Box>
        <VersionHistoryLauncher collapsed={collapsed} />
      </Box>

      <Popover
        open={Boolean(flyout.anchorEl && activeFlyoutItem)}
        anchorEl={flyout.anchorEl}
        onClose={closeFlyout}
        anchorOrigin={{ vertical: "center", horizontal: "right" }}
        transformOrigin={{ vertical: "center", horizontal: "left" }}
        PaperProps={{ sx: { width: 260, p: 1.25 } }}
      >
        {activeFlyoutItem ? (
          <Box>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ px: 1.25, pt: 0.75, pb: 1 }}
            >
              {getNavigationLabel(activeFlyoutItem, t)}
            </Typography>
            <List disablePadding>
              {activeFlyoutItem.children?.map((child) => {
                const ChildIcon = child.icon;
                return (
                <ListItemButton
                  key={child.id}
                  component={child.type === "external" ? "button" : NavLink}
                  to={child.type === "external" ? undefined : child.to}
                  end
                  onClick={
                    child.type === "external"
                      ? handleNavigationClick(child, closeFlyout)
                      : closeFlyout
                  }
                  sx={{
                    borderRadius: 3,
                    mb: 0.5,
                    "&.active": {
                      bgcolor: (theme) =>
                        alpha(theme.palette.primary.main, 0.12),
                      color: "primary.main",
                    },
                  }}
                >
                  {ChildIcon ? (
                    <ListItemIcon sx={{ minWidth: 32, color: "text.secondary" }}>
                      <ChildIcon fontSize="small" />
                    </ListItemIcon>
                  ) : null}
                  <ListItemText
                    primary={getNavigationLabel(child, t)}
                    primaryTypographyProps={{ variant: "body2" }}
                  />
                </ListItemButton>
                );
              })}
            </List>
          </Box>
        ) : null}
      </Popover>
    </Box>
  );
}
