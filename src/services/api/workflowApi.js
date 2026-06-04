import { apiClient } from "./client";

const workflowBasePath = "/Workflow";
const requestBasePath = "/WorkflowRequest";
const reportBasePath = "/WorkflowReport";

function unwrapCollection(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.result)) {
    return data.result;
  }

  if (Array.isArray(data?.value)) {
    return data.value;
  }

  return [];
}

function unwrapEntity(data) {
  return data?.data || data?.result || data?.value || data;
}

function normalizeAccess(source = {}) {
  const access = source.Access || source.access || source;

  return {
    canSubmit: Boolean(access.CanSubmit ?? access.canSubmit ?? source.CanSubmit ?? source.canSubmit),
    canManage: Boolean(access.CanManage ?? access.canManage ?? source.CanManage ?? source.canManage),
    canReport: Boolean(access.CanReport ?? access.canReport ?? source.CanReport ?? source.canReport),
    canView: Boolean(access.CanView ?? access.canView ?? source.CanView ?? source.canView),
    isAdmin: Boolean(access.IsAdmin ?? access.isAdmin ?? source.IsAdmin ?? source.isAdmin),
  };
}

export function normalizeWorkflow(workflow) {
  const id = workflow?.ID ?? workflow?.id ?? null;

  return {
    ...workflow,
    id,
    code: workflow?.Code ?? workflow?.code ?? "",
    name: workflow?.Name ?? workflow?.name ?? "",
    description: workflow?.Description ?? workflow?.description ?? "",
    isActive: Boolean(workflow?.IsActive ?? workflow?.isActive),
    isPublic: Boolean(workflow?.IsPublic ?? workflow?.isPublic),
    versionMode: workflow?.VersionMode ?? workflow?.versionMode ?? "SnapshotOnCreate",
    currentApprovedVersionId: workflow?.CurrentApprovedVersionID ?? workflow?.currentApprovedVersionID ?? workflow?.currentApprovedVersionId ?? null,
    currentApprovedVersionNo: workflow?.CurrentApprovedVersionNo ?? workflow?.currentApprovedVersionNo ?? null,
    currentApprovedVersionStatus: workflow?.CurrentApprovedVersionStatus ?? workflow?.currentApprovedVersionStatus ?? "",
    currentApprovedVersionApprovedAt: workflow?.CurrentApprovedVersionApprovedAt ?? workflow?.currentApprovedVersionApprovedAt ?? null,
    mail: workflow?.Mail ?? workflow?.mail ?? "",
    mailProfileName: workflow?.MailProfileName ?? workflow?.mailProfileName ?? "",
    createdBy: workflow?.CreatedBy ?? workflow?.createdBy ?? "",
    createdAt: workflow?.CreatedAt ?? workflow?.createdAt ?? null,
    updatedAt: workflow?.UpdatedAt ?? workflow?.updatedAt ?? null,
    access: normalizeAccess(workflow),
  };
}

export function normalizeOption(option) {
  return {
    ...option,
    id: option?.ID ?? option?.id ?? null,
    fieldId: option?.FieldID ?? option?.fieldID ?? option?.fieldId ?? null,
    value: option?.Value ?? option?.value ?? "",
    label: option?.Label ?? option?.label ?? "",
    sortOrder: Number(option?.SortOrder ?? option?.sortOrder ?? 0),
    isActive: Boolean(option?.IsActive ?? option?.isActive ?? true),
  };
}

export function normalizeField(field) {
  const template = field?.Template ?? field?.template ?? null;
  return {
    ...field,
    id: field?.ID ?? field?.id ?? null,
    stepId: field?.StepID ?? field?.stepID ?? field?.stepId ?? null,
    fieldKey: field?.FieldKey ?? field?.fieldKey ?? "",
    label: field?.Label ?? field?.label ?? "",
    dataType: field?.DataType ?? field?.dataType ?? "",
    isRequired: Boolean(field?.IsRequired ?? field?.isRequired),
    defaultValue: field?.DefaultValue ?? field?.defaultValue ?? "",
    optionSourceType: field?.OptionSourceType ?? field?.optionSourceType ?? "Static",
    validationJson: field?.ValidationJson ?? field?.validationJson ?? "",
    displayOrder: Number(field?.DisplayOrder ?? field?.displayOrder ?? 0),
    template: template ? {
      fileName: template.FileName ?? template.fileName ?? "",
      contentType: template.ContentType ?? template.contentType ?? "",
      size: Number(template.Size ?? template.size ?? 0),
      uploadedBy: template.UploadedBy ?? template.uploadedBy ?? "",
      uploadedAt: template.UploadedAt ?? template.uploadedAt ?? null,
    } : null,
    options: unwrapCollection(field?.Options ?? field?.options).map(normalizeOption),
  };
}

