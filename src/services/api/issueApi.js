import { apiClient } from "./client";

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

function normalizeAttachment(attachment) {
  return {
    id: attachment?.ID ?? attachment?.id,
    fileName: attachment?.FileName ?? attachment?.fileName ?? "",
    contentType: attachment?.ContentType ?? attachment?.contentType ?? "",
    size: attachment?.Size ?? attachment?.size ?? 0,
    uploadedBy: attachment?.UploadedBy ?? attachment?.uploadedBy ?? "",
    uploadedAt: attachment?.UploadedAt ?? attachment?.uploadedAt ?? null,
  };
}

function normalizeHistory(item) {
  return {
    id: item?.ID ?? item?.id,
    fromStatus: item?.FromStatus ?? item?.fromStatus ?? "",
    toStatus: item?.ToStatus ?? item?.toStatus ?? "",
    actor: item?.Actor ?? item?.actor ?? "",
    comment: item?.Comment ?? item?.comment ?? "",
    createdAt: item?.CreatedAt ?? item?.createdAt ?? null,
  };
}

export function normalizeIssue(issue) {
  return {
    id: issue?.ID ?? issue?.id,
    issueNo: issue?.IssueNo ?? issue?.issueNo ?? "",
    title: issue?.Title ?? issue?.title ?? "",
    description: issue?.Description ?? issue?.description ?? "",
    category: issue?.Category ?? issue?.category ?? "",
    status: issue?.Status ?? issue?.status ?? "",
    reporterUserName: issue?.ReporterUserName ?? issue?.reporterUserName ?? "",
    reporterDisplayName: issue?.ReporterDisplayName ?? issue?.reporterDisplayName ?? "",
    reporterEmail: issue?.ReporterEmail ?? issue?.reporterEmail ?? "",
    reporterEmployeeId: issue?.ReporterEmployeeID ?? issue?.reporterEmployeeID ?? issue?.reporterEmployeeId ?? "",
    createdAt: issue?.CreatedAt ?? issue?.createdAt ?? null,
    updatedAt: issue?.UpdatedAt ?? issue?.updatedAt ?? null,
    resolvedAt: issue?.ResolvedAt ?? issue?.resolvedAt ?? null,
    closedAt: issue?.ClosedAt ?? issue?.closedAt ?? null,
    lastUpdatedBy: issue?.LastUpdatedBy ?? issue?.lastUpdatedBy ?? "",
    adminNote: issue?.AdminNote ?? issue?.adminNote ?? "",
    attachments: unwrapCollection(issue?.Attachments ?? issue?.attachments).map(normalizeAttachment),
    statusHistory: unwrapCollection(issue?.StatusHistory ?? issue?.statusHistory).map(normalizeHistory),
  };
}

function buildIssueFormData(payload) {
  const formData = new FormData();
  formData.append("Title", payload.title);
  formData.append("Description", payload.description);
  formData.append("Category", payload.category || "General");

  (payload.files || []).forEach((item) => {
    formData.append("files", item.file);
  });

  return formData;
}

export const issueApi = {
  async getMyIssues() {
    const { data } = await apiClient.get("/issues/my");
    return unwrapCollection(data).map(normalizeIssue);
  },

  async getAllIssues() {
    const { data } = await apiClient.get("/issues/admin");
    return unwrapCollection(data).map(normalizeIssue);
  },

  async createIssue(payload) {
    const { data } = await apiClient.post("/issues", buildIssueFormData(payload), {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return normalizeIssue(data);
  },

  async updateIssueStatus({ id, status, adminNote }) {
    const { data } = await apiClient.put(`/issues/${encodeURIComponent(id)}/status`, {
      Status: status,
      AdminNote: adminNote,
    });
    return normalizeIssue(data);
  },

  async closeIssue({ id, comment }) {
    const { data } = await apiClient.put(`/issues/${encodeURIComponent(id)}/close`, {
      Status: "Closed",
      AdminNote: comment,
    });
    return normalizeIssue(data);
  },

  async downloadAttachment(issueId, attachmentId) {
    const response = await apiClient.get(
      `/issues/${encodeURIComponent(issueId)}/attachments/${encodeURIComponent(attachmentId)}`,
      { responseType: "blob" },
    );

    return {
      blob: response.data,
      contentType: response.headers["content-type"] || "application/octet-stream",
    };
  },
};
