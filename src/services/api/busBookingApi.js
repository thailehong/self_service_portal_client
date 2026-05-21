import { apiClient } from "./client";

const busBookingBasePath = "/BusBooking";
const busMasterDataBasePath = "/BusMasterData";

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

export function normalizeBusBookingRequest(request) {
  return {
    ...request,
    id: request?.ID ?? request?.id ?? null,
    employeeId: request?.EmployeeID ?? request?.employeeId ?? request?.employeeID ?? "",
    employeeName: request?.EmployeeName ?? request?.employeeName ?? "",
    email: request?.Email ?? request?.email ?? "",
    department: request?.Department ?? request?.department ?? "",
    requestFor: request?.RequestFor ?? request?.requestFor ?? "",
    passenger: request?.Passenger ?? request?.passenger ?? "",
    typeOfTransport: request?.TypeOfTransport ?? request?.typeOfTransport ?? "",
    purpose: request?.Purpose ?? request?.purpose ?? "",
    typeOfGood: request?.TypeOfGood ?? request?.typeOfGood ?? "",
    sizeOfGood: request?.SizeOfGood ?? request?.sizeOfGood ?? "",
    typeMove: request?.TypeMove ?? request?.typeMove ?? "",
    pickupTime: request?.PickupTime ?? request?.pickupTime ?? null,
    dropoffTime: request?.DropoffTime ?? request?.dropoffTime ?? null,
    pickupPoint: request?.PickupPoint ?? request?.pickupPoint ?? "",
    dropoffPoint: request?.DropoffPoint ?? request?.dropoffPoint ?? "",
    estimateDistance: Number(request?.EstimateDistance ?? request?.estimateDistance ?? 0),
    reason: request?.Reason ?? request?.reason ?? "",
    status: request?.Status ?? request?.status ?? "",
    createdAt: request?.CreatedAt ?? request?.createdAt ?? null,
    updatedAt: request?.UpdatedAt ?? request?.updatedAt ?? null,
  };
}

export function normalizeBusApproval(approval) {
  return {
    ...approval,
    id: approval?.ID ?? approval?.id ?? null,
    requestId: approval?.RequestID ?? approval?.requestId ?? null,
    approverEmail: approval?.ApproverEmail ?? approval?.approverEmail ?? "",
    action: approval?.Action ?? approval?.action ?? "",
    comment: approval?.Comment ?? approval?.comment ?? "",
    approvedAt: approval?.ApprovedAt ?? approval?.approvedAt ?? null,
    createdAt: approval?.CreatedAt ?? approval?.createdAt ?? null,
  };
}

export function normalizeBusHistoryItem(item) {
  return {
    ...item,
    id: item?.ID ?? item?.id ?? null,
    requestId: item?.RequestID ?? item?.requestId ?? null,
    action: item?.Action ?? item?.action ?? "",
    comment: item?.Comment ?? item?.comment ?? "",
    createdBy: item?.CreatedBy ?? item?.createdBy ?? "",
    createdAt: item?.CreatedAt ?? item?.createdAt ?? null,
  };
}

export function normalizeBusVehicle(vehicle) {
  return {
    ...vehicle,
    id: vehicle?.ID ?? vehicle?.id ?? null,
    driverName: vehicle?.DriverName ?? vehicle?.driverName ?? "",
    phoneNumber: vehicle?.PhoneNumber ?? vehicle?.phoneNumber ?? "",
    plateNumber: vehicle?.PlateNumber ?? vehicle?.plateNumber ?? "",
    status: vehicle?.Status ?? vehicle?.status ?? "",
    createdAt: vehicle?.CreatedAt ?? vehicle?.createdAt ?? null,
    updatedAt: vehicle?.UpdatedAt ?? vehicle?.updatedAt ?? null,
  };
}