export function normalizeStep(step) {
  const template = step?.Template ?? step?.template ?? null;
  return {
    ...step,
    id: step?.ID ?? step?.id ?? null,
    workflowId: step?.WorkflowID ?? step?.workflowID ?? step?.workflowId ?? null,
    stepOrder: Number(step?.StepOrder ?? step?.stepOrder ?? 0),
    stepGroup: step?.StepGroup ?? step?.stepGroup ?? null,
    stepCode: step?.StepCode ?? step?.stepCode ?? "",
    stepName: step?.StepName ?? step?.stepName ?? "",
    approvalMode: step?.ApprovalMode ?? step?.approvalMode ?? "",
    approverType: step?.ApproverType ?? step?.approverType ?? "",
    approverValue: step?.ApproverValue ?? step?.approverValue ?? "",
    isRequired: Boolean(step?.IsRequired ?? step?.isRequired ?? true),
    minApproveCount: step?.MinApproveCount ?? step?.minApproveCount ?? "",
    reminderHours: step?.ReminderHours ?? step?.reminderHours ?? "",
    template: template ? {
      fileName: template.FileName ?? template.fileName ?? "",
      contentType: template.ContentType ?? template.contentType ?? "",
      size: Number(template.Size ?? template.size ?? 0),
      uploadedBy: template.UploadedBy ?? template.uploadedBy ?? "",
      uploadedAt: template.UploadedAt ?? template.uploadedAt ?? null,
    } : null,
    createdAt: step?.CreatedAt ?? step?.createdAt ?? null,
    fields: unwrapCollection(step?.Fields ?? step?.fields).map(normalizeField),
  };
}

export function normalizePermission(permission) {
  return {
    ...permission,
    id: permission?.ID ?? permission?.id ?? null,
    workflowId: permission?.WorkflowID ?? permission?.workflowID ?? permission?.workflowId ?? null,
    principalType: permission?.PrincipalType ?? permission?.principalType ?? "",
    principalValue: permission?.PrincipalValue ?? permission?.principalValue ?? "",
    permission: permission?.Permission ?? permission?.permission ?? "",
    createdAt: permission?.CreatedAt ?? permission?.createdAt ?? null,
  };
}

export function normalizeGroup(group) {
  return {
    ...group,
    id: group?.ID ?? group?.id ?? null,
    workflowId: group?.WorkflowID ?? group?.workflowID ?? group?.workflowId ?? null,
    groupCode: group?.GroupCode ?? group?.groupCode ?? "",
    groupName: group?.GroupName ?? group?.groupName ?? "",
    description: group?.Description ?? group?.description ?? "",
    isActive: Boolean(group?.IsActive ?? group?.isActive ?? true),
    createdBy: group?.CreatedBy ?? group?.createdBy ?? "",
    createdAt: group?.CreatedAt ?? group?.createdAt ?? null,
    members: unwrapCollection(group?.Members ?? group?.members).map((member) => ({
      id: member?.ID ?? member?.id ?? null,
      groupId: member?.GroupID ?? member?.groupID ?? member?.groupId ?? null,
      actor: member?.Actor ?? member?.actor ?? "",
      isActive: Boolean(member?.IsActive ?? member?.isActive ?? true),
      createdAt: member?.CreatedAt ?? member?.createdAt ?? null,
    })),
  };
}

