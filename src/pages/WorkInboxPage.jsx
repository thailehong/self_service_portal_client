import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import ApprovalRoundedIcon from "@mui/icons-material/ApprovalRounded";
import PlaylistAddCheckRoundedIcon from "@mui/icons-material/PlaylistAddCheckRounded";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { SectionCard } from "../components/layout/SectionCard";
import { AppDataTable } from "../components/datatable/AppDataTable";
import { workItemsApi } from "../services/api/workItemsApi";
import { getErrorMessage } from "./workflow/workflowUtils";

const bucketTabs = [
  {
    value: "tasks",
    label: "My Tasks",
    icon: <TaskAltRoundedIcon fontSize="small" />,
    emptyTitle: "No assigned tasks",
    emptyDescription:
      "Task items will appear here when supported functions start assigning tasks.",
  },
  {
    value: "approvals",
    label: "My Approval",
    icon: <ApprovalRoundedIcon fontSize="small" />,
    emptyTitle: "No pending approvals",
    emptyDescription: "Approval items waiting for your action will appear here.",
  },
  {
    value: "requests",
    label: "My Request",
    icon: <PlaylistAddCheckRoundedIcon fontSize="small" />,
    emptyTitle: "No in-progress requests",
    emptyDescription: "Your in-progress requests will appear here.",
  },
];

const validBuckets = new Set(bucketTabs.map((item) => item.value));

function normalizeBucket(value) {
  const normalizedValue = String(value || "").trim().toLowerCase();
  return validBuckets.has(normalizedValue) ? normalizedValue : "tasks";
}

function formatDateTime(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getStatusColor(status) {
  if (String(status).toLowerCase().includes("pending")) {
    return "warning";
  }

  if (String(status).toLowerCase() === "inprogress") {
    return "info";
  }

  return "default";
}

export function WorkInboxPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const bucket = normalizeBucket(searchParams.get("bucket"));
  const activeTab = bucketTabs.find((item) => item.value === bucket) || bucketTabs[0];
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await workItemsApi.getItems({
        bucket,
        page: 1,
        pageSize: 100,
      });
      setRows(result.items);
    } catch (loadError) {
      setError(getErrorMessage(loadError, "Could not load work inbox."));
    } finally {
      setLoading(false);
    }
  }, [bucket]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const columns = useMemo(
    () => [
      {
        id: "sourceSystem",
        label: "Source",
        width: 140,
        render: (row) => (
          <Chip label={row.sourceSystem || "Portal"} size="small" variant="outlined" />
        ),
      },
      {
        id: "requestNo",
        label: "Request No",
        width: 170,
      },
      {
        id: "title",
        label: "Title",
        minWidth: 240,
        render: (row) => (
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ overflowWrap: "anywhere" }}>
              {row.title || row.requestNo}
            </Typography>
            {row.currentStepName ? (
              <Typography variant="caption" color="text.secondary">
                {row.currentStepName}
              </Typography>
            ) : null}
          </Box>
        ),
        searchAccessor: (row) =>
          [row.title, row.requestNo, row.currentStepName].filter(Boolean).join(" "),
      },
      {
        id: "status",
        label: "Status",
        width: 150,
        render: (row) => (
          <Chip
            label={row.status || "Unknown"}
            size="small"
            color={getStatusColor(row.status)}
            variant="outlined"
          />
        ),
      },
      {
        id: "requester",
        label: "Requester",
        width: 210,
      },
      {
        id: "assignedTo",
        label: "Assigned To",
        width: 210,
        render: (row) => row.assignedTo || "-",
      },
      {
        id: "updatedAt",
        label: "Updated",
        width: 170,
        render: (row) => formatDateTime(row.updatedAt || row.submittedAt || row.createdAt) || "-",
        sortAccessor: (row) =>
          new Date(row.updatedAt || row.submittedAt || row.createdAt || 0).getTime(),
      },
    ],
    [],
  );

  const handleTabChange = (_event, value) => {
    const next = new URLSearchParams(searchParams);
    next.set("bucket", value);
    setSearchParams(next);
  };

  const handleOpenItem = (item) => {
    if (!item?.deepLink) {
      return;
    }

    if (item.isExternal) {
      window.open(item.deepLink, "_blank", "noopener,noreferrer");
      return;
    }

    navigate(item.deepLink);
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Work Inbox"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Work Inbox" },
        ]}
      />

      {error ? <Alert severity="warning">{error}</Alert> : null}

      <SectionCard
        title="Work Inbox"
        action={
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshRoundedIcon />}
            onClick={() => void loadItems()}
            disabled={loading}
          >
            Refresh
          </Button>
        }
      >
        <Stack spacing={2}>
          <Tabs
            value={bucket}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            {bucketTabs.map((item) => (
              <Tab
                key={item.value}
                value={item.value}
                icon={item.icon}
                iconPosition="start"
                label={item.label}
              />
            ))}
          </Tabs>

          <AppDataTable
            columns={columns}
            rows={rows}
            loading={loading}
            defaultRowsPerPage={10}
            pageSizeOptions={[10, 25, 50]}
            defaultSortBy="updatedAt"
            defaultSortDirection="desc"
            searchPlaceholder="Search work items"
            emptyTitle={activeTab.emptyTitle}
            emptyDescription={activeTab.emptyDescription}
            onRowClick={handleOpenItem}
          />
        </Stack>
      </SectionCard>
    </Stack>
  );
}