export function normalizeBusAssignment(assignment) {
  if (!assignment) {
    return null;
  }

  return {
    ...assignment,
    id: assignment?.ID ?? assignment?.id ?? null,
    requestId: assignment?.RequestID ?? assignment?.requestId ?? null,
    vehicleId: assignment?.VehicleID ?? assignment?.vehicleId ?? null,
    note: assignment?.Note ?? assignment?.note ?? "",
    planPickupTime: assignment?.PlanPickupTime ?? assignment?.planPickupTime ?? null,
    planDropoffTime: assignment?.PlanDropoffTime ?? assignment?.planDropoffTime ?? null,
    assignedAt: assignment?.AssignedAt ?? assignment?.assignedAt ?? null,
    vehicle: assignment?.Vehicle ? normalizeBusVehicle(assignment.Vehicle) : assignment?.vehicle ? normalizeBusVehicle(assignment.vehicle) : null,
  };
}

export function normalizeBusLocation(location) {
  return {
    ...location,
    id: location?.ID ?? location?.id ?? null,
    gate: location?.Location ?? location?.location ?? location?.Gate ?? location?.gate ?? "",
    ccn: location?.CCN ?? location?.ccn ?? "",
  };
}

function buildCreateRequestPayload(payload) {
  const isExternalTransport = payload.typeOfTransport === "External";

  return {
    RequestFor: isExternalTransport ? payload.requestFor?.trim() || "" : "",
    Passenger: payload.passenger?.trim() || "",
    TypeOfTransport: payload.typeOfTransport.trim(),
    Purpose: isExternalTransport ? payload.purpose.trim() : "",
    TypeOfGood: payload.typeOfGood?.trim() || "",
    SizeOfGood: payload.sizeOfGood?.trim() || "",
    TypeMove: payload.typeMove?.trim() || "",
    PickupTime: payload.pickupTime,
    DropoffTime: payload.dropoffTime,
    PickupPoint: payload.pickupPoint.trim(),
    DropoffPoint: payload.dropoffPoint.trim(),
    EstimateDistance:
      payload.estimateDistance === "" || payload.estimateDistance === null || payload.estimateDistance === undefined
        ? null
        : Number(payload.estimateDistance),
    Reason: payload.reason.trim(),
    ManagerEmail: payload.managerEmail.trim(),
  };
}

function buildVehiclePayload(payload) {
  return {
    DriverName: payload.driverName.trim(),
    PhoneNumber: payload.phoneNumber.trim(),
    PlateNumber: payload.plateNumber.trim(),
    Status: payload.status.trim(),
  };
}

function buildLocationPayload(payload) {
  return {
    Gate: payload.gate.trim(),
    CCN: payload.ccn.trim(),
  };
}

function buildApprovalPayload(action, payload = {}) {
  return {
    Action: action,
    Comment: payload.comment?.trim() || "",
    ...(payload.approverEmail
      ? { ApproverEmail: payload.approverEmail.trim() }
      : {}),
  };
}