export function normalizeVersion(version) {
  return {
    ...version,
    id: version?.ID ?? version?.id ?? null,
    workflowId: version?.WorkflowID ?? version?.workflowID ?? version?.workflowId ?? null,
    versionNo: Number(version?.VersionNo ?? version?.versionNo ?? 0),
    status: version?.Status ?? version?.status ?? "",
    changeSummary: version?.ChangeSummary ?? version?.changeSummary ?? "",
    createdBy: version?.CreatedBy ?? version?.createdBy ?? "",
    createdAt: version?.CreatedAt ?? version?.createdAt ?? null,
    modifiedBy: version?.ModifiedBy ?? version?.modifiedBy ?? "",
    modifiedAt: version?.ModifiedAt ?? version?.modifiedAt ?? null,
    submittedBy: version?.SubmittedBy ?? version?.submittedBy ?? "",
    submittedAt: version?.SubmittedAt ?? version?.submittedAt ?? null,
    approvedBy: version?.ApprovedBy ?? version?.approvedBy ?? "",
    approvedAt: version?.ApprovedAt ?? version?.approvedAt ?? null,
    rejectedBy: version?.RejectedBy ?? version?.rejectedBy ?? "",
    rejectedAt: version?.RejectedAt ?? version?.rejectedAt ?? null,
    comment: version?.Comment ?? version?.comment ?? "",
  };
}

export function normalizeTransitionRule(rule) {
  return {
    ...rule,
    id: rule?.ID ?? rule?.id ?? null,
    workflowId: rule?.WorkflowID ?? rule?.workflowID ?? rule?.workflowId ?? null,
    fromStepId: rule?.FromStepID ?? rule?.fromStepID ?? rule?.fromStepId ?? "",
    action: rule?.Action ?? rule?.action ?? "Approve",
    targetType: rule?.TargetType ?? rule?.targetType ?? "NextStep",
    targetStepId: rule?.TargetStepID ?? rule?.targetStepID ?? rule?.targetStepId ?? "",
    conditionJson: rule?.ConditionJson ?? rule?.conditionJson ?? "",
    priority: Number(rule?.Priority ?? rule?.priority ?? 0),
    isDefault: Boolean(rule?.IsDefault ?? rule?.isDefault),
    isActive: Boolean(rule?.IsActive ?? rule?.isActive ?? true),
    createdAt: rule?.CreatedAt ?? rule?.createdAt ?? null,
  };
}

export function normalizeInstance(instance) {
  return {
    ...instance,
    id: instance?.ID ?? instance?.id ?? null,
    workflowId: instance?.WorkflowID ?? instance?.workflowID ?? instance?.workflowId ?? null,
    requestNo: instance?.RequestNo ?? instance?.requestNo ?? "",
    title: instance?.Title ?? instance?.title ?? "",
    status: instance?.Status ?? instance?.status ?? "",
    currentStepOrder: Number(instance?.CurrentStepOrder ?? instance?.currentStepOrder ?? 0),
    createdWorkflowVersionId: instance?.CreatedWorkflowVersionID ?? instance?.createdWorkflowVersionID ?? instance?.createdWorkflowVersionId ?? null,
    workflowVersionNo: instance?.WorkflowVersionNo ?? instance?.workflowVersionNo ?? null,
    workflowVersionStatus: instance?.WorkflowVersionStatus ?? instance?.workflowVersionStatus ?? "",
    workflowVersionApprovedAt: instance?.WorkflowVersionApprovedAt ?? instance?.workflowVersionApprovedAt ?? null,
    effectiveVersionMode: instance?.EffectiveVersionMode ?? instance?.effectiveVersionMode ?? "SnapshotOnCreate",
    submittedBy: instance?.SubmittedBy ?? instance?.submittedBy ?? "",
    submittedAt: instance?.SubmittedAt ?? instance?.submittedAt ?? null,
    completedAt: instance?.CompletedAt ?? instance?.completedAt ?? null,
    createdAt: instance?.CreatedAt ?? instance?.createdAt ?? null,
    updatedAt: instance?.UpdatedAt ?? instance?.updatedAt ?? null,
  };
}

