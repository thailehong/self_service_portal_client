import { memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AddTaskRoundedIcon from "@mui/icons-material/AddTaskRounded";
import AttachFileRoundedIcon from "@mui/icons-material/AttachFileRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import FormatAlignCenterRoundedIcon from "@mui/icons-material/FormatAlignCenterRounded";
import FormatAlignLeftRoundedIcon from "@mui/icons-material/FormatAlignLeftRounded";
import FormatAlignRightRoundedIcon from "@mui/icons-material/FormatAlignRightRounded";
import FormatBoldRoundedIcon from "@mui/icons-material/FormatBoldRounded";
import FormatColorTextRoundedIcon from "@mui/icons-material/FormatColorTextRounded";
import FormatItalicRoundedIcon from "@mui/icons-material/FormatItalicRounded";
import FormatListBulletedRoundedIcon from "@mui/icons-material/FormatListBulletedRounded";
import FormatListNumberedRoundedIcon from "@mui/icons-material/FormatListNumberedRounded";
import FormatUnderlinedRoundedIcon from "@mui/icons-material/FormatUnderlinedRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import { AppSnackbarContext } from "../components/common/AppSnackbar";
import { AppDataTable } from "../components/datatable/AppDataTable";
import { PageHeader } from "../components/layout/PageHeader";
import { SectionCard } from "../components/layout/SectionCard";
import { useAppSelector } from "../hooks/useAppSelector";
import { selectAuth } from "../features/auth/authSlice";
import { itApplicationRequestApi } from "../services/api/itApplicationRequestApi";
import { userApi } from "../services/api/userApi";
import { canAccessAdministrator } from "../utils/roles";
import { formatDateLabel, formatDateTimeLabel, formatFileSize } from "../utils/formatters";
import { getErrorMessage } from "./workflow/workflowUtils";

const masterDataTypes = [
  { value: "RequestType", label: "Request Type" },
  { value: "RelatedApplication", label: "Related Application" },
  { value: "Priority", label: "Priority" },
  { value: "EffectToCompanyProfitAndLoss", label: "Effect to Company Profit & Loss" },
  { value: "Site", label: "Site" },
  { value: "BU", label: "BU" },
  { value: "Category", label: "Category" },
  { value: "SourceOfRequest", label: "Source of Request" },
  { value: "SizeOfRequest", label: "Size of Request" },
];

const tabs = [
  { value: "new", label: "New Request", icon: <AddRoundedIcon fontSize="small" /> },
  { value: "myRequests", label: "My Request", icon: <EditRoundedIcon fontSize="small" /> },
  { value: "approvals", label: "Pending My Approval", icon: <CheckCircleRoundedIcon fontSize="small" /> },
  { value: "requests", label: "Request List", icon: <VisibilityRoundedIcon fontSize="small" /> },
  { value: "tasks", label: "Task List", icon: <AddTaskRoundedIcon fontSize="small" /> },
  { value: "myTasks", label: "My Tasks", icon: <TaskAltRoundedIcon fontSize="small" /> },
  { value: "masterData", label: "Master Data", icon: <EditRoundedIcon fontSize="small" /> },
];

const nonItTabs = new Set(["new", "myRequests", "approvals"]);

const dateTextFieldProps = {
  InputLabelProps: { shrink: true },
  slotProps: {
    inputLabel: { shrink: true },
    htmlInput: { placeholder: "" },
  },
};

const initialRequestForm = {
  title: "",
  requestType: "",
  refer: "",
  relatedApplication: "",
  relatedModule: "",
  expectedCompleteDate: "",
  requesterUserName: "",
  requesterDisplayName: "",
  requesterEmail: "",
  requesterEmployeeId: "",
  department: "",
  priority: "",
  site: "",
  bu: "",
  effectToCompanyProfitAndLoss: "",
  estimateCostSaving: "",
  detailOfProfitAndLoss: "",
  currentSituation: "",
  briefOfRequest: "",
  operationProcessFlowChart: "",
  functionReportDescription: "",
  files: [],
};

const initialIntakeForm = {
  approversText: "",
  category: "",
  sourceOfRequest: "",
  sizeOfRequest: "",
  estimateStartDate: "",
  estimateCompleteDate: "",
  itInCharge: "",
  estimateCostSaving: "",
  comment: "",
};

const initialTaskForm = {
  taskName: "",
  status: "NotStarted",
  estimateStartDate: "",
  estimateCompleteDate: "",
  assignTo: "",
  assignToDisplayName: "",
  duration: "",
};

const initialMasterForm = {
  id: null,
  type: "RequestType",
  value: "",
  label: "",
  sortOrder: 0,
  isActive: true,
};

function getUserValue(user, ...keys) {
  return keys.map((key) => user?.[key]).find((value) => value !== undefined && value !== null && value !== "") || "";
}

function buildRequesterFields(user) {
  return {
    requesterUserName: getUserValue(user, "username", "Username"),
    requesterDisplayName: getUserValue(user, "displayName", "DisplayName"),
    requesterEmail: getUserValue(user, "email", "Email"),
    requesterEmployeeId: getUserValue(user, "employeeId", "employeeID", "EmployeeID"),
    department: getUserValue(user, "department", "Department"),
    site: getUserValue(user, "location", "Location"),
    bu: getUserValue(user, "bu", "BU"),
  };
}

function getUserOptionLabel(user) {
  if (!user) {
    return "";
  }

  const displayName = getUserValue(user, "displayName", "DisplayName");
  const username = getUserValue(user, "username", "Username");
  const email = getUserValue(user, "email", "Email");
  return [displayName, username || email].filter(Boolean).join(" - ");
}

function getUserIdentityValues(user) {
  return [
    getUserValue(user, "username", "Username"),
    getUserValue(user, "email", "Email"),
    getUserValue(user, "employeeId", "employeeID", "EmployeeID"),
  ]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase());
}

function isSameUserOption(left, right) {
  const leftValues = getUserIdentityValues(left);
  const rightValues = getUserIdentityValues(right);
  return leftValues.some((value) => rightValues.includes(value));
}

function isItUser(user) {
  if (canAccessAdministrator(user)) {
    return true;
  }

  const text = [
    getUserValue(user, "department", "Department"),
    getUserValue(user, "jobTitle", "JobTitle"),
    getUserValue(user, "company", "Company"),
  ].join(" ");

  return /\bIT\b|Information Technology|DMS/i.test(text);
}

