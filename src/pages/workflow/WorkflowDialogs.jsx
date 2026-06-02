import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
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
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";
import { memo, useEffect, useMemo, useState } from "react";
import {
  approvalModes,
  approverTypes,
  fieldTypes,
  initialFieldForm,
  initialStepForm,
  optionSourceTypes,
  workflowApproverPermissions,
} from "./workflowConstants";
import { WorkflowFileField, WorkflowMultiSelectField, WorkflowSelectField, WorkflowTableField, WorkflowTableValueDisplay } from "./WorkflowFieldInputs";
import {
  flattenFields,
  formatFieldValue,
  getActiveInputFields,
  getStatusColor,
  isFieldRequiredNow,
  isVisibleInputField,
} from "./workflowUtils";

const storedProcedureValidationTemplate = JSON.stringify({
  connectionName: "DefaultConnection",
  procedureName: "dbo.YourStoredProcedure",
  parameters: [
    { name: "@Param1", required: true },
    {
      name: "@ExcelRows",
      sourceField: "FileFieldKey",
      dataMode: "excel-tvp",
      typeName: "dbo.WorkflowExcelImportRow",
      required: false,
    },
    {
      name: "@TableRows",
      sourceField: "TableFieldKey",
      dataMode: "table-tvp",
      typeName: "dbo.WorkflowExcelImportRow",
      required: false,
    },
  ],
}, null, 2);

const optionStoredProcedureTemplate = JSON.stringify({
  connectionName: "DefaultConnection",
  procedureName: "dbo.GetWorkflowOptions",
  parameters: [
    { name: "@ParentValue", sourceFieldKey: "ParentFieldKey", required: false },
    { name: "@Site", value: "VN", required: false },
  ],
}, null, 2);

const optionSqlQueryTemplate = JSON.stringify({
  connectionName: "DefaultConnection",
  query: "SELECT Code AS [Value], Name AS [Label] FROM dbo.YourLookup WHERE (@ParentValue IS NULL OR ParentCode = @ParentValue) ORDER BY Name",
  parameters: [
    { name: "@ParentValue", sourceFieldKey: "ParentFieldKey", required: false },
  ],
}, null, 2);

const conditionalValidationTemplate = JSON.stringify({
  visibleWhen: { fieldKey: "Answer", operator: "equals", value: "No" },
  requiredWhen: { fieldKey: "Answer", operator: "equals", value: "No" },
}, null, 2);

const tableValidationTemplate = JSON.stringify({
  mode: "manual",
  columns: [
    { key: "EmpID", label: "Employee ID", dataType: "text", required: true, maxLength: 20 },
    { key: "DateOfBirth", label: "Date of birth", dataType: "date", required: false },
    { key: "Department", label: "Department", dataType: "text", required: true, maxLength: 100 },
  ],
}, null, 2);

const getWorkflowGroupValue = (group) => {
  const groupCode = String(group?.groupCode ?? "").trim();
  if (groupCode) {
    return groupCode;
  }
  return group?.id != null ? String(group.id) : "";
};