export function normalizeInstanceStep(step) {
  return {
    ...step,
    id: step?.ID ?? step?.id ?? null,
    instanceId: step?.InstanceID ?? step?.instanceID ?? step?.instanceId ?? null,
    stepId: step?.StepID ?? step?.stepID ?? step?.stepId ?? null,
    status: step?.Status ?? step?.status ?? "",
    assignedTo: step?.AssignedTo ?? step?.assignedTo ?? "",
    actionBy: step?.ActionBy ?? step?.actionBy ?? "",
    actionAt: step?.ActionAt ?? step?.actionAt ?? null,
    comment: step?.Comment ?? step?.comment ?? "",
    canAct: Boolean(step?.CanAct ?? step?.canAct),
    createdAt: step?.CreatedAt ?? step?.createdAt ?? null,
    step: step?.Step ? normalizeStep(step.Step) : step?.step ? normalizeStep(step.step) : null,
  };
}

export function normalizeValue(value) {
  return {
    ...value,
    id: value?.ID ?? value?.id ?? null,
    instanceId: value?.InstanceID ?? value?.instanceID ?? value?.instanceId ?? null,
    stepId: value?.StepID ?? value?.stepID ?? value?.stepId ?? null,
    fieldId: value?.FieldID ?? value?.fieldID ?? value?.fieldId ?? null,
    valueText: value?.ValueText ?? value?.valueText ?? "",
    valueNumber: value?.ValueNumber ?? value?.valueNumber ?? null,
    valueDate: value?.ValueDate ?? value?.valueDate ?? null,
    valueDateTime: value?.ValueDateTime ?? value?.valueDateTime ?? null,
    valueBool: value?.ValueBool ?? value?.valueBool ?? null,
    valueUser: value?.ValueUser ?? value?.valueUser ?? "",
    valueJson: value?.ValueJson ?? value?.valueJson ?? "",
    files: unwrapCollection(value?.Files ?? value?.files).map((file) => ({
      id: file?.ID ?? file?.id ?? null,
      fileName: file?.FileName ?? file?.fileName ?? "",
      contentType: file?.ContentType ?? file?.contentType ?? "",
      size: Number(file?.Size ?? file?.size ?? 0),
      uploadedBy: file?.UploadedBy ?? file?.uploadedBy ?? "",
      uploadedAt: file?.UploadedAt ?? file?.uploadedAt ?? null,
    })),
  };
}

export function normalizeAudit(audit) {
  return {
    ...audit,
    id: audit?.ID ?? audit?.id ?? null,
    action: audit?.Action ?? audit?.action ?? "",
    fromStatus: audit?.FromStatus ?? audit?.fromStatus ?? "",
    toStatus: audit?.ToStatus ?? audit?.toStatus ?? "",
    actor: audit?.Actor ?? audit?.actor ?? "",
    comment: audit?.Comment ?? audit?.comment ?? "",
    createdAt: audit?.CreatedAt ?? audit?.createdAt ?? null,
  };
}

export function normalizeTableRow(row) {
  return {
    ...row,
    id: row?.ID ?? row?.id ?? null,
    instanceId: row?.InstanceID ?? row?.instanceID ?? row?.instanceId ?? null,
    stepId: row?.StepID ?? row?.stepID ?? row?.stepId ?? null,
    fieldId: row?.FieldID ?? row?.fieldID ?? row?.fieldId ?? null,
    rowIndex: Number(row?.RowIndex ?? row?.rowIndex ?? 0),
    cells: unwrapCollection(row?.Cells ?? row?.cells).map((cell) => ({
      id: cell?.ID ?? cell?.id ?? null,
      rowId: cell?.RowID ?? cell?.rowID ?? cell?.rowId ?? null,
      columnKey: cell?.ColumnKey ?? cell?.columnKey ?? "",
      valueText: cell?.ValueText ?? cell?.valueText ?? "",
      valueNumber: cell?.ValueNumber ?? cell?.valueNumber ?? null,
      valueDate: cell?.ValueDate ?? cell?.valueDate ?? null,
      valueDateTime: cell?.ValueDateTime ?? cell?.valueDateTime ?? null,
      valueBool: cell?.ValueBool ?? cell?.valueBool ?? null,
      valueJson: cell?.ValueJson ?? cell?.valueJson ?? "",
    })),
  };
}

