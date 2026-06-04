import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import { AppDataTable } from "../../components/datatable/AppDataTable";
import { SectionCard } from "../../components/layout/SectionCard";
import { useNotifier } from "../../hooks/useNotifier";
import { issueApi } from "../../services/api/issueApi";
import { formatFileSize } from "../../utils/formatters";

const issueStatuses = ["Open", "InProgress", "Resolved", "Closed"];

function getErrorMessage(error, fallback) {
  const responseData = error.response?.data;

  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  return responseData?.message || responseData?.title || error.message || fallback;
}

function formatDateTime(value) {
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

function getStatusColor(status) {
  switch (status) {
    case "Open":
      return "error";
    case "InProgress":
      return "warning";
    case "Resolved":
      return "success";
    case "Closed":
      return "default";
    default:
      return "default";
  }
}

function StatusChip({ status }) {
  return (
    <Chip
      label={status || "N/A"}
      size="small"
      color={getStatusColor(status)}
      variant="outlined"
    />
  );
}

export function AdminIssuesPanel() {
  const { notify } = useNotifier();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [statusForm, setStatusForm] = useState({ status: "Open", adminNote: "" });
  const [saving, setSaving] = useState(false);

  const loadIssues = async () => {
    setLoading(true);
    setError("");

    try {
      setIssues(await issueApi.getAllIssues());
    } catch (loadError) {
      setError(getErrorMessage(loadError, "Could not load issues."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadIssues();
  }, []);

  const columns = useMemo(
    () => [
      {
        id: "issueNo",
        label: "Issue",
        width: 170,
        render: (row) => (
          <Stack spacing={0.25} sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2">{row.issueNo}</Typography>
            <Typography variant="caption" color="text.secondary">
              {row.category}
            </Typography>
          </Stack>
        ),
      },
      {
        id: "title",
        label: "Title",
        render: (row) => (
          <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>
            {row.title}
          </Typography>
        ),
      },
      {
        id: "reporterUserName",
        label: "Reporter",
        width: 220,
        render: (row) => (
          <Stack spacing={0.25} sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>
              {row.reporterDisplayName || row.reporterUserName}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: "anywhere" }}>
              {row.reporterEmail || row.reporterUserName}
            </Typography>
          </Stack>
        ),
        searchAccessor: (row) =>
          [row.reporterDisplayName, row.reporterUserName, row.reporterEmail, row.reporterEmployeeId]
            .filter(Boolean)
            .join(" "),
      },
      {
        id: "status",
        label: "Status",
        width: 130,
        render: (row) => <StatusChip status={row.status} />,
      },
      {
        id: "updatedAt",
        label: "Updated",
        width: 180,
        render: (row) => formatDateTime(row.updatedAt),
        sortAccessor: (row) => new Date(row.updatedAt).getTime() || 0,
      },
      {
        id: "actions",
        label: "",
        width: 90,
        sortable: false,
        searchable: false,
        render: (row) => (
          <Tooltip title="View issue">
            <IconButton
              size="small"
              color="primary"
              onClick={() => {
                setSelectedIssue(row);
                setStatusForm({
                  status: row.status || "Open",
                  adminNote: row.adminNote || "",
                });
              }}
            >
              <VisibilityRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
    [],
  );

  const handleOpenAttachment = async (issue, attachment) => {
    try {
      const { blob, contentType } = await issueApi.downloadAttachment(issue.id, attachment.id);
      const url = URL.createObjectURL(new Blob([blob], { type: contentType }));
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch (downloadError) {
      notify({
        message: getErrorMessage(downloadError, "Could not open attachment."),
        severity: "error",
      });
    }
  };

  const handleSaveStatus = async () => {
    if (!selectedIssue) {
      return;
    }

    setSaving(true);

    try {
      const updated = await issueApi.updateIssueStatus({
        id: selectedIssue.id,
        status: statusForm.status,
        adminNote: statusForm.adminNote,
      });
      setSelectedIssue(updated);
      setIssues((current) => current.map((issue) => (issue.id === updated.id ? updated : issue)));
      notify({ message: `Issue ${updated.issueNo} updated.`, severity: "success" });
    } catch (saveError) {
      notify({
        message: getErrorMessage(saveError, "Could not update issue status."),
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SectionCard
        title="Issue reports"
        subtitle="All user-reported portal issues from Help Center."
        action={
          <Tooltip title="Refresh issues">
            <IconButton color="primary" onClick={() => void loadIssues()} disabled={loading}>
              <RefreshRoundedIcon />
            </IconButton>
          </Tooltip>
        }
      >
        <Stack spacing={2}>
          {error ? (
            <Alert severity="error" variant="outlined">
              {error}
            </Alert>
          ) : null}
          <AppDataTable
            columns={columns}
            rows={issues}
            loading={loading}
            defaultRowsPerPage={10}
            defaultSortBy="updatedAt"
            defaultSortDirection="desc"
            searchPlaceholder="Search issues"
            emptyTitle="No issues"
            emptyDescription="Issues reported from Help Center will appear here."
          />
        </Stack>
      </SectionCard>

      <Dialog open={Boolean(selectedIssue)} onClose={() => setSelectedIssue(null)} fullWidth maxWidth="md">
        <DialogTitle>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography variant="h6" sx={{ flex: 1, minWidth: 0, overflowWrap: "anywhere" }}>
              {selectedIssue?.issueNo} - {selectedIssue?.title}
            </Typography>
            <StatusChip status={selectedIssue?.status} />
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {selectedIssue ? (
            <Stack spacing={2.25}>
              <Box
                sx={{
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                }}
              >
                <TextField
                  select
                  label="Status"
                  value={statusForm.status}
                  onChange={(event) =>
                    setStatusForm((current) => ({ ...current, status: event.target.value }))
                  }
                  size="small"
                  disabled={saving}
                >
                  {issueStatuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Reporter"
                  value={selectedIssue.reporterDisplayName || selectedIssue.reporterUserName}
                  size="small"
                  disabled
                />
              </Box>

              <TextField
                label="Admin note"
                value={statusForm.adminNote}
                onChange={(event) =>
                  setStatusForm((current) => ({ ...current, adminNote: event.target.value }))
                }
                multiline
                minRows={2}
                disabled={saving}
              />

              <Divider />

              <Stack spacing={0.75}>
                <Typography variant="subtitle2">Description</Typography>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {selectedIssue.description}
                </Typography>
              </Stack>

              <Divider />

              <Stack spacing={1}>
                <Typography variant="subtitle2">Images</Typography>
                {selectedIssue.attachments.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No images attached.
                  </Typography>
                ) : (
                  selectedIssue.attachments.map((attachment) => (
                    <Stack
                      key={attachment.id}
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ minWidth: 0 }}
                    >
                      <ImageRoundedIcon color="primary" fontSize="small" />
                      <Typography variant="body2" sx={{ flex: 1, overflowWrap: "anywhere" }}>
                        {attachment.fileName} ({formatFileSize(attachment.size)})
                      </Typography>
                      <Button size="small" onClick={() => void handleOpenAttachment(selectedIssue, attachment)}>
                        Open
                      </Button>
                    </Stack>
                  ))
                )}
              </Stack>

              <Divider />

              <Stack spacing={1}>
                <Typography variant="subtitle2">Status history</Typography>
                {selectedIssue.statusHistory.map((item) => (
                  <Box key={item.id}>
                    <Typography variant="body2">
                      {item.fromStatus || "New"} to {item.toStatus}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDateTime(item.createdAt)} by {item.actor}
                      {item.comment ? ` - ${item.comment}` : ""}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            startIcon={<SaveRoundedIcon />}
            onClick={() => void handleSaveStatus()}
            disabled={saving}
          >
            Save status
          </Button>
          <Button onClick={() => setSelectedIssue(null)} disabled={saving}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
