import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { EmptyState } from "../components/common/EmptyState";
import { AppDataTable } from "../components/datatable/AppDataTable";
import { PageHeader } from "../components/layout/PageHeader";
import { SectionCard } from "../components/layout/SectionCard";
import { useNotifier } from "../hooks/useNotifier";
import { masterDataApi } from "../services/api/masterDataApi";
import { workflowApi } from "../services/api/workflowApi";
import { formatDateTimeLabel } from "../utils/formatters";
import { WorkflowDynamicField } from "./workflow/WorkflowDynamicField";
import {
  DecisionDialog,
  FieldFormDialog,
  RequestDetailDialog as WorkflowRequestDetailDialog,
  StepFormDialog,
} from "./workflow/WorkflowDialogs";
import { WorkflowReviewDialog } from "./workflow/WorkflowReviewDialog";
import { pendingColumns, requestColumns, workflowColumns } from "./workflow/workflowColumns";
import {
  initialFieldForm,
  initialGroupForm,
  initialPermissionForm,
  initialStepForm,
  initialTransitionRuleForm,
  initialWorkflowForm,
  permissions,
  principalTypes,
  statusOptions,
  versionModes,
} from "./workflow/workflowConstants";
import {
  buildRequestValuesFromDetail,
  downloadCsv,
  downloadJson,
  flattenFields,
  getErrorMessage,
  getFieldInitialValue,
  getFirstOrderFields,
  getFirstOrderSteps,
  getReportRowWorkflowId,
  getStatusColor,
  getWorkflowName,
  findMissingRequiredField,
  getActiveInputFields,
  hasFieldValue,
  isVisibleInputField,
  validateFieldForm,
  validateStepForm,
} from "./workflow/workflowUtils";

const workflowTabs = ["start", "mine", "pending", "designer", "reports"];

function formatCcnLabel(ccn) {
  return ccn?.name || ccn?.code || ccn?.ccn || "";
}

function getCcnFormValue(ccn) {
  return ccn?.name || "";
}

function sortCcnsByName(ccns = []) {
  return [...ccns].sort((left, right) =>
    formatCcnLabel(left).localeCompare(formatCcnLabel(right), undefined, { sensitivity: "base" })
  );
}

function matchesCcn(ccn, value) {
  return [ccn?.ccn, ccn?.code, ccn?.name, [ccn?.code, ccn?.name].filter(Boolean).join(" - "), formatCcnLabel(ccn)]
    .filter(Boolean)
    .some((item) => String(item).toLowerCase() === String(value || "").toLowerCase());
}

function normalizeWorkflowContextValue(value) {
  return String(value || "").trim().toLowerCase();
}

function matchesWorkflowContext(left, right) {
  return Boolean(normalizeWorkflowContextValue(left))
    && normalizeWorkflowContextValue(left) === normalizeWorkflowContextValue(right);
}

function matchesWorkflowBu(workflow, ccn, bu) {
  const workflowBu = workflow?.bu || "";
  if (!workflowBu || !bu) {
    return false;
  }

  if (matchesWorkflowContext(workflowBu, bu)) {
    return true;
  }

  return [ccn?.ccn, ccn?.code, ccn?.name, formatCcnLabel(ccn), getCcnFormValue(ccn)]
    .filter(Boolean)
    .some((item) => matchesWorkflowContext(workflowBu, item));
}

function matchesWorkflowDepartment(workflow, department) {
  return matchesWorkflowContext(workflow?.department, department);
}

function isStartableWorkflowForContext(workflow, ccn, bu, department) {
  const isStartable = Boolean(workflow?.isActive)
    && Boolean(workflow?.access?.canSubmit)
    && Boolean(workflow?.currentApprovedVersionId);

  if (!isStartable) {
    return false;
  }

  if (bu && !matchesWorkflowBu(workflow, ccn, bu)) {
    return false;
  }

  if (department && !matchesWorkflowDepartment(workflow, department)) {
    return false;
  }

  return true;
}

function formatWorkflowOptionLabel(workflow) {
  const parts = [workflow?.code, workflow?.name].filter(Boolean);
  return parts.length ? parts.join(" - ") : (workflow?.id ? `Workflow #${workflow.id}` : "");
}

function workflowOptionSearchText(workflow) {
  return [workflow?.code, workflow?.name, formatWorkflowOptionLabel(workflow)].filter(Boolean).join(" ");
}

function suggestWorkflowCode(workflows = []) {
  const maxSequence = workflows.reduce((max, workflow) => {
    const codeNumber = Number(String(workflow?.code || "").match(/^WF0*(\d+)$/i)?.[1] || 0);
    const idNumber = Number(workflow?.id) || 0;
    return Math.max(max, codeNumber, idNumber);
  }, 0);

  return `WF${String(maxSequence + 1).padStart(4, "0")}`;
}

