import { apiClient } from './client';

const mealOrdersBasePath = '/MealOrders';
const monthlyOrdersInFlight = new Map();

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

function normalizeShift(shift) {
  return {
    ...shift,
    shiftName: shift?.ShiftName ?? shift?.shiftName ?? shift?.name ?? '',
    ot: shift?.OT ?? shift?.ot ?? '',
  };
}

export function normalizeMealOrder(order) {
  return {
    ...order,
    id: order?.ID ?? order?.id ?? null,
    orderDate: order?.Date ?? order?.date ?? null,
    employeeId: order?.OperatorID ?? order?.operatorId ?? '',
    eatOption: order?.EatOption ?? order?.eatOption ?? '',
    group: order?.Group ?? order?.group ?? '',
    stt: Boolean(order?.stt ?? order?.STT ?? false),
    department: order?.Department ?? order?.department ?? '',
    shift: order?.Shift ?? order?.shift ?? '',
    nhaAn: order?.NhaAn ?? order?.nhaAn ?? '',
    createdAt: order?.NgayNhap ?? order?.ngayNhap ?? null,
    nhaMay: order?.NhaMay ?? order?.nhaMay ?? '',
  };
}

function buildCreatePayload(payload) {
  return {
    EmployeeId: payload.employeeId || undefined,
    Date: payload.date,
    EatOption: payload.eatOption,
    PeriodType: payload.periodType,
    Group: payload.group || '',
    stt: Boolean(payload.stt),
    Department: payload.department || '',
    Shift: payload.shift || '',
    NhaAn: payload.nhaAn || '',
    NhaMay: payload.nhaMay || '',
  };
}

function buildUpdatePayload(payload) {
  return {
    EmployeeId: payload.employeeId,
    Date: payload.date,
    EatOption: payload.eatOption,
    Group: payload.group || '',
    stt: Boolean(payload.stt),
    Department: payload.department || '',
    Shift: payload.shift || '',
    NhaAn: payload.nhaAn || '',
    NhaMay: payload.nhaMay || '',
  };
}

export const mealOrdersApi = {
  async getMonthlyOrders({ employeeId, year, month }) {
    const requestKey = `${employeeId || 'self'}-${year}-${month}`;
    const existingRequest = monthlyOrdersInFlight.get(requestKey);

    if (existingRequest) {
      return existingRequest;
    }

    const params = { month, year };

    if (employeeId) {
      params.employeeId = employeeId;
    }

    const requestPromise = apiClient
      .get(mealOrdersBasePath, { params })
      .then(({ data }) => unwrapCollection(data).map(normalizeMealOrder))
      .finally(() => {
        monthlyOrdersInFlight.delete(requestKey);
      });

    monthlyOrdersInFlight.set(requestKey, requestPromise);
    return requestPromise;
  },

  async getShifts({ ot }) {
    const params = {};

    if (ot) {
      params.ot = ot;
    }

    const { data } = await apiClient.get(`${mealOrdersBasePath}/shifts`, {
      params,
    });

    return unwrapCollection(data).map(normalizeShift);
  },

  async createOrder(payload) {
    const { data } = await apiClient.post(mealOrdersBasePath, buildCreatePayload(payload));
    return unwrapCollection(data).map(normalizeMealOrder);
  },

  async updateOrder(orderId, payload) {
    const { data } = await apiClient.put(
      `${mealOrdersBasePath}/${encodeURIComponent(orderId)}`,
      buildUpdatePayload(payload)
    );

    return normalizeMealOrder(unwrapEntity(data));
  },

  async deleteOrder(orderId, { employeeId } = {}) {
    const params = {};

    if (employeeId) {
      params.employeeId = employeeId;
    }

    await apiClient.delete(`${mealOrdersBasePath}/${encodeURIComponent(orderId)}`, {
      params,
    });
  },
};