function getStatusColor(status) {
  switch (status) {
    case "Draft":
      return "default";
    case "Created":
      return "info";
    case "PendingApproval":
      return "warning";
    case "Approved":
      return "success";
    case "Rejected":
      return "error";
    case "Completed":
      return "success";
    case "InProgress":
      return "warning";
    case "NotStarted":
      return "default";
    default:
      return "primary";
  }
}

function StatusChip({ status }) {
  return <Chip size="small" label={status || "-"} color={getStatusColor(status)} variant="outlined" />;
}

function optionRows(options, type) {
  return options?.[type] || [];
}

const OptionField = memo(function OptionField({ options, type, label, value, onChange, required = false, ...props }) {
  const rows = optionRows(options, type);
  if (!rows.length) {
    return (
      <TextField
        label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        fullWidth
        {...props}
      />
    );
  }

  return (
    <TextField
      select
      label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      required={required}
      fullWidth
      {...props}
    >
      {rows.map((item) => (
        <MenuItem key={item.id || `${type}-${item.value}`} value={item.value}>
          {item.label}
        </MenuItem>
      ))}
      {value && !rows.some((item) => String(item.value) === String(value)) ? (
        <MenuItem value={value}>{value}</MenuItem>
      ) : null}
    </TextField>
  );
});

const RichTextField = memo(function RichTextField({ label, value, onChange, required = false }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== (value || "")) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const runCommand = (command, commandValue = null) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    onChange(editorRef.current?.innerHTML || "");
  };

  return (
    <Stack spacing={1} sx={{ gridColumn: { md: "1 / -1" } }}>
      <Typography variant="caption" color="text.secondary">
        {label}{required ? " *" : ""}
      </Typography>
      <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap" alignItems="center">
        <TextField
          select
          size="small"
          label="Heading"
          defaultValue="P"
          sx={{ width: 128 }}
          onChange={(event) => runCommand("formatBlock", event.target.value)}
        >
          <MenuItem value="P">Normal</MenuItem>
          <MenuItem value="H2">Heading 2</MenuItem>
          <MenuItem value="H3">Heading 3</MenuItem>
          <MenuItem value="H4">Heading 4</MenuItem>
        </TextField>
        <Tooltip title="Bold">
          <IconButton size="small" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("bold")}>
            <FormatBoldRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Italic">
          <IconButton size="small" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("italic")}>
            <FormatItalicRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Underline">
          <IconButton size="small" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("underline")}>
            <FormatUnderlinedRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Bullet list">
          <IconButton size="small" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("insertUnorderedList")}>
            <FormatListBulletedRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Numbered list">
          <IconButton size="small" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("insertOrderedList")}>
            <FormatListNumberedRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Align left">
          <IconButton size="small" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("justifyLeft")}>
            <FormatAlignLeftRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Align center">
          <IconButton size="small" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("justifyCenter")}>
            <FormatAlignCenterRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Align right">
          <IconButton size="small" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("justifyRight")}>
            <FormatAlignRightRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <TextField
          select
          size="small"
          label="Color"
          defaultValue=""
          sx={{ width: 118 }}
          onChange={(event) => {
            if (event.target.value) {
              runCommand("foreColor", event.target.value);
            }
          }}
          InputProps={{ startAdornment: <FormatColorTextRoundedIcon fontSize="small" /> }}
        >
          <MenuItem value="">Default</MenuItem>
          <MenuItem value="#1f2937">Black</MenuItem>
          <MenuItem value="#2563eb">Blue</MenuItem>
          <MenuItem value="#16a34a">Green</MenuItem>
          <MenuItem value="#dc2626">Red</MenuItem>
          <MenuItem value="#ca8a04">Amber</MenuItem>
        </TextField>
      </Stack>
      <Box
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
        sx={{
          minHeight: 132,
          px: 1.5,
          py: 1.25,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
          bgcolor: "background.paper",
          outline: "none",
          overflowWrap: "anywhere",
          "&:focus": {
            borderColor: "primary.main",
            boxShadow: (theme) => `0 0 0 1px ${theme.palette.primary.main}`,
          },
          "& ul, & ol": {
            pl: 3,
          },
        }}
      />
    </Stack>
  );
});

const CompactAttachmentInput = memo(function CompactAttachmentInput({ files, onFilesChange, disabled = false }) {
  const inputRef = useRef(null);

  const handleFiles = (fileList) => {
    const selectedFiles = Array.from(fileList || []).map((file) => ({
      id: `${file.name}-${file.lastModified}-${file.size}`,
      file,
      progress: 100,
    }));

    if (selectedFiles.length) {
      onFilesChange([...files, ...selectedFiles]);
    }
  };

  return (
    <Stack spacing={1} sx={{ gridColumn: { md: "1 / -1" } }}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }}>
        <Button
          variant="outlined"
          startIcon={<AttachFileRoundedIcon />}
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          Attach files
        </Button>
        <Typography variant="body2" color="text.secondary">
          PDF, Office, image, or TXT. Max 20 MB each.
        </Typography>
      </Stack>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.txt"
        hidden
        multiple
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = "";
        }}
      />
      {files.length ? (
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          {files.map((item) => (
            <Chip
              key={item.id}
              label={`${item.file.name} (${formatFileSize(item.file.size)})`}
              onDelete={() => onFilesChange(files.filter((file) => file.id !== item.id))}
              deleteIcon={<DeleteOutlineRoundedIcon />}
              variant="outlined"
              sx={{ maxWidth: "100%", "& .MuiChip-label": { overflowWrap: "anywhere", whiteSpace: "normal" } }}
            />
          ))}
        </Stack>
      ) : null}
    </Stack>
  );
});

function buildRequesterOptionFromForm(form) {
  if (!form.requesterUserName && !form.requesterDisplayName && !form.requesterEmail && !form.requesterEmployeeId) {
    return null;
  }

  return {
    username: form.requesterUserName,
    displayName: form.requesterDisplayName,
    email: form.requesterEmail,
    employeeId: form.requesterEmployeeId,
    department: form.department,
    location: form.site,
    bu: form.bu,
  };
}

function buildRequestFormFromRequest(request) {
  return {
    ...initialRequestForm,
    title: request?.title || "",
    requestType: request?.requestType || "",
    refer: request?.refer || "",
    relatedApplication: request?.relatedApplication || "",
    relatedModule: request?.relatedModule || "",
    expectedCompleteDate: toDateInput(request?.expectedCompleteDate),
    requesterUserName: request?.requesterUserName || "",
    requesterDisplayName: request?.requesterDisplayName || "",
    requesterEmail: request?.requesterEmail || "",
    requesterEmployeeId: request?.requesterEmployeeId || "",
    department: request?.department || "",
    priority: request?.priority || "",
    site: request?.site || "",
    bu: request?.bu || "",
    effectToCompanyProfitAndLoss: request?.effectToCompanyProfitAndLoss || "",
    estimateCostSaving: request?.estimateCostSaving ?? "",
    detailOfProfitAndLoss: request?.detailOfProfitAndLoss || "",
    currentSituation: request?.currentSituation || "",
    briefOfRequest: request?.briefOfRequest || "",
    operationProcessFlowChart: request?.operationProcessFlowChart || "",
    functionReportDescription: request?.functionReportDescription || "",
    files: [],
  };
}