export const StepFormDialog = memo(function StepFormDialog({
  open,
  mode,
  form,
  groups = [],
  error,
  submitting,
  onClose,
  onSubmit,
}) {
  const [localForm, setLocalForm] = useState(form || initialStepForm);
  const activeWorkflowGroups = useMemo(
    () => (groups || []).filter((group) => group?.isActive !== false && getWorkflowGroupValue(group)),
    [groups],
  );
  const selectedWorkflowGroupExists = activeWorkflowGroups.some(
    (group) => getWorkflowGroupValue(group) === String(localForm.approverValue ?? ""),
  );

  useEffect(() => {
    if (open) {
      setLocalForm(form || initialStepForm);
    }
  }, [form, open]);

  useEffect(() => {
    if (open && localForm.approverType === "Group" && !localForm.approverValue && activeWorkflowGroups.length) {
      setLocalForm((current) => ({
        ...current,
        approverValue: getWorkflowGroupValue(activeWorkflowGroups[0]),
      }));
    }
  }, [activeWorkflowGroups, localForm.approverType, localForm.approverValue, open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{mode === "edit" ? "Edit step" : "Add step"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.25} sx={{ pt: 1 }}>
          {error ? <Alert severity="error" variant="outlined">{error}</Alert> : null}
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" } }}>
            <TextField
              label="Order"
              type="number"
              value={localForm.stepOrder}
              helperText="Auto assigned by workflow."
              disabled
              required
            />
            <TextField label="Group" type="number" value={localForm.stepGroup} onChange={(event) => setLocalForm((current) => ({ ...current, stepGroup: event.target.value }))} />
            <TextField label="Step code" value={localForm.stepCode} onChange={(event) => setLocalForm((current) => ({ ...current, stepCode: event.target.value }))} required />
          </Box>
          <TextField label="Step name" value={localForm.stepName} onChange={(event) => setLocalForm((current) => ({ ...current, stepName: event.target.value }))} required fullWidth />
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" } }}>
            <FormControl fullWidth>
              <InputLabel>Approval mode</InputLabel>
              <Select label="Approval mode" value={localForm.approvalMode} onChange={(event) => setLocalForm((current) => ({ ...current, approvalMode: event.target.value }))}>
                {approvalModes.map((modeValue) => <MenuItem key={modeValue} value={modeValue}>{modeValue}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Approver type</InputLabel>
              <Select
                label="Approver type"
                value={localForm.approverType}
                onChange={(event) => setLocalForm((current) => ({
                  ...current,
                  approverType: event.target.value,
                  approverValue:
                    event.target.value === "WorkflowPermission"
                      ? "Approver"
                      : event.target.value === "NoApproval" || event.target.value === "HOD"
                        ? event.target.value
                        : event.target.value === "Group"
                          ? getWorkflowGroupValue(activeWorkflowGroups[0])
                        : "",
                }))}
              >
                {approverTypes.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
              </Select>
            </FormControl>
            {localForm.approverType === "WorkflowPermission" ? (
              <FormControl fullWidth>
                <InputLabel>Workflow role</InputLabel>
                <Select
                  label="Workflow role"
                  value={localForm.approverValue}
                  onChange={(event) => setLocalForm((current) => ({ ...current, approverValue: event.target.value }))}
                >
                  {workflowApproverPermissions.map((permission) => (
                    <MenuItem key={permission} value={permission}>{permission}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : localForm.approverType === "Users" ? (
              <TextField
                label="Approver emails / usernames"
                value={localForm.approverValue}
                onChange={(event) => setLocalForm((current) => ({ ...current, approverValue: event.target.value }))}
                helperText="Separate multiple approvers by comma, semicolon, or new line."
                minRows={3}
                multiline
                required
              />
            ) : localForm.approverType === "Group" ? (
              <FormControl fullWidth required disabled={!activeWorkflowGroups.length}>
                <InputLabel>Workflow group</InputLabel>
                <Select
                  label="Workflow group"
                  value={localForm.approverValue}
                  onChange={(event) => setLocalForm((current) => ({ ...current, approverValue: event.target.value }))}
                >
                  {!selectedWorkflowGroupExists && localForm.approverValue ? (
                    <MenuItem value={localForm.approverValue}>{localForm.approverValue}</MenuItem>
                  ) : null}
                  {activeWorkflowGroups.map((group) => {
                    const value = getWorkflowGroupValue(group);
                    const label = group.groupName || group.groupCode || `Group ${group.id}`;
                    return (
                      <MenuItem key={value} value={value}>
                        {label}{group.groupCode && group.groupName ? ` (${group.groupCode})` : ""}
                      </MenuItem>
                    );
                  })}
                </Select>
                <FormHelperText>
                  {activeWorkflowGroups.length
                    ? "Select a group configured in this workflow."
                    : "Create an active workflow group before using Group approval."}
                </FormHelperText>
              </FormControl>
            ) : localForm.approverType === "NoApproval" || localForm.approverType === "HOD" ? (
              <TextField label="Approver value" value={localForm.approverType} disabled />
            ) : (
              <TextField label="Approver email / username" value={localForm.approverValue} onChange={(event) => setLocalForm((current) => ({ ...current, approverValue: event.target.value }))} required />
            )}
          </Box>
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
            <TextField label="Min approve count" type="number" value={localForm.minApproveCount} onChange={(event) => setLocalForm((current) => ({ ...current, minApproveCount: event.target.value }))} disabled={localForm.approvalMode !== "ParallelAny"} />
            <TextField
              label="Reminder hours"
              type="number"
              value={localForm.reminderHours}
              onChange={(event) => setLocalForm((current) => ({ ...current, reminderHours: event.target.value }))}
              inputProps={{ min: 0, step: 0.5 }}
            />
            <FormControlLabel control={<Checkbox checked={localForm.isRequired} onChange={(event) => setLocalForm((current) => ({ ...current, isRequired: event.target.checked }))} />} label="Required step" />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button
          variant="contained"
          startIcon={<SaveRoundedIcon />}
          onClick={() => onSubmit({
            ...localForm,
            approverValue:
              localForm.approverType === "NoApproval" || localForm.approverType === "HOD"
                ? localForm.approverType
                : localForm.approverValue,
          })}
          disabled={submitting}
        >
          Save step
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export const FieldFormDialog = memo(function FieldFormDialog({ open, mode, form, error, submitting, onClose, onSubmit }) {
  const [localForm, setLocalForm] = useState(form || initialFieldForm);
  const optionEnabled = localForm.dataType === "select" || localForm.dataType === "multi-select";
  const optionSource = localForm.optionSourceType || "Static";
  const validationPlaceholder = localForm.dataType === "table"
    ? tableValidationTemplate
    : optionEnabled && optionSource === "StoredProcedure"
      ? optionStoredProcedureTemplate
      : optionEnabled && optionSource === "SqlQuery"
        ? optionSqlQueryTemplate
        : conditionalValidationTemplate;
  const validationHelperText = localForm.dataType === "table"
    ? "Define table columns here. Supported column dataType values: text, number, date, datetime, boolean, select, multi-select, userpicker."
    : optionEnabled && optionSource === "StoredProcedure"
      ? "Stored procedure must return columns named Value and Label. parameters[].sourceFieldKey uses another field key; value/defaultValue are constants."
      : optionEnabled && optionSource === "SqlQuery"
        ? "SQL query must be read-only SELECT/WITH and return Value and Label columns. Use sourceFieldKey to bind a parameter to another field key."
        : "Use visibleWhen/showWhen to control visibility and requiredWhen to make this field required only when another field has a matching value.";

  useEffect(() => {
    if (open) {
      setLocalForm(form || initialFieldForm);
    }
  }, [form, open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{mode === "edit" ? "Edit field" : "Add field"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.25} sx={{ pt: 1 }}>
          {error ? <Alert severity="error" variant="outlined">{error}</Alert> : null}
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" } }}>
            <TextField label="Field key" value={localForm.fieldKey} onChange={(event) => setLocalForm((current) => ({ ...current, fieldKey: event.target.value }))} required />
            <TextField label="Label" value={localForm.label} onChange={(event) => setLocalForm((current) => ({ ...current, label: event.target.value }))} required />
            <TextField label="Display order" type="number" value={localForm.displayOrder} onChange={(event) => setLocalForm((current) => ({ ...current, displayOrder: event.target.value }))} />
          </Box>
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
            <FormControl fullWidth>
              <InputLabel>Data type</InputLabel>
              <Select
                label="Data type"
                value={localForm.dataType}
                onChange={(event) => {
                  const dataType = event.target.value;
                  setLocalForm((current) => ({
                    ...current,
                    dataType,
                    validationJson:
                      dataType === "stored-procedure" && !current.validationJson?.trim()
                        ? storedProcedureValidationTemplate
                        : dataType === "table" && !current.validationJson?.trim()
                          ? tableValidationTemplate
                        : current.validationJson,
                  }));
                }}
              >
                {fieldTypes.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Default value" value={localForm.defaultValue} onChange={(event) => setLocalForm((current) => ({ ...current, defaultValue: event.target.value }))} />
          </Box>
          {(localForm.dataType === "select" || localForm.dataType === "multi-select") ? (
            <FormControl fullWidth>
              <InputLabel>Option source</InputLabel>
              <Select
                label="Option source"
                value={localForm.optionSourceType || "Static"}
                onChange={(event) => {
                  const optionSourceType = event.target.value;
                  setLocalForm((current) => ({
                    ...current,
                    optionSourceType,
                    validationJson:
                      !current.validationJson?.trim() && optionSourceType === "StoredProcedure"
                        ? optionStoredProcedureTemplate
                        : !current.validationJson?.trim() && optionSourceType === "SqlQuery"
                          ? optionSqlQueryTemplate
                          : current.validationJson,
                  }));
                }}
              >
                {optionSourceTypes.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
              </Select>
            </FormControl>
          ) : null}
          {optionEnabled && optionSource !== "Static" ? (
            <Alert severity="info" variant="outlined">
              Result set must include <strong>Value</strong> and <strong>Label</strong>. Use <strong>sourceFieldKey</strong> to pass the current value of another field as a parameter; use <strong>value</strong> or <strong>defaultValue</strong> for constants.
            </Alert>
          ) : null}
          <TextField
            label="Validation JSON"
            value={localForm.validationJson}
            onChange={(event) => setLocalForm((current) => ({ ...current, validationJson: event.target.value }))}
            placeholder={validationPlaceholder}
            helperText={validationHelperText}
            minRows={2}
            multiline
            fullWidth
          />
          <FormControlLabel control={<Checkbox checked={localForm.isRequired} onChange={(event) => setLocalForm((current) => ({ ...current, isRequired: event.target.checked }))} />} label="Required field" />

          {optionEnabled && (localForm.optionSourceType || "Static") === "Static" ? (
            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2">Options</Typography>
                <Button startIcon={<AddRoundedIcon />} onClick={() => setLocalForm((current) => ({ ...current, options: [...current.options, { value: "", label: "", sortOrder: current.options.length + 1, isActive: true }] }))}>
                  Add option
                </Button>
              </Stack>
              {localForm.options.map((option, index) => (
                <Box key={index} sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 100px auto auto" }, alignItems: "center" }}>
                  <TextField size="small" label="Value" value={option.value} onChange={(event) => setLocalForm((current) => ({ ...current, options: current.options.map((item, itemIndex) => itemIndex === index ? { ...item, value: event.target.value } : item) }))} />
                  <TextField size="small" label="Label" value={option.label} onChange={(event) => setLocalForm((current) => ({ ...current, options: current.options.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value } : item) }))} />
                  <TextField size="small" label="Sort" type="number" value={option.sortOrder} onChange={(event) => setLocalForm((current) => ({ ...current, options: current.options.map((item, itemIndex) => itemIndex === index ? { ...item, sortOrder: event.target.value } : item) }))} />
                  <FormControlLabel control={<Checkbox checked={option.isActive} onChange={(event) => setLocalForm((current) => ({ ...current, options: current.options.map((item, itemIndex) => itemIndex === index ? { ...item, isActive: event.target.checked } : item) }))} />} label="Active" />
                  <Tooltip title="Remove option">
                    <IconButton color="error" onClick={() => setLocalForm((current) => ({ ...current, options: current.options.filter((_, itemIndex) => itemIndex !== index) }))}>
                      <DeleteOutlineRoundedIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              ))}
            </Stack>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button variant="contained" startIcon={<SaveRoundedIcon />} onClick={() => onSubmit(localForm)} disabled={submitting}>Save field</Button>
      </DialogActions>
    </Dialog>
  );
});

export function DecisionDialog({ state, submitting, error, fields, values, onValueChange, onClose, onSubmit }) {
  const [comment, setComment] = useState("");
  const activeFields = useMemo(() => getActiveInputFields(fields, values), [fields, values]);

  useEffect(() => {
    if (state.open) {
      setComment("");
    }
  }, [state.open]);

  return (
    <Dialog open={state.open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{state.action === "Reject" ? "Reject request" : state.action === "Cancel" ? "Cancel request" : "Approve request"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error ? <Alert severity="error" variant="outlined">{error}</Alert> : null}
          <Typography variant="body2" color="text.secondary">{state.request?.requestNo || state.request?.title}</Typography>
          {state.loading ? <Alert severity="info" variant="outlined">Loading step fields...</Alert> : null}
          {state.action === "Approve" && activeFields.length ? (
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" } }}>
              {activeFields.map((field) => {
                const value = values[field.id];
                const setValue = (nextValue) => onValueChange(field.id, nextValue);
                const required = isFieldRequiredNow(field, fields, values);

                if (field.dataType === "boolean") {
                  return (
                    <FormControlLabel
                      key={field.id}
                      control={<Checkbox checked={Boolean(value)} onChange={(event) => setValue(event.target.checked)} />}
                      label={field.label}
                    />
                  );
                }

                if (field.dataType === "select") {
                  return (
                    <WorkflowSelectField key={field.id} field={field} value={value} onChange={setValue} required={required} values={values} fields={fields} />
                  );
                }

                if (field.dataType === "multi-select") {
                  return (
                    <WorkflowMultiSelectField key={field.id} field={field} value={value} onChange={setValue} required={required} values={values} fields={fields} />
                  );
                }

                if (field.dataType === "date") {
                  return (
                    <DatePicker
                      key={field.id}
                      label={field.label}
                      value={value ? dayjs(value) : null}
                      onChange={(nextValue) => setValue(nextValue?.isValid() ? nextValue.format("YYYY-MM-DD") : "")}
                      slotProps={{ textField: { fullWidth: true, required } }}
                    />
                  );
                }

                if (field.dataType === "datetime") {
                  return (
                    <DateTimePicker
                      key={field.id}
                      label={field.label}
                      value={value ? dayjs(value) : null}
                      onChange={(nextValue) => setValue(nextValue?.isValid() ? nextValue.toISOString() : "")}
                      slotProps={{ textField: { fullWidth: true, required } }}
                    />
                  );
                }

                if (field.dataType === "file") {
                  return (
                    <Box key={field.id} sx={{ gridColumn: "1 / -1", minWidth: 0 }}>
                      <WorkflowFileField
                        field={{ ...field, isRequired: required }}
                        value={value}
                        onChange={setValue}
                      />
                    </Box>
                  );
                }

                if (field.dataType === "table") {
                  return (
                    <Box key={field.id} sx={{ gridColumn: "1 / -1", minWidth: 0 }}>
                      <WorkflowTableField
                        field={{ ...field, isRequired: required }}
                        value={value}
                        onChange={setValue}
                      />
                    </Box>
                  );
                }

                return (
                  <TextField
                    key={field.id}
                    label={field.label}
                    type={field.dataType === "number" ? "number" : "text"}
                    value={value ?? ""}
                    onChange={(event) => setValue(event.target.value)}
                    required={required}
                    multiline={field.dataType === "textarea"}
                    minRows={field.dataType === "textarea" ? 3 : undefined}
                    fullWidth
                  />
                );
              })}
            </Box>
          ) : null}
          <TextField label="Comment" value={comment} onChange={(event) => setComment(event.target.value)} minRows={3} multiline fullWidth required={state.action === "Reject" || state.action === "Cancel"} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={submitting}>Close</Button>
        <Button variant="contained" color={state.action === "Reject" || state.action === "Cancel" ? "error" : "primary"} onClick={() => onSubmit(comment)} disabled={submitting}>
          {state.action || "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function RequestAuditTimeline({ audit = [] }) {
  if (!audit.length) {
    return <Alert severity="info" variant="outlined">No audit records yet.</Alert>;
  }

  return (
    <Stack spacing={0.75}>
      {audit.map((item, index) => {
        const statusText = item.fromStatus || item.toStatus ? `${item.fromStatus || "-"} -> ${item.toStatus || "-"}` : "";
        return (
          <Box key={item.id || `${item.action}-${item.createdAt}-${index}`} sx={{ display: "grid", gridTemplateColumns: "20px minmax(0, 1fr)", columnGap: 1.25 }}>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: item.action === "Reject" ? "error.main" : item.action === "Approve" ? "success.main" : "primary.main", mt: 1 }} />
              {index < audit.length - 1 ? <Box sx={{ width: "1px", flex: 1, bgcolor: "rgba(0, 0, 0, 0.16)", minHeight: 34, mt: 0.75 }} /> : null}
            </Box>
            <Box sx={{ pb: index < audit.length - 1 ? 2.5 : 0, minWidth: 0 }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between">
                <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2" sx={{ overflowWrap: "anywhere" }}>{item.action}</Typography>
                  {item.toStatus ? <Chip label={item.toStatus} size="small" color={getStatusColor(item.toStatus)} /> : null}
                </Stack>
                <Typography variant="caption" color="text.secondary">{item.createdAt ? dayjs(item.createdAt).format("DD/MM/YYYY HH:mm") : ""}</Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25, overflowWrap: "anywhere" }}>
                {item.actor || "System"}{statusText ? ` - ${statusText}` : ""}
              </Typography>
              {item.comment ? (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{item.comment}</Typography>
              ) : null}
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
}

export function RequestDetailDialog({ open, detail, workflows, workflowDetail, loading, error, onOpenFile, onClose, getWorkflowName }) {
  const fields = useMemo(() => flattenFields(workflowDetail?.steps || []).filter(isVisibleInputField), [workflowDetail]);
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
      <DialogTitle sx={{ pr: 7 }}>
        Request detail
        <IconButton
          aria-label="Close request detail"
          onClick={onClose}
          size="small"
          sx={{ position: "absolute", right: 12, top: 12 }}
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          {loading ? <Alert severity="info" variant="outlined">Loading detail...</Alert> : null}
          {error ? <Alert severity="error" variant="outlined">{error}</Alert> : null}
          {detail?.instance ? (
            <>
              <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(4, minmax(0, 1fr))" } }}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">Request no</Typography>
                  <Typography variant="subtitle2">{detail.instance.requestNo}</Typography>
                </Stack>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">Workflow</Typography>
                  <Typography variant="subtitle2">{getWorkflowName(workflows, detail.instance.workflowId)}</Typography>
                </Stack>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">Workflow version</Typography>
                  {detail.instance.workflowVersionNo ? (
                    <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
                      <Chip size="small" color="primary" variant="outlined" label={`v${detail.instance.workflowVersionNo}`} />
                      <Typography variant="caption" color="text.secondary">{detail.instance.effectiveVersionMode}</Typography>
                    </Stack>
                  ) : (
                    <Typography variant="subtitle2">N/A</Typography>
                  )}
                </Stack>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Chip label={detail.instance.status} color={getStatusColor(detail.instance.status)} size="small" sx={{ alignSelf: "flex-start" }} />
                </Stack>
              </Box>
              <Divider />
              <Stack spacing={1.5}>
                <Typography variant="h6">{detail.instance.title}</Typography>
                <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "repeat(2, minmax(0, 1fr))" } }}>
                  {detailFields.map((field) => {
                    const value = valueMap.get(String(field.id));
                    const tableRows = (detail?.tableRows || []).filter((row) => String(row.fieldId) === String(field.id));
                    return (
                      <Box key={`${field.stepId || "field"}-${field.id}`} sx={{ p: 1.5, minWidth: 0, borderRadius: 1, border: (theme) => `1px solid ${theme.palette.divider}`, gridColumn: field.dataType === "table" ? "1 / -1" : undefined }}>
                        <Typography variant="caption" color="text.secondary">{field?.label || `Field #${field.id}`}</Typography>
                        {field.dataType === "file" ? (
                          value?.files?.length ? (
                            <Stack spacing={0.75} sx={{ mt: 0.75, minWidth: 0 }}>
                              {value.files.map((file) => (
                                <Tooltip key={file.id} title={file.fileName || ""}>
                                  <Chip
                                    size="small"
                                    label={file.fileName}
                                    variant="outlined"
                                    onClick={() => onOpenFile(file)}
                                    sx={{
                                      width: "100%",
                                      maxWidth: "100%",
                                      justifyContent: "flex-start",
                                      "& .MuiChip-label": {
                                        display: "block",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                      },
                                    }}
                                  />
                                </Tooltip>
                              ))}
                            </Stack>
                          ) : (
                            <Typography variant="body2" color="text.secondary">&nbsp;</Typography>
                          )
                        ) : field.dataType === "table" ? (
                          <WorkflowTableValueDisplay field={field} value={formatFieldValue(field, value)} tableRows={tableRows} />
                        ) : (
                          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{formatFieldValue(field, value) || "\u00a0"}</Typography>
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
                <RequestAuditTimeline audit={detail.audit} />
                {false && detail.audit.map((audit) => (
                  <Box key={audit.id || `${audit.action}-${audit.createdAt}`} sx={{ display: "grid", gap: 1, gridTemplateColumns: { xs: "1fr", md: "160px 1fr 220px" }, p: 1.5, borderRadius: 1, bgcolor: "background.default" }}>
                    <Typography variant="body2">{audit.action}</Typography>
                    <Typography variant="body2" color="text.secondary">{audit.comment || `${audit.fromStatus || "-"} -> ${audit.toStatus || "-"}`}</Typography>
                    <Typography variant="caption" color="text.secondary">{audit.actor} · {audit.createdAt ? dayjs(audit.createdAt).format("DD/MM/YYYY HH:mm") : ""}</Typography>
                  </Box>
                ))}
              </Stack>
            </>
          ) : null}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
