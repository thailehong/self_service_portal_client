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

function toNumber(value, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function normalizeBucket(bucket) {
  return {
    key: String(bucket?.key ?? bucket?.Key ?? ""),
    label: String(bucket?.label ?? bucket?.Label ?? ""),
    userCount: toNumber(bucket?.userCount ?? bucket?.UserCount),
    requestCount: toNumber(bucket?.requestCount ?? bucket?.RequestCount),
  };
}

function normalizeOverview(data) {
  return {
    from: data?.from ?? data?.From ?? "",
    to: data?.to ?? data?.To ?? "",
    granularity: data?.granularity ?? data?.Granularity ?? "day",
    activeNow: toNumber(data?.activeNow ?? data?.ActiveNow),
    activeLastFiveMinutes: toNumber(
      data?.activeLastFiveMinutes ?? data?.ActiveLastFiveMinutes,
    ),
    totalUsers: toNumber(data?.totalUsers ?? data?.TotalUsers),
    totalRequests: toNumber(data?.totalRequests ?? data?.TotalRequests),
    totalErrors: toNumber(data?.totalErrors ?? data?.TotalErrors),
    errorRate: toNumber(data?.errorRate ?? data?.ErrorRate),
    slowestApi: data?.slowestApi ?? data?.SlowestApi ?? "",
    slowestApiAverageMs:
      data?.slowestApiAverageMs ?? data?.SlowestApiAverageMs ?? null,
    buckets: unwrapCollection(data?.buckets ?? data?.Buckets).map(normalizeBucket),
  };
}

function normalizeActiveUser(user) {
  return {
    id: user?.userName ?? user?.UserName ?? user?.username ?? "",
    userName: user?.userName ?? user?.UserName ?? user?.username ?? "",
    displayName: user?.displayName ?? user?.DisplayName ?? "",
    employeeId: user?.employeeID ?? user?.employeeId ?? user?.EmployeeID ?? "",
    connectedAtUtc: user?.connectedAtUtc ?? user?.ConnectedAtUtc ?? "",
    lastSeenAtUtc: user?.lastSeenAtUtc ?? user?.LastSeenAtUtc ?? "",
    connectedAtLocal:
      user?.connectedAtLocal ?? user?.ConnectedAtLocal ?? user?.connectedAtUtc ?? user?.ConnectedAtUtc ?? "",
    lastSeenAtLocal:
      user?.lastSeenAtLocal ?? user?.LastSeenAtLocal ?? user?.lastSeenAtUtc ?? user?.LastSeenAtUtc ?? "",
    connectionCount: toNumber(user?.connectionCount ?? user?.ConnectionCount),
  };
}

function normalizeActiveUsers(data) {
  return {
    activeNow: toNumber(data?.activeNow ?? data?.ActiveNow),
    activeLastFiveMinutes: toNumber(
      data?.activeLastFiveMinutes ?? data?.ActiveLastFiveMinutes,
    ),
    users: unwrapCollection(data?.users ?? data?.Users).map(normalizeActiveUser),
  };
}

function normalizeApiPerformance(item) {
  return {
    id: `${item?.method ?? item?.Method}-${item?.path ?? item?.Path}`,
    method: item?.method ?? item?.Method ?? "",
    path: item?.path ?? item?.Path ?? "",
    endpoint: item?.endpoint ?? item?.Endpoint ?? "",
    requestCount: toNumber(item?.requestCount ?? item?.RequestCount),
    errorCount: toNumber(item?.errorCount ?? item?.ErrorCount),
    averageDurationMs: toNumber(
      item?.averageDurationMs ?? item?.AverageDurationMs,
    ),
    maxDurationMs: toNumber(item?.maxDurationMs ?? item?.MaxDurationMs),
    p95DurationMs:
      item?.p95DurationMs ?? item?.P95DurationMs ?? item?.p95 ?? null,
  };
}

function normalizeRecentApiRequest(item) {
  return {
    id: item?.id ?? item?.ID,
    startedAtUtc: item?.startedAtUtc ?? item?.StartedAtUtc ?? "",
    startedAtLocal:
      item?.startedAtLocal ?? item?.StartedAtLocal ?? item?.startedAtUtc ?? item?.StartedAtUtc ?? "",
    method: item?.method ?? item?.Method ?? "",
    path: item?.path ?? item?.Path ?? "",
    endpoint: item?.endpoint ?? item?.Endpoint ?? "",
    userName: item?.userName ?? item?.UserName ?? "",
    statusCode: toNumber(item?.statusCode ?? item?.StatusCode),
    durationMs: toNumber(item?.durationMs ?? item?.DurationMs),
    traceId: item?.traceId ?? item?.TraceId ?? "",
  };
}

function buildParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );
}

export const administratorTelemetryApi = {
  async getOverview(params) {
    const { data } = await apiClient.get("/admin/telemetry/overview", {
      params: buildParams(params),
    });
    return normalizeOverview(data);
  },

  async getActiveUsers() {
    const { data } = await apiClient.get("/admin/telemetry/active-users");
    return normalizeActiveUsers(data);
  },

  async getApiPerformance(params) {
    const { data } = await apiClient.get("/admin/telemetry/api-performance", {
      params: buildParams(params),
    });
    return unwrapCollection(data).map(normalizeApiPerformance);
  },

  async getRecentApiRequests(params) {
    const { data } = await apiClient.get(
      "/admin/telemetry/api-performance/recent",
      { params: buildParams(params) },
    );
    return unwrapCollection(data).map(normalizeRecentApiRequest);
  },
};