function RequestFormFields({ form, masterOptions, users, usersLoading, onChange, onPatch, onLoadUsers, submitting }) {
  const currentRequesterOption = useMemo(() => buildRequesterOptionFromForm(form), [
    form.bu,
    form.department,
    form.requesterDisplayName,
    form.requesterEmail,
    form.requesterEmployeeId,
    form.requesterUserName,
    form.site,
  ]);
  const selectedRequester = useMemo(() => {
    if (!currentRequesterOption) {
      return null;
    }

    return users.find((user) => isSameUserOption(user, currentRequesterOption)) || currentRequesterOption;
  }, [currentRequesterOption, users]);
  const requesterOptions = useMemo(() => {
    if (!selectedRequester || users.some((user) => isSameUserOption(user, selectedRequester))) {
      return users;
    }

    return [selectedRequester, ...users];
  }, [selectedRequester, users]);
  const handlers = useMemo(() => ({
    title: (event) => onChange("title", event.target.value),
    requestType: (value) => onChange("requestType", value),
    refer: (event) => onChange("refer", event.target.value),
    relatedApplication: (value) => onChange("relatedApplication", value),
    relatedModule: (event) => onChange("relatedModule", event.target.value),
    expectedCompleteDate: (event) => onChange("expectedCompleteDate", event.target.value),
    department: (event) => onChange("department", event.target.value),
    priority: (value) => onChange("priority", value),
    site: (value) => onChange("site", value),
    bu: (value) => onChange("bu", value),
    effectToCompanyProfitAndLoss: (value) => onChange("effectToCompanyProfitAndLoss", value),
    estimateCostSaving: (event) => onChange("estimateCostSaving", event.target.value),
    detailOfProfitAndLoss: (value) => onChange("detailOfProfitAndLoss", value),
    currentSituation: (value) => onChange("currentSituation", value),
    briefOfRequest: (value) => onChange("briefOfRequest", value),
    operationProcessFlowChart: (value) => onChange("operationProcessFlowChart", value),
    functionReportDescription: (value) => onChange("functionReportDescription", value),
    files: (files) => onChange("files", files),
  }), [onChange]);

  return (
    <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" } }}>
      <TextField label="Title of Request" value={form.title} onChange={handlers.title} required fullWidth />
      <OptionField options={masterOptions} type="RequestType" label="Request Type" value={form.requestType} onChange={handlers.requestType} />
      <TextField label="Refer" value={form.refer} onChange={handlers.refer} fullWidth />
      <OptionField options={masterOptions} type="RelatedApplication" label="Related Application" value={form.relatedApplication} onChange={handlers.relatedApplication} />
      <TextField label="Related Module" value={form.relatedModule} onChange={handlers.relatedModule} fullWidth />
      <TextField label="Expected Complete Date" type="date" value={form.expectedCompleteDate} onChange={handlers.expectedCompleteDate} fullWidth {...dateTextFieldProps} />
      <Autocomplete
        options={requesterOptions}
        value={selectedRequester}
        loading={usersLoading}
        onOpen={() => {
          if (!users.length) {
            void onLoadUsers?.();
          }
        }}
        onChange={(_, user) => {
          if (user) {
            onPatch(buildRequesterFields(user));
          }
        }}
        getOptionLabel={getUserOptionLabel}
        isOptionEqualToValue={isSameUserOption}
        sx={{ gridColumn: { md: "1 / -1" } }}
        renderInput={(params) => <TextField {...params} label="Requester" fullWidth />}
      />
      <TextField label="Department" value={form.department} onChange={handlers.department} fullWidth />
      <OptionField options={masterOptions} type="Priority" label="Priority" value={form.priority} onChange={handlers.priority} />
      <OptionField options={masterOptions} type="Site" label="Site" value={form.site} onChange={handlers.site} />
      <OptionField options={masterOptions} type="BU" label="BU" value={form.bu} onChange={handlers.bu} />
      <OptionField options={masterOptions} type="EffectToCompanyProfitAndLoss" label="Effect to Company Profit & Loss" value={form.effectToCompanyProfitAndLoss} onChange={handlers.effectToCompanyProfitAndLoss} />
      <TextField label="Estimate Cost Saving" type="number" value={form.estimateCostSaving} onChange={handlers.estimateCostSaving} fullWidth />
      <RichTextField label="Detail of Profit and Loss" value={form.detailOfProfitAndLoss} onChange={handlers.detailOfProfitAndLoss} />
      <RichTextField label="Current Situation" value={form.currentSituation} onChange={handlers.currentSituation} />
      <RichTextField label="Brief of Request" value={form.briefOfRequest} onChange={handlers.briefOfRequest} />
      <RichTextField label="Operation Process Flow Chart" value={form.operationProcessFlowChart} onChange={handlers.operationProcessFlowChart} />
      <RichTextField label="Function/Report Description" value={form.functionReportDescription} onChange={handlers.functionReportDescription} />
      <CompactAttachmentInput files={form.files} onFilesChange={handlers.files} disabled={submitting} />
    </Box>
  );
}

function NewRequestSection({ auth, masterOptions, users, usersLoading, submitting, onCreate, onLoadUsers }) {
  const [form, setForm] = useState(() => ({
    ...initialRequestForm,
    ...buildRequesterFields(auth.user),
  }));

  useEffect(() => {
    setForm((current) => {
      if (current.requesterUserName || current.requesterEmail || current.requesterEmployeeId) {
        return current;
      }

      return {
        ...current,
        ...buildRequesterFields(auth.user),
      };
    });
  }, [auth.user]);

  const updateForm = useCallback((field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  }, []);

  const patchForm = useCallback((fields) => {
    setForm((current) => ({ ...current, ...fields }));
  }, []);

  const handleCreate = async () => {
    const created = await onCreate(form);
    if (created) {
      setForm({
        ...initialRequestForm,
        ...buildRequesterFields(auth.user),
      });
    }
  };

  return (
    <SectionCard title="New Request">
      <RequestFormFields
        form={form}
        masterOptions={masterOptions}
        users={users}
        usersLoading={usersLoading}
        onChange={updateForm}
        onPatch={patchForm}
        onLoadUsers={onLoadUsers}
        submitting={submitting}
      />
      <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
        <Button variant="contained" startIcon={<SaveRoundedIcon />} disabled={submitting} onClick={handleCreate}>
          Create draft
        </Button>
      </Stack>
    </SectionCard>
  );
}