export function normalizeWorkflowDetail(data) {
  const entity = unwrapEntity(data);

  return {
    workflow: normalizeWorkflow(entity.Workflow ?? entity.workflow),
    steps: unwrapCollection(entity.Steps ?? entity.steps).map(normalizeStep),
    permissions: unwrapCollection(entity.Permissions ?? entity.permissions).map(normalizePermission),
    groups: unwrapCollection(entity.Groups ?? entity.groups).map(normalizeGroup),
    versions: unwrapCollection(entity.Versions ?? entity.versions).map(normalizeVersion),
    transitionRules: unwrapCollection(entity.TransitionRules ?? entity.transitionRules).map(normalizeTransitionRule),
    access: normalizeAccess(entity),
  };
}

export function normalizeRequestDetail(data) {
  const entity = unwrapEntity(data);

  return {
    instance: normalizeInstance(entity.Instance ?? entity.instance),
    steps: unwrapCollection(entity.Steps ?? entity.steps).map(normalizeInstanceStep),
    values: unwrapCollection(entity.Values ?? entity.values).map(normalizeValue),
    tableRows: unwrapCollection(entity.TableRows ?? entity.tableRows).map(normalizeTableRow),
    audit: unwrapCollection(entity.Audit ?? entity.audit).map(normalizeAudit),
    access: normalizeAccess(entity),
    canApprove: Boolean(entity.CanApprove ?? entity.canApprove),
  };
}

function buildWorkflowPayload(payload, includeCode = false) {
  return {
    ...(includeCode ? { Code: payload.code.trim() } : {}),
    Name: payload.name.trim(),
    Description: payload.description?.trim() || "",
    IsActive: Boolean(payload.isActive),
    IsPublic: Boolean(payload.isPublic),
    VersionMode: payload.versionMode || "SnapshotOnCreate",
    Mail: payload.mail?.trim() || null,
    MailProfileName: payload.mailProfileName?.trim() || null,
  };
}

function buildGeneratedStepCode(payload) {
  const order = Number(payload.stepOrder) || 1;
  return `STEP-${String(order).padStart(3, "0")}`;
}

function buildStepPayload(payload) {
  return {
    StepOrder: Number(payload.stepOrder),
    StepGroup: null,
    StepCode: payload.stepCode?.trim() || buildGeneratedStepCode(payload),
    StepName: payload.stepName.trim(),
    ApprovalMode: payload.approvalMode,
    ApproverType: payload.approverType,
    ApproverValue: payload.approverValue.trim(),
    IsRequired: Boolean(payload.isRequired),
    MinApproveCount:
      payload.approvalMode === "ParallelAny" && payload.minApproveCount !== ""
        ? Number(payload.minApproveCount)
        : null,
    ReminderHours:
      payload.reminderHours === "" || payload.reminderHours === null || payload.reminderHours === undefined
        ? null
        : Number(payload.reminderHours),
  };
}

function buildFieldPayload(payload) {
  return {
    FieldKey: payload.fieldKey.trim(),
    Label: payload.label.trim(),
    DataType: String(payload.dataType || "").trim().toLowerCase(),
    IsRequired: Boolean(payload.isRequired),
    DefaultValue: payload.defaultValue?.trim() || null,
    OptionSourceType: payload.optionSourceType || "Static",
    ValidationJson: payload.validationJson?.trim() || null,
    DisplayOrder: Number(payload.displayOrder),
    Options: payload.options?.map((option, index) => ({
      Value: option.value.trim(),
      Label: option.label.trim(),
      SortOrder: Number(option.sortOrder || index + 1),
      IsActive: Boolean(option.isActive),
    })),
  };
}

function buildRequestValue(field, rawValue) {
  const base = {
    StepID: field.stepId,
    FieldID: field.id,
  };

  switch (field.dataType) {
    case "number":
      return { ...base, ValueNumber: rawValue === "" || rawValue === null || rawValue === undefined ? null : Number(rawValue) };
    case "date":
      return { ...base, ValueDate: rawValue || null };
    case "datetime":
      return { ...base, ValueDateTime: rawValue || null };
    case "boolean":
      return { ...base, ValueBool: Boolean(rawValue) };
    case "multi-select":
      return { ...base, ValueJson: JSON.stringify(rawValue || []) };
    case "userpicker":
      return { ...base, ValueUser: String(rawValue || "").trim() };
    case "file":
      return { ...base, ValueJson: null };
    case "stored-procedure":
      return { ...base, ValueJson: rawValue ? JSON.stringify(rawValue) : null };
    case "table":
      return {
        ...base,
        ValueJson: JSON.stringify(rawValue || []),
        TableRows: (rawValue || []).map((row, index) => ({
          RowIndex: row.rowIndex || index + 1,
          Cells: row.cells || row,
        })),
      };
    case "select":
    case "textarea":
    case "text":
    default:
      return { ...base, ValueText: String(rawValue ?? "").trim() };
  }
}

