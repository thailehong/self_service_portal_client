import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Slider,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { WorkflowDynamicField } from "./WorkflowDynamicField";
import { flattenFields, getFieldInitialValue } from "./workflowUtils";

const previewPresets = [
  { label: "Mobile", width: 390 },
  { label: "Tablet", width: 768 },
  { label: "Desktop", width: 1280 },
];

function groupStepsByOrder(steps = []) {
  const groups = new Map();
  [...steps]
    .sort((left, right) => (Number(left.stepOrder) - Number(right.stepOrder)) || (Number(left.id) - Number(right.id)))
    .forEach((step) => {
      const key = Number(step.stepOrder) || 0;
      groups.set(key, [...(groups.get(key) || []), step]);
    });
  return Array.from(groups.entries()).map(([stepOrder, stepsInOrder]) => ({ stepOrder, steps: stepsInOrder }));
}

function getStepLabel(step) {
  return [step?.stepCode, step?.stepName].filter(Boolean).join(" - ") || `Step #${step?.id || "-"}`;
}

function describeTarget(rule, stepById) {
  if (rule.targetType === "SpecificStep" || rule.targetType === "AlternatePath") {
    return getStepLabel(stepById.get(String(rule.targetStepId))) || `Step #${rule.targetStepId || "-"}`;
  }
  if (rule.targetType === "RejectRequest") {
    return "Reject request";
  }
  if (rule.targetType === "Complete") {
    return "Complete request";
  }
  return "Next step";
}

function getPreviewColumns(width) {
  if (width < 700) {
    return "1fr";
  }
  return "repeat(2, minmax(0, 1fr))";
}

