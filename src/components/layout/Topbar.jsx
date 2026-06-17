import { useEffect, useMemo, useState } from "react";
import {
  alpha,
  Avatar,
  Badge,
  Box,
  Button,
  ClickAwayListener,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  Paper,
  Popover,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import DoneRoundedIcon from "@mui/icons-material/DoneRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { useAppSelector } from "../../hooks/useAppSelector";
import { selectAuth, logout } from "../../features/auth/authSlice";
import { useNotifications } from "../../hooks/useNotifications";
import { useNotifier } from "../../hooks/useNotifier";
import { useNavigate } from "react-router-dom";
import { SettingsLauncher } from "./SettingsLauncher";
import {
  getNavigationLabel,
  getSearchableSidebarNavigationForUser,
} from "../../app/navigation";
import {
  externalApplicationGroups,
  getApplicationsForUser,
  openExternalApplication,
} from "../../app/appRegistry";
import { getHrAdminFeatures } from "../../features/hrAdmin/hrAdminCatalog";
import { openNotificationLink } from "../../utils/notificationLinks";

function normalizeSearchText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function Topbar({ onMenuClick, onSidebarToggle, onOpenSettings }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const auth = useAppSelector(selectAuth);
  const { notify } = useNotifier();
  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    error: notificationsError,
    markingIds,
    reloadNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useNotifications();
  const navigate = useNavigate();
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [accountAnchor, setAccountAnchor] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const menuSearchItems = useMemo(
    () => {
      const sidebarItems = getSearchableSidebarNavigationForUser(auth.user).map(
        (item) => {
          const label = getNavigationLabel(item, t);
          const parentLabel = item.parentLabelKey
            ? t(item.parentLabelKey)
            : item.parentLabel;

          return {
            ...item,
            label,
            parentLabel,
            searchText: [label, parentLabel].filter(Boolean).join(" "),
          };
        },
      );

      const hrAdminLabel = t("nav.hr_admin");
      const hrAdminFeatureItems = getHrAdminFeatures(t).map((feature) => ({
        id: `hr-admin-feature-${feature.id}`,
        label: feature.title,
        to: feature.routePath || `/dashboard/hr-admin/${feature.id}`,
        parentId: "hr_admin",
        parentLabel: hrAdminLabel,
        searchText: [
          feature.title,
          feature.description,
          feature.category,
          feature.status,
          ...(feature.meta || []),
        ]
          .filter(Boolean)
          .join(" "),
      }));

      const externalGroupById = Object.fromEntries(
        externalApplicationGroups.map((group) => [group.id, group]),
      );
      const externalApplicationItems = getApplicationsForUser(auth.user)
        .filter((application) => application.type === "external")
        .map((application) => {
          const group = externalGroupById[application.groupId];

          return {
            ...application,
            parentId: group?.id,
            parentLabel: group?.label,
            searchText: [application.label, group?.label].filter(Boolean).join(" "),
          };
        });

      return [...sidebarItems, ...externalApplicationItems, ...hrAdminFeatureItems];
    },
    [auth.user, t],
  );

  const searchResults = useMemo(() => {
    const normalizedQuery = normalizeSearchText(searchValue.trim());

    if (!normalizedQuery) {
      return [];
    }

    return menuSearchItems.filter((item) => {
      const searchText = normalizeSearchText(item.searchText || item.label);

      return searchText.includes(normalizedQuery);
    });
  }, [menuSearchItems, searchValue]);

  useEffect(() => {
    if (!searchValue.trim()) {
      setSearchOpen(false);
    }
  }, [searchValue]);

  const handleLogout = async () => {
    await dispatch(logout());
    setAccountAnchor(null);
    notify({ message: t("notifications.logoutSuccess") });
    navigate("/login", { replace: true });
  };

  const handleSearchItemClick = (item) => {
    setSearchValue("");
    setSearchOpen(false);

    if (item.type === "external") {
      openExternalApplication(item.href);
      return;
    }

    navigate(item.to);
  };

  const handleNotificationClick = async (item) => {
    if (!item?.link) {
      return;
    }

    try {
      await markNotificationAsRead(item.id);
    } finally {
      setNotificationAnchor(null);
      openNotificationLink(item.link, navigate);
    }
  };

  return (
    <Box
      sx={{
        px: { xs: 2, md: 3 },
        py: 1.75,
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        backdropFilter: "blur(14px)",
        bgcolor: (theme) => alpha(theme.palette.background.default, 0.75),
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
      >
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{ minWidth: 0, flex: 1 }}
        >
          <IconButton
            onClick={onMenuClick}
            sx={{ display: { xs: "inline-flex", lg: "none" } }}
          >
            <MenuRoundedIcon />
          </IconButton>
          <IconButton
            onClick={onSidebarToggle}
            sx={{ display: { xs: "none", lg: "inline-flex" } }}
          >
            <MenuRoundedIcon />
          </IconButton>
          <ClickAwayListener onClickAway={() => setSearchOpen(false)}>
            <Box
              sx={{
                width: { xs: "100%", md: 320 },
                position: "relative",
              }}
            >
              <TextField
                size="small"
                value={searchValue}
                placeholder={`${t("common.search")}...`}
                fullWidth
                onFocus={() => {
                  if (searchValue.trim()) {
                    setSearchOpen(true);
                  }
                }}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setSearchValue(nextValue);
                  setSearchOpen(Boolean(nextValue.trim()));
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

              {searchOpen ? (
                <Paper
                  elevation={8}
                  sx={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    left: 0,
                    right: 0,
                    zIndex: (theme) => theme.zIndex.modal,
                    overflow: "hidden",
                  }}
                >
                  {searchResults.length ? (
                    <List disablePadding>
                      {searchResults.map((item, index) => (
                        <Box key={item.id}>
                          <ListItemButton
                            onClick={() => handleSearchItemClick(item)}
                            sx={{
                              px: 1.5,
                              py: 1.25,
                              alignItems: "flex-start",
                            }}
                          >
                            <ListItemText
                              primary={item.label}
                              secondary={
                                item.parentLabel
                                  ? t("topbar.searchResultParent", {
                                      defaultValue: "Menu: {{parent}}",
                                      parent: item.parentLabel,
                                    })
                                  : t("topbar.searchResultDirect", {
                                      defaultValue: "Main menu",
                                    })
                              }
                              secondaryTypographyProps={{
                                color: "text.secondary",
                                variant: "body2",
                              }}
                            />
                          </ListItemButton>
                          {index !== searchResults.length - 1 ? <Divider /> : null}
                        </Box>
                      ))}
                    </List>
                  ) : (
                    <Box sx={{ px: 1.5, py: 1.25 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t("topbar.searchNoResults", {
                          defaultValue: "No matching menu items.",
                        })}
                      </Typography>
                    </Box>
                  )}
                </Paper>
              ) : null}
            </Box>
          </ClickAwayListener>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <SettingsLauncher onClick={onOpenSettings} />
          <Tooltip title={t("topbar.notificationsTitle")}>
            <IconButton
              onClick={(event) => {
                setNotificationAnchor(event.currentTarget);
                void reloadNotifications();
              }}
            >
              <Badge
                badgeContent={unreadCount}
                color="error"
                max={99}
                overlap="circular"
              >
                <NotificationsNoneRoundedIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <Stack
            direction="row"
            spacing={1.25}
            alignItems="center"
            sx={{ pl: 1, cursor: "pointer" }}
            onClick={(event) => setAccountAnchor(event.currentTarget)}
          >
            <Avatar sx={{ bgcolor: "primary.main" }}>
              {auth.user?.displayName?.slice(0, 1) || "E"}
            </Avatar>
            <Box sx={{ display: { xs: "none", md: "block" } }}>
              <Typography variant="subtitle2">
                {auth.user?.displayName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {auth.user?.department || t("common.notAvailable")}
              </Typography>
            </Box>
            <ExpandMoreRoundedIcon
              sx={{
                color: "text.secondary",
                display: { xs: "none", md: "block" },
              }}
            />
          </Stack>
        </Stack>
      </Stack>

      <Popover
        open={Boolean(notificationAnchor)}
        anchorEl={notificationAnchor}
        onClose={() => setNotificationAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{ sx: { width: 360, mt: 1.5, p: 1 } }}
      >
        <Stack spacing={1}>
          <Box sx={{ px: 1.5, pt: 1 }}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="flex-start"
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="h6">
                  {t("topbar.notificationsTitle")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {notificationsError || t("topbar.notificationsSubtitle")}
                </Typography>
              </Box>
              <Tooltip title={t("actions.retry")}>
                <span>
                  <IconButton
                    size="small"
                    onClick={() => void reloadNotifications()}
                    disabled={notificationsLoading}
                  >
                    <RefreshRoundedIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Mark all as read">
                <span>
                  <IconButton
                    size="small"
                    onClick={() => void markAllNotificationsAsRead()}
                    disabled={!notifications.length || notificationsLoading}
                  >
                    <DoneRoundedIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          </Box>
          {notificationsLoading ? (
            <Stack spacing={1.25} sx={{ px: 1.5, pb: 1.5 }}>
              {Array.from({ length: 3 }).map((_, index) => (
                <Box key={index}>
                  <Skeleton variant="text" height={24} />
                  <Skeleton variant="text" height={20} width="85%" />
                </Box>
              ))}
            </Stack>
          ) : notifications.length ? (
            <List disablePadding>
              {notifications.map((item, index) => (
                <Box key={item.id}>
                  <ListItemButton
                    onClick={() => void handleNotificationClick(item)}
                    sx={{
                      px: 1.5,
                      py: 1.25,
                      alignItems: "flex-start",
                      cursor: item.link ? "pointer" : "default",
                    }}
                  >
                    <ListItemText
                      sx={{ pr: 5 }}
                      primary={item.title}
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.secondary"
                          >
                            {item.description || t("common.notAvailable")}
                          </Typography>
                          {item.time ? (
                            <>
                              <br />
                              <Typography
                                component="span"
                                variant="caption"
                                color="text.secondary"
                              >
                                {item.time}
                              </Typography>
                            </>
                          ) : null}
                        </>
                      }
                    />
                    <Tooltip title="Mark as read">
                      <span>
                        <IconButton
                          size="small"
                          edge="end"
                          onClick={(event) => {
                            event.stopPropagation();
                            void markNotificationAsRead(item.id);
                          }}
                          disabled={markingIds.includes(item.id)}
                        >
                          <DoneRoundedIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </ListItemButton>
                  {index !== notifications.length - 1 ? <Divider /> : null}
                </Box>
              ))}
            </List>
          ) : (
            <Box sx={{ px: 1.5, pb: 1.5 }}>
              <Typography variant="body2" color="text.secondary">
                {t("states.emptyDescription")}
              </Typography>
            </Box>
          )}
        </Stack>
      </Popover>

      <Menu
        anchorEl={accountAnchor}
        open={Boolean(accountAnchor)}
        onClose={() => setAccountAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{ sx: { width: 300, mt: 1.5 } }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle1">{auth.user?.displayName}</Typography>
          <Typography variant="body2" color="text.secondary">
            {auth.user?.email}
          </Typography>
          <Divider />
          <Typography variant="subtitle1" marginTop={0.5}>
            Job Title
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {auth.user?.jobTitle}
          </Typography>
          <Typography variant="subtitle1" marginTop={0.5}>
            Work Location
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {auth.user?.location}
          </Typography>
          <Typography variant="subtitle1" marginTop={0.5}>
            Company
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {auth.user?.company}
          </Typography>
        </Box>
        <Divider />
        <Button
          variant="contained"
          color="error"
          fullWidth
          sx={{ mt: 1 }}
          onClick={handleLogout}
        >
          <LogoutRoundedIcon /> {t("actions.signOut")}
        </Button>
      </Menu>
    </Box>
  );
}
