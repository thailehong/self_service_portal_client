import { apiClient } from "./client";

const basePath = "/it-application-requests";

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

  return [];
}

function readValue(item, pascalName, camelName, fallback = "") {
  return item?.[pascalName] ?? item?.[camelName] ?? fallback;
}

function normalizeMasterData(item) {
  return {
    id: readValue(item, "ID", "id"),
    type: readValue(item, "Type", "type"),
    value: readValue(item, "Value", "value"),
    label: readValue(item, "Label", "label"),
    sortOrder: readValue(item, "SortOrder", "sortOrder", 0),
    isActive: readValue(item, "IsActive", "isActive", true),
    createdAt: readValue(item, "CreatedAt", "createdAt", null),
    updatedAt: readValue(item, "UpdatedAt", "updatedAt", null),
  };
}

function normalizeAttachment(item) {
  return {
    id: readValue(item, "ID", "id"),
    fileName: readValue(item, "FileName", "fileName"),
    contentType: readValue(item, "ContentType", "contentType"),
    size: readValue(item, "Size", "size", 0),
    uploadedBy: readValue(item, "UploadedBy", "uploadedBy"),
    uploadedAt: readValue(item, "UploadedAt", "uploadedAt", null),
  };
}

function normalizeApprover(item) {
  return {
    id: readValue(item, "ID", "id"),
    sequence: readValue(item, "Sequence", "sequence", 0),
    approver: readValue(item, "Approver", "approver"),
    approverDisplayName: readValue(item, "ApproverDisplayName", "approverDisplayName"),
    decision: readValue(item, "Decision", "decision"),
    comment: readValue(item, "Comment", "comment"),
    decisionAt: readValue(item, "DecisionAt", "decisionAt", null),
    assignedBy: readValue(item, "AssignedBy", "assignedBy"),
    assignedAt: readValue(item, "AssignedAt", "assignedAt", null),
    canAct: readValue(item, "CanAct", "canAct", false),
  };
}

function normalizeTask(item) {
  return {
    id: readValue(item, "ID", "id"),
    requestId: readValue(item, "RequestID", "requestID", readValue(item, "RequestId", "requestId")),
    requestNo: readValue(item, "RequestNo", "requestNo"),
    requestTitle: readValue(item, "RequestTitle", "requestTitle"),
    taskName: readValue(item, "TaskName", "taskName"),
    status: readValue(item, "Status", "status"),
    estimateStartDate: readValue(item, "EstimateStartDate", "estimateStartDate", null),
    estimateCompleteDate: readValue(item, "EstimateCompleteDate", "estimateCompleteDate", null),
    assignTo: readValue(item, "AssignTo", "assignTo"),
    assignToDisplayName: readValue(item, "AssignToDisplayName", "assignToDisplayName"),
    duration: readValue(item, "Duration", "duration", null),
    actualStartDate: readValue(item, "ActualStartDate", "actualStartDate", null),
    actualCompleteDate: readValue(item, "ActualCompleteDate", "actualCompleteDate", null),
    createdAt: readValue(item, "CreatedAt", "createdAt", null),
    updatedAt: readValue(item, "UpdatedAt", "updatedAt", null),
    canStart: readValue(item, "CanStart", "canStart", false),
    canComplete: readValue(item, "CanComplete", "canComplete", false),
  };
}

function normalizeHistory(item) {
  return {
    id: readValue(item, "ID", "id"),
    action: readValue(item, "Action", "action"),
    fromStatus: readValue(item, "FromStatus", "fromStatus"),
    toStatus: readValue(item, "ToStatus", "toStatus"),
    actor: readValue(item, "Actor", "actor"),
    comment: readValue(item, "Comment", "comment"),
    createdAt: readValue(item, "CreatedAt", "createdAt", null),
  };
}

