import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import AssignmentIndRoundedIcon from "@mui/icons-material/AssignmentIndRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import SpeedRoundedIcon from "@mui/icons-material/SpeedRounded";
import Groups2RoundedIcon from "@mui/icons-material/Groups2Rounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import TimelapseRoundedIcon from "@mui/icons-material/TimelapseRounded";
import BugReportRoundedIcon from "@mui/icons-material/BugReportRounded";
import { useTranslation } from "react-i18next";
import { AppDataTable } from "../components/datatable/AppDataTable";
import { PageHeader } from "../components/layout/PageHeader";
import { SectionCard } from "../components/layout/SectionCard";
import { AdminIssuesPanel } from "./admin/AdminIssuesPanel";
import { useNotifier } from "../hooks/useNotifier";
import { administratorTelemetryApi } from "../services/api/administratorTelemetryApi";
import { masterDataApi } from "../services/api/masterDataApi";
import { roleApi } from "../services/api/roleApi";

const initialRoleForm = {
  name: "",
  siteId: "",
  site: "",
  ccn: "",
  bu: "",
  department: "",
};

const roleNameOptions = ["Admin", "Worker", "Staff", "Supervisor", "Manager", "Executive"];

function getErrorMessage(error, fallback) {
  const responseData = error.response?.data;

  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  return (
    responseData?.detail ||
    responseData?.message ||
    responseData?.title ||
    error.message ||
    fallback
  );
}

function formatRoleScope(role) {
  return [role.site, role.bu, role.department].filter(Boolean).join(" / ");
}

function formatRoleLabel(role) {
  const scope = formatRoleScope(role);
  return scope ? `${role.roleName} - ${scope}` : role.roleName;
}

function formatSiteLabel(site) {
  return [site.siteCode, site.siteName].filter(Boolean).join(" - ");
}

function getSiteFormValue(site) {
  return site.siteCode || site.siteName || "";
}

function formatCcnLabel(ccn) {
  return [ccn.code, ccn.name].filter(Boolean).join(" - ") || ccn.ccn;
}

function getCcnFormValue(ccn) {
  return formatCcnLabel(ccn) || ccn.ccn || "";
}

function matchesSite(site, value) {
  const normalizedValue = String(value || "").trim().toLowerCase();
  return [site.siteCode, site.siteName, formatSiteLabel(site)]
    .filter(Boolean)
    .some((item) => String(item).trim().toLowerCase() === normalizedValue);
}

function matchesCcn(ccn, value) {
  const normalizedValue = String(value || "").trim().toLowerCase();
  return [ccn.ccn, ccn.code, ccn.name, formatCcnLabel(ccn)]
    .filter(Boolean)
    .some((item) => String(item).trim().toLowerCase() === normalizedValue);
}

function formatDateInput(date) {
  return date.toISOString().slice(0, 10);
}

function formatDateTimeLabel(value) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatVietnamDateTimeLabel(value) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  }).format(date);
}

function formatNumber(value) {
  return new Intl.NumberFormat().format(Number(value) || 0);
}

function formatDuration(value) {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }

  return `${formatNumber(Math.round(Number(value) || 0))} ms`;
}

function buildDefaultMonitoringFilters() {
  const today = new Date();
  const from = new Date(today);
  from.setDate(today.getDate() - 29);

  return {
    granularity: "day",
    from: formatDateInput(from),
    to: formatDateInput(today),
  };
}