function RequestDetailDialog({ open, detail, workflows, workflowDetail, loading, error, onOpenFile, onClose }) {
  const fields = useMemo(() => flattenFields(workflowDetail?.steps || []), [workflowDetail]);
  const valueMap = useMemo(() => {
    return new Map((detail?.values || []).map((value) => [String(value.fieldId), value]));
  }, [detail]);

  const detailFields = useMemo(() => {
    if (fields.length) {
      return fields;
    }

    return (detail?.values || []).map((value) => ({
      id: value.fieldId,
      stepId: value.stepId,
      label: `Field #${value.fieldId}`,
      dataType: "text",
    }));
  }, [detail, fields]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Request detail</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          {loading ? <Alert severity="info" variant="outlined">Loading detail...</Alert> : null}
          {error ? <Alert severity="error" variant="outlined">{error}</Alert> : null}
          {detail?.instance ? (
            <>
              <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" } }}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">Request no</Typography>
                  <Typography variant="subtitle2">{detail.instance.requestNo}</Typography>
                </Stack>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">Workflow</Typography>
                  <Typography variant="subtitle2">{getWorkflowName(workflows, detail.instance.workflowId)}</Typography>
                </Stack>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Chip label={detail.instance.status} color={getStatusColor(detail.instance.status)} size="small" sx={{ alignSelf: "flex-start" }} />
                </Stack>
              </Box>
              <Divider />
              <Stack spacing={1.5}>
                <Typography variant="h6">{detail.instance.title}</Typography>
                <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" } }}>
                  {detailFields.map((field) => {
                    const value = valueMap.get(String(field.id));
                    return (
                      <Box key={`${field.stepId || "field"}-${field.id}`} sx={{ p: 1.5, borderRadius: 1, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                        <Typography variant="caption" color="text.secondary">{field?.label || `Field #${field.id}`}</Typography>
                        {field.dataType === "file" ? (
                          value?.files?.length ? (
                            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 0.75 }}>
                              {value.files.map((file) => (
                                <Chip
                                  key={file.id}
                                  size="small"
                                  label={file.fileName}
                                  variant="outlined"
                                  onClick={() => onOpenFile(file)}
                                  sx={{ maxWidth: "100%" }}
                                />
                              ))}
                            </Stack>
                          ) : (
                            <Typography variant="body2" color="text.secondary">&nbsp;</Typography>
                          )
                        ) : (
                          <Typography variant="body2">{formatFieldValue(field, value) || "\u00a0"}</Typography>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              </Stack>
              <Divider />
              <Stack spacing={1.25}>
                <Typography variant="h6">Approval steps</Typography>
                {detail.steps.length ? detail.steps.map((step) => (
                  <Box key={step.id} sx={{ display: "grid", gap: 1.25, gridTemplateColumns: { xs: "1fr", md: "minmax(180px, 1fr) 120px minmax(0, 2fr)" }, alignItems: "start", p: 1.5, borderRadius: 1, bgcolor: "background.default" }}>
                    <Typography variant="body2" sx={{ minWidth: 0, overflowWrap: "anywhere" }}>{step.step?.stepName || `Step #${step.stepId}`}</Typography>
                    <Chip label={step.status} size="small" color={getStatusColor(step.status)} sx={{ justifySelf: { md: "start" } }} />
                    <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                      <Typography variant="caption" color="text.secondary">{step.actionBy ? "Action by" : "Assigned to"}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: "anywhere", wordBreak: "break-word" }}>
                        {(step.actionBy || step.assignedTo || "N/A").split(";").join(", ")}
                      </Typography>
                    </Stack>
                  </Box>
                )) : <Alert severity="info" variant="outlined">No approval steps yet.</Alert>}
              </Stack>
              <Divider />
              <Stack spacing={1.25}>
                <Typography variant="h6">Audit</Typography>
                {detail.audit.map((audit) => (
                  <Box key={audit.id || `${audit.action}-${audit.createdAt}`} sx={{ display: "grid", gap: 1, gridTemplateColumns: { xs: "1fr", md: "160px 1fr 220px" }, p: 1.5, borderRadius: 1, bgcolor: "background.default" }}>
                    <Typography variant="body2">{audit.action}</Typography>
                    <Typography variant="body2" color="text.secondary">{audit.comment || `${audit.fromStatus || "-"} -> ${audit.toStatus || "-"}`}</Typography>
                    <Typography variant="caption" color="text.secondary">{audit.actor} · {formatDateTimeLabel(audit.createdAt)}</Typography>
                  </Box>
                ))}
              </Stack>
            </>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

function WorkflowVersionTimeline({ versions = [], activeVersionId, configSubmitting, onAction }) {
  const pageSize = 5;
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage(0);
  }, [versions.length]);

  if (!versions.length) {
    return <Alert severity="info" variant="outlined">No version history yet.</Alert>;
  }

  const pageCount = Math.max(1, Math.ceil(versions.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const visibleVersions = versions.slice(safePage * pageSize, safePage * pageSize + pageSize);

  const buildEvents = (version) => [
    { label: "Changed", actor: version.modifiedBy || version.createdBy, at: version.modifiedAt || version.createdAt },
    version.submittedAt ? { label: "Submitted", actor: version.submittedBy, at: version.submittedAt } : null,
    version.approvalAssignedAt ? { label: "Assigned approver", actor: version.approvalAssignedTo, at: version.approvalAssignedAt } : null,
    version.approvedAt ? { label: "Approved", actor: version.approvedBy, at: version.approvedAt } : null,
    version.rejectedAt ? { label: "Rejected", actor: version.rejectedBy, at: version.rejectedAt } : null,
  ].filter(Boolean);

  return (
    <Stack spacing={1}>
      {visibleVersions.map((version, index) => {
        const isActive = String(activeVersionId || "") === String(version.id || "");
        const events = buildEvents(version);
        const absoluteIndex = safePage * pageSize + index;
        return (
          <Box key={version.id} sx={{ display: "grid", gridTemplateColumns: "22px minmax(0, 1fr)", columnGap: 1.25 }}>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: isActive ? "success.main" : version.status === "Rejected" ? "error.main" : version.status === "PendingApproval" ? "warning.main" : "primary.main", mt: 1.25 }} />
              {absoluteIndex < versions.length - 1 ? <Box sx={{ width: "1px", flex: 1, bgcolor: "rgba(0, 0, 0, 0.16)", minHeight: 64, mt: 0.75 }} /> : null}
            </Box>
            <Box sx={{ pb: absoluteIndex < versions.length - 1 ? 3 : 0, minWidth: 0 }}>
              <Box sx={{ p: 1.5, borderRadius: 1, border: (theme) => `1px solid ${isActive ? theme.palette.success.main : theme.palette.divider}`, bgcolor: isActive ? "rgba(46, 125, 50, 0.08)" : "background.default" }}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between">
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                    <Typography variant="subtitle2">v{version.versionNo}</Typography>
                    <Chip label={version.status} size="small" color={version.status === "Approved" ? "success" : version.status === "PendingApproval" ? "warning" : version.status === "Rejected" ? "error" : "default"} />
                    {isActive ? <Chip label="Active" size="small" color="success" variant="outlined" /> : null}
                  </Stack>
                  {version.status === "PendingApproval" && version.canApprove ? (
                    <Stack direction="row" spacing={1}>
                      <Button size="small" onClick={() => onAction(version, "Approve")} disabled={configSubmitting}>Approve</Button>
                      <Button size="small" color="error" onClick={() => onAction(version, "Reject")} disabled={configSubmitting}>Reject</Button>
                    </Stack>
                  ) : null}
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                  {version.changeSummary || version.comment || "No change summary"}
                </Typography>
                <Box sx={{ display: "grid", gap: 0.75, mt: 1.25 }}>
                  {events.map((event) => (
                    <Box key={`${version.id}-${event.label}`} sx={{ display: "grid", gap: 1, gridTemplateColumns: { xs: "1fr", sm: "100px minmax(0, 1fr) 160px" }, alignItems: "center" }}>
                      <Typography variant="caption" color="text.secondary">{event.label}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: "anywhere" }}>{event.actor || "N/A"}</Typography>
                      <Typography variant="caption" color="text.secondary">{event.at ? formatDateTimeLabel(event.at) : ""}</Typography>
                    </Box>
                  ))}
                </Box>
                {version.comment ? (
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>Comment: {version.comment}</Typography>
                ) : null}
              </Box>
            </Box>
          </Box>
        );
      })}
      {versions.length > pageSize ? (
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end" sx={{ pt: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            {safePage * pageSize + 1}-{Math.min((safePage + 1) * pageSize, versions.length)} of {versions.length}
          </Typography>
          <Button size="small" variant="outlined" onClick={() => setPage((current) => Math.max(0, current - 1))} disabled={safePage <= 0}>
            Previous
          </Button>
          <Button size="small" variant="outlined" onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))} disabled={safePage >= pageCount - 1}>
            Next
          </Button>
        </Stack>
      ) : null}
    </Stack>
  );
}

function getWorkflowStepLabel(step) {
  if (!step) {
    return "";
  }
  const code = step.stepCode ? `${step.stepCode} - ` : "";
  return `${code}${step.stepName || `Step #${step.id}`}`;
}

function getWorkflowStepMeta(step) {
  if (!step) {
    return "";
  }
  const parts = [`Order ${step.stepOrder ?? "-"}`];
  if (step.stepGroup !== null && step.stepGroup !== undefined && step.stepGroup !== "") {
    parts.push(`Group ${step.stepGroup}`);
  }
  if (step.approverType) {
    parts.push(`Approver: ${step.approverType}${step.approverValue ? ` (${step.approverValue})` : ""}`);
  }
  if (step.parallelRejectPolicy) {
    parts.push(`Parallel reject: ${step.parallelRejectPolicy}`);
  }
  return parts.join(" | ");
}

function getTransitionTargetLabel(rule, stepById) {
  if (rule.targetType === "SpecificStep" || rule.targetType === "AlternatePath") {
    const targetStep = stepById.get(String(rule.targetStepId));
    return targetStep ? getWorkflowStepLabel(targetStep) : `Target step #${rule.targetStepId || "-"}`;
  }
  if (rule.targetType === "NextStep") {
    return "Next step by order";
  }
  if (rule.targetType === "Complete") {
    return "Complete request";
  }
  if (rule.targetType === "RejectRequest") {
    return "Reject request";
  }
  return rule.targetType || "-";
}

export function EWorkflowPage() {
  const { t } = useTranslation();
  const { notify } = useNotifier();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryTab = searchParams.get("tab");
  const queryRequestId = searchParams.get("requestId");
  const queryFileId = searchParams.get("fileId");
  const queryWorkflowId = searchParams.get("workflowId");
  const initialTab = workflowTabs.includes(queryTab) ? queryTab : "start";
  const editingDraftLoadRef = useRef(false);

  const [tab, setTab] = useState(initialTab);
  const [workflows, setWorkflows] = useState([]);
  const [workflowsLoading, setWorkflowsLoading] = useState(false);
  const [workflowsError, setWorkflowsError] = useState("");

  const [myRequests, setMyRequests] = useState([]);
  const [myRequestsLoading, setMyRequestsLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [requestsError, setRequestsError] = useState("");

  const [selectedStartWorkflowId, setSelectedStartWorkflowId] = useState("");
  const [startDetail, setStartDetail] = useState(null);
  const [startLoading, setStartLoading] = useState(false);
  const [startError, setStartError] = useState("");
  const [startCcns, setStartCcns] = useState([]);
  const [startDepartments, setStartDepartments] = useState([]);
  const [startCcn, setStartCcn] = useState("");
  const [startBu, setStartBu] = useState("");
  const [startDepartment, setStartDepartment] = useState("");
  const [startMasterLoading, setStartMasterLoading] = useState(false);
  const [startMasterError, setStartMasterError] = useState("");
  const [requestTitle, setRequestTitle] = useState("");
  const [requestValues, setRequestValues] = useState({});
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);

  const [designerWorkflowId, setDesignerWorkflowId] = useState("");
  const [designerDetail, setDesignerDetail] = useState(null);
  const [designerLoading, setDesignerLoading] = useState(false);
  const [designerError, setDesignerError] = useState("");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [workflowDialog, setWorkflowDialog] = useState({ open: false, mode: "create", item: null });
  const [workflowForm, setWorkflowForm] = useState(initialWorkflowForm);
  const [workflowSubmitError, setWorkflowSubmitError] = useState("");
  const [workflowSubmitting, setWorkflowSubmitting] = useState(false);
  const [workflowCcns, setWorkflowCcns] = useState([]);
  const [workflowDepartments, setWorkflowDepartments] = useState([]);
  const [workflowMasterLoading, setWorkflowMasterLoading] = useState(false);
  const [workflowMasterError, setWorkflowMasterError] = useState("");
  const [stepDialog, setStepDialog] = useState({ open: false, mode: "create", item: null });
  const [stepForm, setStepForm] = useState(initialStepForm);
  const [stepSubmitError, setStepSubmitError] = useState("");
  const [stepDelete, setStepDelete] = useState(null);
  const [fieldDialog, setFieldDialog] = useState({ open: false, mode: "create", item: null, step: null });
  const [fieldForm, setFieldForm] = useState(initialFieldForm);
  const [fieldSubmitError, setFieldSubmitError] = useState("");
  const [fieldDelete, setFieldDelete] = useState(null);
  const [permissionForm, setPermissionForm] = useState(initialPermissionForm);
  const [editingPermission, setEditingPermission] = useState(null);
  const [permissionError, setPermissionError] = useState("");
  const [configSubmitting, setConfigSubmitting] = useState(false);
  const [permissionDelete, setPermissionDelete] = useState(null);
  const [groupForm, setGroupForm] = useState(initialGroupForm);
  const [editingGroup, setEditingGroup] = useState(null);
  const [groupError, setGroupError] = useState("");
  const [transitionRuleForm, setTransitionRuleForm] = useState(initialTransitionRuleForm);
  const [editingTransitionRule, setEditingTransitionRule] = useState(null);
  const [transitionError, setTransitionError] = useState("");
  const [versionComment, setVersionComment] = useState("");

  const [detailState, setDetailState] = useState({ open: false, request: null });
  const [openedQueryRequestId, setOpenedQueryRequestId] = useState("");
  const [openedQueryFileKey, setOpenedQueryFileKey] = useState("");
  const [requestDetail, setRequestDetail] = useState(null);
  const [requestDetailWorkflow, setRequestDetailWorkflow] = useState(null);
  const [requestDetailLoading, setRequestDetailLoading] = useState(false);
  const [requestDetailError, setRequestDetailError] = useState("");
  const [decisionState, setDecisionState] = useState({ open: false, action: "", request: null, loading: false });
  const [decisionFields, setDecisionFields] = useState([]);
  const [decisionValues, setDecisionValues] = useState({});
  const [decisionError, setDecisionError] = useState("");
  const [decisionSubmitting, setDecisionSubmitting] = useState(false);

  const [reportQuery, setReportQuery] = useState({ workflowId: "", status: "", from: null, to: null });
  const [reportSummary, setReportSummary] = useState([]);
  const [reportRows, setReportRows] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");

  const selectedStartCcn = useMemo(
    () => startCcns.find((ccn) => String(ccn.ccn) === String(startCcn)) || null,
    [startCcns, startCcn],
  );
  const startWorkflows = workflows.filter((workflow) =>
    isStartableWorkflowForContext(workflow, selectedStartCcn, startBu, startDepartment)
  );
  const selectedStartWorkflow = workflows.find((workflow) => String(workflow.id) === String(selectedStartWorkflowId)) || null;
  const startWorkflowOptions = selectedStartWorkflow && !startWorkflows.some((workflow) => String(workflow.id) === String(selectedStartWorkflow.id))
    ? [selectedStartWorkflow, ...startWorkflows]
    : startWorkflows;
  const designerWorkflows = workflows.filter((workflow) => workflow.access.canManage || workflow.access.canApproveVersion);
  const reportWorkflows = workflows.filter((workflow) => workflow.access.canReport);
  const canManageDesigner = Boolean(designerDetail?.access?.canManage);
  const startSteps = useMemo(() => getFirstOrderSteps(startDetail?.steps || []), [startDetail]);
  const startFields = useMemo(() => getFirstOrderFields(startDetail?.steps || []).filter(isVisibleInputField), [startDetail]);
  const activeStartFields = useMemo(() => getActiveInputFields(startFields, requestValues), [startFields, requestValues]);
  const activeStartFieldIds = useMemo(() => new Set(activeStartFields.map((field) => field.id)), [activeStartFields]);
  const designerStepById = useMemo(
    () => new Map((designerDetail?.steps || []).map((step) => [String(step.id), step])),
    [designerDetail],
  );
  const nextDesignerStepOrder = useMemo(
    () => Math.max(0, ...(designerDetail?.steps || []).map((step) => Number(step.stepOrder) || 0)) + 1,
    [designerDetail],
  );

  const resetStartRequestState = ({ clearDepartment = false } = {}) => {
    if (clearDepartment) {
      setStartDepartment("");
      setStartDepartments([]);
    }
    setSelectedStartWorkflowId("");
    setStartDetail(null);
    setRequestTitle("");
    setEditingRequest(null);
    setRequestValues({});
  };

  const loadStartCcns = async () => {
    setStartMasterLoading(true);
    setStartMasterError("");

    try {
      const nextCcns = sortCcnsByName(await masterDataApi.getCcns());
      setStartCcns(nextCcns);

      if (startCcn && !nextCcns.some((ccn) => String(ccn.ccn) === String(startCcn))) {
        setStartCcn("");
        setStartBu("");
        resetStartRequestState({ clearDepartment: true });
      }

      return nextCcns;
    } catch (error) {
      setStartMasterError(getErrorMessage(error, "Could not load BU master data."));
      setStartCcns([]);
      return [];
    } finally {
      setStartMasterLoading(false);
    }
  };

  const loadStartDepartmentsForCcn = async (ccn, { keepSelection = true } = {}) => {
    if (!ccn) {
      setStartDepartments([]);
      if (!keepSelection) {
        setStartDepartment("");
      }
      return [];
    }

    setStartMasterLoading(true);
    setStartMasterError("");

    try {
      const nextDepartments = await masterDataApi.getDepartmentsByCcn(ccn);
      setStartDepartments(nextDepartments);

      if (keepSelection && startDepartment && !nextDepartments.some((department) => matchesWorkflowContext(department.kronosDeptName, startDepartment))) {
        setStartDepartment("");
        resetStartRequestState();
      }

      return nextDepartments;
    } catch (error) {
      setStartMasterError(getErrorMessage(error, "Could not load department master data."));
      setStartDepartments([]);
      return [];
    } finally {
      setStartMasterLoading(false);
    }
  };

  const loadWorkflows = async () => {
    setWorkflowsLoading(true);
    setWorkflowsError("");

    try {
      const nextWorkflows = await workflowApi.getWorkflows();
      setWorkflows(nextWorkflows);
      setSelectedStartWorkflowId((current) =>
        current && nextWorkflows.some((item) => String(item.id) === String(current)
          && isStartableWorkflowForContext(item, selectedStartCcn, startBu, startDepartment))
          ? current
          : ""
      );
      setDesignerWorkflowId((current) => current && nextWorkflows.some((item) => String(item.id) === String(current)) ? current : "");
    } catch (error) {
      setWorkflowsError(getErrorMessage(error, "Could not load workflows."));
    } finally {
      setWorkflowsLoading(false);
    }
  };

  const loadMyRequests = async () => {
    setRequestsError("");
    setMyRequestsLoading(true);

    try {
      setMyRequests(await workflowApi.getMyRequests());
    } catch (error) {
      setRequestsError(getErrorMessage(error, "Could not load workflow requests."));
    } finally {
      setMyRequestsLoading(false);
    }
  };

  const loadPendingRequests = async () => {
    setRequestsError("");
    setPendingLoading(true);

    try {
      setPendingRequests(await workflowApi.getPendingMyApproval());
    } catch (error) {
      setRequestsError(getErrorMessage(error, "Could not load pending approvals."));
    } finally {
      setPendingLoading(false);
    }
  };

  const loadTabData = async (targetTab = tab) => {
    if (targetTab === "start") {
      if (editingDraftLoadRef.current) {
        return;
      }

      await Promise.all([
        loadWorkflows(),
        loadStartCcns(),
        startCcn ? loadStartDepartmentsForCcn(startCcn) : Promise.resolve([]),
      ]);
      if (selectedStartWorkflowId) {
        await loadStartWorkflowDetail(selectedStartWorkflowId);
      }
      return;
    }

    if (targetTab === "mine") {
      await Promise.all([loadWorkflows(), loadMyRequests()]);
      return;
    }

    if (targetTab === "pending") {
      await Promise.all([loadWorkflows(), loadPendingRequests()]);
      return;
    }

    if (targetTab === "designer") {
      await loadWorkflows();
      if (designerWorkflowId) {
        await loadDesignerDetail(designerWorkflowId);
      }
      return;
    }

    if (targetTab === "reports") {
      await loadWorkflows();
      if (reportSummary.length || reportRows.length) {
        await runReport();
      }
    }
  };

  useEffect(() => {
    void loadTabData(tab);
  }, [tab]);

  useEffect(() => {
    if (workflowTabs.includes(queryTab)) {
      setTab(queryTab);
    }
  }, [queryTab]);

  useEffect(() => {
    if (queryTab === "designer" && queryWorkflowId && String(designerWorkflowId || "") !== String(queryWorkflowId)) {
      setDesignerWorkflowId(queryWorkflowId);
      void loadDesignerDetail(queryWorkflowId);
    }
  }, [queryTab, queryWorkflowId, designerWorkflowId]);

  useEffect(() => {
    setEditingPermission(null);
    setPermissionForm(initialPermissionForm);
    setEditingGroup(null);
    setGroupForm(initialGroupForm);
    setEditingTransitionRule(null);
    setTransitionRuleForm(initialTransitionRuleForm);
  }, [designerWorkflowId]);

  const handleTabChange = (_, value) => {
    setTab(value);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set("tab", value);
      next.delete("requestId");
      next.delete("fileId");
      return next;
    }, { replace: true });
  };

  const loadStartWorkflowDetail = async (workflowId) => {
    if (!workflowId) {
      setStartDetail(null);
      setRequestValues({});
      return;
    }

    setStartLoading(true);
    setStartError("");

    try {
      const detail = await workflowApi.getWorkflow(workflowId);
      setStartDetail(detail);
      setRequestValues(
        getFirstOrderFields(detail.steps).filter(isVisibleInputField)
          .reduce((values, field) => ({ ...values, [field.id]: getFieldInitialValue(field) }), {}),
      );
    } catch (error) {
      setStartError(getErrorMessage(error, "Could not load workflow form."));
    } finally {
      setStartLoading(false);
    }
  };

  const applyStartWorkflowContext = async (workflow) => {
    if (!workflow) {
      return;
    }

    const nextCcns = startCcns.length ? startCcns : await loadStartCcns();
    const matchedCcn = nextCcns.find((ccn) => matchesCcn(ccn, workflow.bu));
    const ccnKey = matchedCcn?.ccn || "";

    setStartCcn(ccnKey);
    setStartBu(matchedCcn ? getCcnFormValue(matchedCcn) : workflow.bu || "");
    setStartDepartment(workflow.department || "");

    if (ccnKey) {
      await loadStartDepartmentsForCcn(ccnKey, { keepSelection: false });
    } else {
      setStartDepartments([]);
    }
  };

  const handleStartWorkflowChange = async (workflow) => {
    const workflowId = workflow?.id || "";
    setSelectedStartWorkflowId(workflowId);
    setEditingRequest(null);
    setRequestTitle("");

    if (!workflow) {
      await loadStartWorkflowDetail("");
      return;
    }

    await applyStartWorkflowContext(workflow);
    await loadStartWorkflowDetail(workflowId);
  };

  const loadDesignerDetail = async (workflowId) => {
    if (!workflowId) {
      setDesignerDetail(null);
      return;
    }

    setDesignerLoading(true);
    setDesignerError("");

    try {
      const detail = await workflowApi.getWorkflow(workflowId);
      setDesignerDetail(detail);
      return detail;
    } catch (error) {
      setDesignerError(getErrorMessage(error, "Could not load workflow configuration."));
      return null;
    } finally {
      setDesignerLoading(false);
    }
  };

  const refreshStartDetailIfSameWorkflow = async (workflowId) => {
    if (selectedStartWorkflowId && String(selectedStartWorkflowId) === String(workflowId)) {
      await loadStartWorkflowDetail(workflowId);
    }
  };

  const openRequestDetail = async (request) => {
    setDetailState({ open: true, request });
    setRequestDetail(null);
    setRequestDetailWorkflow(null);
    setRequestDetailLoading(true);
    setRequestDetailError("");

    try {
      const detail = await workflowApi.getRequestDetail(request.id);
      const workflowId = request.workflowId || detail.instance?.workflowId;
      const workflowDetail = workflowId ? await workflowApi.getWorkflow(workflowId) : null;

      setDetailState({
        open: true,
        request: {
          ...request,
          workflowId,
          requestNo: request.requestNo || detail.instance?.requestNo,
          title: request.title || detail.instance?.title,
        },
      });
      setRequestDetail(detail);
      setRequestDetailWorkflow(workflowDetail);
    } catch (error) {
      setRequestDetailError(getErrorMessage(error, "Could not load request detail."));
    } finally {
      setRequestDetailLoading(false);
    }
  };

  useEffect(() => {
    if (!queryRequestId || openedQueryRequestId === queryRequestId) {
      return;
    }

    setOpenedQueryRequestId(queryRequestId);
    void openRequestDetail({ id: queryRequestId });
  }, [queryRequestId, openedQueryRequestId]);

  useEffect(() => {
    if (!queryFileId || !requestDetail || requestDetailLoading) {
      return;
    }

    const fileKey = `${queryRequestId || requestDetail.instance?.id || ""}:${queryFileId}`;
    if (openedQueryFileKey === fileKey) {
      return;
    }

    setOpenedQueryFileKey(fileKey);
    void openWorkflowFile({ id: queryFileId });
  }, [queryFileId, queryRequestId, requestDetail, requestDetailLoading, openedQueryFileKey]);

  const uploadFieldFiles = async (requestId, fields, values) => {
    const fileFields = fields.filter((field) => field.dataType === "file");

    for (const field of fileFields) {
      const files = Array.from(values[field.id]?.files || []);
      for (const item of files) {
        const file = item?.file || item;
        await workflowApi.uploadFile(requestId, field.id, file);
      }
    }
  };

  const handleEditDraft = async (request) => {
    editingDraftLoadRef.current = true;
    setTab("start");
    setEditingRequest(request);
    setSelectedStartWorkflowId(request.workflowId);
    setStartLoading(true);
    setStartError("");

    try {
      const [workflowDetail, detail] = await Promise.all([
        workflowApi.getWorkflow(request.workflowId),
        workflowApi.getRequestDetail(request.id),
      ]);
      const fields = getFirstOrderFields(workflowDetail.steps).filter(isVisibleInputField);
      const workflow = workflowDetail.workflow || {};
      const nextCcns = startCcns.length ? startCcns : await loadStartCcns();
      const matchedCcn = nextCcns.find((ccn) => matchesCcn(ccn, workflow.bu));
      const ccnKey = matchedCcn?.ccn || "";
      setStartCcn(ccnKey);
      setStartBu(matchedCcn ? getCcnFormValue(matchedCcn) : workflow.bu || "");
      setStartDepartment(workflow.department || "");
      if (ccnKey) {
        await loadStartDepartmentsForCcn(ccnKey, { keepSelection: false });
      }
      setStartDetail(workflowDetail);
      setRequestTitle(detail.instance.title);
      setRequestValues(buildRequestValuesFromDetail(fields, detail.values, detail.tableRows));
    } catch (error) {
      setStartError(getErrorMessage(error, "Could not load draft for editing."));
    } finally {
      editingDraftLoadRef.current = false;
      setStartLoading(false);
    }
  };

  const handleCreateRequest = async () => {
    if (!selectedStartWorkflowId) {
      setStartError("Choose a workflow first.");
      return;
    }

    if (!requestTitle.trim()) {
      setStartError("Request title is required.");
      return;
    }

    const missingRequired = findMissingRequiredField(startFields, requestValues);

    if (missingRequired) {
      setStartError(`${missingRequired.label} is required.`);
      return;
    }

    setRequestSubmitting(true);
    setStartError("");

    try {
      const activeFields = getActiveInputFields(startFields, requestValues);
      if (editingRequest) {
        await workflowApi.updateRequest(editingRequest.id, {
          title: requestTitle,
          fields: activeFields,
          values: requestValues,
        });
        await uploadFieldFiles(editingRequest.id, activeFields, requestValues);
        notify({ message: `${editingRequest.requestNo} updated.`, severity: "success" });
      } else {
        const createdRequest = await workflowApi.createRequest({
          workflowId: selectedStartWorkflowId,
          title: requestTitle,
          fields: activeFields,
          values: requestValues,
        });
        await uploadFieldFiles(createdRequest.id, activeFields, requestValues);
        notify({ message: "Workflow request draft created.", severity: "success" });
      }
      setRequestTitle("");
      setEditingRequest(null);
      if (startDetail) {
        setRequestValues(
          getFirstOrderFields(startDetail.steps).filter(isVisibleInputField)
            .reduce((values, field) => ({ ...values, [field.id]: getFieldInitialValue(field) }), {}),
        );
      }
      await loadMyRequests();
    } catch (error) {
      setStartError(getErrorMessage(error, "Could not create workflow request."));
    } finally {
      setRequestSubmitting(false);
    }
  };

  const handleSubmitDraft = async (request) => {
    try {
      await workflowApi.submitRequest(request.id);
      notify({ message: `${request.requestNo} submitted.`, severity: "success" });
      await loadMyRequests();
    } catch (error) {
      notify({ message: getErrorMessage(error, "Could not submit request."), severity: "error" });
    }
  };

  const openDecision = async (request, action) => {
    setDecisionState({ open: true, request, action, loading: action === "Approve" });
    setDecisionFields([]);
    setDecisionValues({});
    setDecisionError("");

    if (action !== "Approve") {
      return;
    }

    try {
      const [detail, workflowDetail] = await Promise.all([
        workflowApi.getRequestDetail(request.id),
        workflowApi.getWorkflow(request.workflowId),
      ]);
      const pendingStep = detail.steps.find((step) => step.status === "Pending" && step.canAct)
        || detail.steps.find((step) => step.status === "Pending");
      const stepConfig = workflowDetail.steps.find((step) => String(step.id) === String(pendingStep?.stepId));
      const fields = flattenFields(stepConfig ? [stepConfig] : []).filter(isVisibleInputField);
      setDecisionFields(fields);
      setDecisionValues(buildRequestValuesFromDetail(fields, detail.values, detail.tableRows));
    } catch (error) {
      setDecisionError(getErrorMessage(error, "Could not load approval fields."));
    } finally {
      setDecisionState((current) => ({ ...current, loading: false }));
    }
  };

  const closeDecision = () => {
    if (!decisionSubmitting) {
      setDecisionState({ open: false, request: null, action: "", loading: false });
      setDecisionFields([]);
      setDecisionValues({});
      setDecisionError("");
    }
  };

  const handleDecisionSubmit = async (comment) => {
    if (!decisionState.request) {
      return;
    }

    if ((decisionState.action === "Reject" || decisionState.action === "Cancel") && !comment.trim()) {
      setDecisionError("Comment is required.");
      return;
    }

    if (decisionState.action === "Approve") {
      const missingRequired = findMissingRequiredField(decisionFields, decisionValues);

      if (missingRequired) {
        setDecisionError(`${missingRequired.label} is required.`);
        return;
      }
    }

    setDecisionSubmitting(true);
    setDecisionError("");

    try {
      if (decisionState.action === "Approve") {
        const activeDecisionFields = getActiveInputFields(decisionFields, decisionValues);
        await uploadFieldFiles(decisionState.request.id, activeDecisionFields, decisionValues);
        await workflowApi.approveRequest(decisionState.request.id, {
          comment,
          fields: activeDecisionFields,
          values: decisionValues,
        });
      } else if (decisionState.action === "Reject") {
        await workflowApi.rejectRequest(decisionState.request.id, comment);
      } else {
        await workflowApi.cancelRequest(decisionState.request.id, comment);
      }

      notify({ message: `${decisionState.request.requestNo} updated.`, severity: "success" });
      closeDecision();
      if (tab === "pending") {
        await loadPendingRequests();
      } else if (tab === "mine") {
        await loadMyRequests();
      }
    } catch (error) {
      setDecisionError(getErrorMessage(error, "Could not update request."));
    } finally {
      setDecisionSubmitting(false);
    }
  };

  const loadWorkflowCcns = async () => {
    setWorkflowMasterLoading(true);
    setWorkflowMasterError("");
    try {
      const nextCcns = sortCcnsByName(await masterDataApi.getCcns());
      setWorkflowCcns(nextCcns);
      return nextCcns;
    } catch (error) {
      setWorkflowMasterError(getErrorMessage(error, "Could not load BU master data."));
      setWorkflowCcns([]);
      return [];
    } finally {
      setWorkflowMasterLoading(false);
    }
  };

  const loadWorkflowDepartmentsForCcn = async (ccn) => {
    if (!ccn) {
      setWorkflowDepartments([]);
      return [];
    }

    setWorkflowMasterLoading(true);
    setWorkflowMasterError("");
    try {
      const nextDepartments = await masterDataApi.getDepartmentsByCcn(ccn);
      setWorkflowDepartments(nextDepartments);
      return nextDepartments;
    } catch (error) {
      setWorkflowMasterError(getErrorMessage(error, "Could not load department master data."));
      setWorkflowDepartments([]);
      return [];
    } finally {
      setWorkflowMasterLoading(false);
    }
  };

  const prepareWorkflowMasterData = async (item = null) => {
    const nextCcns = await loadWorkflowCcns();
    if (!item?.bu) {
      setWorkflowDepartments([]);
      return;
    }

    const matchedCcn = nextCcns.find((ccn) => matchesCcn(ccn, item.bu));
    const ccnKey = matchedCcn?.ccn || "";
    setWorkflowForm((current) => ({
      ...current,
      ccn: ccnKey,
      bu: matchedCcn ? getCcnFormValue(matchedCcn) : current.bu,
    }));

    if (ccnKey) {
      await loadWorkflowDepartmentsForCcn(ccnKey);
    } else {
      setWorkflowDepartments([]);
    }
  };

  const openWorkflowDialog = (mode, item = null) => {
    setWorkflowDialog({ open: true, mode, item });
    setWorkflowSubmitError("");
    setWorkflowMasterError("");
    setWorkflowForm(item ? {
      code: item.code,
      name: item.name,
      description: item.description,
      ccn: "",
      bu: item.bu || "",
      department: item.department || "",
      isActive: item.isActive,
      isPublic: item.isPublic,
      versionMode: item.versionMode || "SnapshotOnCreate",
      mail: item.mail || "",
      mailProfileName: item.mailProfileName || "",
    } : {
      ...initialWorkflowForm,
      code: suggestWorkflowCode(workflows),
    });
    void prepareWorkflowMasterData(item);
  };

  const closeWorkflowDialog = () => {
    if (!workflowSubmitting) {
      setWorkflowDialog({ open: false, mode: "create", item: null });
      setWorkflowForm(initialWorkflowForm);
      setWorkflowSubmitError("");
      setWorkflowMasterError("");
      setWorkflowDepartments([]);
    }
  };

  const handleSaveWorkflow = async () => {
    if (workflowDialog.mode === "create" && !workflowForm.code.trim()) {
      setWorkflowSubmitError("Code is required.");
      return;
    }

    if (!workflowForm.name.trim()) {
      setWorkflowSubmitError("Name is required.");
      return;
    }

    if (!workflowForm.bu.trim() || !workflowForm.department.trim()) {
      setWorkflowSubmitError("BU and Department are required.");
      return;
    }

    setWorkflowSubmitting(true);
    setWorkflowSubmitError("");

    try {
      if (workflowDialog.mode === "edit" && workflowDialog.item) {
        await workflowApi.updateWorkflow(workflowDialog.item.id, workflowForm);
        notify({ message: "Workflow updated.", severity: "success" });
      } else {
        await workflowApi.createWorkflow(workflowForm);
        notify({ message: "Workflow created.", severity: "success" });
      }
      closeWorkflowDialog();
      await loadWorkflows();
    } catch (error) {
      setWorkflowSubmitError(getErrorMessage(error, "Could not save workflow."));
    } finally {
      setWorkflowSubmitting(false);
    }
  };

  const openStepDialog = (mode, step = null) => {
    const parallelPeer = step
      ? (designerDetail?.steps || []).find((item) => String(item.id) !== String(step.id) && Number(item.stepOrder) === Number(step.stepOrder))
      : null;
    setStepDialog({ open: true, mode, item: step });
    setStepSubmitError("");
    setStepForm(step ? {
      id: step.id,
      stepOrder: step.stepOrder,
      stepGroup: step.stepGroup ?? "",
      stepCode: step.stepCode,
      stepName: step.stepName,
      approvalMode: step.approvalMode,
      approverType: step.approverType,
      approverValue: step.approverValue,
      isRequired: step.isRequired,
      minApproveCount: step.minApproveCount ?? "",
      reminderHours: step.reminderHours ?? "",
      parallelRejectPolicy: step.parallelRejectPolicy || "AnyReject",
      parallelWithStepId: parallelPeer?.id || "",
    } : { ...initialStepForm, stepOrder: nextDesignerStepOrder, parallelWithStepId: "" });
  };

  const closeStepDialog = () => {
    if (!configSubmitting) {
      setStepDialog({ open: false, mode: "create", item: null });
      setStepForm(initialStepForm);
      setStepSubmitError("");
    }
  };

  const handleSaveStep = async (nextStepForm = stepForm) => {
    const validationError = validateStepForm(nextStepForm);
    if (validationError) {
      setStepSubmitError(validationError);
      return;
    }

    setConfigSubmitting(true);
    setStepSubmitError("");

    try {
      if (stepDialog.mode === "edit" && stepDialog.item) {
        await workflowApi.updateStep(stepDialog.item.id, nextStepForm);
      } else {
        await workflowApi.createStep(designerWorkflowId, nextStepForm);
      }

      notify({ message: "Step saved.", severity: "success" });
      closeStepDialog();
      await loadDesignerDetail(designerWorkflowId);
    } catch (error) {
      setStepSubmitError(getErrorMessage(error, "Could not save step."));
    } finally {
      setConfigSubmitting(false);
    }
  };

  const handleDeleteStep = async () => {
    if (!stepDelete) {
      return;
    }

    setConfigSubmitting(true);
    setDesignerError("");

    try {
      await workflowApi.deleteStep(stepDelete.id);
      setStepDelete(null);
      notify({ message: "Step deleted.", severity: "success" });
      await loadDesignerDetail(designerWorkflowId);
      await refreshStartDetailIfSameWorkflow(designerWorkflowId);
    } catch (error) {
      setDesignerError(getErrorMessage(error, "Could not delete step."));
    } finally {
      setConfigSubmitting(false);
    }
  };

  const handleUploadFieldTemplate = async (field, file) => {
    if (!field || !file) {
      return;
    }

    setConfigSubmitting(true);
    setDesignerError("");
    try {
      await workflowApi.uploadFieldTemplate(field.id, file);
      notify({ message: "Field template uploaded.", severity: "success" });
      await loadDesignerDetail(designerWorkflowId);
      await refreshStartDetailIfSameWorkflow(designerWorkflowId);
    } catch (error) {
      setDesignerError(getErrorMessage(error, "Could not upload field template."));
    } finally {
      setConfigSubmitting(false);
    }
  };

  const handleDownloadFieldTemplate = async (field) => {
    if (!field) {
      return;
    }

    setDesignerError("");
    try {
      const result = await workflowApi.downloadFieldTemplate(field.id);
      const url = URL.createObjectURL(result.blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = field.template?.fileName || `${field.fieldKey || "field"}_template.xlsx`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setDesignerError(getErrorMessage(error, "Could not download field template."));
    }
  };

  const openFieldDialog = (mode, step, field = null) => {
    setFieldDialog({ open: true, mode, item: field, step });
    setFieldSubmitError("");
    setFieldForm(field ? {
      fieldKey: field.fieldKey,
      label: field.label,
      dataType: field.dataType,
      isRequired: field.isRequired,
      defaultValue: field.defaultValue || "",
      placeholder: field.placeholder || "",
      optionSourceType: field.optionSourceType || "Static",
      validationJson: field.validationJson || "",
      displayOrder: field.displayOrder,
      options: field.options.map((option) => ({
        value: option.value,
        label: option.label,
        sortOrder: option.sortOrder,
        isActive: option.isActive,
      })),
    } : { ...initialFieldForm, displayOrder: (step.fields?.length || 0) + 1 });
  };

  const closeFieldDialog = () => {
    if (!configSubmitting) {
      setFieldDialog({ open: false, mode: "create", item: null, step: null });
      setFieldForm(initialFieldForm);
      setFieldSubmitError("");
    }
  };

  const handleSaveField = async (nextFieldForm = fieldForm) => {
    const validationError = validateFieldForm(nextFieldForm);
    if (validationError) {
      setFieldSubmitError(validationError);
      return;
    }

    const normalizedFieldKey = nextFieldForm.fieldKey.trim().toLowerCase();
    const currentFieldId = fieldDialog.mode === "edit" ? fieldDialog.item?.id : null;
    const duplicateFieldEntry = (designerDetail?.steps || [])
      .flatMap((step) => (step.fields || []).map((field) => ({ step, field })))
      .find(({ field }) => String(field.id) !== String(currentFieldId || "") && field.fieldKey?.trim().toLowerCase() === normalizedFieldKey);
    if (duplicateFieldEntry) {
      setFieldSubmitError(
        String(duplicateFieldEntry.step.id) === String(fieldDialog.step?.id)
          ? "Field key already exists in this step."
          : `Field key already exists in this workflow at step ${duplicateFieldEntry.step.stepName}.`,
      );
      return;
    }

    setConfigSubmitting(true);
    setFieldSubmitError("");

    try {
      if (fieldDialog.mode === "edit" && fieldDialog.item) {
        await workflowApi.updateField(fieldDialog.item.id, nextFieldForm);
      } else {
        await workflowApi.createField(fieldDialog.step.id, nextFieldForm);
      }

      notify({ message: "Field saved.", severity: "success" });
      closeFieldDialog();
      await loadDesignerDetail(designerWorkflowId);
      await refreshStartDetailIfSameWorkflow(designerWorkflowId);
    } catch (error) {
      setFieldSubmitError(getErrorMessage(error, "Could not save field."));
    } finally {
      setConfigSubmitting(false);
    }
  };

  const handleDeleteField = async () => {
    if (!fieldDelete?.field) {
      return;
    }

    setConfigSubmitting(true);
    setDesignerError("");

    try {
      await workflowApi.deleteField(fieldDelete.field.id);
      setFieldDelete(null);
      notify({ message: "Field deleted.", severity: "success" });
      await loadDesignerDetail(designerWorkflowId);
      await refreshStartDetailIfSameWorkflow(designerWorkflowId);
    } catch (error) {
      setDesignerError(getErrorMessage(error, "Could not delete field."));
    } finally {
      setConfigSubmitting(false);
    }
  };

  const handleAssignPermission = async (event) => {
    event.preventDefault();

    if (!permissionForm.principalValue.trim()) {
      setPermissionError("Principal value is required.");
      return;
    }

    setConfigSubmitting(true);
    setPermissionError("");

    try {
      if (editingPermission) {
        await workflowApi.updatePermission(editingPermission.id, permissionForm);
      } else {
        await workflowApi.assignPermission(designerWorkflowId, permissionForm);
      }
      setPermissionForm(initialPermissionForm);
      setEditingPermission(null);
      notify({ message: editingPermission ? "Permission updated." : "Permission assigned.", severity: "success" });
      await loadDesignerDetail(designerWorkflowId);
      await refreshStartDetailIfSameWorkflow(designerWorkflowId);
    } catch (error) {
      setPermissionError(getErrorMessage(error, "Could not assign permission."));
    } finally {
      setConfigSubmitting(false);
    }
  };

  const handleRemovePermission = async () => {
    if (!permissionDelete) {
      return;
    }

    setConfigSubmitting(true);

    try {
      await workflowApi.removePermission(permissionDelete.id);
      setPermissionDelete(null);
      if (editingPermission && String(editingPermission.id) === String(permissionDelete.id)) {
        cancelEditPermission();
      }
      notify({ message: "Permission removed.", severity: "success" });
      await loadDesignerDetail(designerWorkflowId);
      await refreshStartDetailIfSameWorkflow(designerWorkflowId);
    } catch (error) {
      notify({ message: getErrorMessage(error, "Could not remove permission."), severity: "error" });
    } finally {
      setConfigSubmitting(false);
    }
  };

  const openEditPermission = (permission) => {
    setEditingPermission(permission);
    setPermissionError("");
    setPermissionForm({
      principalType: permission.principalType || "User",
      principalValue: permission.principalValue || "",
      permission: permission.permission || "User",
    });
  };

  const cancelEditPermission = () => {
    setEditingPermission(null);
    setPermissionForm(initialPermissionForm);
    setPermissionError("");
  };

  const handleSaveGroup = async (event) => {
    event.preventDefault();
    if (!groupForm.groupCode.trim() || !groupForm.groupName.trim()) {
      setGroupError("Group code and name are required.");
      return;
    }

    setConfigSubmitting(true);
    setGroupError("");
    try {
      if (editingGroup) {
        await workflowApi.updateGroup(editingGroup.id, groupForm);
      } else {
        await workflowApi.createGroup(designerWorkflowId, groupForm);
      }
      setGroupForm(initialGroupForm);
      setEditingGroup(null);
      notify({ message: editingGroup ? "Group updated." : "Group saved.", severity: "success" });
      await loadDesignerDetail(designerWorkflowId);
    } catch (error) {
      setGroupError(getErrorMessage(error, "Could not save group."));
    } finally {
      setConfigSubmitting(false);
    }
  };

  const openEditGroup = (group) => {
    setEditingGroup(group);
    setGroupError("");
    setGroupForm({
      groupCode: group.groupCode || "",
      groupName: group.groupName || "",
      description: group.description || "",
      isActive: group.isActive !== false,
      members: (group.members || []).map((member) => member.actor).filter(Boolean).join("; "),
    });
  };

  const cancelEditGroup = () => {
    setEditingGroup(null);
    setGroupForm(initialGroupForm);
    setGroupError("");
  };

  const handleDeleteGroup = async (group) => {
    setConfigSubmitting(true);
    setGroupError("");
    try {
      await workflowApi.deleteGroup(group.id);
      if (editingGroup && String(editingGroup.id) === String(group.id)) {
        cancelEditGroup();
      }
      notify({ message: "Group deleted.", severity: "success" });
      await loadDesignerDetail(designerWorkflowId);
    } catch (error) {
      setGroupError(getErrorMessage(error, "Could not delete group."));
    } finally {
      setConfigSubmitting(false);
    }
  };

  const handleSaveTransitionRule = async (event) => {
    event.preventDefault();
    if (!transitionRuleForm.fromStepId) {
      setTransitionError("From step is required.");
      return;
    }
    if (["SpecificStep", "AlternatePath"].includes(transitionRuleForm.targetType) && !transitionRuleForm.targetStepId) {
      setTransitionError("Target step is required for SpecificStep or AlternatePath.");
      return;
    }

    setConfigSubmitting(true);
    setTransitionError("");
    try {
      if (editingTransitionRule) {
        await workflowApi.updateTransitionRule(editingTransitionRule.id, transitionRuleForm);
      } else {
        await workflowApi.createTransitionRule(designerWorkflowId, transitionRuleForm);
      }
      setTransitionRuleForm(initialTransitionRuleForm);
      setEditingTransitionRule(null);
      notify({ message: editingTransitionRule ? "Transition rule updated." : "Transition rule saved.", severity: "success" });
      await loadDesignerDetail(designerWorkflowId);
    } catch (error) {
      setTransitionError(getErrorMessage(error, "Could not save transition rule."));
    } finally {
      setConfigSubmitting(false);
    }
  };

  const openEditTransitionRule = (rule) => {
    setEditingTransitionRule(rule);
    setTransitionError("");
    setTransitionRuleForm({
      fromStepId: rule.fromStepId || "",
      action: rule.action || "Approve",
      targetType: rule.targetType || "NextStep",
      targetStepId: rule.targetStepId || "",
      conditionJson: rule.conditionJson || "",
      priority: rule.priority ?? 0,
      isDefault: Boolean(rule.isDefault),
      isActive: rule.isActive !== false,
    });
  };

  const cancelEditTransitionRule = () => {
    setEditingTransitionRule(null);
    setTransitionRuleForm(initialTransitionRuleForm);
    setTransitionError("");
  };

  const handleDeleteTransitionRule = async (rule) => {
    setConfigSubmitting(true);
    setTransitionError("");
    try {
      await workflowApi.deleteTransitionRule(rule.id);
      if (editingTransitionRule && String(editingTransitionRule.id) === String(rule.id)) {
        cancelEditTransitionRule();
      }
      notify({ message: "Transition rule deleted.", severity: "success" });
      await loadDesignerDetail(designerWorkflowId);
    } catch (error) {
      setTransitionError(getErrorMessage(error, "Could not delete transition rule."));
    } finally {
      setConfigSubmitting(false);
    }
  };

  const handleSubmitVersion = async () => {
    setConfigSubmitting(true);
    try {
      await workflowApi.submitVersion(designerWorkflowId, versionComment);
      setVersionComment("");
      notify({ message: "Workflow version submitted.", severity: "success" });
      await loadDesignerDetail(designerWorkflowId);
    } catch (error) {
      notify({ message: getErrorMessage(error, "Could not submit version."), severity: "error" });
    } finally {
      setConfigSubmitting(false);
    }
  };

  const handleVersionAction = async (version, action) => {
    setConfigSubmitting(true);
    try {
      if (action === "Approve") {
        await workflowApi.approveVersion(version.id, versionComment);
      } else {
        await workflowApi.rejectVersion(version.id, versionComment);
      }
      setVersionComment("");
      notify({ message: `Version ${action.toLowerCase()}d.`, severity: "success" });
      await loadDesignerDetail(designerWorkflowId);
      await loadWorkflows();
    } catch (error) {
      notify({ message: getErrorMessage(error, `Could not ${action.toLowerCase()} version.`), severity: "error" });
    } finally {
      setConfigSubmitting(false);
    }
  };

  const runReport = async () => {
    setReportLoading(true);
    setReportError("");

    try {
      const query = {
        workflowId: reportQuery.workflowId,
        status: reportQuery.status,
        from: reportQuery.from ? dayjs(reportQuery.from).toISOString() : "",
        to: reportQuery.to ? dayjs(reportQuery.to).toISOString() : "",
      };
      const [summary, rows] = await Promise.all([
        workflowApi.getReportSummary(query),
        workflowApi.exportReport(query),
      ]);
      setReportSummary(summary);
      setReportRows(rows);
    } catch (error) {
      setReportError(getErrorMessage(error, "Could not load report summary."));
    } finally {
      setReportLoading(false);
    }
  };

  const exportReport = async (format = "json") => {
    setReportLoading(true);
    setReportError("");

    try {
      const rows = await workflowApi.exportReport({
        workflowId: reportQuery.workflowId,
        status: reportQuery.status,
        from: reportQuery.from ? dayjs(reportQuery.from).toISOString() : "",
        to: reportQuery.to ? dayjs(reportQuery.to).toISOString() : "",
      });
      const timestamp = dayjs().format("YYYYMMDD-HHmmss");
      if (format === "csv") {
        const fieldLabelMap = await buildReportFieldLabelMap(rows);
        downloadCsv(rows, `eworkflow-report-${timestamp}.csv`, fieldLabelMap);
      } else {
        downloadJson(rows, `eworkflow-report-${timestamp}.json`);
      }
    } catch (error) {
      setReportError(getErrorMessage(error, "Could not export report."));
    } finally {
      setReportLoading(false);
    }
  };

  const buildReportFieldLabelMap = async (rows) => {
    const workflowIds = Array.from(new Set(rows.map(getReportRowWorkflowId).filter(Boolean).map(String)));
    const details = await Promise.all(workflowIds.map(async (workflowId) => {
      try {
        return await workflowApi.getWorkflow(workflowId);
      } catch {
        return null;
      }
    }));

    const labels = new Map();
    details.filter(Boolean).forEach((detail) => {
      flattenFields(detail.steps || []).forEach((field) => {
        labels.set(String(field.id), field.label || field.fieldKey || `Field ${field.id}`);
      });
    });

    return labels;
  };

  const openWorkflowFile = async (file) => {
    const previewWindow = window.open("", "_blank");
    if (previewWindow) {
      previewWindow.opener = null;
    }
    try {
      const { blob, contentType } = await workflowApi.downloadFile(file.id);
      const url = URL.createObjectURL(new Blob([blob], { type: contentType }));
      if (previewWindow) {
        previewWindow.location.href = url;
      } else {
        window.open(url, "_blank", "noopener,noreferrer");
      }
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      previewWindow?.close();
      notify({ message: getErrorMessage(error, "Could not open file."), severity: "error" });
    }
  };

  const currentWorkflowColumns = useMemo(() => workflowColumns({
    onSelect: (workflow) => {
      setDesignerWorkflowId(workflow.id);
      void loadDesignerDetail(workflow.id);
    },
    onEdit: (workflow) => openWorkflowDialog("edit", workflow),
  }), []);

  const currentRequestColumns = useMemo(() => requestColumns({
    workflows,
    onOpenDetail: openRequestDetail,
    onSubmit: handleSubmitDraft,
    onCancel: (request) => openDecision(request, "Cancel"),
    onEdit: handleEditDraft,
  }), [workflows]);

  const currentPendingColumns = useMemo(() => pendingColumns({
    workflows,
    onOpenDetail: openRequestDetail,
    onApprove: (request) => openDecision(request, "Approve"),
    onReject: (request) => openDecision(request, "Reject"),
  }), [workflows]);

  const renderStartRequestContent = () => (
    <>
      {startMasterError ? <Alert severity="error" variant="outlined">{startMasterError}</Alert> : null}
      {startMasterLoading ? <Alert severity="info" variant="outlined">Loading BU and department data...</Alert> : null}
      {editingRequest ? (
        <Alert
          severity="info"
          variant="outlined"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                setEditingRequest(null);
                setRequestTitle("");
                if (startDetail) {
                  setRequestValues(
                    getFirstOrderFields(startDetail.steps).filter(isVisibleInputField)
                      .reduce((values, field) => ({ ...values, [field.id]: getFieldInitialValue(field) }), {}),
                  );
                }
              }}
            >
              Cancel edit
            </Button>
          }
        >
          Editing draft {editingRequest.requestNo}.
        </Alert>
      ) : null}
      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", lg: "minmax(220px, 1fr) minmax(260px, 1.2fr) minmax(260px, 1.2fr) minmax(260px, 1.4fr)" } }}>
        <Autocomplete
          options={startCcns}
          value={selectedStartCcn}
          loading={startMasterLoading}
          getOptionLabel={formatCcnLabel}
          isOptionEqualToValue={(option, value) => String(option.ccn) === String(value.ccn)}
          onChange={(_, value) => {
            const ccnKey = value?.ccn || "";
            setStartCcn(ccnKey);
            setStartBu(value ? getCcnFormValue(value) : "");
            resetStartRequestState({ clearDepartment: true });
            if (ccnKey) {
              void loadStartDepartmentsForCcn(ccnKey, { keepSelection: false });
            }
          }}
          renderInput={(params) => (
            <TextField {...params} label="BU" required fullWidth />
          )}
        />
        <Autocomplete
          options={startDepartments}
          value={startDepartments.find((department) => matchesWorkflowContext(department.kronosDeptName, startDepartment)) || (startDepartment ? { kronosDeptName: startDepartment } : null)}
          loading={startMasterLoading}
          getOptionLabel={(option) => option?.kronosDeptName || ""}
          isOptionEqualToValue={(option, value) => String(option.kronosDeptId || option.kronosDeptName) === String(value.kronosDeptId || value.kronosDeptName)}
          disabled={!startCcn}
          onChange={(_, value) => {
            setStartDepartment(value?.kronosDeptName || "");
            resetStartRequestState();
          }}
          renderInput={(params) => (
            <TextField {...params} label="Department" required fullWidth />
          )}
        />
        <Autocomplete
          options={startWorkflowOptions}
          value={selectedStartWorkflow}
          loading={workflowsLoading}
          disabled={!startWorkflowOptions.length}
          getOptionLabel={formatWorkflowOptionLabel}
          isOptionEqualToValue={(option, value) => String(option.id) === String(value.id)}
          filterOptions={(options, state) => {
            const query = normalizeWorkflowContextValue(state.inputValue);
            if (!query) {
              return options;
            }
            return options.filter((workflow) => normalizeWorkflowContextValue(workflowOptionSearchText(workflow)).includes(query));
          }}
          onChange={(_, workflow) => {
            void handleStartWorkflowChange(workflow);
          }}
          renderInput={(params) => (
            <TextField {...params} label="Workflow" fullWidth />
          )}
        />
        <TextField label="Request title" value={requestTitle} onChange={(event) => setRequestTitle(event.target.value)} required fullWidth disabled={!selectedStartWorkflowId} />
      </Box>

      {!startWorkflowOptions.length ? (
        <EmptyState
          title="No workflow available"
          description={startBu || startDepartment
            ? "No active workflow with submit permission and approved version matches the selected BU and Department."
            : "No active workflow with submit permission and approved version is available."}
        />
      ) : (
        <>
          {startLoading ? <Alert severity="info" variant="outlined">Loading workflow form...</Alert> : null}
          {startDetail ? (
            <Stack spacing={2.5}>
              {startSteps.map((step) => (
                <Box key={step.id} sx={{ p: 2, borderRadius: 1, border: (theme) => `1px solid ${theme.palette.divider}`, bgcolor: "background.default" }}>
                  <Stack spacing={2}>
                    <Stack spacing={0.25}>
                      <Typography variant="subtitle1">{step.stepName}</Typography>
                      <Typography variant="caption" color="text.secondary">Order {step.stepOrder} - {step.approvalMode}</Typography>
                    </Stack>
                    <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" } }}>
                      {step.fields.filter((field) =>
                        activeStartFieldIds.has(field.id)
                      ).map((field) => (
                        <Box key={field.id} sx={{ minWidth: 0, gridColumn: ["file", "table"].includes(field.dataType) ? "1 / -1" : undefined }}>
                          <WorkflowDynamicField
                            field={{ ...field, stepId: step.id, stepName: step.stepName, stepOrder: step.stepOrder, stepTemplate: field.template }}
                            fields={startFields}
                            values={requestValues}
                            onChange={(fieldId, nextValue) => setRequestValues((current) => ({ ...current, [fieldId]: nextValue }))}
                          />
                        </Box>
                      ))}
                    </Box>
                  </Stack>
                </Box>
              ))}
              {startFields.length ? null : (
                <Alert severity="info" variant="outlined">
                  This workflow has no request fields. A draft will be created with the title only.
                </Alert>
              )}
              <Stack direction="row" justifyContent="flex-end">
                <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={handleCreateRequest} disabled={requestSubmitting || !startDetail}>
                  {editingRequest ? "Update draft" : "Create draft"}
                </Button>
              </Stack>
            </Stack>
          ) : (
            <EmptyState title="Choose a workflow" description="The request form will appear after a workflow is selected." />
          )}
        </>
      )}
    </>
  );

  return (
    <Stack spacing={3.5}>
      <PageHeader
        breadcrumbs={[
          { label: t("dashboard.breadcrumbs.root"), to: "/dashboard" },
          { label: "Self Service", to: "/dashboard/self-service" },
          { label: "eWorkflow" },
        ]}
        title="eWorkflow"
        subtitle="Create workflow requests, approve assigned work, maintain workflow definitions, and review workflow reports."
      />

      <SectionCard cardSx={{ borderRadius: 0 }} contentSx={{ pb: 2 }}>
        <Tabs value={tab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab value="start" icon={<PlayArrowRoundedIcon fontSize="small" />} iconPosition="start" label="Start request" />
          <Tab value="mine" icon={<AccountTreeRoundedIcon fontSize="small" />} iconPosition="start" label={`My requests (${myRequests.length})`} />
          <Tab value="pending" icon={<CheckRoundedIcon fontSize="small" />} iconPosition="start" label={`Pending approval (${pendingRequests.length})`} />
          <Tab value="designer" icon={<EditRoundedIcon fontSize="small" />} iconPosition="start" label={`Designer (${designerWorkflows.length})`} />
          <Tab value="reports" icon={<AssessmentRoundedIcon fontSize="small" />} iconPosition="start" label={`Reports (${reportWorkflows.length})`} />
        </Tabs>
      </SectionCard>

      {workflowsError ? <Alert severity="error" variant="outlined">{workflowsError}</Alert> : null}

      {tab === "start" ? (
        <SectionCard
          title="Start request"
          subtitle="Select an active workflow and fill in the configured request fields."
          cardSx={{ borderRadius: 0 }}
          action={
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label={`${startWorkflows.length} available`} color="primary" variant="outlined" />
              <Button variant="outlined" startIcon={<RefreshRoundedIcon />} onClick={() => void loadTabData("start")} disabled={workflowsLoading || startLoading || startMasterLoading}>
                Refresh
              </Button>
            </Stack>
          }
        >
          <Stack spacing={2.5}>
            {startError ? <Alert severity="error" variant="outlined">{startError}</Alert> : null}
            {renderStartRequestContent()}
          </Stack>
        </SectionCard>
      ) : null}

      {tab === "mine" ? (
        <SectionCard
          title="My requests"
          subtitle="Track your draft and submitted workflow requests."
          cardSx={{ borderRadius: 0 }}
          action={<Button variant="outlined" startIcon={<RefreshRoundedIcon />} onClick={() => void loadTabData("mine")} disabled={myRequestsLoading || workflowsLoading}>Refresh</Button>}
        >
          <Stack spacing={2}>
            {requestsError ? <Alert severity="error" variant="outlined">{requestsError}</Alert> : null}
            <AppDataTable
              columns={currentRequestColumns}
              rows={myRequests}
              loading={myRequestsLoading}
              defaultRowsPerPage={10}
              pageSizeOptions={[10, 25, 50]}
              defaultSortBy="requestNo"
              defaultSortDirection="desc"
              searchPlaceholder="Search requests"
              emptyTitle="No workflow requests"
              emptyDescription="Created workflow requests will appear here."
            />
          </Stack>
        </SectionCard>
      ) : null}

      {tab === "pending" ? (
        <SectionCard
          title="Pending approval"
          subtitle="Requests waiting for your approval by user or role assignment."
          cardSx={{ borderRadius: 0 }}
          action={<Button variant="outlined" startIcon={<RefreshRoundedIcon />} onClick={() => void loadTabData("pending")} disabled={pendingLoading || workflowsLoading}>Refresh</Button>}
        >
          <Stack spacing={2}>
            {requestsError ? <Alert severity="error" variant="outlined">{requestsError}</Alert> : null}
            <AppDataTable
              columns={currentPendingColumns}
              rows={pendingRequests}
              loading={pendingLoading}
              defaultRowsPerPage={10}
              pageSizeOptions={[10, 25, 50]}
              searchPlaceholder="Search pending approvals"
              emptyTitle="No pending approvals"
              emptyDescription="Requests assigned to you will appear here."
            />
          </Stack>
        </SectionCard>
      ) : null}

      {tab === "designer" ? (
        <Stack spacing={3}>
          <SectionCard
            title="Workflow designer"
            subtitle="Create workflows, maintain approval steps and define dynamic request fields."
            cardSx={{ borderRadius: 0 }}
            action={
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" startIcon={<RefreshRoundedIcon />} onClick={() => void loadTabData("designer")} disabled={workflowsLoading || designerLoading}>Refresh</Button>
                {workflows.some((workflow) => workflow.access.canManage) ? (
                  <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => openWorkflowDialog("create")}>New workflow</Button>
                ) : null}
              </Stack>
            }
          >
            <AppDataTable
              columns={currentWorkflowColumns}
              rows={designerWorkflows}
              loading={workflowsLoading}
              defaultRowsPerPage={5}
              searchPlaceholder="Search workflows"
              emptyTitle="No workflow approvals"
              emptyDescription="Workflows you can manage or approve will appear here."
            />
          </SectionCard>

          {designerError ? <Alert severity="error" variant="outlined">{designerError}</Alert> : null}
          {designerDetail ? (
            <SectionCard
              title={designerDetail.workflow.name}
              subtitle={`${designerDetail.workflow.code} · ${designerDetail.workflow.isActive ? "Active" : "Inactive"}`}
              cardSx={{ borderRadius: 0 }}
              action={(
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Button variant="outlined" startIcon={<VisibilityRoundedIcon />} onClick={() => setReviewOpen(true)} disabled={!designerDetail}>
                    Review UI
                  </Button>
                  {canManageDesigner ? (
                    <Button variant="outlined" startIcon={<AddRoundedIcon />} onClick={() => openStepDialog("create")}>
                      Add step
                    </Button>
                  ) : null}
                </Stack>
              )}
            >
              <Stack spacing={3}>
                {designerLoading ? <Alert severity="info" variant="outlined">Loading configuration...</Alert> : null}
                <Stack spacing={2}>
                  <Typography variant="h6">Steps and fields</Typography>
                  {designerDetail.steps.length ? designerDetail.steps.map((step) => (
                    <Box key={step.id} sx={{ p: 2, borderRadius: 1, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                      <Stack spacing={2}>
                        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} justifyContent="space-between" alignItems={{ md: "center" }}>
                          <Stack spacing={0.25}>
                            <Typography variant="subtitle1">{step.stepName}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {step.stepCode} · order {step.stepOrder} · {step.approverType}: {step.approverValue}
                            </Typography>
                          </Stack>
                          {canManageDesigner ? (
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                              <Button size="small" startIcon={<EditRoundedIcon />} onClick={() => openStepDialog("edit", step)}>Edit step</Button>
                              <Button size="small" startIcon={<AddRoundedIcon />} onClick={() => openFieldDialog("create", step)}>Add field</Button>
                              <Button size="small" color="error" startIcon={<DeleteOutlineRoundedIcon />} onClick={() => setStepDelete(step)} disabled={configSubmitting}>Delete step</Button>
                            </Stack>
                          ) : null}
                        </Stack>
                        {step.fields.length ? (
                          <Box sx={{ display: "grid", gap: 1.25, gridTemplateColumns: "1fr" }}>
                            {step.fields.map((field) => (
                              <Box key={field.id} sx={{ display: "grid", gap: 1, gridTemplateColumns: { xs: "1fr", md: "1fr 150px 120px auto" }, alignItems: "center", p: 1.25, borderRadius: 1, bgcolor: "background.default" }}>
                                <Stack spacing={0.25}>
                                  <Typography variant="body2">{field.label}</Typography>
                                  <Typography variant="caption" color="text.secondary">{field.fieldKey}</Typography>
                                </Stack>
                                <Chip label={field.dataType} size="small" variant="outlined" />
                                <Chip label={field.isRequired ? "Required" : "Optional"} size="small" color={field.isRequired ? "warning" : "default"} />
                                {canManageDesigner ? (
                                  <Stack direction="row" spacing={0.5} justifyContent={{ xs: "flex-start", md: "flex-end" }}>
                                  {field.dataType === "file" ? (
                                    <Tooltip title="Upload Excel template">
                                      <IconButton size="small" color="secondary" component="label" disabled={configSubmitting}>
                                        <UploadFileRoundedIcon fontSize="small" />
                                        <input
                                          type="file"
                                          accept=".xlsx"
                                          hidden
                                          onChange={(event) => {
                                            void handleUploadFieldTemplate(field, event.target.files?.[0]);
                                            event.target.value = "";
                                          }}
                                        />
                                      </IconButton>
                                    </Tooltip>
                                  ) : null}
                                  {field.dataType === "file" && field.template ? (
                                    <Tooltip title={field.template.fileName || "Download Excel template"}>
                                      <IconButton size="small" color="primary" onClick={() => void handleDownloadFieldTemplate(field)} disabled={configSubmitting}>
                                        <DownloadRoundedIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  ) : null}
                                  <Tooltip title="Edit field">
                                    <IconButton size="small" color="primary" onClick={() => openFieldDialog("edit", step, field)} disabled={configSubmitting}>
                                      <EditRoundedIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete field">
                                    <IconButton size="small" color="error" onClick={() => setFieldDelete({ step, field })} disabled={configSubmitting}>
                                      <DeleteOutlineRoundedIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  </Stack>
                                ) : null}
                              </Box>
                            ))}
                          </Box>
                        ) : (
                          <Alert severity="info" variant="outlined">No fields configured for this step.</Alert>
                        )}
                      </Stack>
                    </Box>
                  )) : <Alert severity="info" variant="outlined">No steps configured yet.</Alert>}
                </Stack>

                {canManageDesigner ? (
                  <>
                <Divider />

                <Stack spacing={2}>
                  <Typography variant="h6">Permissions</Typography>
                  {permissionError ? <Alert severity="error" variant="outlined">{permissionError}</Alert> : null}
                  {editingPermission ? (
                    <Alert
                      severity="info"
                      variant="outlined"
                      action={<Button size="small" color="inherit" onClick={cancelEditPermission}>Cancel edit</Button>}
                    >
                      Editing permission for {editingPermission.principalValue}.
                    </Alert>
                  ) : null}
                  <Box component="form" onSubmit={handleAssignPermission} sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "180px minmax(260px, 1fr) 180px auto" }, alignItems: "start" }}>
                    <FormControl fullWidth>
                      <InputLabel>Principal type</InputLabel>
                      <Select label="Principal type" value={permissionForm.principalType} onChange={(event) => setPermissionForm((current) => ({ ...current, principalType: event.target.value, principalValue: "" }))}>
                        {principalTypes.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                      </Select>
                    </FormControl>
                    <TextField
                      label={permissionForm.principalType === "Group" ? "Workflow group ID / code" : "Email / username"}
                      value={permissionForm.principalValue}
                      onChange={(event) => setPermissionForm((current) => ({ ...current, principalValue: event.target.value }))}
                      required
                      fullWidth
                    />
                    <FormControl fullWidth>
                      <InputLabel>Permission</InputLabel>
                      <Select label="Permission" value={permissionForm.permission} onChange={(event) => setPermissionForm((current) => ({ ...current, permission: event.target.value }))}>
                        {permissions.map((permission) => <MenuItem key={permission} value={permission}>{permission}</MenuItem>)}
                      </Select>
                    </FormControl>
                    <Button type="submit" variant="contained" startIcon={editingPermission ? <SaveRoundedIcon /> : <AddRoundedIcon />} disabled={configSubmitting} sx={{ minHeight: 56, whiteSpace: "nowrap" }}>
                      {editingPermission ? "Update" : "Assign"}
                    </Button>
                  </Box>
                  <Box sx={{ display: "grid", gap: 1 }}>
                    {designerDetail.permissions.map((permission) => (
                      <Box key={permission.id} sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", md: "160px 1fr 160px auto" }, alignItems: "center", p: 1.25, borderRadius: 1, bgcolor: "background.default" }}>
                        <Chip label={permission.principalType} size="small" variant="outlined" />
                        <Typography variant="body2">{permission.principalValue}</Typography>
                        <Chip label={permission.permission} size="small" color={permission.permission === "Owner" ? "primary" : "default"} />
                        <Stack direction="row" spacing={0.5} justifyContent={{ xs: "flex-start", md: "flex-end" }}>
                          <Tooltip title="Edit permission">
                            <IconButton size="small" color="primary" onClick={() => openEditPermission(permission)} disabled={configSubmitting}>
                              <EditRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Remove permission">
                            <IconButton size="small" color="error" onClick={() => setPermissionDelete(permission)} disabled={configSubmitting}>
                              <DeleteOutlineRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Box>
                    ))}
                  </Box>
                </Stack>

                <Divider />

                <Stack spacing={2}>
                  <Typography variant="h6">Groups</Typography>
                  {groupError ? <Alert severity="error" variant="outlined">{groupError}</Alert> : null}
                  {editingGroup ? (
                    <Alert
                      severity="info"
                      variant="outlined"
                      action={<Button size="small" color="inherit" onClick={cancelEditGroup}>Cancel edit</Button>}
                    >
                      Editing group {editingGroup.groupCode}.
                    </Alert>
                  ) : null}
                  <Box component="form" onSubmit={handleSaveGroup} sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "160px 220px minmax(280px, 1fr) auto" }, alignItems: "start" }}>
                    <TextField label="Code" value={groupForm.groupCode} onChange={(event) => setGroupForm((current) => ({ ...current, groupCode: event.target.value }))} required fullWidth />
                    <TextField label="Name" value={groupForm.groupName} onChange={(event) => setGroupForm((current) => ({ ...current, groupName: event.target.value }))} required fullWidth />
                    <TextField label="Members" value={groupForm.members} onChange={(event) => setGroupForm((current) => ({ ...current, members: event.target.value }))} helperText="Email/username separated by comma, semicolon, or new line." fullWidth />
                    <Button type="submit" variant="contained" startIcon={editingGroup ? <SaveRoundedIcon /> : <AddRoundedIcon />} disabled={configSubmitting} sx={{ minHeight: 56, whiteSpace: "nowrap" }}>
                      {editingGroup ? "Update group" : "Save group"}
                    </Button>
                  </Box>
                  <Box sx={{ display: "grid", gap: 1 }}>
                    {(designerDetail.groups || []).map((group) => (
                      <Box key={group.id} sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", md: "140px 1fr 2fr auto" }, alignItems: "center", p: 1.25, borderRadius: 1, bgcolor: "background.default" }}>
                        <Chip label={group.groupCode} size="small" variant="outlined" />
                        <Typography variant="body2">{group.groupName}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: "anywhere" }}>{group.members.map((member) => member.actor).join("; ") || "No members"}</Typography>
                        <Stack direction="row" spacing={0.5} justifyContent={{ xs: "flex-start", md: "flex-end" }}>
                          <Tooltip title="Edit group">
                            <IconButton size="small" color="primary" onClick={() => openEditGroup(group)} disabled={configSubmitting}>
                              <EditRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete group">
                            <IconButton size="small" color="error" onClick={() => handleDeleteGroup(group)} disabled={configSubmitting}>
                              <DeleteOutlineRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Box>
                    ))}
                  </Box>
                </Stack>

                <Divider />

                <Stack spacing={2}>
                  <Typography variant="h6">Transition rules</Typography>
                  {transitionError ? <Alert severity="error" variant="outlined">{transitionError}</Alert> : null}
                  {editingTransitionRule ? (
                    <Alert
                      severity="info"
                      variant="outlined"
                      action={<Button size="small" color="inherit" onClick={cancelEditTransitionRule}>Cancel edit</Button>}
                    >
                      Editing transition rule #{editingTransitionRule.id}.
                    </Alert>
                  ) : null}
                  <Box component="form" onSubmit={handleSaveTransitionRule} sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1.3fr 130px 150px 1.5fr 90px auto" }, alignItems: "start" }}>
                    <FormControl fullWidth>
                      <InputLabel>From step</InputLabel>
                      <Select label="From step" value={transitionRuleForm.fromStepId} onChange={(event) => setTransitionRuleForm((current) => ({ ...current, fromStepId: event.target.value }))}>
                        {designerDetail.steps.map((step) => (
                          <MenuItem key={step.id} value={step.id}>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="body2">{getWorkflowStepLabel(step)}</Typography>
                              <Typography variant="caption" color="text.secondary">{getWorkflowStepMeta(step)}</Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl fullWidth>
                      <InputLabel>Action</InputLabel>
                      <Select label="Action" value={transitionRuleForm.action} onChange={(event) => setTransitionRuleForm((current) => ({ ...current, action: event.target.value }))}>
                        <MenuItem value="Approve">Approve</MenuItem>
                        <MenuItem value="Reject">Reject</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl fullWidth>
                      <InputLabel>Target</InputLabel>
                      <Select
                        label="Target"
                        value={transitionRuleForm.targetType}
                        onChange={(event) => setTransitionRuleForm((current) => ({
                          ...current,
                          targetType: event.target.value,
                          targetStepId: ["SpecificStep", "AlternatePath"].includes(event.target.value) ? current.targetStepId : "",
                        }))}
                      >
                        {["NextStep", "SpecificStep", "Complete", "RejectRequest", "AlternatePath"].map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                      </Select>
                    </FormControl>
                    <FormControl fullWidth disabled={!["SpecificStep", "AlternatePath"].includes(transitionRuleForm.targetType)}>
                      <InputLabel>Target step</InputLabel>
                      <Select
                        label="Target step"
                        value={transitionRuleForm.targetStepId}
                        onChange={(event) => setTransitionRuleForm((current) => ({ ...current, targetStepId: event.target.value }))}
                        renderValue={(value) => getWorkflowStepLabel(designerStepById.get(String(value))) || value}
                      >
                        {designerDetail.steps.map((step) => (
                          <MenuItem key={step.id} value={step.id}>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="body2">{getWorkflowStepLabel(step)}</Typography>
                              <Typography variant="caption" color="text.secondary">{getWorkflowStepMeta(step)}</Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                      {transitionRuleForm.targetStepId ? (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                          {getWorkflowStepMeta(designerStepById.get(String(transitionRuleForm.targetStepId)))}
                        </Typography>
                      ) : null}
                    </FormControl>
                    <TextField label="Priority" type="number" value={transitionRuleForm.priority} onChange={(event) => setTransitionRuleForm((current) => ({ ...current, priority: event.target.value }))} />
                    <Button type="submit" variant="contained" startIcon={editingTransitionRule ? <SaveRoundedIcon /> : <AddRoundedIcon />} disabled={configSubmitting} sx={{ minHeight: 56 }}>
                      {editingTransitionRule ? "Update rule" : "Add rule"}
                    </Button>
                  </Box>
                  <TextField
                    label="Condition JSON"
                    value={transitionRuleForm.conditionJson}
                    onChange={(event) => setTransitionRuleForm((current) => ({ ...current, conditionJson: event.target.value }))}
                    onKeyDown={(event) => {
                      if (event.key === "Tab" && !transitionRuleForm.conditionJson?.trim()) {
                        event.preventDefault();
                        setTransitionRuleForm((current) => ({
                          ...current,
                          conditionJson: '{"fieldKey":"ProductGroup","operator":"equals","value":"A"}',
                        }));
                      }
                    }}
                    multiline
                    minRows={2}
                    placeholder='{"fieldKey":"ProductGroup","operator":"equals","value":"A"}'
                    helperText="Press Tab while this field is empty to insert the condition JSON template."
                  />
                  <Box sx={{ display: "grid", gap: 1 }}>
                    {(designerDetail.transitionRules || []).map((rule) => {
                      const fromStep = designerStepById.get(String(rule.fromStepId));
                      const targetStep = designerStepById.get(String(rule.targetStepId));
                      return (
                        <Box key={rule.id} sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", md: "1.4fr 110px 1.6fr 1.2fr auto" }, alignItems: "start", p: 1.25, borderRadius: 1, bgcolor: "background.default" }}>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2">{getWorkflowStepLabel(fromStep) || rule.fromStepId}</Typography>
                            <Typography variant="caption" color="text.secondary">{getWorkflowStepMeta(fromStep)}</Typography>
                          </Box>
                          <Chip label={rule.action} size="small" variant="outlined" sx={{ justifySelf: { md: "start" } }} />
                          <Box sx={{ minWidth: 0 }}>
                            <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
                              <Chip label={rule.targetType} size="small" />
                              <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>{getTransitionTargetLabel(rule, designerStepById)}</Typography>
                            </Stack>
                            {targetStep ? (
                              <Typography variant="caption" color="text.secondary">{getWorkflowStepMeta(targetStep)}</Typography>
                            ) : null}
                          </Box>
                          <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}>{rule.conditionJson || (rule.isDefault ? "Default" : "No condition")}</Typography>
                          <Stack direction="row" spacing={0.5} justifyContent={{ xs: "flex-start", md: "flex-end" }}>
                            <Tooltip title="Edit transition rule">
                              <IconButton size="small" color="primary" onClick={() => openEditTransitionRule(rule)} disabled={configSubmitting}>
                                <EditRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete transition rule">
                              <IconButton size="small" color="error" onClick={() => handleDeleteTransitionRule(rule)} disabled={configSubmitting}>
                                <DeleteOutlineRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </Box>
                      );
                    })}
                  </Box>
                </Stack>
                  </>
                ) : null}

                <Divider />

                <Stack spacing={2}>
                  <Typography variant="h6">Versions & history</Typography>
                  <TextField label="Version comment" value={versionComment} onChange={(event) => setVersionComment(event.target.value)} multiline minRows={2} />
                  {canManageDesigner ? (
                    <Stack direction="row" spacing={1}>
                      <Button variant="contained" onClick={handleSubmitVersion} disabled={configSubmitting}>Submit draft version</Button>
                    </Stack>
                  ) : null}
                  <WorkflowVersionTimeline
                    versions={designerDetail.versions || []}
                    activeVersionId={designerDetail.workflow?.currentApprovedVersionId}
                    configSubmitting={configSubmitting}
                    onAction={handleVersionAction}
                  />
                </Stack>
              </Stack>
            </SectionCard>
          ) : null}
        </Stack>
      ) : null}

      {tab === "reports" ? (
        <SectionCard
          title="Reports"
          subtitle="Review workflow summary and export workflow rows."
          cardSx={{ borderRadius: 0 }}
          action={<Button variant="outlined" startIcon={<RefreshRoundedIcon />} onClick={() => void loadTabData("reports")} disabled={workflowsLoading || reportLoading}>Refresh</Button>}
        >
          <Stack spacing={2.5}>
            {reportError ? <Alert severity="error" variant="outlined">{reportError}</Alert> : null}
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1.2fr 180px 180px 180px auto auto auto" }, alignItems: "center" }}>
              <FormControl fullWidth>
                <InputLabel>Workflow</InputLabel>
                <Select label="Workflow" value={reportQuery.workflowId} onChange={(event) => setReportQuery((current) => ({ ...current, workflowId: event.target.value }))}>
                  <MenuItem value="">All reportable</MenuItem>
                  {reportWorkflows.map((workflow) => <MenuItem key={workflow.id} value={workflow.id}>{workflow.name}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select label="Status" value={reportQuery.status} onChange={(event) => setReportQuery((current) => ({ ...current, status: event.target.value }))}>
                  {statusOptions.map((status) => <MenuItem key={status || "all"} value={status}>{status || "All"}</MenuItem>)}
                </Select>
              </FormControl>
              <DatePicker label="From" value={reportQuery.from} onChange={(value) => setReportQuery((current) => ({ ...current, from: value }))} slotProps={{ textField: { fullWidth: true } }} />
              <DatePicker label="To" value={reportQuery.to} onChange={(value) => setReportQuery((current) => ({ ...current, to: value }))} slotProps={{ textField: { fullWidth: true } }} />
              <Button variant="contained" onClick={runReport} disabled={reportLoading}>Run</Button>
              <Button variant="outlined" onClick={() => exportReport("json")} disabled={reportLoading}>JSON</Button>
              <Button variant="outlined" onClick={() => exportReport("csv")} disabled={reportLoading}>CSV</Button>
            </Box>
            <AppDataTable
              columns={[
                { id: "workflowId", label: "Workflow", render: (row) => getWorkflowName(workflows, row.WorkflowID ?? row.workflowID ?? row.workflowId), searchAccessor: (row) => getWorkflowName(workflows, row.WorkflowID ?? row.workflowID ?? row.workflowId) },
                { id: "total", label: "Total", width: 120, render: (row) => row.Total ?? row.total ?? 0, sortAccessor: (row) => row.Total ?? row.total ?? 0 },
                { id: "draft", label: "Draft", width: 120, render: (row) => row.Draft ?? row.draft ?? 0 },
                { id: "inProgress", label: "In progress", width: 140, render: (row) => row.InProgress ?? row.inProgress ?? 0 },
                { id: "completed", label: "Completed", width: 140, render: (row) => row.Completed ?? row.completed ?? 0 },
                { id: "rejected", label: "Rejected", width: 130, render: (row) => row.Rejected ?? row.rejected ?? 0 },
              ]}
              rows={reportSummary.map((row, index) => ({ ...row, id: row.WorkflowID ?? row.workflowID ?? row.workflowId ?? index }))}
              loading={reportLoading}
              defaultRowsPerPage={10}
              searchPlaceholder="Search report"
              emptyTitle="No report data"
              emptyDescription="Run report filters to load workflow summary."
            />
            <Divider />
            <Stack spacing={1.5}>
              <Typography variant="h6">Request rows</Typography>
              <AppDataTable
                columns={[
                  { id: "RequestNo", label: "Request no", minWidth: 180, render: (row) => row.RequestNo ?? row.requestNo ?? "" },
                  { id: "Title", label: "Title", minWidth: 220, render: (row) => row.Title ?? row.title ?? "" },
                  {
                    id: "WorkflowID",
                    label: "Workflow",
                    minWidth: 190,
                    render: (row) => getWorkflowName(workflows, row.WorkflowID ?? row.workflowID ?? row.workflowId),
                    searchAccessor: (row) => getWorkflowName(workflows, row.WorkflowID ?? row.workflowID ?? row.workflowId),
                  },
                  {
                    id: "Status",
                    label: "Status",
                    width: 140,
                    render: (row) => <Chip label={row.Status ?? row.status ?? ""} color={getStatusColor(row.Status ?? row.status)} size="small" />,
                  },
                  {
                    id: "CreatedAt",
                    label: "Created",
                    width: 180,
                    render: (row) => formatDateTimeLabel(row.CreatedAt ?? row.createdAt),
                    searchAccessor: (row) => formatDateTimeLabel(row.CreatedAt ?? row.createdAt),
                    sortAccessor: (row) => row.CreatedAt ?? row.createdAt ?? "",
                  },
                  {
                    id: "actions",
                    label: "Actions",
                    width: 110,
                    sortable: false,
                    searchable: false,
                    render: (row) => (
                      <Tooltip title="View request detail">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => openRequestDetail({
                            id: row.ID ?? row.id,
                            workflowId: row.WorkflowID ?? row.workflowID ?? row.workflowId,
                            requestNo: row.RequestNo ?? row.requestNo,
                            title: row.Title ?? row.title,
                          })}
                        >
                          <VisibilityRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ),
                  },
                ]}
                rows={reportRows.map((row, index) => ({ ...row, id: row.ID ?? row.id ?? index }))}
                loading={reportLoading}
                defaultRowsPerPage={10}
                pageSizeOptions={[10, 25, 50]}
                searchPlaceholder="Search request rows"
                emptyTitle="No request rows"
                emptyDescription="Run report filters to load matching requests."
              />
            </Stack>
          </Stack>
        </SectionCard>
      ) : null}

      <Dialog open={workflowDialog.open} onClose={closeWorkflowDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{workflowDialog.mode === "edit" ? "Edit workflow" : "New workflow"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.25} sx={{ pt: 1 }}>
            {workflowSubmitError ? <Alert severity="error" variant="outlined">{workflowSubmitError}</Alert> : null}
            {workflowMasterError ? <Alert severity="warning" variant="outlined">{workflowMasterError}</Alert> : null}
            <TextField label="Code" value={workflowForm.code} onChange={(event) => setWorkflowForm((current) => ({ ...current, code: event.target.value }))} required disabled={workflowDialog.mode === "edit"} fullWidth />
            <TextField label="Name" value={workflowForm.name} onChange={(event) => setWorkflowForm((current) => ({ ...current, name: event.target.value }))} required fullWidth />
            <TextField label="Description" value={workflowForm.description} onChange={(event) => setWorkflowForm((current) => ({ ...current, description: event.target.value }))} minRows={3} multiline fullWidth />
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
              <Autocomplete
                options={workflowCcns}
                value={workflowCcns.find((ccn) => String(ccn.ccn) === String(workflowForm.ccn)) || null}
                getOptionLabel={formatCcnLabel}
                isOptionEqualToValue={(option, value) => String(option.ccn) === String(value.ccn)}
                loading={workflowMasterLoading}
                disabled={workflowSubmitting || workflowMasterLoading}
                onChange={(_, ccn) => {
                  const ccnKey = ccn?.ccn || "";
                  setWorkflowForm((current) => ({
                    ...current,
                    ccn: ccnKey,
                    bu: ccn ? getCcnFormValue(ccn) : "",
                    department: "",
                  }));
                  void loadWorkflowDepartmentsForCcn(ccnKey);
                }}
                renderInput={(params) => (
                  <TextField {...params} label="BU" required fullWidth />
                )}
              />
              <Autocomplete
                options={workflowDepartments}
                value={workflowDepartments.find((department) => department.kronosDeptName === workflowForm.department) || (workflowForm.department ? { kronosDeptName: workflowForm.department } : null)}
                getOptionLabel={(department) => department?.kronosDeptName || ""}
                isOptionEqualToValue={(option, value) => option.kronosDeptName === value.kronosDeptName}
                loading={workflowMasterLoading}
                disabled={workflowSubmitting || workflowMasterLoading || !workflowForm.ccn}
                onChange={(_, department) => {
                  setWorkflowForm((current) => ({
                    ...current,
                    department: department?.kronosDeptName || "",
                  }));
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Department" required fullWidth />
                )}
              />
            </Box>
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
              <TextField label="Mail" value={workflowForm.mail} onChange={(event) => setWorkflowForm((current) => ({ ...current, mail: event.target.value }))} fullWidth />
              <TextField label="Profile name" value={workflowForm.mailProfileName} onChange={(event) => setWorkflowForm((current) => ({ ...current, mailProfileName: event.target.value }))} fullWidth />
            </Box>
            <FormControl fullWidth>
              <InputLabel>Version mode</InputLabel>
              <Select label="Version mode" value={workflowForm.versionMode} onChange={(event) => setWorkflowForm((current) => ({ ...current, versionMode: event.target.value }))}>
                {versionModes.map((mode) => <MenuItem key={mode} value={mode}>{mode}</MenuItem>)}
              </Select>
            </FormControl>
            <Box sx={{ display: "grid", gap: 1, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
              <FormControlLabel control={<Checkbox checked={workflowForm.isActive} onChange={(event) => setWorkflowForm((current) => ({ ...current, isActive: event.target.checked }))} />} label="Active" />
              <FormControlLabel control={<Checkbox checked={workflowForm.isPublic} onChange={(event) => setWorkflowForm((current) => ({ ...current, isPublic: event.target.checked }))} />} label="Public for requesters" />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={closeWorkflowDialog} disabled={workflowSubmitting}>Cancel</Button>
          <Button variant="contained" startIcon={<SaveRoundedIcon />} onClick={handleSaveWorkflow} disabled={workflowSubmitting || workflowMasterLoading}>Save workflow</Button>
        </DialogActions>
      </Dialog>

      <WorkflowReviewDialog
        open={reviewOpen}
        workflowDetail={designerDetail}
        onClose={() => setReviewOpen(false)}
      />

      <StepFormDialog
        open={stepDialog.open}
        mode={stepDialog.mode}
        form={stepForm}
        groups={designerDetail?.groups || []}
        steps={designerDetail?.steps || []}
        nextStepOrder={nextDesignerStepOrder}
        setForm={setStepForm}
        error={stepSubmitError}
        submitting={configSubmitting}
        onClose={closeStepDialog}
        onSubmit={handleSaveStep}
      />

      <FieldFormDialog
        open={fieldDialog.open}
        mode={fieldDialog.mode}
        form={fieldForm}
        setForm={setFieldForm}
        error={fieldSubmitError}
        submitting={configSubmitting}
        onClose={closeFieldDialog}
        onSubmit={handleSaveField}
      />

      <WorkflowRequestDetailDialog
        open={detailState.open}
        detail={requestDetail}
        workflows={workflows}
        workflowDetail={requestDetailWorkflow}
        loading={requestDetailLoading}
        error={requestDetailError}
        onOpenFile={openWorkflowFile}
        getWorkflowName={getWorkflowName}
        onClose={() => setDetailState({ open: false, request: null })}
      />

      <DecisionDialog
        state={decisionState}
        submitting={decisionSubmitting}
        error={decisionError}
        fields={decisionFields}
        values={decisionValues}
        onValueChange={(fieldId, value) => setDecisionValues((current) => ({ ...current, [fieldId]: value }))}
        onClose={closeDecision}
        onSubmit={handleDecisionSubmit}
      />

      <ConfirmDialog
        open={Boolean(permissionDelete)}
        title="Remove permission"
        description={`Remove ${permissionDelete?.permission || ""} permission for ${permissionDelete?.principalValue || ""}?`}
        confirmLabel={configSubmitting ? "Removing..." : "Remove"}
        cancelLabel="Cancel"
        destructive
        onClose={() => {
          if (!configSubmitting) {
            setPermissionDelete(null);
          }
        }}
        onConfirm={() => void handleRemovePermission()}
      />

      <ConfirmDialog
        open={Boolean(fieldDelete)}
        title="Delete field"
        description={`Delete field ${fieldDelete?.field?.label || ""} from step ${fieldDelete?.step?.stepName || ""}? Existing request values and uploaded files for this field will also be removed.`}
        confirmLabel={configSubmitting ? "Deleting..." : "Delete"}
        cancelLabel="Cancel"
        destructive
        onClose={() => {
          if (!configSubmitting) {
            setFieldDelete(null);
          }
        }}
        onConfirm={() => void handleDeleteField()}
      />

      <ConfirmDialog
        open={Boolean(stepDelete)}
        title="Delete step"
        description={`Delete step ${stepDelete?.stepName || ""}? Fields, request values, uploaded files, and approval rows for this step will also be removed.`}
        confirmLabel={configSubmitting ? "Deleting..." : "Delete"}
        cancelLabel="Cancel"
        destructive
        onClose={() => {
          if (!configSubmitting) {
            setStepDelete(null);
          }
        }}
        onConfirm={() => void handleDeleteStep()}
      />
    </Stack>
  );
}