export const busBookingApi = {
  async getRequests({ status } = {}) {
    const params = {};

    if (status) {
      params.status = status;
    }

    const { data } = await apiClient.get(`${busBookingBasePath}/requests`, { params });
    return unwrapCollection(data).map(normalizeBusBookingRequest);
  },

  async getMyRequests({ employeeId } = {}) {
    const params = {};

    if (employeeId) {
      params.employeeId = employeeId;
    }

    const { data } = await apiClient.get(`${busBookingBasePath}/my-request`, { params });
    return unwrapCollection(data).map(normalizeBusBookingRequest);
  },

  async getPendingMyApprovalRequests() {
    const { data } = await apiClient.get(`${busBookingBasePath}/requests/pending-my-approval`);
    return unwrapCollection(data).map(normalizeBusBookingRequest);
  },

  async createRequest(payload) {
    const { data } = await apiClient.post(`${busBookingBasePath}/requests`, buildCreateRequestPayload(payload));
    return normalizeBusBookingRequest(unwrapEntity(data));
  },

  async approveRequest(requestId, payload) {
    const { data } = await apiClient.post(
      `${busBookingBasePath}/requests/${encodeURIComponent(requestId)}/approval`,
      buildApprovalPayload("Approve", payload),
    );

    return unwrapEntity(data);
  },

  async rejectRequestApproval(requestId, payload) {
    const { data } = await apiClient.post(
      `${busBookingBasePath}/requests/${encodeURIComponent(requestId)}/approval`,
      buildApprovalPayload("Reject", payload),
    );

    return unwrapEntity(data);
  },

  async getApprovals(requestId) {
    const { data } = await apiClient.get(`${busBookingBasePath}/requests/${encodeURIComponent(requestId)}/approvals`);
    return unwrapCollection(data).map(normalizeBusApproval);
  },

  async getHistory(requestId) {
    const { data } = await apiClient.get(`${busBookingBasePath}/requests/${encodeURIComponent(requestId)}/history`);
    return unwrapCollection(data).map(normalizeBusHistoryItem);
  },

  async getAssignment(requestId) {
    try {
      const { data } = await apiClient.get(`${busBookingBasePath}/requests/${encodeURIComponent(requestId)}/assignment`);
      return normalizeBusAssignment(unwrapEntity(data));
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }

      throw error;
    }
  },

  async assignRequest(requestId, payload) {
    const { data } = await apiClient.post(`${busBookingBasePath}/requests/${encodeURIComponent(requestId)}/assignment`, {
      Action: "Assign",
      VehicleID: Number(payload.vehicleId),
      PlanPickupTime: payload.planPickupTime || null,
      PlanDropoffTime: payload.planDropoffTime || null,
      Note: payload.note?.trim() || "",
    });

    return unwrapEntity(data);
  },

  async rejectRequestAssignment(requestId, payload) {
    const { data } = await apiClient.post(`${busBookingBasePath}/requests/${encodeURIComponent(requestId)}/assignment`, {
      Action: "Reject",
      Comment: payload.comment?.trim() || "",
    });

    return unwrapEntity(data);
  },

  async cancelRequest(requestId, payload) {
    const { data } = await apiClient.put(`${busBookingBasePath}/requests/${encodeURIComponent(requestId)}/cancel`, {
      Reason: payload.reason?.trim() || "",
    });

    return unwrapEntity(data);
  },

  async getVehicles({ status } = {}) {
    const params = {};

    if (status) {
      params.status = status;
    }

    const { data } = await apiClient.get(`${busMasterDataBasePath}/vehicles`, { params });
    return unwrapCollection(data).map(normalizeBusVehicle);
  },

  async createVehicle(payload) {
    const { data } = await apiClient.post(`${busMasterDataBasePath}/vehicles`, buildVehiclePayload(payload));
    return normalizeBusVehicle(unwrapEntity(data));
  },

  async updateVehicle(vehicleId, payload) {
    const { data } = await apiClient.put(
      `${busMasterDataBasePath}/vehicles/${encodeURIComponent(vehicleId)}`,
      buildVehiclePayload(payload),
    );

    return normalizeBusVehicle(unwrapEntity(data));
  },

  async deleteVehicle(vehicleId) {
    await apiClient.delete(`${busMasterDataBasePath}/vehicles/${encodeURIComponent(vehicleId)}`);
  },

  async getLocations() {
    const { data } = await apiClient.get(`${busMasterDataBasePath}/locations`);
    return unwrapCollection(data).map(normalizeBusLocation);
  },

  async createLocation(payload) {
    const { data } = await apiClient.post(`${busMasterDataBasePath}/locations`, buildLocationPayload(payload));
    return normalizeBusLocation(unwrapEntity(data));
  },

  async updateLocation(locationId, payload) {
    const { data } = await apiClient.put(
      `${busMasterDataBasePath}/locations/${encodeURIComponent(locationId)}`,
      buildLocationPayload(payload),
    );

    return normalizeBusLocation(unwrapEntity(data));
  },

  async deleteLocation(locationId) {
    await apiClient.delete(`${busMasterDataBasePath}/locations/${encodeURIComponent(locationId)}`);
  },
};