export function normalizeItApplicationRequest(item) {
  return {
    id: readValue(item, "ID", "id"),
    requestNo: readValue(item, "RequestNo", "requestNo"),
    title: readValue(item, "Title", "title"),
    requestType: readValue(item, "RequestType", "requestType"),
    refer: readValue(item, "Refer", "refer"),
    relatedApplication: readValue(item, "RelatedApplication", "relatedApplication"),
    relatedModule: readValue(item, "RelatedModule", "relatedModule"),
    expectedCompleteDate: readValue(item, "ExpectedCompleteDate", "expectedCompleteDate", null),
    requesterUserName: readValue(item, "RequesterUserName", "requesterUserName"),
    requesterDisplayName: readValue(item, "RequesterDisplayName", "requesterDisplayName"),
    requesterEmail: readValue(item, "RequesterEmail", "requesterEmail"),
    requesterEmployeeId: readValue(item, "RequesterEmployeeID", "requesterEmployeeID"),
    department: readValue(item, "Department", "department"),
    priority: readValue(item, "Priority", "priority"),
    site: readValue(item, "Site", "site"),
    bu: readValue(item, "BU", "bu"),
    effectToCompanyProfitAndLoss: readValue(item, "EffectToCompanyProfitAndLoss", "effectToCompanyProfitAndLoss"),
    estimateCostSaving: readValue(item, "EstimateCostSaving", "estimateCostSaving", null),
    detailOfProfitAndLoss: readValue(item, "DetailOfProfitAndLoss", "detailOfProfitAndLoss"),
    currentSituation: readValue(item, "CurrentSituation", "currentSituation"),
    briefOfRequest: readValue(item, "BriefOfRequest", "briefOfRequest"),
    operationProcessFlowChart: readValue(item, "OperationProcessFlowChart", "operationProcessFlowChart"),
    functionReportDescription: readValue(item, "FunctionReportDescription", "functionReportDescription"),
    category: readValue(item, "Category", "category"),
    sourceOfRequest: readValue(item, "SourceOfRequest", "sourceOfRequest"),
    sizeOfRequest: readValue(item, "SizeOfRequest", "sizeOfRequest"),
    estimateStartDate: readValue(item, "EstimateStartDate", "estimateStartDate", null),
    estimateCompleteDate: readValue(item, "EstimateCompleteDate", "estimateCompleteDate", null),
    itInCharge: readValue(item, "ITInCharge", "itInCharge"),
    status: readValue(item, "Status", "status"),
    createdAt: readValue(item, "CreatedAt", "createdAt", null),
    updatedAt: readValue(item, "UpdatedAt", "updatedAt", null),
    canIntake: readValue(item, "CanIntake", "canIntake", false),
    canApprove: readValue(item, "CanApprove", "canApprove", false),
    canCreateTask: readValue(item, "CanCreateTask", "canCreateTask", false),
    canEditDraft: readValue(item, "CanEditDraft", "canEditDraft", false),
    canSubmitDraft: readValue(item, "CanSubmitDraft", "canSubmitDraft", false),
    canManageMasterData: readValue(item, "CanManageMasterData", "canManageMasterData", false),
    approvers: unwrapCollection(readValue(item, "Approvers", "approvers", [])).map(normalizeApprover),
    tasks: unwrapCollection(readValue(item, "Tasks", "tasks", [])).map(normalizeTask),
    attachments: unwrapCollection(readValue(item, "Attachments", "attachments", [])).map(normalizeAttachment),
    statusHistory: unwrapCollection(readValue(item, "StatusHistory", "statusHistory", [])).map(normalizeHistory),
  };
}

function appendIfPresent(formData, key, value) {
  if (value !== undefined && value !== null && value !== "") {
    formData.append(key, value);
  }
}

function buildRequestFormData(payload) {
  const formData = new FormData();
  appendIfPresent(formData, "Title", payload.title);
  appendIfPresent(formData, "RequestType", payload.requestType);
  appendIfPresent(formData, "Refer", payload.refer);
  appendIfPresent(formData, "RelatedApplication", payload.relatedApplication);
  appendIfPresent(formData, "RelatedModule", payload.relatedModule);
  appendIfPresent(formData, "ExpectedCompleteDate", payload.expectedCompleteDate);
  appendIfPresent(formData, "RequesterUserName", payload.requesterUserName);
  appendIfPresent(formData, "RequesterDisplayName", payload.requesterDisplayName);
  appendIfPresent(formData, "RequesterEmail", payload.requesterEmail);
  appendIfPresent(formData, "RequesterEmployeeID", payload.requesterEmployeeId);
  appendIfPresent(formData, "Department", payload.department);
  appendIfPresent(formData, "Priority", payload.priority);
  appendIfPresent(formData, "Site", payload.site);
  appendIfPresent(formData, "BU", payload.bu);
  appendIfPresent(formData, "EffectToCompanyProfitAndLoss", payload.effectToCompanyProfitAndLoss);
  appendIfPresent(formData, "EstimateCostSaving", payload.estimateCostSaving);
  appendIfPresent(formData, "DetailOfProfitAndLoss", payload.detailOfProfitAndLoss);
  appendIfPresent(formData, "CurrentSituation", payload.currentSituation);
  appendIfPresent(formData, "BriefOfRequest", payload.briefOfRequest);
  appendIfPresent(formData, "OperationProcessFlowChart", payload.operationProcessFlowChart);
  appendIfPresent(formData, "FunctionReportDescription", payload.functionReportDescription);

  (payload.files || []).forEach((item) => {
    formData.append("files", item.file);
  });

  return formData;
}

function buildIntakePayload(payload) {
  return {
    Approvers: (payload.approvers || []).map((approver) => ({
      Approver: approver.approver,
      ApproverDisplayName: approver.approverDisplayName,
    })),
    Category: payload.category,
    SourceOfRequest: payload.sourceOfRequest,
    SizeOfRequest: payload.sizeOfRequest,
    EstimateStartDate: payload.estimateStartDate || null,
    EstimateCompleteDate: payload.estimateCompleteDate || null,
    ITInCharge: payload.itInCharge,
    EstimateCostSaving: payload.estimateCostSaving === "" ? null : payload.estimateCostSaving,
    Comment: payload.comment,
  };
}