function buildReportParams(query = {}) {
  const params = {};

  if (query.workflowId) {
    params.WorkflowID = query.workflowId;
  }

  if (query.status) {
    params.Status = query.status;
  }

  if (query.from) {
    params.From = query.from;
  }

  if (query.to) {
    params.To = query.to;
  }

  return params;
}

export const workflowApi = {
  async getWorkflows() {
    const { data } = await apiClient.get(workflowBasePath);
    return unwrapCollection(data).map(normalizeWorkflow);
  },

  async getWorkflow(id) {
    const { data } = await apiClient.get(`${workflowBasePath}/${encodeURIComponent(id)}`);
    return normalizeWorkflowDetail(data);
  },

  async createWorkflow(payload) {
    const { data } = await apiClient.post(workflowBasePath, buildWorkflowPayload(payload, true));
    return normalizeWorkflow(unwrapEntity(data));
  },

  async updateWorkflow(id, payload) {
    const { data } = await apiClient.put(`${workflowBasePath}/${encodeURIComponent(id)}`, buildWorkflowPayload(payload));
    return normalizeWorkflow(unwrapEntity(data));
  },

  async createStep(workflowId, payload) {
    const { data } = await apiClient.post(`${workflowBasePath}/${encodeURIComponent(workflowId)}/steps`, buildStepPayload(payload));
    return normalizeStep(unwrapEntity(data));
  },

  async updateStep(stepId, payload) {
    const { data } = await apiClient.put(`${workflowBasePath}/steps/${encodeURIComponent(stepId)}`, buildStepPayload(payload));
    return normalizeStep(unwrapEntity(data));
  },

  async deleteStep(stepId) {
    await apiClient.delete(`${workflowBasePath}/steps/${encodeURIComponent(stepId)}`);
  },

  async createField(stepId, payload) {
    const { data } = await apiClient.post(`${workflowBasePath}/steps/${encodeURIComponent(stepId)}/fields`, buildFieldPayload(payload));
    return normalizeField(unwrapEntity(data));
  },

  async updateField(fieldId, payload) {
    const { data } = await apiClient.put(`${workflowBasePath}/fields/${encodeURIComponent(fieldId)}`, buildFieldPayload(payload));
    return normalizeField(unwrapEntity(data));
  },

  async deleteField(fieldId) {
    await apiClient.delete(`${workflowBasePath}/fields/${encodeURIComponent(fieldId)}`);
  },

  async assignPermission(workflowId, payload) {
    const { data } = await apiClient.post(`${workflowBasePath}/${encodeURIComponent(workflowId)}/permissions`, {
      PrincipalType: payload.principalType,
      PrincipalValue: payload.principalValue.trim(),
      Permission: payload.permission,
    });
    return normalizePermission(unwrapEntity(data));
  },

  async removePermission(permissionId) {
    await apiClient.delete(`${workflowBasePath}/permissions/${encodeURIComponent(permissionId)}`);
  },

  async createGroup(workflowId, payload) {
    const { data } = await apiClient.post(`${workflowBasePath}/${encodeURIComponent(workflowId)}/groups`, {
      GroupCode: payload.groupCode.trim(),
      GroupName: payload.groupName.trim(),
      Description: payload.description?.trim() || "",
      IsActive: Boolean(payload.isActive),
      Members: String(payload.members || "")
        .split(/[;,\n\r]+/)
        .map((item) => item.trim())
        .filter(Boolean),
    });
    return normalizeGroup(unwrapEntity(data));
  },

  async updateGroup(groupId, payload) {
    const { data } = await apiClient.put(`${workflowBasePath}/groups/${encodeURIComponent(groupId)}`, {
      GroupCode: payload.groupCode.trim(),
      GroupName: payload.groupName.trim(),
      Description: payload.description?.trim() || "",
      IsActive: Boolean(payload.isActive),
      Members: String(payload.members || "")
        .split(/[;,\n\r]+/)
        .map((item) => item.trim())
        .filter(Boolean),
    });
    return normalizeGroup(unwrapEntity(data));
  },

  async deleteGroup(groupId) {
    await apiClient.delete(`${workflowBasePath}/groups/${encodeURIComponent(groupId)}`);
  },

  async createTransitionRule(workflowId, payload) {
    const { data } = await apiClient.post(`${workflowBasePath}/${encodeURIComponent(workflowId)}/transition-rules`, {
      FromStepID: Number(payload.fromStepId),
      Action: payload.action,
      TargetType: payload.targetType,
      TargetStepID: payload.targetStepId ? Number(payload.targetStepId) : null,
      ConditionJson: payload.conditionJson?.trim() || null,
      Priority: Number(payload.priority || 0),
      IsDefault: Boolean(payload.isDefault),
      IsActive: Boolean(payload.isActive),
    });
    return normalizeTransitionRule(unwrapEntity(data));
  },

  async updateTransitionRule(ruleId, payload) {
    const { data } = await apiClient.put(`${workflowBasePath}/transition-rules/${encodeURIComponent(ruleId)}`, {
      FromStepID: Number(payload.fromStepId),
      Action: payload.action,
      TargetType: payload.targetType,
      TargetStepID: payload.targetStepId ? Number(payload.targetStepId) : null,
      ConditionJson: payload.conditionJson?.trim() || null,
      Priority: Number(payload.priority || 0),
      IsDefault: Boolean(payload.isDefault),
      IsActive: Boolean(payload.isActive),
    });
    return normalizeTransitionRule(unwrapEntity(data));
  },

  async deleteTransitionRule(ruleId) {
    await apiClient.delete(`${workflowBasePath}/transition-rules/${encodeURIComponent(ruleId)}`);
  },

  async submitVersion(workflowId, comment = "") {
    const { data } = await apiClient.post(`${workflowBasePath}/${encodeURIComponent(workflowId)}/versions/submit`, {
      Comment: comment.trim(),
    });
    return normalizeVersion(unwrapEntity(data));
  },

  async approveVersion(versionId, comment = "") {
    const { data } = await apiClient.post(`${workflowBasePath}/versions/${encodeURIComponent(versionId)}/approve`, {
      Comment: comment.trim(),
    });
    return normalizeVersion(unwrapEntity(data));
  },

  async rejectVersion(versionId, comment = "") {
    const { data } = await apiClient.post(`${workflowBasePath}/versions/${encodeURIComponent(versionId)}/reject`, {
      Comment: comment.trim(),
    });
    return normalizeVersion(unwrapEntity(data));
  },

  async resolveFieldOptions(fieldId, values = [], fields = []) {
    const { data } = await apiClient.post(`${workflowBasePath}/fields/${encodeURIComponent(fieldId)}/options/resolve`, {
      Values: fields.map((field) => buildRequestValue(field, values[field.id])),
    });
    return unwrapCollection(data).map(normalizeOption);
  },

  async createRequest(payload) {
    const { data } = await apiClient.post(requestBasePath, {
      WorkflowID: payload.workflowId,
      Title: payload.title.trim(),
      Values: payload.fields.map((field) => buildRequestValue(field, payload.values[field.id])),
    });
    return normalizeInstance(unwrapEntity(data));
  },

  async updateRequest(requestId, payload) {
    const { data } = await apiClient.put(`${requestBasePath}/${encodeURIComponent(requestId)}`, {
      Title: payload.title.trim(),
      Values: payload.fields.map((field) => buildRequestValue(field, payload.values[field.id])),
    });
    return normalizeInstance(unwrapEntity(data));
  },

  async uploadFile(requestId, fieldId, file) {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await apiClient.post(`${requestBasePath}/${encodeURIComponent(requestId)}/fields/${encodeURIComponent(fieldId)}/files`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return unwrapEntity(data);
  },

  async uploadStepTemplate(stepId, file) {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await apiClient.post(`${workflowBasePath}/steps/${encodeURIComponent(stepId)}/template`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return normalizeStep(unwrapEntity(data));
  },

  async uploadFieldTemplate(fieldId, file) {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await apiClient.post(`${workflowBasePath}/fields/${encodeURIComponent(fieldId)}/template`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return normalizeField(unwrapEntity(data));
  },

  async downloadFieldTemplate(fieldId) {
    const { data, headers } = await apiClient.get(`${workflowBasePath}/fields/${encodeURIComponent(fieldId)}/template`, {
      responseType: "blob",
    });
    return {
      blob: data,
      contentType: headers["content-type"] || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  },

  async downloadTableFieldTemplate(fieldId) {
    const { data, headers } = await apiClient.get(`${workflowBasePath}/fields/${encodeURIComponent(fieldId)}/table/template`, {
      responseType: "blob",
    });
    return {
      blob: data,
      contentType: headers["content-type"] || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  },

  async downloadStepTemplate(stepId) {
    const { data, headers } = await apiClient.get(`${workflowBasePath}/steps/${encodeURIComponent(stepId)}/template`, {
      responseType: "blob",
    });
    return {
      blob: data,
      contentType: headers["content-type"] || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  },

  async importTableFieldExcel(fieldId, file) {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await apiClient.post(`${workflowBasePath}/fields/${encodeURIComponent(fieldId)}/table/import`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const entity = unwrapEntity(data);
    return {
      rows: unwrapCollection(entity.Rows ?? entity.rows).map((row, index) => ({
        rowIndex: Number(row?.RowIndex ?? row?.rowIndex ?? index + 1),
        cells: row?.Cells ?? row?.cells ?? {},
      })),
      count: Number(entity.Count ?? entity.count ?? 0),
    };
  },

  async downloadFile(fileId) {
    const { data, headers } = await apiClient.get(`${requestBasePath}/files/${encodeURIComponent(fileId)}`, {
      responseType: "blob",
    });
    return {
      blob: data,
      contentType: headers["content-type"] || "application/octet-stream",
    };
  },

  async submitRequest(requestId) {
    const { data } = await apiClient.post(`${requestBasePath}/${encodeURIComponent(requestId)}/submit`);
    return unwrapEntity(data);
  },

  async getMyRequests() {
    const { data } = await apiClient.get(`${requestBasePath}/my`);
    return unwrapCollection(data).map(normalizeInstance);
  },

  async getPendingMyApproval() {
    const { data } = await apiClient.get(`${requestBasePath}/pending-my-approval`);
    return unwrapCollection(data).map(normalizeInstance);
  },

  async getRequestDetail(requestId) {
    const { data } = await apiClient.get(`${requestBasePath}/${encodeURIComponent(requestId)}`);
    return normalizeRequestDetail(data);
  },

  async approveRequest(requestId, payload = {}) {
    const { data } = await apiClient.post(`${requestBasePath}/${encodeURIComponent(requestId)}/action`, {
      Action: "Approve",
      Comment: (payload.comment || "").trim(),
      Values: (payload.fields || []).map((field) => buildRequestValue(field, payload.values?.[field.id])),
    });
    return unwrapEntity(data);
  },

  async executeStoredProcedure(fieldId, parameters = {}) {
    const { data } = await apiClient.post(`${workflowBasePath}/fields/${encodeURIComponent(fieldId)}/execute-procedure`, {
      Parameters: parameters,
    });
    return unwrapEntity(data);
  },

  async rejectRequest(requestId, comment = "") {
    const { data } = await apiClient.post(`${requestBasePath}/${encodeURIComponent(requestId)}/action`, {
      Action: "Reject",
      Comment: comment.trim(),
    });
    return unwrapEntity(data);
  },

  async cancelRequest(requestId, comment = "") {
    const { data } = await apiClient.put(`${requestBasePath}/${encodeURIComponent(requestId)}/cancel`, {
      Comment: comment.trim(),
    });
    return unwrapEntity(data);
  },

  async getReportSummary(query) {
    const { data } = await apiClient.get(`${reportBasePath}/summary`, { params: buildReportParams(query) });
    return unwrapCollection(data);
  },

  async exportReport(query) {
    const { data } = await apiClient.get(`${reportBasePath}/export`, { params: buildReportParams(query) });
    return unwrapCollection(data);
  },
};
