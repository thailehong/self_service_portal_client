import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import Groups2RoundedIcon from "@mui/icons-material/Groups2Rounded";
import GppGoodRoundedIcon from "@mui/icons-material/GppGoodRounded";
import MemoryRoundedIcon from "@mui/icons-material/MemoryRounded";
import DoneRoundedIcon from "@mui/icons-material/DoneRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import DragIndicatorRoundedIcon from "@mui/icons-material/DragIndicatorRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import ApprovalRoundedIcon from "@mui/icons-material/ApprovalRounded";
import PlaylistAddCheckRoundedIcon from "@mui/icons-material/PlaylistAddCheckRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { selectAuth } from "../features/auth/authSlice";
import {
  selectSettings,
  setDashboardHiddenSections,
  setDashboardSectionOrder,
  toggleDashboardSectionVisibility,
} from "../features/settings/settingsSlice";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { useAppSelector } from "../hooks/useAppSelector";
import { useNotifications } from "../hooks/useNotifications";
import { SectionCard } from "../components/layout/SectionCard";
import { openNotificationLink } from "../utils/notificationLinks";
import { workItemsApi } from "../services/api/workItemsApi";
import { portalFavoritesApi } from "../services/api/portalFavoritesApi";
import {
  getFavoriteApplicationOptions,
  getApplicationsForUser,
} from "../app/appRegistry";
import { launchExternalApplication } from "../app/applicationLaunch";
import { getErrorMessage } from "./workflow/workflowUtils";

function getUpdateIcon(updateId) {
  if (updateId === "update-hires") {
    return <Groups2RoundedIcon fontSize="small" />;
  }

  if (updateId === "update-policy") {
    return <GppGoodRoundedIcon fontSize="small" />;
  }

  return <MemoryRoundedIcon fontSize="small" />;
}

const dashboardCardSx = {
  height: "100%",
  borderRadius: 1,
  boxShadow: "none",
};

const dashboardContentSx = {
  height: "100%",
  display: "flex",
  flexDirection: "column",
  gap: 2.5,
};

const quickAccessIconColors = [
  "primary.main",
  "success.main",
  "warning.main",
  "secondary.main",
  "info.main",
  "error.main",
  "text.secondary",
];
const dashboardQuickAccessApplicationIds = [
  "eworkflow",
  "order_meal",
  "booking_bus",
  "help_center",
];

const prioritizedUserKeys = [
  "displayName",
  "employeeID",
  "email",
  "department",
  "BU",
  "bu",
  "jobTitle",
  "location",
  "company",
  "username",
  "firstName",
  "lastName",
  "authProvider",
];

const hiddenUserFieldKeys = new Set([
  "roles",
  "isactive",
  "createdat",
  "updatedat",
  "accounttype",
  "createdatutc",
  "ccn",
]);

function shouldHideUserField(key) {
  return hiddenUserFieldKeys.has(
    key.replace(/[_-]+/g, "").trim().toLowerCase(),
  );
}

function normalizeUserFieldKey(key) {
  const normalizedKey = key.replace(/[_-]+/g, "").trim().toLowerCase();

  if (normalizedKey === "employeeid") {
    return "employeeid";
  }

  return normalizedKey;
}

