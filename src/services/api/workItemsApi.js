import { apiClient } from "./client";

const SUMMARY_CACHE_TTL_MS = 15000;
let summaryCache = null;
let summaryRequest = null;

function normalizeSummary(data = {}) {
  const tasks = Number(data.tasks ?? data.Tasks ?? 0);
  const approvals = Number(data.approvals ?? data.Approvals ?? 0);
  const requests = Number(data.requests ?? data.Requests ?? 0);

  return {
    tasks,
    approvals,
    requests,
    total: Number(data.total ?? data.Total ?? tasks + approvals + requests),
  };
}

function normalizeWorkItem(item = {}) {
  return {
    ...item,
    id: item.id ?? item.Id ?? "",
    sourceSystem: item.sourceSystem ?? item.SourceSystem ?? "",
    sourceItemId: item.sourceItemId ?? item.SourceItemId ?? "",
    bucket: item.bucket ?? item.Bucket ?? "",
    title: item.title ?? item.Title ?? "",
    requestNo: item.requestNo ?? item.RequestNo ?? "",
    status: item.status ?? item.Status ?? "",
    currentStepName: item.currentStepName ?? item.CurrentStepName ?? "",
    requester: item.requester ?? item.Requester ?? "",
    assignedTo: item.assignedTo ?? item.AssignedTo ?? "",
    createdAt: item.createdAt ?? item.CreatedAt ?? null,
    submittedAt: item.submittedAt ?? item.SubmittedAt ?? null,
    updatedAt: item.updatedAt ?? item.UpdatedAt ?? null,
    dueAt: item.dueAt ?? item.DueAt ?? null,
    deepLink: item.deepLink ?? item.DeepLink ?? "",
    isExternal: Boolean(item.isExternal ?? item.IsExternal),
  };
}

function normalizePage(data = {}) {
  const items = data.items ?? data.Items ?? [];

  return {
    items: Array.isArray(items) ? items.map(normalizeWorkItem) : [],
    total: Number(data.total ?? data.Total ?? 0),
    page: Number(data.page ?? data.Page ?? 1),
    pageSize: Number(data.pageSize ?? data.PageSize ?? 25),
  };
}

export const workItemsApi = {
  async getSummary() {
    const now = Date.now();
    if (summaryCache && now - summaryCache.loadedAt < SUMMARY_CACHE_TTL_MS) {
      return summaryCache.data;
    }

    if (summaryRequest) {
      return summaryRequest;
    }

    summaryRequest = apiClient
      .get("/WorkItems/summary")
      .then(({ data }) => {
        const normalized = normalizeSummary(data);
        summaryCache = {
          data: normalized,
          loadedAt: Date.now(),
        };
        return normalized;
      })
      .finally(() => {
        summaryRequest = null;
      });

    return summaryRequest;
  },

  async getItems(params = {}) {
    const { data } = await apiClient.get("/WorkItems", { params });
    return normalizePage(data);
  },
};
