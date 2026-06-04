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
import BugReportRoundedIcon from "@mui/icons-material/BugReportRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import { useTranslation } from "react-i18next";
import { AppDataTable } from "../components/datatable/AppDataTable";
import { PageHeader } from "../components/layout/PageHeader";
import { SectionCard } from "../components/layout/SectionCard";
import { DragDropUpload } from "../components/upload/DragDropUpload";
import { useNotifier } from "../hooks/useNotifier";
import { issueApi } from "../services/api/issueApi";
import { formatFileSize } from "../utils/formatters";

const issueCategories = [
  "Bug",
  "Access",
  "Performance",
  "Data issue",
  "UI issue",
  "Other",
];

const initialIssueForm = {
  title: "",
  category: "Bug",
  description: "",
};

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

export function HelpCenterPage() {
  const { t } = useTranslation();
  const { notify } = useNotifier();
  const [issues, setIssues] = useState([]);
  const [issuesLoading, setIssuesLoading] = useState(false);
  const [issuesError, setIssuesError] = useState("");
  const [form, setForm] = useState(initialIssueForm);
  const [files, setFiles] = useState([]);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [closingIssue, setClosingIssue] = useState(false);

  const loadIssues = async () => {
    setIssuesLoading(true);
    setIssuesError("");

    try {
      setIssues(await issueApi.getMyIssues());
    } catch (error) {
      setIssuesError(getErrorMessage(error, "Could not load issues."));
    } finally {
      setIssuesLoading(false);
    }
  };

  useEffect(() => {
    void loadIssues();
  }, []);

  const issueColumns = useMemo(
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
        id: "attachments",
        label: "Images",
        align: "right",
        width: 110,
        render: (row) => row.attachments.length,
        sortAccessor: (row) => row.attachments.length,
      },
      {
        id: "actions",
        label: "",
        width: 90,
        sortable: false,
        searchable: false,
        render: (row) => (
          <Tooltip title="View issue">
            <IconButton size="small" color="primary" onClick={() => setSelectedIssue(row)}>
              <VisibilityRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
    [],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      title: form.title.trim(),
      category: form.category,
      description: form.description.trim(),
      files,
    };

    if (!payload.title || !payload.description) {
      setSubmitError("Title and description are required.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const created = await issueApi.createIssue(payload);
      setForm(initialIssueForm);
      setFiles([]);
      setIssues((current) => [created, ...current]);
      notify({ message: `Issue ${created.issueNo} reported.`, severity: "success" });
    } catch (error) {
      setSubmitError(getErrorMessage(error, "Could not report issue."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenAttachment = async (issue, attachment) => {
    try {
      const { blob, contentType } = await issueApi.downloadAttachment(issue.id, attachment.id);
      const url = URL.createObjectURL(new Blob([blob], { type: contentType }));
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch (error) {
      notify({
        message: getErrorMessage(error, "Could not open attachment."),
        severity: "error",
      });
    }
  };

  const handleCloseIssue = async () => {
    if (!selectedIssue) {
      return;
    }

    setClosingIssue(true);

    try {
      const updated = await issueApi.closeIssue({ id: selectedIssue.id, comment: "Closed by reporter" });
      setSelectedIssue(updated);
      setIssues((current) => current.map((issue) => (issue.id === updated.id ? updated : issue)));
      notify({ message: `Issue ${updated.issueNo} closed.`, severity: "success" });
    } catch (error) {
      notify({
        message: getErrorMessage(error, "Could not close issue."),
        severity: "error",
      });
    } finally {
      setClosingIssue(false);
    }
  };

  return (
    <Stack spacing={3.5}>
      <PageHeader
        breadcrumbs={[
          { label: t("dashboard.breadcrumbs.root"), to: "/dashboard" },
          { label: "Help" },
          { label: "Report an issue" },
        ]}
        title="Report an issue"
        subtitle="Report portal issues and follow them from open to resolved or closed."
        actions={
          <Chip
            label="Report an issue"
            color="primary"
            variant="outlined"
            icon={<BugReportRoundedIcon />}
          />
        }
      />

      <SectionCard
        title="Report an issue"
        subtitle="Describe what happened and attach screenshots if they help the support team reproduce it."
      >
        <Stack
          component="form"
          spacing={2.25}
          onSubmit={handleSubmit}
          sx={{ maxWidth: 980 }}
        >
          {submitError ? (
            <Alert severity="error" variant="outlined">
              {submitError}
            </Alert>
          ) : null}

          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
            }}
          >
            <TextField
              label="Title"
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({ ...current, title: event.target.value }))
              }
              required
              size="small"
              disabled={submitting}
              inputProps={{ maxLength: 200 }}
            />
            <TextField
              select
              label="Category"
              value={form.category}
              onChange={(event) =>
                setForm((current) => ({ ...current, category: event.target.value }))
              }
              size="small"
              disabled={submitting}
            >
              {issueCategories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <TextField
            label="Description"
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({ ...current, description: event.target.value }))
            }
            required
            multiline
            minRows={4}
            disabled={submitting}
          />

          <DragDropUpload
            files={files}
            onFilesChange={(nextFiles) => setFiles(nextFiles.slice(0, 5))}
            allowedExtensions={["png", "jpg", "jpeg", "gif", "webp"]}
            maxSizeMb={10}
            disabled={submitting}
            loading={submitting}
            compact
          />

          <Button
            type="submit"
            variant="contained"
            startIcon={<SendRoundedIcon />}
            disabled={submitting}
            sx={{ alignSelf: "flex-start" }}
          >
            Submit issue
          </Button>
        </Stack>
      </SectionCard>

      <SectionCard
        title="My issues"
        subtitle="Track issue status and support updates."
        action={
          <Tooltip title="Refresh issues">
            <IconButton color="primary" onClick={() => void loadIssues()} disabled={issuesLoading}>
              <RefreshRoundedIcon />
            </IconButton>
          </Tooltip>
        }
      >
        <Stack spacing={2}>
          {issuesError ? (
            <Alert severity="error" variant="outlined">
              {issuesError}
            </Alert>
          ) : null}
          <AppDataTable
            columns={issueColumns}
            rows={issues}
            loading={issuesLoading}
            defaultRowsPerPage={10}
            defaultSortBy="updatedAt"
            defaultSortDirection="desc"
            searchPlaceholder="Search issues"
            emptyTitle="No issues reported"
            emptyDescription="Issues you report will appear here."
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
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                {selectedIssue.description}
              </Typography>
              {selectedIssue.adminNote ? (
                <Alert severity="info" variant="outlined">
                  {selectedIssue.adminNote}
                </Alert>
              ) : null}

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
          {selectedIssue?.status === "Resolved" ? (
            <Button
              color="success"
              variant="contained"
              onClick={() => void handleCloseIssue()}
              disabled={closingIssue}
              startIcon={<CloseRoundedIcon />}
            >
              Close issue
            </Button>
          ) : null}
          <Button onClick={() => setSelectedIssue(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