function formatUserFieldLabel(key, t) {
  const labelByKey = {
    displayName: t("dashboard.userInfoFields.displayName", {
      defaultValue: "Display name",
    }),
    employeeId: t("common.employeeId"),
    email: t("common.email"),
    department: t("common.department"),
    BU: "BU",
    bu: "BU",
    jobTitle: t("dashboard.userInfoFields.jobTitle", {
      defaultValue: "Job title",
    }),
    location: t("dashboard.userInfoFields.location", {
      defaultValue: "Location",
    }),
    company: t("dashboard.userInfoFields.company", {
      defaultValue: "Company",
    }),
    username: t("common.username"),
    firstName: t("common.firstName"),
    lastName: t("common.lastName"),
    authProvider: t("dashboard.userInfoFields.authProvider", {
      defaultValue: "Auth provider",
    }),
  };

  if (labelByKey[key]) {
    return labelByKey[key];
  }

  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatUserFieldValue(value, t) {
  if (value === null || value === undefined || value === "") {
    return t("common.notAvailable");
  }

  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : t("common.notAvailable");
  }

  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

function formatAnnouncementDate(date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getDashboardUserName(user) {
  if (!user || typeof user !== "object") {
    return "User";
  }

  return (
    user.displayName
    || user.fullName
    || user.name
    || [user.firstName, user.lastName].filter(Boolean).join(" ")
    || user.username
    || "User"
  );
}

function DashboardWelcomeHeader({ user, now }) {
  const displayName = getDashboardUserName(user);
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(now);
  const timeLabel = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(now);

  return (
    <Box
      sx={{
        width: "100%",
        display: "grid",
        gap: 2,
        gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) auto" },
        alignItems: "center",
      }}
    >
      <Stack spacing={0.75}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Welcome back,
        </Typography>
        <Typography variant="h3">{displayName}</Typography>
        <Typography variant="body2" color="text.secondary">
          Here's what's happening in your workspace today.
        </Typography>
      </Stack>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 1, sm: 2.5 }}
        divider={
          <Divider
            orientation="vertical"
            flexItem
            sx={{ display: { xs: "none", sm: "block" } }}
          />
        }
        alignItems={{ xs: "flex-start", sm: "center" }}
        sx={{
          color: "text.primary",
          justifySelf: { xs: "start", md: "end" },
          alignSelf: "center",
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <EventAvailableRoundedIcon fontSize="small" color="action" />
          <Typography variant="subtitle2">{dateLabel}</Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <AccessTimeRoundedIcon fontSize="small" color="action" />
          <Typography variant="subtitle2">{timeLabel}</Typography>
        </Stack>
      </Stack>
    </Box>
  );
}

function normalizeDashboardSectionOrder(order, sectionIds) {
  const safeOrder = Array.isArray(order) ? order : [];
  const normalizedOrder = safeOrder.filter(
    (sectionId, index) =>
      sectionIds.includes(sectionId) && safeOrder.indexOf(sectionId) === index,
  );
  const prioritySectionIds = [
    "workflow-stats",
    "quick-access",
    "favorite-applications",
    "announcements",
  ];
  const legacyGroupedSectionIds = ["tasks-favorites", "quick-announcements"];
  const orderWithoutLegacySections = normalizedOrder.filter(
    (sectionId) => !legacyGroupedSectionIds.includes(sectionId),
  );
  const priorityMissingSections = prioritySectionIds.filter(
    (sectionId) =>
      sectionIds.includes(sectionId) && !orderWithoutLegacySections.includes(sectionId),
  );
  const remainingMissingSections = sectionIds.filter(
    (sectionId) =>
      !orderWithoutLegacySections.includes(sectionId) &&
      !priorityMissingSections.includes(sectionId),
  );

  return [
    ...priorityMissingSections,
    ...orderWithoutLegacySections,
    ...remainingMissingSections,
  ];
}

function normalizeHiddenSections(hiddenSections, sectionIds) {
  const safeHiddenSections = Array.isArray(hiddenSections)
    ? hiddenSections
    : [];

  return safeHiddenSections.filter(
    (sectionId, index) =>
      sectionIds.includes(sectionId) &&
      safeHiddenSections.indexOf(sectionId) === index,
  );
}

function moveSection(order, draggedSectionId, targetSectionId, placement = "before") {
  if (
    !draggedSectionId ||
    !targetSectionId ||
    draggedSectionId === targetSectionId
  ) {
    return order;
  }

  const nextOrder = [...order];
  const draggedIndex = nextOrder.indexOf(draggedSectionId);
  if (draggedIndex === -1 || nextOrder.indexOf(targetSectionId) === -1) {
    return order;
  }

  nextOrder.splice(draggedIndex, 1);
  const targetIndex = nextOrder.indexOf(targetSectionId);

  if (targetIndex === -1) {
    return order;
  }

  nextOrder.splice(
    placement === "after" ? targetIndex + 1 : targetIndex,
    0,
    draggedSectionId,
  );

  return nextOrder;
}

function ApplicationTile({
  application,
  favorite,
  saving,
  variant = "horizontal",
  iconColor = "primary.main",
  showFavoriteAction = false,
  onOpen,
  onToggleFavorite,
}) {
  const Icon = application.icon;
  const isSquare = variant === "square";
  const isFavoriteTile = variant === "favorite";

  return (
    <Box
      component="button"
      type="button"
      onClick={() => onOpen(application)}
      sx={{
        width: isSquare ? "80%" : "100%",
        minHeight: isSquare ? 0 : 72,
        aspectRatio: isSquare || isFavoriteTile ? "1 / 1" : "auto",
        border: (theme) => `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        bgcolor: "background.paper",
        color: "text.primary",
        display: "flex",
        flexDirection: isSquare || isFavoriteTile ? "column" : "row",
        alignItems: "center",
        justifyContent: isSquare || isFavoriteTile ? "center" : "flex-start",
        gap: isSquare || isFavoriteTile ? 0.75 : 1.25,
        p: isSquare || isFavoriteTile ? 1 : 1.25,
        textAlign: isSquare || isFavoriteTile ? "center" : "left",
        cursor: "pointer",
        transition: "border-color 150ms ease, background-color 150ms ease",
        "&:hover": {
          borderColor: "primary.main",
          bgcolor: "action.hover",
        },
      }}
    >
      <Box
        sx={{
          width: isSquare || isFavoriteTile ? "auto" : 38,
          height: isSquare || isFavoriteTile ? "auto" : 38,
          borderRadius: isSquare || isFavoriteTile ? 0 : 1,
          display: "grid",
          placeItems: "center",
          color: isSquare || isFavoriteTile ? iconColor : "primary.main",
          bgcolor: isSquare || isFavoriteTile
            ? "transparent"
            : (theme) => theme.palette.action.hover,
          flexShrink: 0,
        }}
      >
        <Icon fontSize={isSquare || isFavoriteTile ? "large" : "small"} />
      </Box>
      <Typography
        variant="subtitle2"
        sx={{
          flex: isSquare || isFavoriteTile ? "0 1 auto" : 1,
          minWidth: 0,
          width: isSquare || isFavoriteTile ? "100%" : "auto",
          overflowWrap: "anywhere",
          lineHeight: 1.25,
          display: "-webkit-box",
          WebkitLineClamp: isSquare || isFavoriteTile ? 2 : "unset",
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {application.label}
      </Typography>
      {showFavoriteAction ? (
        <Tooltip title={favorite ? "Remove favorite" : "Add favorite"}>
          <span>
            <IconButton
              size="small"
              disabled={saving}
              onClick={(event) => {
                event.stopPropagation();
                onToggleFavorite(application);
              }}
              sx={{ flexShrink: 0 }}
            >
              {favorite ? (
                <StarRoundedIcon fontSize="small" color="warning" />
              ) : (
                <StarBorderRoundedIcon fontSize="small" />
              )}
            </IconButton>
          </span>
        </Tooltip>
      ) : null}
    </Box>
  );
}

function WorkflowStatCard({
  title,
  value,
  helper,
  icon,
  color,
  accentBg,
  onClick,
  loading,
}) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      aria-label={`${title}: ${helper}`}
      sx={{
        width: "100%",
        height: 192,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        bgcolor: "background.paper",
        color: "text.primary",
        p: 2.5,
        textAlign: "left",
        cursor: "pointer",
        "&:hover": {
          borderColor: color,
          bgcolor: "action.hover",
        },
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 1,
              display: "grid",
              placeItems: "center",
              bgcolor: accentBg,
              color,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
            {title}
          </Typography>
        </Stack>
        {loading ? (
          <Skeleton variant="text" width={72} height={56} />
        ) : (
          <Typography variant="h2" sx={{ color, lineHeight: 0.95 }}>
            {value}
          </Typography>
        )}
        <Typography variant="body2">{helper}</Typography>
      </Stack>
    </Box>
  );
}

function AddFavoriteTile({ onClick }) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        width: "100%",
        aspectRatio: "1 / 1",
        border: (theme) => `1px dashed ${theme.palette.primary.light}`,
        borderRadius: 1,
        bgcolor: "background.paper",
        color: "primary.main",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        p: 1,
        cursor: "pointer",
        "&:hover": {
          bgcolor: "action.hover",
          borderColor: "primary.main",
        },
      }}
    >
      <AddRoundedIcon fontSize="large" />
      <Typography variant="subtitle2">Add Favorite</Typography>
    </Box>
  );
}

export function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const auth = useAppSelector(selectAuth);
  const settings = useAppSelector(selectSettings);
  const {
    notifications,
    loading: notificationsLoading,
    error: notificationsError,
    markingIds,
    reloadNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useNotifications();
  const [draggedSectionId, setDraggedSectionId] = useState(null);
  const [dragOverSectionId, setDragOverSectionId] = useState(null);
  const [workflowStats, setWorkflowStats] = useState({
    tasks: 0,
    pendingApprovals: 0,
    inProgressRequests: 0,
    loading: false,
    error: "",
  });
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [favoritesError, setFavoritesError] = useState("");
  const [savingFavoriteIds, setSavingFavoriteIds] = useState([]);
  const [currentDateTime, setCurrentDateTime] = useState(() => new Date());

  const handleNotificationClick = useCallback(
    async (item) => {
      if (!item?.link) {
        return;
      }

      try {
        await markNotificationAsRead(item.id);
      } finally {
        openNotificationLink(item.link, navigate);
      }
    },
    [markNotificationAsRead, navigate],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadWorkflowStats() {
      setWorkflowStats((current) => ({ ...current, loading: true, error: "" }));
      try {
        const summary = await workItemsApi.getSummary();
        if (cancelled) {
          return;
        }

        setWorkflowStats({
          tasks: summary.tasks,
          pendingApprovals: summary.approvals,
          inProgressRequests: summary.requests,
          loading: false,
          error: "",
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        setWorkflowStats({
          tasks: 0,
          pendingApprovals: 0,
          inProgressRequests: 0,
          loading: false,
          error: getErrorMessage(error, "Could not load work inbox stats."),
        });
      }
    }

    void loadWorkflowStats();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadFavorites() {
      setFavoritesLoading(true);
      setFavoritesError("");
      try {
        const favorites = await portalFavoritesApi.getFavorites();
        if (!cancelled) {
          setFavoriteIds(favorites);
        }
      } catch (error) {
        if (!cancelled) {
          setFavoritesError(
            getErrorMessage(error, "Could not load favorite applications."),
          );
        }
      } finally {
        if (!cancelled) {
          setFavoritesLoading(false);
        }
      }
    }

    void loadFavorites();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleOpenApplication = useCallback(
    async (application) => {
      if (application.type === "external") {
        setFavoritesError("");
        try {
          await launchExternalApplication(application);
        } catch (error) {
          setFavoritesError(getErrorMessage(error, "Could not open application."));
        }
        return;
      }

      navigate(application.to);
    },
    [navigate],
  );

  const handleToggleFavorite = useCallback(
    async (application) => {
      const isFavorite = favoriteIds.includes(application.id);
      setFavoritesError("");
      setSavingFavoriteIds((current) => [...current, application.id]);

      try {
        if (isFavorite) {
          await portalFavoritesApi.removeFavorite(application.id);
          setFavoriteIds((current) =>
            current.filter((applicationId) => applicationId !== application.id),
          );
        } else {
          await portalFavoritesApi.addFavorite(application.id);
          setFavoriteIds((current) =>
            current.includes(application.id)
              ? current
              : [...current, application.id],
          );
        }
      } catch (error) {
        setFavoritesError(
          getErrorMessage(error, "Could not update favorite applications."),
        );
      } finally {
        setSavingFavoriteIds((current) =>
          current.filter((applicationId) => applicationId !== application.id),
        );
      }
    },
    [favoriteIds],
  );

  const announcements = useMemo(
    () => [
      {
        id: "maintenance",
        title: t("dashboard.announcementMaintenanceTitle", {
          defaultValue: "System Maintenance Notice - DMS Portal",
        }),
        description: t("dashboard.announcementMaintenanceDescription", {
          defaultValue:
            "The system will be upgraded from 00:00 to 04:00.",
        }),
        date: formatAnnouncementDate(new Date(Date.now() - 1 * 86400000)),
      },
      {
        id: "ewps-release",
        title: t("dashboard.announcementEwpsTitle", {
          defaultValue: "New eWPS Release is Now Available",
        }),
        description: t("dashboard.announcementEwpsDescription", {
          defaultValue:
            "Please check and use the latest version for your operations.",
        }),
        date: formatAnnouncementDate(new Date(Date.now() - 2 * 86400000)),
      },
      {
        id: "ppe-reminder",
        title: t("dashboard.announcementPpeTitle", {
          defaultValue: "Safety Reminder: PPE Compliance",
        }),
        description: t("dashboard.announcementPpeDescription", {
          defaultValue:
            "Please ensure proper PPE usage in all production areas.",
        }),
        date: formatAnnouncementDate(new Date(Date.now() - 3 * 86400000)),
      },
    ],
    [t],
  );

  const departmentUpdates = useMemo(
    () => [
      {
        id: "update-hires",
        title: t("dashboard.departmentUpdateHireTitle", {
          defaultValue: "New employees joined Operations and Finance",
        }),
        description: t("dashboard.departmentUpdateHireDescription", {
          defaultValue:
            "The company welcomed new team members this week and onboarding is now in progress across both departments.",
        }),
        badge: t("dashboard.departmentUpdateHireBadge", {
          defaultValue: "People",
        }),
      },
      {
        id: "update-policy",
        title: t("dashboard.departmentUpdatePolicyTitle", {
          defaultValue: "Policy acknowledgement window extended",
        }),
        description: t("dashboard.departmentUpdatePolicyDescription", {
          defaultValue:
            "Employees now have additional time to complete the latest policy review before the next compliance checkpoint.",
        }),
        badge: t("dashboard.departmentUpdatePolicyBadge", {
          defaultValue: "Policy",
        }),
      },
      {
        id: "update-it",
        title: t("dashboard.departmentUpdateTechTitle", {
          defaultValue:
            "Technology team published workspace maintenance notice",
        }),
        description: t("dashboard.departmentUpdateTechDescription", {
          defaultValue:
            "A scheduled maintenance window is planned for internal tools, with no expected interruption to employee sign-in.",
        }),
        badge: t("dashboard.departmentUpdateTechBadge", {
          defaultValue: "IT",
        }),
      },
    ],
    [t],
  );

  const userInfoItems = useMemo(() => {
    if (!auth.user || typeof auth.user !== "object") {
      return [];
    }

    const seenKeys = new Set();
    const orderedEntries = [];

    prioritizedUserKeys.forEach((key) => {
      const normalizedKey = normalizeUserFieldKey(key);
      if (
        Object.prototype.hasOwnProperty.call(auth.user, key) &&
        !shouldHideUserField(key) &&
        !seenKeys.has(normalizedKey)
      ) {
        orderedEntries.push([key, auth.user[key]]);
        seenKeys.add(normalizedKey);
      }
    });

    Object.entries(auth.user)
      .filter(([key]) => {
        const normalizedKey = normalizeUserFieldKey(key);
        return !seenKeys.has(normalizedKey) && !shouldHideUserField(key);
      })
      .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
      .forEach(([key, value]) => {
        orderedEntries.push([key, value]);
        seenKeys.add(normalizeUserFieldKey(key));
      });

    return orderedEntries.map(([key, value]) => ({
      key,
      label: formatUserFieldLabel(key, t),
      value: formatUserFieldValue(value, t),
    }));
  }, [auth.user, t]);

  const quickAccessApplications = useMemo(
    () => {
      const applicationsById = new Map(
        getApplicationsForUser(auth.user).map((application) => [
          application.id,
          application,
        ]),
      );

      return dashboardQuickAccessApplicationIds
        .map((applicationId) => applicationsById.get(applicationId))
        .filter(Boolean);
    },
    [auth.user],
  );

  const favoriteApplicationOptions = useMemo(
    () => getFavoriteApplicationOptions(auth.user),
    [auth.user],
  );

  const favoriteApplications = useMemo(
    () =>
      favoriteIds
        .map((applicationId) =>
          favoriteApplicationOptions.find(
            (application) => application.id === applicationId,
          ),
        )
        .filter(Boolean),
    [favoriteApplicationOptions, favoriteIds],
  );

  const myTaskCount = workflowStats.tasks;

  const sectionDefinitions = useMemo(
    () => [
      {
        id: "workflow-stats",
        managerLabel: "Dashboard stats",
        content: (
          <Box
            sx={{
              display: "grid",
              gap: 1.5,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(3, minmax(0, 1fr))",
              },
            }}
          >
            <WorkflowStatCard
              title="My tasks"
              value={myTaskCount}
              helper="Pending Tasks"
              icon={<AssignmentTurnedInRoundedIcon fontSize="small" />}
              color="success.main"
              accentBg="#E8F7EF"
              loading={workflowStats.loading}
              onClick={() => navigate("/dashboard/work-inbox?bucket=tasks")}
            />
            <WorkflowStatCard
              title="My Approval"
              value={workflowStats.pendingApprovals}
              helper="Pending Approvals"
              icon={<ApprovalRoundedIcon fontSize="small" />}
              color="primary.main"
              accentBg="#EAF1FF"
              loading={workflowStats.loading}
              onClick={() => navigate("/dashboard/work-inbox?bucket=approvals")}
            />
            <WorkflowStatCard
              title="My Request"
              value={workflowStats.inProgressRequests}
              helper="In Progress"
              icon={<PlaylistAddCheckRoundedIcon fontSize="small" />}
              color="secondary.main"
              accentBg="#F2E9FF"
              loading={workflowStats.loading}
              onClick={() => navigate("/dashboard/work-inbox?bucket=requests")}
            />
          </Box>
        ),
      },
      {
        id: "quick-access",
        managerLabel: "Quick Access",
        content: (
          <SectionCard
            title="Quick Access"
            action={
              <Button
                size="small"
                onClick={() => navigate("/dashboard/self-service")}
              >
                See all
              </Button>
            }
            cardSx={dashboardCardSx}
          >
            <Box
              sx={{
                display: "grid",
                gap: 1.5,
                gridTemplateColumns: {
                  xs: "repeat(2, minmax(0, 1fr))",
                  sm: "repeat(4, minmax(0, 1fr))",
                },
                justifyItems: "center",
              }}
            >
              {quickAccessApplications.map((application, index) => (
                <ApplicationTile
                  key={application.id}
                  application={application}
                  variant="square"
                  iconColor={
                    quickAccessIconColors[index % quickAccessIconColors.length]
                  }
                  onOpen={handleOpenApplication}
                />
              ))}
            </Box>
          </SectionCard>
        ),
      },
      {
        id: "favorite-applications",
        managerLabel: "Favorite applications",
        content: (
          <SectionCard
            title="Favorite applications"
            action={
              <Button
                size="small"
                onClick={() => navigate("/dashboard/utility-application")}
              >
                Manage
              </Button>
            }
            cardSx={{ ...dashboardCardSx, height: "auto" }}
          >
            <Stack spacing={2}>
              {favoritesError ? (
                <Alert severity="warning">{favoritesError}</Alert>
              ) : null}
              {favoritesLoading ? (
                <Box
                  sx={{
                    display: "grid",
                    gap: 1.5,
                    gridTemplateColumns: {
                      xs: "repeat(2, minmax(0, 1fr))",
                      sm: "repeat(3, minmax(0, 1fr))",
                      md: "repeat(5, minmax(0, 1fr))",
                    },
                  }}
                >
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton
                      key={index}
                      variant="rounded"
                      sx={{ aspectRatio: "1 / 1" }}
                    />
                  ))}
                </Box>
              ) : (
                <Box
                  sx={{
                    display: "grid",
                    gap: 1.5,
                    gridTemplateColumns: {
                      xs: "repeat(2, minmax(0, 1fr))",
                      sm: "repeat(3, minmax(0, 1fr))",
                      md: "repeat(5, minmax(0, 1fr))",
                    },
                  }}
                >
                  {favoriteApplications.map((application, index) => (
                    <ApplicationTile
                      key={application.id}
                      application={application}
                      variant="favorite"
                      iconColor={
                        quickAccessIconColors[index % quickAccessIconColors.length]
                      }
                      onOpen={handleOpenApplication}
                    />
                  ))}
                  <AddFavoriteTile
                    onClick={() => navigate("/dashboard/utility-application")}
                  />
                </Box>
              )}
            </Stack>
          </SectionCard>
        ),
      },
      {
        id: "announcements",
        managerLabel: "Announcements",
        content: (
          <SectionCard
            title="Announcements"
            action={<Button size="small">View all</Button>}
            cardSx={{ ...dashboardCardSx, height: "auto" }}
          >
            <Stack spacing={0} divider={<Divider flexItem />}>
              {announcements.map((item) => (
                <Stack
                  key={item.id}
                  direction="row"
                  spacing={1.75}
                  alignItems="flex-start"
                  sx={{ py: 1.5 }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      display: "grid",
                      placeItems: "center",
                      color: "primary.main",
                      flexShrink: 0,
                    }}
                  >
                    <CampaignRoundedIcon fontSize="small" />
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Stack
                      direction="row"
                      spacing={2}
                      justifyContent="space-between"
                      alignItems="flex-start"
                    >
                      <Typography variant="subtitle2">{item.title}</Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ whiteSpace: "nowrap", pt: 0.25 }}
                      >
                        {item.date}
                      </Typography>
                    </Stack>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      {item.description}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </SectionCard>
        ),
      },
      {
        id: "user-info",
        managerLabel: t("dashboard.userInfoSectionTitle", {
          defaultValue: "User Information",
        }),
        fullWidth: true,
        content: (
          <SectionCard
            title={t("dashboard.userInfoSectionTitle", {
              defaultValue: "User Information",
            })}
            action={<AccountCircleRoundedIcon color="action" />}
          >
            {userInfoItems.length ? (
              <Box
                sx={{
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "repeat(2, minmax(0, 1fr))",
                    xl: "repeat(3, minmax(0, 1fr))",
                  },
                }}
              >
                {userInfoItems.map((item) => (
                  <Box
                    key={item.key}
                    sx={{
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                      borderRadius: 1,
                      p: 2,
                      minWidth: 0,
                    }}
                  >
                    <Typography
                      variant="overline"
                      color="text.secondary"
                      sx={{ display: "block", lineHeight: 1.4 }}
                    >
                      {item.label}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        mt: 0.75,
                        whiteSpace: "pre-wrap",
                        overflowWrap: "anywhere",
                        wordBreak: "break-word",
                      }}
                    >
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {t("common.notAvailable")}
              </Typography>
            )}
          </SectionCard>
        ),
      },
      {
        id: "notifications",
        managerLabel: t("dashboard.notificationsSectionTitle", {
          defaultValue: "Notifications",
        }),
        content: (
          <SectionCard
            title={t("dashboard.notificationsSectionTitle", {
              defaultValue: "Notifications",
            })}
            action={
              <Stack direction="row" spacing={0.5} alignItems="center">
                <NotificationsRoundedIcon color="action" />
                <IconButton
                  size="small"
                  onClick={() => void reloadNotifications()}
                  disabled={notificationsLoading}
                >
                  <RefreshRoundedIcon fontSize="small" />
                </IconButton>
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
            }
            cardSx={dashboardCardSx}
            contentSx={dashboardContentSx}
          >
            <Stack spacing={0} divider={<Divider flexItem />} sx={{ flex: 1 }}>
              {notificationsLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <Stack key={index} spacing={0.75} sx={{ py: 1.75 }}>
                    <Skeleton variant="text" height={24} width="70%" />
                    <Skeleton variant="text" height={20} />
                    <Skeleton variant="text" height={18} width="35%" />
                  </Stack>
                ))
              ) : notificationsError ? (
                <Stack spacing={1.5} sx={{ py: 1.75 }}>
                  <Typography variant="body2" color="error">
                    {notificationsError}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ alignSelf: "flex-start" }}
                    onClick={() => void reloadNotifications()}
                  >
                    {t("actions.retry")}
                  </Button>
                </Stack>
              ) : notifications.length ? (
                notifications.map((item) => (
                  <Stack
                    key={item.id}
                    direction="row"
                    spacing={1.5}
                    alignItems="flex-start"
                    onClick={() => void handleNotificationClick(item)}
                    sx={{
                      py: 1.75,
                      cursor: item.link ? "pointer" : "default",
                    }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        border: (theme) => `1px solid ${theme.palette.divider}`,
                        borderRadius: 1,
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      <NotificationsRoundedIcon
                        fontSize="small"
                        color="primary"
                      />
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        spacing={2}
                        alignItems="flex-start"
                      >
                        <Typography variant="subtitle2">
                          {item.title}
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ whiteSpace: "nowrap" }}
                          >
                            {item.time}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={(event) => {
                              event.stopPropagation();
                              void markNotificationAsRead(item.id);
                            }}
                            disabled={markingIds.includes(item.id)}
                          >
                            <DoneRoundedIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Stack>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        {item.description || t("common.notAvailable")}
                      </Typography>
                    </Box>
                  </Stack>
                ))
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ py: 1.75 }}
                >
                  {t("states.emptyDescription")}
                </Typography>
              )}
            </Stack>
          </SectionCard>
        ),
      },
      {
        id: "department-updates",
        managerLabel: t("dashboard.departmentUpdatesSectionTitle", {
          defaultValue: "Department Updates",
        }),
        content: (
          <SectionCard
            title={t("dashboard.departmentUpdatesSectionTitle", {
              defaultValue: "Department Updates",
            })}
            action={<CampaignRoundedIcon color="action" />}
            cardSx={dashboardCardSx}
            contentSx={dashboardContentSx}
          >
            <Box sx={{ pb: 0.5 }}>
              <Chip
                label={departmentUpdates[0].badge}
                size="small"
                variant="outlined"
                sx={{ mb: 1.25 }}
              />
              <Typography variant="h5">{departmentUpdates[0].title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {departmentUpdates[0].description}
              </Typography>
            </Box>

            <Stack spacing={0} divider={<Divider flexItem />} sx={{ flex: 1 }}>
              {departmentUpdates.slice(1).map((item) => (
                <Stack
                  key={item.id}
                  direction="row"
                  spacing={1.5}
                  alignItems="flex-start"
                  sx={{ py: 1.75 }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                      borderRadius: 1,
                      display: "grid",
                      placeItems: "center",
                      color: "text.secondary",
                      flexShrink: 0,
                    }}
                  >
                    {getUpdateIcon(item.id)}
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      spacing={2}
                      alignItems="flex-start"
                    >
                      <Typography variant="subtitle2">{item.title}</Typography>
                      <Chip
                        label={item.badge}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      {item.description}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </SectionCard>
        ),
      },
    ],
    [
      announcements,
      departmentUpdates,
      favoriteApplications,
      favoritesError,
      favoritesLoading,
      handleOpenApplication,
      handleNotificationClick,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      markingIds,
      myTaskCount,
      navigate,
      notifications,
      notificationsError,
      notificationsLoading,
      quickAccessApplications,
      reloadNotifications,
      t,
      userInfoItems,
      workflowStats.inProgressRequests,
      workflowStats.loading,
      workflowStats.pendingApprovals,
    ],
  );

  const sectionIds = useMemo(
    () => sectionDefinitions.map((section) => section.id),
    [sectionDefinitions],
  );

  const orderedSectionIds = useMemo(
    () =>
      normalizeDashboardSectionOrder(
        settings.dashboardSectionOrder,
        sectionIds,
      ),
    [sectionIds, settings.dashboardSectionOrder],
  );

  const hiddenSectionIds = useMemo(
    () => normalizeHiddenSections(settings.dashboardHiddenSections, sectionIds),
    [sectionIds, settings.dashboardHiddenSections],
  );

  const hiddenSectionIdSet = useMemo(
    () => new Set(hiddenSectionIds),
    [hiddenSectionIds],
  );

  const sectionsById = useMemo(
    () =>
      Object.fromEntries(
        sectionDefinitions.map((section) => [section.id, section]),
      ),
    [sectionDefinitions],
  );

  const visibleSections = useMemo(
    () =>
      orderedSectionIds
        .filter(
          (sectionId) =>
            sectionsById[sectionId] && !hiddenSectionIdSet.has(sectionId),
        )
        .map((sectionId) => sectionsById[sectionId]),
    [hiddenSectionIdSet, orderedSectionIds, sectionsById],
  );

  const clearDragState = () => {
    setDraggedSectionId(null);
    setDragOverSectionId(null);
  };

  const handleToggleSectionVisibility = (sectionId) => {
    dispatch(toggleDashboardSectionVisibility(sectionId));
  };

  const handleShowAllSections = () => {
    dispatch(setDashboardHiddenSections([]));
  };

  const handleDragStart = (sectionId) => (event) => {
    setDraggedSectionId(sectionId);
    setDragOverSectionId(sectionId);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", sectionId);
  };

  const handleDragOver = (sectionId) => (event) => {
    if (!draggedSectionId || draggedSectionId === sectionId) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDragOverSectionId(sectionId);
  };

  const handleDrop = (targetSectionId) => (event) => {
    event.preventDefault();

    const sourceSectionId =
      draggedSectionId || event.dataTransfer.getData("text/plain");
    const targetRect = event.currentTarget.getBoundingClientRect();
    const placement =
      event.clientY > targetRect.top + targetRect.height / 2 ? "after" : "before";

    clearDragState();

    if (!sourceSectionId || sourceSectionId === targetSectionId) {
      return;
    }

    dispatch(
      setDashboardSectionOrder(
        moveSection(
          orderedSectionIds,
          sourceSectionId,
          targetSectionId,
          placement,
        ),
      ),
    );
  };

  return (
    <Stack spacing={3.5}>
      <DashboardWelcomeHeader user={auth.user} now={currentDateTime} />

      <Stack spacing={3}>
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" },
            alignItems: "start",
          }}
        >
          {visibleSections.map((section) => {
            const isDragging = draggedSectionId === section.id;
            const isDropTarget =
              dragOverSectionId === section.id &&
              draggedSectionId !== section.id;

            return (
              <Box
                key={section.id}
                draggable
                onDragStart={handleDragStart(section.id)}
                onDragOver={handleDragOver(section.id)}
                onDrop={handleDrop(section.id)}
                onDragEnd={clearDragState}
                sx={{
                  minWidth: 0,
                  cursor: "grab",
                  borderRadius: 1,
                  opacity: isDragging ? 0.55 : 1,
                  outline: isDropTarget
                    ? (theme) => `2px dashed ${theme.palette.primary.main}`
                    : "none",
                  outlineOffset: 4,
                  transform: isDropTarget ? "translateY(-2px)" : "none",
                  transition: "transform 150ms ease, opacity 150ms ease",
                }}
              >
                {section.content}
              </Box>
            );
          })}
        </Box>

        {!visibleSections.length ? (
          <Box
            sx={{
              border: (theme) => `1px dashed ${theme.palette.divider}`,
              borderRadius: 1,
              p: 3,
            }}
          >
            <Stack spacing={1.5}>
              <Typography variant="h6">
                {t("dashboard.allSectionsHiddenTitle", {
                  defaultValue: "All sections are hidden",
                })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("dashboard.allSectionsHiddenDescription", {
                  defaultValue:
                    "Use the controls below to show the sections you want to keep on this dashboard.",
                })}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                sx={{ alignSelf: "flex-start" }}
                onClick={handleShowAllSections}
              >
                {t("dashboard.showAllSectionsAction", {
                  defaultValue: "Show all sections",
                })}
              </Button>
            </Stack>
          </Box>
        ) : null}

        <Box
          sx={{
            border: (theme) => `1px dashed ${theme.palette.divider}`,
            borderRadius: 1,
            px: { xs: 2, md: 2.5 },
            py: 2,
          }}
        >
          <Stack
            direction={{ xs: "column", xl: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", xl: "center" }}
          >
            <Stack spacing={0.75}>
              <Stack direction="row" spacing={1} alignItems="center">
                <DragIndicatorRoundedIcon color="primary" fontSize="small" />
                <Typography variant="subtitle1">
                  {t("dashboard.sectionManagerTitle", {
                    defaultValue: "Customize sections",
                  })}
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {t("dashboard.sectionManagerDescription", {
                  defaultValue:
                    "Drag cards to change their order. Click a chip to hide or show a section.",
                })}
              </Typography>
            </Stack>

            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                alignItems: "stretch",
                width: "100%",
                justifyContent: { xs: "stretch", xl: "flex-end" },
              }}
            >
              {orderedSectionIds.map((sectionId) => {
                const section = sectionsById[sectionId];

                if (!section) {
                  return null;
                }

                const hidden = hiddenSectionIdSet.has(sectionId);

                return (
                  <Chip
                    key={section.id}
                    icon={
                      hidden ? (
                        <VisibilityOffRoundedIcon />
                      ) : (
                        <VisibilityRoundedIcon />
                      )
                    }
                    label={section.managerLabel}
                    onClick={() => handleToggleSectionVisibility(section.id)}
                    variant={hidden ? "outlined" : "filled"}
                    color={hidden ? "default" : "primary"}
                    sx={{
                      opacity: hidden ? 0.8 : 1,
                      height: { xs: "auto", sm: 36 },
                      minHeight: 32,
                      width: { xs: "100%", sm: "auto" },
                      minWidth: { sm: 160 },
                      maxWidth: { xs: "100%", sm: 220, xl: 240 },
                      justifyContent: { xs: "flex-start", sm: "center" },
                      borderRadius: 999,
                      "& .MuiChip-icon": {
                        ml: 1,
                        mr: { xs: 0.75, sm: 0.5 },
                      },
                      "& .MuiChip-label": {
                        display: "block",
                        whiteSpace: { xs: "normal", sm: "nowrap" },
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        overflowWrap: { xs: "anywhere", sm: "normal" },
                        lineHeight: { xs: 1.3, sm: "32px" },
                        py: { xs: 0.75, sm: 0 },
                        px: { xs: 0.5, sm: 0.75 },
                      },
                    }}
                  />
                );
              })}

              {hiddenSectionIds.length ? (
                <Button
                  size="small"
                  onClick={handleShowAllSections}
                  sx={{
                    width: { xs: "100%", sm: "auto" },
                    alignSelf: "stretch",
                  }}
                >
                  {t("dashboard.showAllSectionsAction", {
                    defaultValue: "Show all sections",
                  })}
                </Button>
              ) : null}
            </Box>
          </Stack>
        </Box>
      </Stack>
    </Stack>
  );
}