export function WorkflowReviewDialog({ open, workflowDetail, onClose }) {
  const [previewWidth, setPreviewWidth] = useState(1280);
  const [previewValues, setPreviewValues] = useState({});
  const steps = workflowDetail?.steps || [];
  const workflow = workflowDetail?.workflow || {};
  const allFields = useMemo(() => flattenFields(steps), [steps]);
  const stepGroups = useMemo(() => groupStepsByOrder(steps), [steps]);
  const stepById = useMemo(() => new Map(steps.map((step) => [String(step.id), step])), [steps]);
  const gridColumns = getPreviewColumns(previewWidth);

  useEffect(() => {
    if (!open) {
      return;
    }

    setPreviewWidth(1280);
    setPreviewValues(
      allFields.reduce((values, field) => ({ ...values, [field.id]: getFieldInitialValue(field) }), {}),
    );
  }, [allFields, open]);

  const setFieldValue = (fieldId, nextValue) => {
    setPreviewValues((current) => ({ ...current, [fieldId]: nextValue }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth={false} fullWidth PaperProps={{ sx: { width: "min(1500px, 96vw)", height: "92vh" } }}>
      <DialogTitle sx={{ pr: 7 }}>
        <Stack spacing={0.5}>
          <Typography variant="h6">Review UI</Typography>
          <Typography variant="body2" color="text.secondary">{workflow.name || "Workflow preview"}</Typography>
        </Stack>
        <Tooltip title="Close">
          <IconButton onClick={onClose} sx={{ position: "absolute", right: 16, top: 16 }}>
            <CloseRoundedIcon />
          </IconButton>
        </Tooltip>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0, display: "flex", minHeight: 0 }}>
        <Box sx={{ width: "100%", display: "grid", gridTemplateColumns: { xs: "1fr", lg: "280px minmax(0, 1fr)" }, minHeight: 0 }}>
          <Box sx={{ p: 2, borderRight: { lg: (theme) => `1px solid ${theme.palette.divider}` }, borderBottom: { xs: (theme) => `1px solid ${theme.palette.divider}`, lg: 0 }, overflowY: "auto" }}>
            <Stack spacing={2}>
              <Stack spacing={1}>
                <Typography variant="subtitle2">Workflow</Typography>
                <Chip label={workflow.code || `#${workflow.id || "-"}`} size="small" variant="outlined" sx={{ alignSelf: "flex-start" }} />
                <Typography variant="body2" color="text.secondary">{workflow.versionMode || "SnapshotOnCreate"}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Active version: {workflow.currentApprovedVersionNo ? `v${workflow.currentApprovedVersionNo}` : "-"}
                </Typography>
              </Stack>
              <Divider />
              <Stack spacing={1}>
                <Typography variant="subtitle2">Responsive width</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {previewPresets.map((preset) => (
                    <Button key={preset.label} size="small" variant={previewWidth === preset.width ? "contained" : "outlined"} onClick={() => setPreviewWidth(preset.width)}>
                      {preset.label} {preset.width}
                    </Button>
                  ))}
                  <Tooltip title="Reset width">
                    <IconButton size="small" onClick={() => setPreviewWidth(1280)}>
                      <RestartAltRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
                <Slider
                  min={320}
                  max={1440}
                  step={10}
                  value={previewWidth}
                  onChange={(_, value) => setPreviewWidth(Number(value))}
                  valueLabelDisplay="auto"
                />
              </Stack>
              <Divider />
              <Stack spacing={1}>
                <Typography variant="subtitle2">Transition rules</Typography>
                {(workflowDetail?.transitionRules || []).length ? (
                  (workflowDetail?.transitionRules || []).map((rule) => {
                    const fromStep = stepById.get(String(rule.fromStepId));
                    return (
                      <Box key={rule.id} sx={{ p: 1, borderRadius: 1, bgcolor: "background.default" }}>
                        <Typography variant="body2">{getStepLabel(fromStep)}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {`${rule.action} -> ${describeTarget(rule, stepById)}`}
                        </Typography>
                      </Box>
                    );
                  })
                ) : (
                  <Typography variant="body2" color="text.secondary">No transition rules.</Typography>
                )}
              </Stack>
            </Stack>
          </Box>

          <Box sx={{ minWidth: 0, overflow: "auto", bgcolor: "grey.100", p: 2.5 }}>
            <Box sx={{ width: previewWidth, maxWidth: "100%", mx: "auto", transition: "width 160ms ease" }}>
              <Box sx={{ bgcolor: "background.paper", border: (theme) => `1px solid ${theme.palette.divider}`, borderRadius: 1, overflow: "hidden" }}>
                <Stack spacing={0} divider={<Divider />}>
                  <Box sx={{ p: 2 }}>
                    <Typography variant="h6">{workflow.name || "Request form"}</Typography>
                    <Typography variant="body2" color="text.secondary">{workflow.description || "Preview request layout"}</Typography>
                  </Box>
                  {stepGroups.length ? stepGroups.map((group) => {
                    const isParallel = group.steps.length > 1;
                    return (
                      <Box key={group.stepOrder} sx={{ p: 2 }}>
                        <Stack spacing={2}>
                          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }} justifyContent="space-between">
                            <Stack spacing={0.25}>
                              <Typography variant="subtitle1">{isParallel ? `Parallel group - Order ${group.stepOrder}` : getStepLabel(group.steps[0])}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {isParallel ? `${group.steps.length} steps run together` : `Order ${group.stepOrder}`}
                              </Typography>
                            </Stack>
                            {isParallel ? <Chip size="small" label="Parallel" color="primary" variant="outlined" /> : null}
                          </Stack>
                          <Stack spacing={1.5}>
                            {group.steps.map((step) => {
                              const fields = (step.fields || []).map((field) => ({
                                ...field,
                                stepId: step.id,
                                stepName: step.stepName,
                                stepOrder: step.stepOrder,
                                stepTemplate: field.template,
                              }));
                              return (
                                <Box key={step.id} sx={{ p: 1.5, borderRadius: 1, border: (theme) => `1px solid ${theme.palette.divider}`, bgcolor: "background.default" }}>
                                  <Stack spacing={1.5}>
                                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="space-between">
                                      <Stack spacing={0.25}>
                                        <Typography variant="subtitle2">{getStepLabel(step)}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {step.approvalMode} | {step.approverType}: {step.approverValue || "-"}
                                        </Typography>
                                      </Stack>
                                      {isParallel ? <Chip size="small" label={step.parallelRejectPolicy || "AnyReject"} variant="outlined" /> : null}
                                    </Stack>
                                    {fields.length ? (
                                      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: gridColumns }}>
                                        {fields.map((field) => (
                                          <Box key={field.id} sx={{ minWidth: 0, gridColumn: ["file", "table", "stored-procedure"].includes(field.dataType) ? "1 / -1" : undefined }}>
                                            <WorkflowDynamicField
                                              field={field}
                                              fields={allFields}
                                              values={previewValues}
                                              onChange={setFieldValue}
                                              preview
                                              showStoredProcedure
                                            />
                                          </Box>
                                        ))}
                                      </Box>
                                    ) : (
                                      <Alert severity="info" variant="outlined">No fields configured for this step.</Alert>
                                    )}
                                  </Stack>
                                </Box>
                              );
                            })}
                          </Stack>
                        </Stack>
                      </Box>
                    );
                  }) : (
                    <Box sx={{ p: 2 }}>
                      <Alert severity="info" variant="outlined">No steps configured yet.</Alert>
                    </Box>
                  )}
                </Stack>
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
