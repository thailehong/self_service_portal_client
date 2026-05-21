import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
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
import { useTranslation } from "react-i18next";
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
import { PageHeader } from "../components/layout/PageHeader";
import { SectionCard } from "../components/layout/SectionCard";
import { formatDateLabel } from "../utils/formatters";

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

const prioritizedUserKeys = [
  "displayName",
  "employeeID",
  "email",
  "department",
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
  "bu",
]);

function shouldHideUserField(key) {
  return hiddenUserFieldKeys.has(
    key.replace(/[_-]+/g, "").trim().toLowerCase(),
  );
}

function formatUserFieldLabel(key, t) {
  const labelByKey = {
    displayName: t("dashboard.userInfoFields.displayName", {
      defaultValue: "Display name",
    }),
    employeeId: t("common.employeeId"),
    email: t("common.email"),
    department: t("common.department"),
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

function normalizeDashboardSectionOrder(order, sectionIds) {
  const safeOrder = Array.isArray(order) ? order : [];
  const normalizedOrder = safeOrder.filter(
    (sectionId, index) =>
      sectionIds.includes(sectionId) && safeOrder.indexOf(sectionId) === index,
  );

  return [
    ...normalizedOrder,
    ...sectionIds.filter((sectionId) => !normalizedOrder.includes(sectionId)),
  ];
}

function normalizeHiddenSections(hiddenSections, sectionIds) {
  const safeHiddenSections = Array.isArray(hiddenSections) ? hiddenSections : [];

  return safeHiddenSections.filter(
    (sectionId, index) =>
      sectionIds.includes(sectionId) &&
      safeHiddenSections.indexOf(sectionId) === index,
  );
}

function moveSection(order, draggedSectionId, targetSectionId) {
  if (!draggedSectionId || !targetSectionId || draggedSectionId === targetSectionId) {
    return order;
  }

  const nextOrder = [...order];
  const draggedIndex = nextOrder.indexOf(draggedSectionId);
  const targetIndex = nextOrder.indexOf(targetSectionId);

  if (draggedIndex === -1 || targetIndex === -1) {
    return order;
  }

  nextOrder.splice(draggedIndex, 1);
  nextOrder.splice(targetIndex, 0, draggedSectionId);

  return nextOrder;
}

export function DashboardPage() {
  const { t } = useTranslation();
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
  } = useNotifications();
  const [draggedSectionId, setDraggedSectionId] = useState(null);
  const [dragOverSectionId, setDragOverSectionId] = useState(null);

  const upcomingEvent = useMemo(
    () => ({
      title: t("dashboard.upcomingEventTitle", {
        defaultValue: "Quarterly Town Hall",
      }),
      description: t("dashboard.upcomingEventDescription", {
        defaultValue:
          "Leadership will share business updates, new initiatives, and open Q&A with employees.",
      }),
      schedule: formatDateLabel(new Date(Date.now() + 5 * 86400000)),
      location: t("dashboard.upcomingEventLocation", {
        defaultValue: "Main auditorium and livestream",
      }),
    }),
    [t],
  );

  const upcomingTrainings = useMemo(
    () => [
      {
        id: "training-security",
        title: t("dashboard.trainingSecurityTitle", {
          defaultValue: "Security Awareness Refresher",
        }),
        description: t("dashboard.trainingSecurityDescription", {
          defaultValue:
            "Review current phishing patterns, safe handling rules, and incident reporting steps.",
        }),
        schedule: formatDateLabel(new Date(Date.now() + 2 * 86400000)),
      },
      {
        id: "training-manager",
        title: t("dashboard.trainingManagerTitle", {
          defaultValue: "Manager Onboarding Toolkit",
        }),
        description: t("dashboard.trainingManagerDescription", {
          defaultValue:
            "A short session for new managers covering approvals, policy acknowledgements, and team workflows.",
        }),
        schedule: formatDateLabel(new Date(Date.now() + 7 * 86400000)),
      },
      {
        id: "training-compliance",
        title: t("dashboard.trainingComplianceTitle", {
          defaultValue: "Compliance Documentation Basics",
        }),
        description: t("dashboard.trainingComplianceDescription", {
          defaultValue:
            "Walk through the latest documentation standards for audit-ready employee records.",
        }),
        schedule: formatDateLabel(new Date(Date.now() + 11 * 86400000)),
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
          defaultValue: "Technology team published workspace maintenance notice",
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

  const breadcrumbs = [
    { label: t("dashboard.breadcrumbs.root"), to: "/" },
    { label: t("dashboard.breadcrumbs.current") },
  ];

  const userInfoItems = useMemo(() => {
    if (!auth.user || typeof auth.user !== "object") {
      return [];
    }

    const seenKeys = new Set();
    const orderedEntries = [];

    prioritizedUserKeys.forEach((key) => {
      if (
        Object.prototype.hasOwnProperty.call(auth.user, key) &&
        !shouldHideUserField(key)
      ) {
        orderedEntries.push([key, auth.user[key]]);
        seenKeys.add(key);
      }
    });

    Object.entries(auth.user)
      .filter(([key]) => !seenKeys.has(key) && !shouldHideUserField(key))
      .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
      .forEach((entry) => orderedEntries.push(entry));

    return orderedEntries.map(([key, value]) => ({
      key,
      label: formatUserFieldLabel(key, t),
      value: formatUserFieldValue(value, t),
    }));
  }, [auth.user, t]);

  const sectionDefinitions = useMemo(
    () => [
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
            subtitle={t("dashboard.userInfoSectionSubtitle", {
              defaultValue:
                "All profile fields currently available in the authenticated session.",
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
            subtitle={t("dashboard.notificationsSectionSubtitle", {
              defaultValue: "All recent notifications for the current user.",
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
                        flexShrink: 0,
                      }}
                    >
                      <NotificationsRoundedIcon fontSize="small" color="primary" />
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        spacing={2}
                        alignItems="flex-start"
                      >
                        <Typography variant="subtitle2">{item.title}</Typography>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ whiteSpace: "nowrap" }}
                          >
                            {item.time}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => void markNotificationAsRead(item.id)}
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
        id: "events-training",
        managerLabel: t("dashboard.eventsTrainingSectionTitle", {
          defaultValue: "Events and Training",
        }),
        content: (
          <SectionCard
            title={t("dashboard.eventsTrainingSectionTitle", {
              defaultValue: "Events and Training",
            })}
            subtitle={t("dashboard.eventsTrainingSectionSubtitle", {
              defaultValue:
                "Upcoming company events and employee training sessions.",
            })}
            action={<EventAvailableRoundedIcon color="action" />}
            cardSx={dashboardCardSx}
            contentSx={dashboardContentSx}
          >
            <Box
              sx={{
                border: (theme) => `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                p: 2.25,
              }}
            >
              <Stack spacing={1.5}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  spacing={2}
                  alignItems="center"
                >
                  <Chip
                    label={t("dashboard.upcomingEventLabel", {
                      defaultValue: "Upcoming event",
                    })}
                    size="small"
                    variant="outlined"
                  />
                  <Typography variant="subtitle2" color="text.secondary">
                    {upcomingEvent.schedule}
                  </Typography>
                </Stack>
                <Typography variant="h6">{upcomingEvent.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {upcomingEvent.description}
                </Typography>
                <Divider />
                <Stack direction="row" spacing={1} alignItems="center">
                  <AccessTimeRoundedIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {upcomingEvent.location}
                  </Typography>
                </Stack>
              </Stack>
            </Box>

            <Stack spacing={0} divider={<Divider flexItem />} sx={{ flex: 1 }}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ pb: 1.5 }}
              >
                <SchoolRoundedIcon color="action" fontSize="small" />
                <Typography variant="subtitle1">
                  {t("dashboard.upcomingTrainingLabel", {
                    defaultValue: "Upcoming trainings",
                  })}
                </Typography>
              </Stack>

              {upcomingTrainings.map((item) => (
                <Stack
                  key={item.id}
                  direction="row"
                  spacing={1.5}
                  alignItems="flex-start"
                  sx={{ py: 1.75 }}
                >
                  <Box sx={{ width: 86, flexShrink: 0 }}>
                    <Typography variant="caption" color="text.secondary">
                      {item.schedule}
                    </Typography>
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="subtitle2">{item.title}</Typography>
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
        id: "department-updates",
        managerLabel: t("dashboard.departmentUpdatesSectionTitle", {
          defaultValue: "Department Updates",
        }),
        content: (
          <SectionCard
            title={t("dashboard.departmentUpdatesSectionTitle", {
              defaultValue: "Department Updates",
            })}
            subtitle={t("dashboard.departmentUpdatesSectionSubtitle", {
              defaultValue:
                "Company news, new employees, and internal department updates.",
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
                      <Chip label={item.badge} size="small" variant="outlined" />
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
      departmentUpdates,
      markNotificationAsRead,
      markingIds,
      notifications,
      notificationsError,
      notificationsLoading,
      reloadNotifications,
      t,
      upcomingEvent,
      upcomingTrainings,
      userInfoItems,
    ],
  );

  const sectionIds = useMemo(
    () => sectionDefinitions.map((section) => section.id),
    [sectionDefinitions],
  );

  const orderedSectionIds = useMemo(
    () =>
      normalizeDashboardSectionOrder(settings.dashboardSectionOrder, sectionIds),
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
      Object.fromEntries(sectionDefinitions.map((section) => [section.id, section])),
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

    clearDragState();

    if (!sourceSectionId || sourceSectionId === targetSectionId) {
      return;
    }

    dispatch(
      setDashboardSectionOrder(
        moveSection(orderedSectionIds, sourceSectionId, targetSectionId),
      ),
    );
  };

  return (
    <Stack spacing={3.5}>
      <PageHeader
        breadcrumbs={breadcrumbs}
        title={t("dashboard.title")}
        subtitle={t("dashboard.subtitle")}
      />

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
                    hidden ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />
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

      {visibleSections.length ? (
        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: { xs: "1fr", lg: "repeat(3, minmax(0, 1fr))" },
            alignItems: "stretch",
          }}
        >
          {visibleSections.map((section) => {
            const isDragging = draggedSectionId === section.id;
            const isDropTarget =
              dragOverSectionId === section.id && draggedSectionId !== section.id;

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
                  gridColumn: section.fullWidth
                    ? { xs: "auto", lg: "1 / -1" }
                    : "auto",
                  opacity: isDragging ? 0.55 : 1,
                  outline: isDropTarget
                    ? (theme) => `2px dashed ${theme.palette.primary.main}`
                    : "none",
                  outlineOffset: 4,
                  transform: isDropTarget ? "translateY(-4px)" : "none",
                  transition: "transform 150ms ease, opacity 150ms ease",
                }}
              >
                {section.content}
              </Box>
            );
          })}
        </Box>
      ) : (
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
                  "Use the controls above to show the sections you want to keep on this dashboard.",
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
      )}
    </Stack>
  );
}
