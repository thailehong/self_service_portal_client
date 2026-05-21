import dayjs from "dayjs";

export function getErrorMessage(error, fallback) {
  const responseData = error.response?.data;

  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
    return responseData.errors[0];
  }

  if (responseData?.errors && typeof responseData.errors === "object") {
    const firstGroup = Object.values(responseData.errors).find(
      (value) => Array.isArray(value) && value.length > 0,
    );

    if (firstGroup) {
      return firstGroup[0];
    }
  }

  return (
    responseData?.detail ||
    responseData?.message ||
    responseData?.title ||
    error.message ||
    fallback
  );
}

export function getEmployeeIdFromUser(user) {
  if (!user || typeof user !== "object") {
    return "";
  }

  return (
    user.employeeID ||
    user.EmployeeID ||
    user.employeeId ||
    user.EmployeeId ||
    ""
  );
}

export function getEmailFromUser(user) {
  if (!user || typeof user !== "object") {
    return "";
  }

  return user.email || user.Email || user.mail || user.Mail || "";
}

function getCostCenterFromUser(user) {
  if (!user || typeof user !== "object") {
    return "";
  }

  return user.costCenter || user.CostCenter || "";
}

export function normalizeCompareValue(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

export function getUniqueHodOptions(hods) {
  const seenEmails = new Set();

  return hods.reduce((options, hod) => {
    const email = String(hod.email || "").trim();
    const emailKey = normalizeCompareValue(email);

    if (!email || seenEmails.has(emailKey)) {
      return options;
    }

    seenEmails.add(emailKey);
    options.push({
      value: email,
      label: email,
      email,
    });

    return options;
  }, []);
}

export function getDefaultHodEmail(user, hods) {
  if (!Array.isArray(hods) || hods.length === 0) {
    return "";
  }

  const costCenter = normalizeCompareValue(getCostCenterFromUser(user));

  if (!costCenter) {
    return "";
  }

  const defaultHod = hods.find(
    (hod) =>
      normalizeCompareValue(hod.kronosDeptId || hod.KronosDeptID) ===
      costCenter,
  );

  return defaultHod?.email || "";
}

export function getStatusColor(status) {
  switch (status) {
    case "Approved":
      return "success";
    case "Resolved":
      return "info";
    case "Completed":
      return "primary";
    case "Rejected":
      return "error";
    case "Cancelled":
      return "default";
    default:
      return "warning";
  }
}

export function toPickerValue(value) {
  if (!value) {
    return null;
  }

  const nextValue = dayjs(value);
  return nextValue.isValid() ? nextValue : null;
}

export function toApiDateTime(value) {
  if (!value) {
    return null;
  }

  const nextValue = dayjs(value);
  return nextValue.isValid() ? nextValue.toISOString() : null;
}

export function formatBusDateTime(value) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const nextValue = dayjs(value);
  return nextValue.isValid() ? nextValue.format("DD/MM/YYYY HH:mm") : String(value);
}