function MetricCard({ title, value, helper, icon }) {
  return (
    <Box
      sx={{
        border: (theme) => `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        p: 2,
        minWidth: 0,
        bgcolor: "background.default",
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1,
            display: "grid",
            placeItems: "center",
            color: "primary.main",
            bgcolor: "action.hover",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Stack spacing={0.5} sx={{ minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h5" sx={{ overflowWrap: "anywhere" }}>
            {value}
          </Typography>
          {helper ? (
            <Typography variant="body2" color="text.secondary">
              {helper}
            </Typography>
          ) : null}
        </Stack>
      </Stack>
    </Box>
  );
}

export function AdministratorPage() {
  const { t } = useTranslation();
  const { notify } = useNotifier();
  const [username, setUsername] = useState("");
  const [roles, setRoles] = useState([]);
  const [roleAssignments, setRoleAssignments] = useState([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [roleAssignmentsLoading, setRoleAssignmentsLoading] = useState(false);
  const [rolesError, setRolesError] = useState("");
  const [roleAssignmentsError, setRoleAssignmentsError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [roleForm, setRoleForm] = useState(initialRoleForm);
  const [roleCreateError, setRoleCreateError] = useState("");
  const [roleCreating, setRoleCreating] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [deletingAssignmentId, setDeletingAssignmentId] = useState(null);
  const [editingRole, setEditingRole] = useState(null);
  const [sites, setSites] = useState([]);
  const [ccns, setCcns] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roleMasterLoading, setRoleMasterLoading] = useState(false);
  const [roleMasterError, setRoleMasterError] = useState("");
  const [activeTab, setActiveTab] = useState("access");
  const [monitoringFilters, setMonitoringFilters] = useState(
    buildDefaultMonitoringFilters,
  );
  const [monitoringLoading, setMonitoringLoading] = useState({
    overview: false,
    activeUsers: false,
    apiPerformance: false,
    recentRequests: false,
  });
  const [monitoringError, setMonitoringError] = useState("");
  const [monitoringOverview, setMonitoringOverview] = useState(null);
  const [activeUsers, setActiveUsers] = useState({
    activeNow: 0,
    activeLastFiveMinutes: 0,
    users: [],
  });
  const [apiPerformance, setApiPerformance] = useState([]);
  const [recentApiRequests, setRecentApiRequests] = useState([]);

  const selectedRoles = useMemo(
    () => roles.filter((role) => selectedRoleIds.includes(role.id)),
    [roles, selectedRoleIds],
  );

  const roleColumns = useMemo(
    () => [
      {
        id: "roleName",
        label: "Role",
        render: (row) => (
          <Stack spacing={0.25} sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2">{row.roleName}</Typography>
            <Typography variant="caption" color="text.secondary">
              ID {row.id}
            </Typography>
          </Stack>
        ),
        searchAccessor: (row) =>
          [row.roleName, row.id, row.site, row.bu, row.department]
            .filter(Boolean)
            .join(" "),
      },
      {
        id: "site",
        label: "Site",
        width: 140,
        render: (row) => row.site || t("common.notAvailable"),
      },
      {
        id: "bu",
        label: "BU",
        width: 150,
        render: (row) => row.bu || t("common.notAvailable"),
      },
      {
        id: "department",
        label: "Department",
        width: 190,
        render: (row) => row.department || t("common.notAvailable"),
      },
      {
        id: "scope",
        label: "Scope",
        width: 220,
        render: (row) => (
          <Chip
            label={formatRoleScope(row) || "Global"}
            size="small"
            icon={<AssignmentIndRoundedIcon />}
            variant="outlined"
          />
        ),
        searchAccessor: formatRoleScope,
        sortAccessor: formatRoleScope,
      },
      {
        id: "actions",
        label: "",
        width: 80,
        sortable: false,
        searchable: false,
        render: (row) => (
          <Tooltip title="Edit role">
            <IconButton
              size="small"
              color="primary"
              onClick={() => void openRoleDialog(row)}
            >
              <EditRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
    [t, sites],
  );

  const roleAssignmentColumns = useMemo(
    () => [
      {
        id: "userName",
        label: "User",
        width: 220,
        render: (row) => (
          <Typography variant="subtitle2" sx={{ overflowWrap: "anywhere" }}>
            {row.userName}
          </Typography>
        ),
      },
      {
        id: "roleName",
        label: "Role",
        width: 180,
        render: (row) => (
          <Stack spacing={0.25} sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2">{row.roleName}</Typography>
            <Typography variant="caption" color="text.secondary">
              Role ID {row.roleId}
            </Typography>
          </Stack>
        ),
        searchAccessor: (row) =>
          [row.roleName, row.roleId, row.userName, row.site, row.bu, row.department]
            .filter(Boolean)
            .join(" "),
      },
      {
        id: "site",
        label: "Site",
        width: 140,
        render: (row) => row.site || t("common.notAvailable"),
      },
      {
        id: "bu",
        label: "BU",
        width: 150,
        render: (row) => row.bu || t("common.notAvailable"),
      },
      {
        id: "department",
        label: "Department",
        width: 190,
        render: (row) => row.department || t("common.notAvailable"),
      },
      {
        id: "scope",
        label: "Scope",
        width: 220,
        render: (row) => (
          <Chip
            label={formatRoleScope(row) || "Global"}
            size="small"
            icon={<AssignmentIndRoundedIcon />}
            variant="outlined"
          />
        ),
        searchAccessor: formatRoleScope,
        sortAccessor: formatRoleScope,
      },
      {
        id: "actions",
        label: "",
        width: 110,
        sortable: false,
        searchable: false,
        render: (row) => (
          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
            <Tooltip title="Edit assignment">
              <IconButton
                size="small"
                color="primary"
                onClick={() => openAssignmentDialog(row)}
              >
                <EditRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete assignment">
              <IconButton
                size="small"
                color="error"
                onClick={() => void handleDeleteRoleAssignment(row)}
                disabled={deletingAssignmentId === row.id}
              >
                {deletingAssignmentId === row.id ? (
                  <CircularProgress size={16} />
                ) : (
                  <DeleteOutlineRoundedIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ],
    [deletingAssignmentId, t],
  );

  const isMonitoringLoading = useMemo(
    () => Object.values(monitoringLoading).some(Boolean),
    [monitoringLoading],
  );

  const setMonitoringSectionLoading = useCallback((section, isLoading) => {
    setMonitoringLoading((current) => ({
      ...current,
      [section]: isLoading,
    }));
  }, []);

  const getMonitoringParams = useCallback(
    () => ({
      from: monitoringFilters.from,
      to: monitoringFilters.to,
      granularity: monitoringFilters.granularity,
    }),
    [monitoringFilters],
  );

  const accessBucketColumns = useMemo(
    () => [
      { id: "label", label: "Period", width: 180 },
      {
        id: "userCount",
        label: "Users",
        align: "right",
        render: (row) => formatNumber(row.userCount),
        sortAccessor: (row) => row.userCount,
      },
      {
        id: "requestCount",
        label: "Requests",
        align: "right",
        render: (row) => formatNumber(row.requestCount),
        sortAccessor: (row) => row.requestCount,
      },
    ],
    [],
  );

  const activeUserColumns = useMemo(
    () => [
      {
        id: "userName",
        label: "User",
        render: (row) => (
          <Stack spacing={0.25} sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2">{row.displayName || row.userName}</Typography>
            <Typography variant="caption" color="text.secondary">
              {row.userName}
            </Typography>
          </Stack>
        ),
        searchAccessor: (row) =>
          [row.userName, row.displayName, row.employeeId].filter(Boolean).join(" "),
      },
      { id: "employeeId", label: "Employee ID", width: 140 },
      {
        id: "connectionCount",
        label: "Connections",
        align: "right",
        width: 130,
        render: (row) => formatNumber(row.connectionCount),
        sortAccessor: (row) => row.connectionCount,
      },
      {
        id: "lastSeenAtLocal",
        label: "Last seen (VN)",
        width: 190,
        render: (row) => formatVietnamDateTimeLabel(row.lastSeenAtLocal),
        sortAccessor: (row) => new Date(row.lastSeenAtLocal).getTime() || 0,
      },
    ],
    [],
  );

  const apiPerformanceColumns = useMemo(
    () => [
      {
        id: "path",
        label: "API",
        render: (row) => (
          <Stack spacing={0.25} sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ overflowWrap: "anywhere" }}>
              {row.method} {row.path}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.endpoint || "N/A"}
            </Typography>
          </Stack>
        ),
        searchAccessor: (row) => `${row.method} ${row.path} ${row.endpoint}`,
      },
      {
        id: "requestCount",
        label: "Requests",
        align: "right",
        width: 120,
        render: (row) => formatNumber(row.requestCount),
        sortAccessor: (row) => row.requestCount,
      },
      {
        id: "errorCount",
        label: "Errors",
        align: "right",
        width: 110,
        render: (row) => formatNumber(row.errorCount),
        sortAccessor: (row) => row.errorCount,
      },
      {
        id: "averageDurationMs",
        label: "Avg",
        align: "right",
        width: 120,
        render: (row) => formatDuration(row.averageDurationMs),
        sortAccessor: (row) => row.averageDurationMs,
      },
      {
        id: "p95DurationMs",
        label: "P95",
        align: "right",
        width: 120,
        render: (row) => formatDuration(row.p95DurationMs),
        sortAccessor: (row) => row.p95DurationMs || 0,
      },
      {
        id: "maxDurationMs",
        label: "Max",
        align: "right",
        width: 120,
        render: (row) => formatDuration(row.maxDurationMs),
        sortAccessor: (row) => row.maxDurationMs,
      },
    ],
    [],
  );

  const recentRequestColumns = useMemo(
    () => [
      {
        id: "startedAtLocal",
        label: "Time (VN)",
        width: 190,
        render: (row) => formatVietnamDateTimeLabel(row.startedAtLocal),
        sortAccessor: (row) => new Date(row.startedAtLocal).getTime() || 0,
      },
      {
        id: "path",
        label: "API",
        render: (row) => `${row.method} ${row.path}`,
        searchAccessor: (row) => `${row.method} ${row.path} ${row.endpoint}`,
      },
      { id: "userName", label: "User", width: 180 },
      {
        id: "statusCode",
        label: "Status",
        align: "right",
        width: 110,
        render: (row) => (
          <Chip
            label={row.statusCode}
            color={row.statusCode >= 500 ? "error" : row.statusCode >= 400 ? "warning" : "default"}
            size="small"
            variant="outlined"
          />
        ),
        sortAccessor: (row) => row.statusCode,
      },
      {
        id: "durationMs",
        label: "Duration",
        align: "right",
        width: 130,
        render: (row) => formatDuration(row.durationMs),
        sortAccessor: (row) => row.durationMs,
      },
    ],
    [],
  );

  const loadRoles = async () => {
    setRolesLoading(true);
    setRolesError("");

    try {
      const nextRoles = await roleApi.getRoles();
      setRoles(nextRoles);
      setSelectedRoleIds((current) =>
        current.filter((roleId) =>
          nextRoles.some((role) => String(role.id) === String(roleId)),
        ),
      );
    } catch (error) {
      setRolesError(getErrorMessage(error, "Could not load roles."));
    } finally {
      setRolesLoading(false);
    }
  };

  const loadRoleAssignments = async () => {
    setRoleAssignmentsLoading(true);
    setRoleAssignmentsError("");

    try {
      const nextAssignments = await roleApi.getRoleAssignments();
      setRoleAssignments(nextAssignments);
    } catch (error) {
      setRoleAssignmentsError(
        getErrorMessage(error, "Could not load role assignments."),
      );
    } finally {
      setRoleAssignmentsLoading(false);
    }
  };

  const loadRoleMasterData = async () => {
    setRoleMasterLoading(true);
    setRoleMasterError("");

    try {
      const nextSites = await masterDataApi.getSites();
      setSites(nextSites);
      return nextSites;
    } catch (error) {
      setRoleMasterError(getErrorMessage(error, "Could not load site master data."));
      return [];
    } finally {
      setRoleMasterLoading(false);
    }
  };

  const loadCcnsForSite = async (siteId) => {
    if (!siteId) {
      setCcns([]);
      return [];
    }

    setRoleMasterLoading(true);
    setRoleMasterError("");

    try {
      const nextCcns = await masterDataApi.getCcnsBySite(siteId);
      setCcns(nextCcns);
      return nextCcns;
    } catch (error) {
      setRoleMasterError(getErrorMessage(error, "Could not load BU master data."));
      setCcns([]);
      return [];
    } finally {
      setRoleMasterLoading(false);
    }
  };

  const loadDepartmentsForCcn = async (ccn) => {
    if (!ccn) {
      setDepartments([]);
      return [];
    }

    setRoleMasterLoading(true);
    setRoleMasterError("");

    try {
      const nextDepartments = await masterDataApi.getDepartmentsByCcn(ccn);
      setDepartments(nextDepartments);
      return nextDepartments;
    } catch (error) {
      setRoleMasterError(getErrorMessage(error, "Could not load department master data."));
      setDepartments([]);
      return [];
    } finally {
      setRoleMasterLoading(false);
    }
  };

  useEffect(() => {
    void loadRoles();
    void loadRoleAssignments();
    void loadRoleMasterData();
  }, []);

  const loadOverview = useCallback(async () => {
    setMonitoringSectionLoading("overview", true);
    setMonitoringError("");

    try {
      const overview = await administratorTelemetryApi.getOverview(getMonitoringParams());
      setMonitoringOverview(overview);
    } catch (error) {
      setMonitoringError(getErrorMessage(error, "Could not load monitoring overview."));
    } finally {
      setMonitoringSectionLoading("overview", false);
    }
  }, [getMonitoringParams, setMonitoringSectionLoading]);

  const loadActiveUsers = useCallback(async () => {
    setMonitoringSectionLoading("activeUsers", true);
    setMonitoringError("");

    try {
      const activeUserResult = await administratorTelemetryApi.getActiveUsers();
      setActiveUsers(activeUserResult);
    } catch (error) {
      setMonitoringError(getErrorMessage(error, "Could not load active users."));
    } finally {
      setMonitoringSectionLoading("activeUsers", false);
    }
  }, [setMonitoringSectionLoading]);

  const loadApiPerformance = useCallback(async () => {
    setMonitoringSectionLoading("apiPerformance", true);
    setMonitoringError("");

    try {
      const params = getMonitoringParams();
      const performanceResult = await administratorTelemetryApi.getApiPerformance({
        ...params,
        take: 20,
      });
      setApiPerformance(performanceResult);
    } catch (error) {
      setMonitoringError(getErrorMessage(error, "Could not load API performance."));
    } finally {
      setMonitoringSectionLoading("apiPerformance", false);
    }
  }, [getMonitoringParams, setMonitoringSectionLoading]);

  const loadRecentApiRequests = useCallback(async () => {
    setMonitoringSectionLoading("recentRequests", true);
    setMonitoringError("");

    try {
      const params = getMonitoringParams();
      const recentResult = await administratorTelemetryApi.getRecentApiRequests({
        ...params,
        take: 100,
      });
      setRecentApiRequests(recentResult);
    } catch (error) {
      setMonitoringError(getErrorMessage(error, "Could not load recent API requests."));
    } finally {
      setMonitoringSectionLoading("recentRequests", false);
    }
  }, [getMonitoringParams, setMonitoringSectionLoading]);

  const loadMonitoring = useCallback(async () => {
    await Promise.all([
      loadOverview(),
      loadActiveUsers(),
      loadApiPerformance(),
      loadRecentApiRequests(),
    ]);
  }, [loadActiveUsers, loadApiPerformance, loadOverview, loadRecentApiRequests]);

  useEffect(() => {
    if (activeTab === "monitoring") {
      void loadMonitoring();
    }
  }, [activeTab, loadMonitoring]);

  async function openRoleDialog(role = null) {
    setRoleCreateError("");
    setRoleMasterError("");
    setEditingRole(role);

    if (!role) {
      setRoleForm(initialRoleForm);
      setCcns([]);
      setDepartments([]);
      setRoleDialogOpen(true);

      if (sites.length === 0) {
        await loadRoleMasterData();
      }

      return;
    }

    setRoleDialogOpen(true);

    const nextSites = sites.length > 0 ? sites : await loadRoleMasterData();
    const matchedSite = nextSites.find((site) => matchesSite(site, role.site));
    const nextForm = {
      name: role.roleName || "",
      siteId: matchedSite?.siteId || "",
      site: matchedSite ? getSiteFormValue(matchedSite) : role.site || "",
      ccn: "",
      bu: role.bu || "",
      department: role.department || "",
    };

    setRoleForm(nextForm);

    if (!matchedSite?.siteId) {
      setCcns([]);
      setDepartments([]);
      return;
    }

    const nextCcns = await loadCcnsForSite(matchedSite.siteId);
    const matchedCcn = nextCcns.find((ccn) => matchesCcn(ccn, role.bu));
    const ccnKey = matchedCcn?.ccn || "";

    setRoleForm((current) => ({
      ...current,
      ccn: ccnKey,
      bu: matchedCcn ? getCcnFormValue(matchedCcn) : current.bu,
    }));

    if (ccnKey) {
      await loadDepartmentsForCcn(ccnKey);
    } else {
      setDepartments([]);
    }
  }

  function openAssignmentDialog(assignment = null) {
    setSubmitError("");
    setEditingAssignment(assignment);

    if (assignment) {
      setUsername(assignment.userName || "");
      setSelectedRoleIds([assignment.roleId]);
    } else {
      setUsername("");
      setSelectedRoleIds([]);
    }

    setAssignDialogOpen(true);
  }

  async function handleDeleteRoleAssignment(assignment) {
    const confirmed = window.confirm(
      `Remove role "${assignment.roleName}" from ${assignment.userName}?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingAssignmentId(assignment.id);
    setRoleAssignmentsError("");

    try {
      await roleApi.deleteRoleAssignment(assignment.id);
      notify({
        message: `Assignment removed for ${assignment.userName}.`,
        severity: "success",
      });
      await loadRoleAssignments();
    } catch (error) {
      setRoleAssignmentsError(
        getErrorMessage(error, "Could not delete role assignment."),
      );
    } finally {
      setDeletingAssignmentId(null);
    }
  }

  const handleAssignRoles = async (event) => {
    event.preventDefault();
    const trimmedUsername = username.trim();

    if (!trimmedUsername || selectedRoleIds.length === 0) {
      setSubmitError("Enter a username and select at least one role.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      if (editingAssignment) {
        if (selectedRoleIds.length !== 1) {
          setSubmitError("Select exactly one role when editing an assignment.");
          setSubmitting(false);
          return;
        }

        await roleApi.updateRoleAssignment({
          id: editingAssignment.id,
          username: trimmedUsername,
          roleId: selectedRoleIds[0],
        });
      } else {
        await roleApi.assignUserRoles({
          username: trimmedUsername,
          roleIds: selectedRoleIds,
        });
      }

      notify({
        message: editingAssignment
          ? `Assignment updated for ${trimmedUsername}.`
          : `Roles updated for ${trimmedUsername}.`,
        severity: "success",
      });
      await loadRoleAssignments();
      setAssignDialogOpen(false);
      setEditingAssignment(null);
      setUsername("");
      setSelectedRoleIds([]);
    } catch (error) {
      setSubmitError(getErrorMessage(error, "Could not assign roles."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateRole = async (event) => {
    event.preventDefault();
    const nextRole = {
      name: roleForm.name.trim(),
      site: roleForm.site.trim(),
      bu: roleForm.bu.trim(),
      department: roleForm.department.trim(),
    };

    if (!nextRole.name || !nextRole.site || !nextRole.bu || !nextRole.department) {
      setRoleCreateError("Name, Site, BU, and Department are required.");
      return;
    }

    setRoleCreating(true);
    setRoleCreateError("");

    try {
      const savedRole = editingRole
        ? await roleApi.updateRole(editingRole.id, nextRole)
        : await roleApi.createRole(nextRole);

      setRoles((current) => {
        if (editingRole) {
          return current.map((role) =>
            String(role.id) === String(savedRole.id) ? savedRole : role,
          );
        }

        return [...current, savedRole];
      });
      setRoleForm(initialRoleForm);
      setEditingRole(null);
      notify({
        message: editingRole
          ? `Role ${savedRole.roleName} updated.`
          : `Role ${savedRole.roleName} created.`,
        severity: "success",
      });
      await loadRoles();
      setRoleDialogOpen(false);
    } catch (error) {
      setRoleCreateError(
        getErrorMessage(
          error,
          editingRole ? "Could not update role." : "Could not create role.",
        ),
      );
    } finally {
      setRoleCreating(false);
    }
  };

  return (
    <Stack spacing={3.5}>
      <PageHeader
        breadcrumbs={[
          { label: t("dashboard.breadcrumbs.root"), to: "/dashboard" },
          { label: "Administrator" },
        ]}
        title="Administrator"
        subtitle="Manage system-wide users, roles, and permission assignments."
        actions={
          <Chip
            label="Access control"
            color="primary"
            variant="outlined"
            icon={<SecurityRoundedIcon />}
          />
        }
      />

      <Box sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          aria-label="Administrator sections"
        >
          <Tab value="access" label="Access control" icon={<SecurityRoundedIcon />} iconPosition="start" />
          <Tab value="monitoring" label="Monitoring" icon={<AnalyticsRoundedIcon />} iconPosition="start" />
          <Tab value="issues" label="Issues" icon={<BugReportRoundedIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      <Dialog
        open={assignDialogOpen}
        onClose={() => {
          if (!submitting) {
            setAssignDialogOpen(false);
            setEditingAssignment(null);
          }
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {editingAssignment ? "Edit assignment" : "Assign permissions"}
        </DialogTitle>
        <DialogContent dividers>
          <Stack
            id="assign-permissions-form"
            component="form"
            spacing={2.25}
            onSubmit={handleAssignRoles}
            sx={{ pt: 0.5 }}
          >
            {submitError ? (
              <Alert severity="error" variant="outlined">
                {submitError}
              </Alert>
            ) : null}

            <TextField
              label={t("common.username")}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              fullWidth
              required
              disabled={submitting}
              size="small"
            />

            <Autocomplete
              multiple
              disableCloseOnSelect
              loading={rolesLoading}
              options={roles}
              value={selectedRoles}
              onChange={(_, value) =>
                setSelectedRoleIds(value.map((role) => role.id))
              }
              getOptionLabel={formatRoleLabel}
              isOptionEqualToValue={(option, value) =>
                String(option.id) === String(value.id)
              }
              renderOption={(props, option) => {
                const { key, ...optionProps } = props;
                const scope = formatRoleScope(option);

                return (
                  <Box component="li" key={key} {...optionProps}>
                    <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                      <Typography variant="body2">{option.roleName}</Typography>
                      {scope ? (
                        <Typography variant="caption" color="text.secondary">
                          {scope}
                        </Typography>
                      ) : null}
                    </Stack>
                  </Box>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Roles"
                  required={selectedRoleIds.length === 0}
                  size="small"
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const { key, ...tagProps } = getTagProps({ index });

                  return (
                    <Chip
                      key={key}
                      label={formatRoleLabel(option)}
                      size="small"
                      {...tagProps}
                    />
                  );
                })
              }
              disabled={rolesLoading || submitting}
            />

            <Typography variant="body2" color="text.secondary">
              {selectedRoleIds.length} role
              {selectedRoleIds.length === 1 ? "" : "s"} selected
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="assign-permissions-form"
            variant="contained"
            startIcon={
              submitting ? (
                <CircularProgress color="inherit" size={18} />
              ) : (
                <SaveRoundedIcon />
              )
            }
            disabled={submitting || rolesLoading}
          >
            Save assignment
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={roleDialogOpen}
        onClose={() => {
          if (!roleCreating) {
            setRoleDialogOpen(false);
            setEditingRole(null);
          }
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{editingRole ? "Edit role" : "Create role"}</DialogTitle>
        <DialogContent dividers>
          <Stack
            id="create-role-form"
            component="form"
            spacing={2.25}
            onSubmit={handleCreateRole}
            sx={{ pt: 0.5 }}
          >
            {roleCreateError ? (
              <Alert severity="error" variant="outlined">
                {roleCreateError}
              </Alert>
            ) : null}

            <TextField
              select
              label="Name"
              value={roleForm.name}
              onChange={(event) =>
                setRoleForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              required
              fullWidth
              disabled={roleCreating}
              size="small"
            >
              {roleNameOptions.map((roleName) => (
                <MenuItem key={roleName} value={roleName}>
                  {roleName}
                </MenuItem>
              ))}
            </TextField>
            {roleMasterError ? (
              <Alert severity="warning" variant="outlined">
                {roleMasterError}
              </Alert>
            ) : null}
            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
              }}
            >
              <TextField
                select
                label="Site"
                value={roleForm.siteId}
                onChange={(event) => {
                  const siteId = event.target.value;
                  const site = sites.find(
                    (item) => String(item.siteId) === String(siteId),
                  );

                  setRoleForm((current) => ({
                    ...current,
                    siteId,
                    site: site ? getSiteFormValue(site) : "",
                    ccn: "",
                    bu: "",
                    department: "",
                  }));
                  setDepartments([]);
                  void loadCcnsForSite(siteId);
                }}
                required
                disabled={roleCreating || roleMasterLoading}
                size="small"
              >
                {sites.map((site) => (
                  <MenuItem key={site.siteId} value={site.siteId}>
                    {formatSiteLabel(site)}
                  </MenuItem>
                ))}
                {roleForm.siteId === "" && roleForm.site ? (
                  <MenuItem value="" disabled>
                    {roleForm.site}
                  </MenuItem>
                ) : null}
              </TextField>
              <TextField
                select
                label="BU"
                value={roleForm.ccn}
                onChange={(event) => {
                  const ccnKey = event.target.value;
                  const ccn = ccns.find(
                    (item) => String(item.ccn) === String(ccnKey),
                  );

                  setRoleForm((current) => ({
                    ...current,
                    ccn: ccnKey,
                    bu: ccn ? getCcnFormValue(ccn) : "",
                    department: "",
                  }));
                  void loadDepartmentsForCcn(ccnKey);
                }}
                required
                disabled={roleCreating || roleMasterLoading || !roleForm.siteId}
                size="small"
              >
                {ccns.map((ccn) => (
                  <MenuItem key={ccn.ccn || ccn.id} value={ccn.ccn}>
                    {formatCcnLabel(ccn)}
                  </MenuItem>
                ))}
                {roleForm.ccn === "" && roleForm.bu ? (
                  <MenuItem value="" disabled>
                    {roleForm.bu}
                  </MenuItem>
                ) : null}
              </TextField>
              <TextField
                select
                label="Department"
                value={roleForm.department}
                onChange={(event) =>
                  setRoleForm((current) => ({
                    ...current,
                    department: event.target.value,
                  }))
                }
                required
                disabled={roleCreating || roleMasterLoading || !roleForm.ccn}
                size="small"
              >
                {departments.map((department) => (
                  <MenuItem
                    key={department.kronosDeptId || department.kronosDeptName}
                    value={department.kronosDeptName}
                  >
                    {department.kronosDeptName}
                  </MenuItem>
                ))}
                {roleForm.department &&
                !departments.some(
                  (department) =>
                    department.kronosDeptName === roleForm.department,
                ) ? (
                  <MenuItem value={roleForm.department}>
                    {roleForm.department}
                  </MenuItem>
                ) : null}
              </TextField>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialogOpen(false)} disabled={roleCreating}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-role-form"
            variant="contained"
            startIcon={
              roleCreating ? (
                <CircularProgress color="inherit" size={18} />
              ) : editingRole ? (
                <SaveRoundedIcon />
              ) : (
                <AddCircleOutlineRoundedIcon />
              )
            }
            disabled={roleCreating || rolesLoading || roleMasterLoading}
          >
            {editingRole ? "Save role" : "Create role"}
          </Button>
        </DialogActions>
      </Dialog>

      {activeTab === "access" ? (
        <Stack spacing={3}>
          {rolesError ? (
            <Alert severity="error" variant="outlined">
              {rolesError}
            </Alert>
          ) : null}

          <SectionCard
            title="User role assignments"
            subtitle="Current portal users and the roles assigned to them."
            action={
              <Stack direction="row" spacing={1} alignItems="center">
                <Button
                  variant="contained"
                  startIcon={<SecurityRoundedIcon />}
                  onClick={() => openAssignmentDialog()}
                  disabled={rolesLoading}
                >
                  Assign permissions
                </Button>
                <Tooltip title="Refresh assignments">
                  <IconButton
                    color="primary"
                    onClick={() => void loadRoleAssignments()}
                    disabled={roleAssignmentsLoading}
                  >
                    {roleAssignmentsLoading ? (
                      <CircularProgress size={20} />
                    ) : (
                      <RefreshRoundedIcon />
                    )}
                  </IconButton>
                </Tooltip>
              </Stack>
            }
          >
            <Stack spacing={2}>
              {roleAssignmentsError ? (
                <Alert severity="error" variant="outlined">
                  {roleAssignmentsError}
                </Alert>
              ) : null}
              <AppDataTable
                columns={roleAssignmentColumns}
                rows={roleAssignments}
                loading={roleAssignmentsLoading}
                getRowId={(row) => row.id}
                defaultRowsPerPage={10}
                defaultSortBy="userName"
                searchPlaceholder="Search assignments"
                emptyTitle="No role assignments"
                emptyDescription="Assigned user roles will appear here."
              />
            </Stack>
          </SectionCard>

          <SectionCard
            title="Available roles"
            subtitle="Full role definitions returned by the Roles API."
            action={
              <Stack direction="row" spacing={1} alignItems="center">
                <Button
                  variant="outlined"
                  startIcon={<AddCircleOutlineRoundedIcon />}
                  onClick={() => void openRoleDialog()}
                  disabled={roleCreating || roleMasterLoading}
                >
                  Create role
                </Button>
                <Tooltip title="Refresh roles">
                  <IconButton
                    color="primary"
                    onClick={loadRoles}
                    disabled={rolesLoading || submitting || roleCreating}
                  >
                    {rolesLoading ? (
                      <CircularProgress size={20} />
                    ) : (
                      <RefreshRoundedIcon />
                    )}
                  </IconButton>
                </Tooltip>
              </Stack>
            }
          >
            <AppDataTable
              columns={roleColumns}
              rows={roles}
              loading={rolesLoading}
              getRowId={(row) => row.id}
              defaultRowsPerPage={10}
              defaultSortBy="roleName"
              searchPlaceholder="Search roles"
              emptyTitle="No roles available"
              emptyDescription="Roles will appear here after they are created."
            />
          </SectionCard>
        </Stack>
      ) : activeTab === "issues" ? (
        <AdminIssuesPanel />
      ) : (
        <Stack spacing={3}>
          <SectionCard
            title="Portal monitoring"
            subtitle="Track portal access, realtime users, and API performance from administrator tools."
            action={
              <Tooltip title="Refresh monitoring data">
                <IconButton
                  color="primary"
                  onClick={() => void loadMonitoring()}
                  disabled={isMonitoringLoading}
                >
                  {isMonitoringLoading ? (
                    <CircularProgress size={20} />
                  ) : (
                    <RefreshRoundedIcon />
                  )}
                </IconButton>
              </Tooltip>
            }
          >
            <Stack spacing={3}>
              {monitoringError ? (
                <Alert severity="error" variant="outlined">
                  {monitoringError}
                </Alert>
              ) : null}

              <Box
                sx={{
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                    lg: "180px 180px 180px auto",
                  },
                  alignItems: "center",
                }}
              >
                <TextField
                  select
                  label="Granularity"
                  value={monitoringFilters.granularity}
                  onChange={(event) =>
                    setMonitoringFilters((current) => ({
                      ...current,
                      granularity: event.target.value,
                    }))
                  }
                  size="small"
                >
                  <MenuItem value="day">Day</MenuItem>
                  <MenuItem value="week">Week</MenuItem>
                  <MenuItem value="month">Month</MenuItem>
                </TextField>
                <TextField
                  label="From"
                  type="date"
                  value={monitoringFilters.from}
                  onChange={(event) =>
                    setMonitoringFilters((current) => ({
                      ...current,
                      from: event.target.value,
                    }))
                  }
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="To"
                  type="date"
                  value={monitoringFilters.to}
                  onChange={(event) =>
                    setMonitoringFilters((current) => ({
                      ...current,
                      to: event.target.value,
                    }))
                  }
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
                <Button
                  variant="contained"
                  startIcon={
                    isMonitoringLoading ? (
                      <CircularProgress color="inherit" size={18} />
                    ) : (
                      <RefreshRoundedIcon />
                    )
                  }
                  onClick={() => void loadMonitoring()}
                  disabled={isMonitoringLoading}
                  sx={{ justifySelf: { lg: "start" } }}
                >
                  Refresh all
                </Button>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                    xl: "repeat(6, minmax(0, 1fr))",
                  },
                }}
              >
                <MetricCard
                  title="Active now"
                  value={formatNumber(activeUsers.activeNow || monitoringOverview?.activeNow)}
                  helper="Realtime SignalR presence"
                  icon={<Groups2RoundedIcon fontSize="small" />}
                />
                <MetricCard
                  title="Active 5 min"
                  value={formatNumber(
                    activeUsers.activeLastFiveMinutes ||
                      monitoringOverview?.activeLastFiveMinutes,
                  )}
                  helper="Recent heartbeat window"
                  icon={<TimelapseRoundedIcon fontSize="small" />}
                />
                <MetricCard
                  title="Users"
                  value={formatNumber(monitoringOverview?.totalUsers)}
                  helper="Unique users in range"
                  icon={<AssignmentIndRoundedIcon fontSize="small" />}
                />
                <MetricCard
                  title="Requests"
                  value={formatNumber(monitoringOverview?.totalRequests)}
                  helper="Tracked API requests"
                  icon={<AnalyticsRoundedIcon fontSize="small" />}
                />
                <MetricCard
                  title="Error rate"
                  value={`${monitoringOverview?.errorRate ?? 0}%`}
                  helper={`${formatNumber(monitoringOverview?.totalErrors)} errors`}
                  icon={<ErrorOutlineRoundedIcon fontSize="small" />}
                />
                <MetricCard
                  title="Slowest API"
                  value={formatDuration(monitoringOverview?.slowestApiAverageMs)}
                  helper={monitoringOverview?.slowestApi || "No API data"}
                  icon={<SpeedRoundedIcon fontSize="small" />}
                />
              </Box>
            </Stack>
          </SectionCard>

          <SectionCard
            title="User access trend"
            subtitle="Unique portal users and tracked requests grouped by the selected period."
            action={
              <Tooltip title="Refresh access trend">
                <IconButton
                  color="primary"
                  onClick={() => void loadOverview()}
                  disabled={monitoringLoading.overview}
                >
                  {monitoringLoading.overview ? (
                    <CircularProgress size={20} />
                  ) : (
                    <RefreshRoundedIcon />
                  )}
                </IconButton>
              </Tooltip>
            }
          >
            <Stack spacing={2.5}>
              <Stack spacing={1.25}>
                {(monitoringOverview?.buckets || []).map((bucket) => {
                  const maxUsers = Math.max(
                    1,
                    ...(monitoringOverview?.buckets || []).map((item) => item.userCount),
                  );
                  const width = `${Math.max(8, (bucket.userCount / maxUsers) * 100)}%`;

                  return (
                    <Box key={bucket.key}>
                      <Stack
                        direction="row"
                        spacing={1.5}
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="body2">{bucket.label}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatNumber(bucket.userCount)} users
                        </Typography>
                      </Stack>
                      <Box
                        sx={{
                          mt: 0.75,
                          height: 8,
                          borderRadius: 1,
                          bgcolor: "action.hover",
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            height: "100%",
                            width,
                            bgcolor: "primary.main",
                          }}
                        />
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
              <AppDataTable
                columns={accessBucketColumns}
                rows={monitoringOverview?.buckets || []}
                loading={monitoringLoading.overview}
                getRowId={(row) => row.key}
                defaultRowsPerPage={10}
                emptyTitle="No access data"
                emptyDescription="Telemetry will appear after authenticated users access portal APIs."
              />
            </Stack>
          </SectionCard>

          <SectionCard
            title="API performance"
            subtitle="Slowest tracked APIs by average duration, with request and error counts."
            action={
              <Tooltip title="Refresh API performance">
                <IconButton
                  color="primary"
                  onClick={() => void loadApiPerformance()}
                  disabled={monitoringLoading.apiPerformance}
                >
                  {monitoringLoading.apiPerformance ? (
                    <CircularProgress size={20} />
                  ) : (
                    <RefreshRoundedIcon />
                  )}
                </IconButton>
              </Tooltip>
            }
          >
            <AppDataTable
              columns={apiPerformanceColumns}
              rows={apiPerformance}
              loading={monitoringLoading.apiPerformance}
              getRowId={(row) => row.id}
              defaultRowsPerPage={10}
              emptyTitle="No API performance data"
              emptyDescription="Request metrics will appear after API traffic is recorded."
            />
          </SectionCard>

          <SectionCard
            title="Active users"
            subtitle="Users currently connected to the portal presence hub, shown in Vietnam local time."
            action={
              <Tooltip title="Refresh active users">
                <IconButton
                  color="primary"
                  onClick={() => void loadActiveUsers()}
                  disabled={monitoringLoading.activeUsers}
                >
                  {monitoringLoading.activeUsers ? (
                    <CircularProgress size={20} />
                  ) : (
                    <RefreshRoundedIcon />
                  )}
                </IconButton>
              </Tooltip>
            }
          >
            <AppDataTable
              columns={activeUserColumns}
              rows={activeUsers.users}
              loading={monitoringLoading.activeUsers}
              getRowId={(row) => row.id}
              defaultRowsPerPage={10}
              emptyTitle="No active users"
              emptyDescription="Active users will appear when clients connect to the presence hub."
            />
          </SectionCard>

          <SectionCard
            title="Recent API requests"
            subtitle="Latest tracked requests in the selected date range."
            action={
              <Tooltip title="Refresh recent API requests">
                <IconButton
                  color="primary"
                  onClick={() => void loadRecentApiRequests()}
                  disabled={monitoringLoading.recentRequests}
                >
                  {monitoringLoading.recentRequests ? (
                    <CircularProgress size={20} />
                  ) : (
                    <RefreshRoundedIcon />
                  )}
                </IconButton>
              </Tooltip>
            }
          >
            <AppDataTable
              columns={recentRequestColumns}
              rows={recentApiRequests}
              loading={monitoringLoading.recentRequests}
              getRowId={(row) => row.id}
              defaultRowsPerPage={10}
              emptyTitle="No recent requests"
              emptyDescription="Recent API requests will appear after telemetry is recorded."
            />
          </SectionCard>
        </Stack>
      )}
    </Stack>
  );
}