function toDateInput(value) {
  if (!value) {
    return "";
  }

  return String(value).slice(0, 10);
}

function formatDate(value) {
  return value ? formatDateLabel(value) : "";
}

function parseApprovers(value) {
  return value
    .split(/[,;\n\r]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((approver) => ({ approver, approverDisplayName: "" }));
}

function FieldValue({ label, value }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}>
        {value || "-"}
      </Typography>
    </Box>
  );
}

function RichTextValue({ label, value }) {
  const html = value || "";
  const textOnly = html.replace(/<[^>]+>/g, "").trim();

  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      {textOnly || /<(br|ul|ol|li|p|div|table|img)\b/i.test(html) ? (
        <Box
          sx={{
            mt: 0.5,
            px: 1.5,
            py: 1.25,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            bgcolor: "background.default",
            overflowWrap: "anywhere",
            "& p": { my: 0.5 },
            "& ul, & ol": { pl: 3, my: 0.5 },
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <Typography variant="body2">-</Typography>
      )}
    </Box>
  );
}

function openBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function ITApplicationRequestPage() {
  const auth = useAppSelector(selectAuth);
  const { notify } = useContext(AppSnackbarContext);
  const canManageMasterData = isItUser(auth.user);
  const visibleTabs = useMemo(
    () => tabs.filter((tab) => canManageMasterData || nonItTabs.has(tab.value)),
    [canManageMasterData],
  );
  const [activeTab, setActiveTab] = useState("new");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [masterOptions, setMasterOptions] = useState({});
  const [masterRows, setMasterRows] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [detailState, setDetailState] = useState({ open: false, request: null, loading: false });
  const [draftState, setDraftState] = useState({ open: false, request: null, loading: false });
  const [intakeState, setIntakeState] = useState({ open: false, request: null, form: initialIntakeForm });
  const [approvalState, setApprovalState] = useState({ open: false, request: null, decision: "approve", comment: "" });
  const [taskState, setTaskState] = useState({ open: false, request: null, form: initialTaskForm });
  const [masterForm, setMasterForm] = useState(initialMasterForm);
  const masterOptionsRef = useRef(masterOptions);
  const usersRef = useRef(users);

  useEffect(() => {
    masterOptionsRef.current = masterOptions;
  }, [masterOptions]);

  useEffect(() => {
    usersRef.current = users;
  }, [users]);

  const loadMasterOptions = useCallback(async (force = false) => {
    if (!force && Object.keys(masterOptionsRef.current).length) {
      return masterOptionsRef.current;
    }

    const options = await itApplicationRequestApi.getMasterDataOptions();
    masterOptionsRef.current = options;
    setMasterOptions(options);
    return options;
  }, []);

  const loadUsers = useCallback(async (force = false) => {
    if (!force && usersRef.current.length) {
      return usersRef.current;
    }

    setUsersLoading(true);
    try {
      const rows = await userApi.getAllUsers().catch(() => []);
      usersRef.current = rows;
      setUsers(rows);
      return rows;
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const loadTabData = useCallback(async (tab = activeTab, force = false) => {
    setLoading(true);
    setError("");

    try {
      if (tab === "new") {
        await loadMasterOptions(force);
        return;
      }

      if (tab === "myRequests") {
        setMyRequests(await itApplicationRequestApi.getMyRequests());
        return;
      }

      if (tab === "approvals") {
        setPendingApprovals(await itApplicationRequestApi.getPendingMyApproval());
        return;
      }

      if (tab === "requests") {
        setRequests(await itApplicationRequestApi.getRequests());
        return;
      }

      if (tab === "tasks") {
        setTasks(await itApplicationRequestApi.getTasks());
        return;
      }

      if (tab === "myTasks") {
        setMyTasks(await itApplicationRequestApi.getMyTasks());
        return;
      }

      if (tab === "masterData") {
        const [options, rows] = await Promise.all([
          itApplicationRequestApi.getMasterDataOptions(),
          itApplicationRequestApi.getMasterData(),
        ]);
        masterOptionsRef.current = options;
        setMasterOptions(options);
        setMasterRows(rows);
      }
    } catch (loadError) {
      setError(getErrorMessage(loadError, "Could not load IT application requests."));
    } finally {
      setLoading(false);
    }
  }, [activeTab, loadMasterOptions]);

  const ensureUsers = useCallback(() => loadUsers(), [loadUsers]);

  useEffect(() => {
    void loadTabData(activeTab);
  }, [activeTab, loadTabData]);

  useEffect(() => {
    if (!visibleTabs.some((tab) => tab.value === activeTab)) {
      setActiveTab("new");
    }
  }, [activeTab, visibleTabs]);

  const tabCounts = {
    requests: requests.length,
    tasks: tasks.length,
    myRequests: myRequests.length,
    myTasks: myTasks.length,
    approvals: pendingApprovals.length,
    masterData: masterRows.length,
  };

  const getTabLabel = (tab) => {
    if (tab.value === "new") {
      return tab.label;
    }

    return `${tab.label} (${tabCounts[tab.value] ?? 0})`;
  };

  const handleCreateRequest = async (form) => {
    if (!form.title.trim()) {
      setError("Title is required to create a draft.");
      return false;
    }

    setSubmitting(true);
    setError("");
    try {
      await itApplicationRequestApi.createRequest(form);
      notify({ message: "Draft created.", severity: "success" });
      setActiveTab("myRequests");
      return true;
    } catch (createError) {
      setError(getErrorMessage(createError, "Could not create draft."));
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const openDetail = async (request) => {
    setDetailState({ open: true, request, loading: true });
    try {
      const detail = await itApplicationRequestApi.getRequestDetail(request.id);
      setDetailState({ open: true, request: detail, loading: false });
    } catch (detailError) {
      setDetailState({ open: false, request: null, loading: false });
      setError(getErrorMessage(detailError, "Could not load request detail."));
    }
  };

  const openDraftEdit = async (request) => {
    setDraftState({ open: true, request, loading: true });
    try {
      const [detail] = await Promise.all([
        itApplicationRequestApi.getRequestDetail(request.id),
        loadMasterOptions(),
      ]);
      setDraftState({ open: true, request: detail, loading: false });
    } catch (detailError) {
      setDraftState({ open: false, request: null, loading: false });
      setError(getErrorMessage(detailError, "Could not load draft."));
    }
  };

  const saveDraft = async (form) => {
    if (!form.title.trim()) {
      setError("Title is required to save a draft.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await itApplicationRequestApi.updateDraft(draftState.request.id, form);
      setDraftState({ open: false, request: null, loading: false });
      notify({ message: "Draft updated.", severity: "success" });
      await loadTabData("myRequests", true);
    } catch (draftError) {
      setError(getErrorMessage(draftError, "Could not update draft."));
    } finally {
      setSubmitting(false);
    }
  };

  const submitDraft = async (request) => {
    setSubmitting(true);
    setError("");
    try {
      await itApplicationRequestApi.submitDraft(request.id);
      notify({ message: "Request submitted.", severity: "success" });
      await loadTabData("myRequests", true);
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Could not submit draft."));
    } finally {
      setSubmitting(false);
    }
  };

  const openIntake = (request) => {
    void loadMasterOptions();
    setIntakeState({
      open: true,
      request,
      form: {
        ...initialIntakeForm,
        category: request.category || "",
        sourceOfRequest: request.sourceOfRequest || "",
        sizeOfRequest: request.sizeOfRequest || "",
        estimateStartDate: toDateInput(request.estimateStartDate),
        estimateCompleteDate: toDateInput(request.estimateCompleteDate),
        itInCharge: request.itInCharge || getUserValue(auth.user, "email", "Email", "username", "Username"),
        estimateCostSaving: request.estimateCostSaving ?? "",
      },
    });
  };

  const submitIntake = async () => {
    const approvers = parseApprovers(intakeState.form.approversText);
    if (!approvers.length) {
      setError("At least one approver is required.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await itApplicationRequestApi.intakeRequest(intakeState.request.id, {
        ...intakeState.form,
        approvers,
      });
      setIntakeState({ open: false, request: null, form: initialIntakeForm });
      notify({ message: "Request submitted for approval.", severity: "success" });
      await loadTabData(activeTab, true);
    } catch (intakeError) {
      setError(getErrorMessage(intakeError, "Could not submit request for approval."));
    } finally {
      setSubmitting(false);
    }
  };

  const openApproval = (request, decision) => {
    setApprovalState({ open: true, request, decision, comment: "" });
  };

  const submitApproval = async () => {
    setSubmitting(true);
    setError("");
    try {
      if (approvalState.decision === "reject") {
        await itApplicationRequestApi.rejectRequest(approvalState.request.id, approvalState.comment);
      } else {
        await itApplicationRequestApi.approveRequest(approvalState.request.id, approvalState.comment);
      }

      setApprovalState({ open: false, request: null, decision: "approve", comment: "" });
      notify({ message: approvalState.decision === "reject" ? "Request rejected." : "Request approved.", severity: "success" });
      await loadTabData("approvals", true);
    } catch (approvalError) {
      setError(getErrorMessage(approvalError, "Could not submit approval decision."));
    } finally {
      setSubmitting(false);
    }
  };

  const openTaskDialog = (request) => {
    setTaskState({ open: true, request, form: initialTaskForm });
  };

  const submitTask = async () => {
    if (!taskState.form.taskName.trim() || !taskState.form.assignTo.trim()) {
      setError("Task name and assignee are required.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await itApplicationRequestApi.createTask(taskState.request.id, taskState.form);
      setTaskState({ open: false, request: null, form: initialTaskForm });
      notify({ message: "Task created.", severity: "success" });
      await loadTabData(activeTab, true);
    } catch (taskError) {
      setError(getErrorMessage(taskError, "Could not create task."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleTaskAction = async (task, action) => {
    setSubmitting(true);
    setError("");
    try {
      if (action === "start") {
        await itApplicationRequestApi.startTask(task.id);
        notify({ message: "Task started.", severity: "success" });
      } else {
        await itApplicationRequestApi.completeTask(task.id);
        notify({ message: "Task completed.", severity: "success" });
      }
      await loadTabData(activeTab, true);
    } catch (taskError) {
      setError(getErrorMessage(taskError, "Could not update task."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadAttachment = async (requestId, attachment) => {
    try {
      const { blob } = await itApplicationRequestApi.downloadAttachment(requestId, attachment.id);
      openBlob(blob, attachment.fileName);
    } catch (downloadError) {
      setError(getErrorMessage(downloadError, "Could not download attachment."));
    }
  };

  const submitMasterData = async () => {
    if (!masterForm.value.trim() || !masterForm.label.trim()) {
      setError("Value and label are required.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      if (masterForm.id) {
        await itApplicationRequestApi.updateMasterData(masterForm.id, masterForm);
        notify({ message: "Master data updated.", severity: "success" });
      } else {
        await itApplicationRequestApi.createMasterData(masterForm);
        notify({ message: "Master data created.", severity: "success" });
      }
      setMasterForm(initialMasterForm);
      await loadTabData("masterData", true);
    } catch (masterError) {
      setError(getErrorMessage(masterError, "Could not save master data."));
    } finally {
      setSubmitting(false);
    }
  };

  const requestColumns = useMemo(() => [
    {
      id: "requestNo",
      label: "Request No",
      width: 150,
    },
    {
      id: "title",
      label: "Title",
      width: 260,
      render: (row) => (
        <Stack spacing={0.25} sx={{ minWidth: 0 }}>
          <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>{row.title}</Typography>
          <Typography variant="caption" color="text.secondary">{row.relatedApplication || "-"}</Typography>
        </Stack>
      ),
      searchAccessor: (row) => [row.title, row.relatedApplication, row.relatedModule].filter(Boolean).join(" "),
    },
    {
      id: "requester",
      label: "Requester",
      width: 180,
      render: (row) => row.requesterDisplayName || row.requesterUserName || "-",
      searchAccessor: (row) => [row.requesterDisplayName, row.requesterUserName, row.department].filter(Boolean).join(" "),
    },
    {
      id: "priority",
      label: "Priority",
      width: 110,
    },
    {
      id: "status",
      label: "Status",
      width: 150,
      render: (row) => <StatusChip status={row.status} />,
    },
    {
      id: "updatedAt",
      label: "Updated",
      width: 170,
      render: (row) => formatDateTimeLabel(row.updatedAt),
      searchAccessor: (row) => formatDateTimeLabel(row.updatedAt),
    },
    {
      id: "actions",
      label: "",
      width: 190,
      sortable: false,
      searchable: false,
      render: (row) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View">
            <IconButton size="small" onClick={() => openDetail(row)}>
              <VisibilityRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {row.canEditDraft ? (
            <Tooltip title="Edit draft">
              <IconButton size="small" disabled={submitting} onClick={() => openDraftEdit(row)}>
                <EditRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
          {row.canSubmitDraft ? (
            <Tooltip title="Submit draft">
              <IconButton size="small" color="primary" disabled={submitting} onClick={() => submitDraft(row)}>
                <CheckCircleRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
          {row.canIntake ? (
            <Tooltip title="IT intake">
              <IconButton size="small" onClick={() => openIntake(row)}>
                <AddRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
          {row.canApprove ? (
            <>
              <Tooltip title="Approve">
                <IconButton size="small" color="success" onClick={() => openApproval(row, "approve")}>
                  <CheckCircleRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reject">
                <IconButton size="small" color="error" onClick={() => openApproval(row, "reject")}>
                  <CancelRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          ) : null}
          {row.canCreateTask ? (
            <Tooltip title="Add task">
              <IconButton size="small" onClick={() => openTaskDialog(row)}>
                <AddTaskRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
        </Stack>
      ),
    },
  ], [activeTab, submitting]);

  const taskColumns = useMemo(() => [
    {
      id: "requestNo",
      label: "Request",
      width: 150,
    },
    {
      id: "taskName",
      label: "Task",
      width: 260,
      render: (row) => (
        <Stack spacing={0.25} sx={{ minWidth: 0 }}>
          <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>{row.taskName}</Typography>
          <Typography variant="caption" color="text.secondary">{row.requestTitle || "-"}</Typography>
        </Stack>
      ),
      searchAccessor: (row) => [row.taskName, row.requestTitle, row.requestNo].filter(Boolean).join(" "),
    },
    {
      id: "assignTo",
      label: "Assignee",
      width: 180,
      render: (row) => row.assignToDisplayName || row.assignTo || "-",
      searchAccessor: (row) => [row.assignToDisplayName, row.assignTo].filter(Boolean).join(" "),
    },
    {
      id: "status",
      label: "Status",
      width: 140,
      render: (row) => <StatusChip status={row.status} />,
    },
    {
      id: "estimate",
      label: "Estimate",
      width: 180,
      render: (row) => [formatDate(row.estimateStartDate), formatDate(row.estimateCompleteDate)].filter(Boolean).join(" - ") || "-",
      searchAccessor: (row) => [row.estimateStartDate, row.estimateCompleteDate].filter(Boolean).join(" "),
    },
    {
      id: "actual",
      label: "Actual",
      width: 180,
      render: (row) => [formatDate(row.actualStartDate), formatDate(row.actualCompleteDate)].filter(Boolean).join(" - ") || "-",
      searchAccessor: (row) => [row.actualStartDate, row.actualCompleteDate].filter(Boolean).join(" "),
    },
    {
      id: "actions",
      label: "",
      width: 110,
      sortable: false,
      searchable: false,
      render: (row) => (
        <Stack direction="row" spacing={0.5}>
          {row.canStart ? (
            <Tooltip title="Start task">
              <IconButton size="small" disabled={submitting} onClick={() => handleTaskAction(row, "start")}>
                <PlayArrowRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
          {row.canComplete ? (
            <Tooltip title="Complete task">
              <IconButton size="small" disabled={submitting} onClick={() => handleTaskAction(row, "complete")}>
                <TaskAltRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
        </Stack>
      ),
    },
  ], [activeTab, submitting]);

  const masterColumns = useMemo(() => [
    { id: "type", label: "Type", width: 180 },
    { id: "value", label: "Value", width: 180 },
    { id: "label", label: "Label", width: 240 },
    { id: "sortOrder", label: "Sort", width: 90 },
    {
      id: "isActive",
      label: "Active",
      width: 100,
      render: (row) => <Chip size="small" label={row.isActive ? "Active" : "Inactive"} color={row.isActive ? "success" : "default"} variant="outlined" />,
    },
    {
      id: "actions",
      label: "",
      width: 80,
      sortable: false,
      searchable: false,
      render: (row) => (
        <Tooltip title="Edit">
          <IconButton size="small" onClick={() => setMasterForm(row)}>
            <EditRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ], []);

  const renderRequestTable = (title, rows) => (
    <SectionCard
      title={title}
      action={(
        <Tooltip title="Refresh">
          <IconButton onClick={() => void loadTabData(activeTab, true)} disabled={loading}>
            <RefreshRoundedIcon />
          </IconButton>
        </Tooltip>
      )}
    >
      <AppDataTable
        columns={requestColumns}
        rows={rows}
        loading={loading}
        defaultRowsPerPage={10}
        emptyTitle="No requests"
        emptyDescription="No matching requests were found."
        defaultSortBy="updatedAt"
        defaultSortDirection="desc"
      />
    </SectionCard>
  );

  const renderTaskTable = (title, rows) => (
    <SectionCard
      title={title}
      action={(
        <Tooltip title="Refresh">
          <IconButton onClick={() => void loadTabData(activeTab, true)} disabled={loading}>
            <RefreshRoundedIcon />
          </IconButton>
        </Tooltip>
      )}
    >
      <AppDataTable
        columns={taskColumns}
        rows={rows}
        loading={loading}
        defaultRowsPerPage={10}
        emptyTitle="No tasks"
        emptyDescription="No matching tasks were found."
        defaultSortBy="updatedAt"
        defaultSortDirection="desc"
      />
    </SectionCard>
  );

  return (
    <Stack spacing={3}>
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Self Service", to: "/dashboard/self-service" },
          { label: "IT Application Request" },
        ]}
        title="IT Application Request"
        actions={(
          <Button startIcon={<RefreshRoundedIcon />} onClick={() => void loadTabData(activeTab, true)} disabled={loading}>
            Refresh
          </Button>
        )}
      />

      {error ? <Alert severity="error" onClose={() => setError("")}>{error}</Alert> : null}

      <SectionCard cardSx={{ borderRadius: 0 }} contentSx={{ pb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {visibleTabs.map((tab) => (
            <Tab key={tab.value} value={tab.value} icon={tab.icon} iconPosition="start" label={getTabLabel(tab)} />
          ))}
        </Tabs>
      </SectionCard>

      {activeTab === "new" ? (
        <NewRequestSection
          auth={auth}
          masterOptions={masterOptions}
          users={users}
          usersLoading={usersLoading}
          submitting={submitting}
          onCreate={handleCreateRequest}
          onLoadUsers={ensureUsers}
        />
      ) : null}

      {activeTab === "requests" ? renderRequestTable("Request List", requests) : null}
      {activeTab === "tasks" ? renderTaskTable("Task List", tasks) : null}
      {activeTab === "myRequests" ? renderRequestTable("My Request", myRequests) : null}
      {activeTab === "myTasks" ? renderTaskTable("My Tasks", myTasks) : null}
      {activeTab === "approvals" ? renderRequestTable("Pending My Approval", pendingApprovals) : null}

      {activeTab === "masterData" && canManageMasterData ? (
        <SectionCard title="Master Data">
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "180px 1fr 1fr 120px auto" }, alignItems: "center", mb: 2 }}>
            <TextField select label="Type" value={masterForm.type} onChange={(event) => setMasterForm((current) => ({ ...current, type: event.target.value }))} fullWidth>
              {masterDataTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
              ))}
            </TextField>
            <TextField label="Value" value={masterForm.value} onChange={(event) => setMasterForm((current) => ({ ...current, value: event.target.value }))} fullWidth />
            <TextField label="Label" value={masterForm.label} onChange={(event) => setMasterForm((current) => ({ ...current, label: event.target.value }))} fullWidth />
            <TextField label="Sort" type="number" value={masterForm.sortOrder} onChange={(event) => setMasterForm((current) => ({ ...current, sortOrder: event.target.value }))} fullWidth />
            <Stack direction="row" spacing={1} alignItems="center">
              <FormControlLabel
                control={<Switch checked={masterForm.isActive} onChange={(event) => setMasterForm((current) => ({ ...current, isActive: event.target.checked }))} />}
                label="Active"
              />
              <Button variant="contained" startIcon={<SaveRoundedIcon />} disabled={submitting} onClick={submitMasterData}>
                Save
              </Button>
            </Stack>
          </Box>
          <AppDataTable columns={masterColumns} rows={masterRows} loading={loading} defaultRowsPerPage={10} emptyTitle="No master data" />
        </SectionCard>
      ) : null}

      <RequestDetailDialog
        state={detailState}
        onClose={() => setDetailState({ open: false, request: null, loading: false })}
        onDownload={handleDownloadAttachment}
      />
      <DraftDialog
        state={draftState}
        masterOptions={masterOptions}
        users={users}
        usersLoading={usersLoading}
        submitting={submitting}
        onLoadUsers={ensureUsers}
        onClose={() => setDraftState({ open: false, request: null, loading: false })}
        onSubmit={saveDraft}
      />
      <IntakeDialog
        state={intakeState}
        options={masterOptions}
        submitting={submitting}
        onClose={() => setIntakeState({ open: false, request: null, form: initialIntakeForm })}
        onChange={(field, value) => setIntakeState((current) => ({ ...current, form: { ...current.form, [field]: value } }))}
        onSubmit={submitIntake}
      />
      <ApprovalDialog
        state={approvalState}
        submitting={submitting}
        onClose={() => setApprovalState({ open: false, request: null, decision: "approve", comment: "" })}
        onChange={(comment) => setApprovalState((current) => ({ ...current, comment }))}
        onSubmit={submitApproval}
      />
      <TaskDialog
        state={taskState}
        submitting={submitting}
        onClose={() => setTaskState({ open: false, request: null, form: initialTaskForm })}
        onChange={(field, value) => setTaskState((current) => ({ ...current, form: { ...current.form, [field]: value } }))}
        onSubmit={submitTask}
      />
    </Stack>
  );
}

function DraftDialog({ state, masterOptions, users, usersLoading, submitting, onLoadUsers, onClose, onSubmit }) {
  const [form, setForm] = useState(initialRequestForm);

  useEffect(() => {
    if (state.open && state.request) {
      setForm(buildRequestFormFromRequest(state.request));
    }
  }, [state.open, state.request]);

  const updateForm = useCallback((field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  }, []);

  const patchForm = useCallback((fields) => {
    setForm((current) => ({ ...current, ...fields }));
  }, []);

  return (
    <Dialog open={state.open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Edit Draft</DialogTitle>
      <DialogContent dividers>
        {state.loading ? (
          <Typography color="text.secondary">Loading...</Typography>
        ) : (
          <RequestFormFields
            form={form}
            masterOptions={masterOptions}
            users={users}
            usersLoading={usersLoading}
            onChange={updateForm}
            onPatch={patchForm}
            onLoadUsers={onLoadUsers}
            submitting={submitting}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>Close</Button>
        <Button variant="contained" startIcon={<SaveRoundedIcon />} disabled={submitting || state.loading} onClick={() => onSubmit(form)}>
          Save draft
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function RequestDetailDialog({ state, onClose, onDownload }) {
  const request = state.request;
  return (
    <Dialog open={state.open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>{request?.requestNo || "Request Detail"}</DialogTitle>
      <DialogContent dividers>
        {state.loading || !request ? (
          <Typography color="text.secondary">Loading...</Typography>
        ) : (
          <Stack spacing={2.5}>
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" } }}>
              <FieldValue label="Title" value={request.title} />
              <FieldValue label="Status" value={request.status} />
              <FieldValue label="Requester" value={request.requesterDisplayName || request.requesterUserName} />
              <FieldValue label="Request Type" value={request.requestType} />
              <FieldValue label="Related Application" value={request.relatedApplication} />
              <FieldValue label="Related Module" value={request.relatedModule} />
              <FieldValue label="Expected Complete Date" value={formatDate(request.expectedCompleteDate)} />
              <FieldValue label="Priority" value={request.priority} />
              <FieldValue label="Department" value={request.department} />
              <FieldValue label="Site" value={request.site} />
              <FieldValue label="BU" value={request.bu} />
              <FieldValue label="Effect to Company Profit & Loss" value={request.effectToCompanyProfitAndLoss} />
              <FieldValue label="Estimate Cost Saving" value={request.estimateCostSaving} />
              <FieldValue label="Category" value={request.category} />
              <FieldValue label="Source of Request" value={request.sourceOfRequest} />
              <FieldValue label="Size of Request" value={request.sizeOfRequest} />
              <FieldValue label="Estimate Start Date" value={formatDate(request.estimateStartDate)} />
              <FieldValue label="Estimate Complete Date" value={formatDate(request.estimateCompleteDate)} />
              <FieldValue label="IT Incharge" value={request.itInCharge} />
            </Box>

            <Divider />
            <RichTextValue label="Detail of Profit and Loss" value={request.detailOfProfitAndLoss} />
            <RichTextValue label="Current Situation" value={request.currentSituation} />
            <RichTextValue label="Brief of Request" value={request.briefOfRequest} />
            <RichTextValue label="Operation Process Flow Chart" value={request.operationProcessFlowChart} />
            <RichTextValue label="Function/Report Description" value={request.functionReportDescription} />

            <Divider />
            <Stack spacing={1}>
              <Typography variant="subtitle2">Attachments</Typography>
              {request.attachments.length ? request.attachments.map((attachment) => (
                <Stack key={attachment.id} direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                  <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>
                    {attachment.fileName} ({formatFileSize(attachment.size)})
                  </Typography>
                  <Tooltip title="Download">
                    <IconButton size="small" onClick={() => onDownload(request.id, attachment)}>
                      <DownloadRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              )) : <Typography color="text.secondary">-</Typography>}
            </Stack>

            <Divider />
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" } }}>
              <Stack spacing={1}>
                <Typography variant="subtitle2">Approvers</Typography>
                {request.approvers.length ? request.approvers.map((item) => (
                  <Stack key={item.id} spacing={0.25}>
                    <Typography variant="body2">{item.sequence}. {item.approverDisplayName || item.approver}</Typography>
                    <Typography variant="caption" color="text.secondary">{item.decision} {item.decisionAt ? `- ${formatDateTimeLabel(item.decisionAt)}` : ""}</Typography>
                  </Stack>
                )) : <Typography color="text.secondary">-</Typography>}
              </Stack>
              <Stack spacing={1}>
                <Typography variant="subtitle2">Tasks</Typography>
                {request.tasks.length ? request.tasks.map((item) => (
                  <Stack key={item.id} spacing={0.25}>
                    <Typography variant="body2">{item.taskName}</Typography>
                    <Typography variant="caption" color="text.secondary">{item.status} - {item.assignToDisplayName || item.assignTo}</Typography>
                  </Stack>
                )) : <Typography color="text.secondary">-</Typography>}
              </Stack>
              <Stack spacing={1}>
                <Typography variant="subtitle2">Status History</Typography>
                {request.statusHistory.length ? request.statusHistory.map((item) => (
                  <Stack key={item.id} spacing={0.25}>
                    <Typography variant="body2">{item.action}: {item.fromStatus || "-"} to {item.toStatus}</Typography>
                    <Typography variant="caption" color="text.secondary">{formatDateTimeLabel(item.createdAt)} by {item.actor}</Typography>
                    {item.comment ? <Typography variant="caption" color="text.secondary">{item.comment}</Typography> : null}
                  </Stack>
                )) : <Typography color="text.secondary">-</Typography>}
              </Stack>
            </Box>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

function IntakeDialog({ state, options, submitting, onClose, onChange, onSubmit }) {
  const form = state.form;
  return (
    <Dialog open={state.open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>IT Intake</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" } }}>
          <TextField label="Approvers" value={form.approversText} onChange={(event) => onChange("approversText", event.target.value)} multiline minRows={4} required fullWidth sx={{ gridColumn: { md: "1 / -1" } }} />
          <OptionField options={options} type="Category" label="Category" value={form.category} onChange={(value) => onChange("category", value)} />
          <OptionField options={options} type="SourceOfRequest" label="Source of Request" value={form.sourceOfRequest} onChange={(value) => onChange("sourceOfRequest", value)} />
          <OptionField options={options} type="SizeOfRequest" label="Size of Request" value={form.sizeOfRequest} onChange={(value) => onChange("sizeOfRequest", value)} />
          <TextField label="IT Incharge" value={form.itInCharge} onChange={(event) => onChange("itInCharge", event.target.value)} fullWidth />
          <TextField label="Estimate Start Date" type="date" value={form.estimateStartDate} onChange={(event) => onChange("estimateStartDate", event.target.value)} fullWidth {...dateTextFieldProps} />
          <TextField label="Estimate Complete Date" type="date" value={form.estimateCompleteDate} onChange={(event) => onChange("estimateCompleteDate", event.target.value)} fullWidth {...dateTextFieldProps} />
          <TextField label="Estimate Cost Saving" type="number" value={form.estimateCostSaving} onChange={(event) => onChange("estimateCostSaving", event.target.value)} fullWidth />
          <TextField label="Comment" value={form.comment} onChange={(event) => onChange("comment", event.target.value)} multiline minRows={3} fullWidth sx={{ gridColumn: { md: "1 / -1" } }} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" startIcon={<SaveRoundedIcon />} disabled={submitting} onClick={onSubmit}>Submit</Button>
      </DialogActions>
    </Dialog>
  );
}

function ApprovalDialog({ state, submitting, onClose, onChange, onSubmit }) {
  return (
    <Dialog open={state.open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{state.decision === "reject" ? "Reject Request" : "Approve Request"}</DialogTitle>
      <DialogContent dividers>
        <TextField label="Comment" value={state.comment} onChange={(event) => onChange(event.target.value)} multiline minRows={4} fullWidth />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          color={state.decision === "reject" ? "error" : "primary"}
          disabled={submitting}
          onClick={onSubmit}
        >
          {state.decision === "reject" ? "Reject" : "Approve"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function TaskDialog({ state, submitting, onClose, onChange, onSubmit }) {
  const form = state.form;
  return (
    <Dialog open={state.open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add Task</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" } }}>
          <TextField label="Task Name" value={form.taskName} onChange={(event) => onChange("taskName", event.target.value)} required fullWidth sx={{ gridColumn: { md: "1 / -1" } }} />
          <TextField select label="Status" value={form.status} onChange={(event) => onChange("status", event.target.value)} fullWidth>
            <MenuItem value="NotStarted">Not Started</MenuItem>
            <MenuItem value="InProgress">In Progress</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
          </TextField>
          <TextField label="Duration" type="number" value={form.duration} onChange={(event) => onChange("duration", event.target.value)} fullWidth />
          <TextField label="Estimate Start Date" type="date" value={form.estimateStartDate} onChange={(event) => onChange("estimateStartDate", event.target.value)} fullWidth {...dateTextFieldProps} />
          <TextField label="Estimate Complete Date" type="date" value={form.estimateCompleteDate} onChange={(event) => onChange("estimateCompleteDate", event.target.value)} fullWidth {...dateTextFieldProps} />
          <TextField label="Assign To" value={form.assignTo} onChange={(event) => onChange("assignTo", event.target.value)} required fullWidth />
          <TextField label="Assign To Display Name" value={form.assignToDisplayName} onChange={(event) => onChange("assignToDisplayName", event.target.value)} fullWidth />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" startIcon={<SaveRoundedIcon />} disabled={submitting} onClick={onSubmit}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