function buildTaskPayload(payload) {
  return {
    TaskName: payload.taskName,
    Status: payload.status || "NotStarted",
    EstimateStartDate: payload.estimateStartDate || null,
    EstimateCompleteDate: payload.estimateCompleteDate || null,
    AssignTo: payload.assignTo,
    AssignToDisplayName: payload.assignToDisplayName,
    Duration: payload.duration === "" ? null : payload.duration,
  };
}

function buildMasterDataPayload(payload) {
  return {
    Type: payload.type,
    Value: payload.value,
    Label: payload.label,
    SortOrder: Number(payload.sortOrder || 0),
    IsActive: Boolean(payload.isActive),
  };
}

function normalizeOptions(data) {
  return Object.entries(data || {}).reduce((options, [type, rows]) => ({
    ...options,
    [type]: unwrapCollection(rows).map(normalizeMasterData),
  }), {});
}

export const itApplicationRequestApi = {
  async getRequests() {
    const { data } = await apiClient.get(`${basePath}/requests`);
    return unwrapCollection(data).map(normalizeItApplicationRequest);
  },

  async getMyRequests() {
    const { data } = await apiClient.get(`${basePath}/requests/my`);
    return unwrapCollection(data).map(normalizeItApplicationRequest);
  },

  async getPendingMyApproval() {
    const { data } = await apiClient.get(`${basePath}/requests/pending-my-approval`);
    return unwrapCollection(data).map(normalizeItApplicationRequest);
  },

  async getRequestDetail(id) {
    const { data } = await apiClient.get(`${basePath}/requests/${encodeURIComponent(id)}`);
    return normalizeItApplicationRequest(data);
  },

  async createRequest(payload) {
    const { data } = await apiClient.post(`${basePath}/requests`, buildRequestFormData(payload), {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return normalizeItApplicationRequest(data);
  },

  async updateDraft(id, payload) {
    const { data } = await apiClient.put(`${basePath}/requests/${encodeURIComponent(id)}/draft`, buildRequestFormData(payload), {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return normalizeItApplicationRequest(data);
  },

  async submitDraft(id) {
    const { data } = await apiClient.post(`${basePath}/requests/${encodeURIComponent(id)}/submit`);
    return normalizeItApplicationRequest(data);
  },

  async intakeRequest(id, payload) {
    const { data } = await apiClient.post(`${basePath}/requests/${encodeURIComponent(id)}/intake`, buildIntakePayload(payload));
    return normalizeItApplicationRequest(data);
  },

  async approveRequest(id, comment) {
    const { data } = await apiClient.post(`${basePath}/requests/${encodeURIComponent(id)}/approve`, { Comment: comment });
    return normalizeItApplicationRequest(data);
  },

  async rejectRequest(id, comment) {
    const { data } = await apiClient.post(`${basePath}/requests/${encodeURIComponent(id)}/reject`, { Comment: comment });
    return normalizeItApplicationRequest(data);
  },

  async getTasks() {
    const { data } = await apiClient.get(`${basePath}/tasks`);
    return unwrapCollection(data).map(normalizeTask);
  },

  async getMyTasks() {
    const { data } = await apiClient.get(`${basePath}/tasks/my`);
    return unwrapCollection(data).map(normalizeTask);
  },

  async createTask(requestId, payload) {
    const { data } = await apiClient.post(`${basePath}/requests/${encodeURIComponent(requestId)}/tasks`, buildTaskPayload(payload));
    return normalizeTask(data);
  },

  async updateTask(taskId, payload) {
    const { data } = await apiClient.put(`${basePath}/tasks/${encodeURIComponent(taskId)}`, buildTaskPayload(payload));
    return normalizeTask(data);
  },

  async startTask(taskId) {
    const { data } = await apiClient.post(`${basePath}/tasks/${encodeURIComponent(taskId)}/start`);
    return normalizeTask(data);
  },

  async completeTask(taskId) {
    const { data } = await apiClient.post(`${basePath}/tasks/${encodeURIComponent(taskId)}/complete`);
    return normalizeTask(data);
  },

  async getMasterData(params = {}) {
    const { data } = await apiClient.get(`${basePath}/master-data`, { params });
    return unwrapCollection(data).map(normalizeMasterData);
  },

  async getMasterDataOptions() {
    const { data } = await apiClient.get(`${basePath}/master-data/options`);
    return normalizeOptions(data);
  },

  async createMasterData(payload) {
    const { data } = await apiClient.post(`${basePath}/master-data`, buildMasterDataPayload(payload));
    return normalizeMasterData(data);
  },

  async updateMasterData(id, payload) {
    const { data } = await apiClient.put(`${basePath}/master-data/${encodeURIComponent(id)}`, buildMasterDataPayload(payload));
    return normalizeMasterData(data);
  },

  async downloadAttachment(requestId, attachmentId) {
    const response = await apiClient.get(
      `${basePath}/requests/${encodeURIComponent(requestId)}/attachments/${encodeURIComponent(attachmentId)}`,
      { responseType: "blob" },
    );

    return {
      blob: response.data,
      contentType: response.headers["content-type"] || "application/octet-stream",
    };
  },
};
