import dayjs from "dayjs";

export function getErrorMessage(error, fallback) {
  const responseData = error.response?.data;

  if (typeof responseData === "string" && responseData.trim()) {
    return sanitizeErrorMessage(responseData, fallback);
  }

  if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
    return sanitizeErrorMessage(responseData.errors[0], fallback);
  }

  if (responseData?.errors && typeof responseData.errors === "object") {
    const firstGroup = Object.values(responseData.errors).find(
      (value) => Array.isArray(value) && value.length > 0,
    );

    if (firstGroup) {
      return sanitizeErrorMessage(firstGroup[0], fallback);
    }
  }

  return sanitizeErrorMessage(
    responseData?.detail ||
    responseData?.message ||
    responseData?.title ||
    error.message ||
    fallback,
    fallback,
  );
}

function sanitizeErrorMessage(value, fallback) {
  if (!value) {
    return fallback;
  }

  let message = String(value)
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  message = message
    .replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer [redacted]")
    .replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, "[redacted-token]")
    .replace(/(Authorization\s*[:=]\s*)[^\s,;]+/gi, "$1[redacted]")
    .replace(/(access[_-]?token\s*[:=]\s*)[^\s,;]+/gi, "$1[redacted]")
    .replace(/(refresh[_-]?token\s*[:=]\s*)[^\s,;]+/gi, "$1[redacted]");

  const looksLikeDiagnostics =
    /System\.[A-Za-z0-9_.]+Exception/i.test(message)
    || /Microsoft\.[A-Za-z0-9_.]+Exception/i.test(message)
    || /\bAuthorization\b/i.test(message)
    || /\bBearer\b/i.test(message)
    || /\bat\s+[\w.]+\(.*\)/i.test(message)
    || /\bRequest headers\b/i.test(message)
    || /\bStack Trace\b/i.test(message)
    || /\bAxiosError\b/i.test(message)
    || message.length > 500;

  if (looksLikeDiagnostics) {
    return fallback;
  }

  return message || fallback;
}

export function getStatusColor(status) {
  switch (status) {
    case "Completed":
      return "success";
    case "InProgress":
      return "warning";
    case "Rejected":
      return "error";
    case "Cancelled":
      return "default";
    case "Draft":
      return "info";
    default:
      return "primary";
  }
}

export function getWorkflowName(workflows, workflowId) {
  return workflows.find((workflow) => String(workflow.id) === String(workflowId))?.name || `Workflow #${workflowId}`;
}

export function getFieldInitialValue(field) {
  if (field.dataType === "file") {
    return { files: [], existingFiles: [] };
  }

  if (field.dataType === "stored-procedure") {
    return null;
  }

  if (field.dataType === "table") {
    return [];
  }

  if (field.defaultValue) {
    if (field.dataType === "boolean") {
      return field.defaultValue === "true";
    }

    if (field.dataType === "multi-select") {
      return field.defaultValue.split(",").map((item) => item.trim()).filter(Boolean);
    }

    return field.defaultValue;
  }

  if (field.dataType === "boolean") {
    return false;
  }

  if (field.dataType === "multi-select") {
    return [];
  }

  return "";
}

export function flattenFields(steps) {
  return steps.flatMap((step) =>
    step.fields.map((field) => ({
      ...field,
      stepId: step.id,
      stepName: step.stepName,
      stepOrder: step.stepOrder,
      stepTemplate: field.template,
    })),
  );
}

export function isVisibleInputField(field) {
  return field?.dataType !== "stored-procedure";
}

export function getFieldConditionConfig(field) {
  if (!field?.validationJson) {
    return {};
  }

  try {
    const config = JSON.parse(field.validationJson);
    if (!config || typeof config !== "object" || Array.isArray(config)) {
      return {};
    }

    return {
      visibleWhen: readValidationConfigProperty(config, "visibleWhen"),
      showWhen: readValidationConfigProperty(config, "showWhen"),
      requiredWhen: readValidationConfigProperty(config, "requiredWhen"),
    };
  } catch {
    return {};
  }
}

function parseConfigValue(value) {
  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function readConfigProperty(config, propertyName) {
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    return undefined;
  }

  const key = Object.keys(config).find((item) => item.toLowerCase() === propertyName.toLowerCase());
  return key ? config[key] : undefined;
}

function readValidationConfigProperty(config, propertyName) {
  const parsedConfig = parseConfigValue(config);
  const directValue = readConfigProperty(parsedConfig, propertyName);
  if (directValue !== undefined) {
    return directValue;
  }

  for (const key of ["schema", "table", "tableField", "tableSchema", "tableConfig"]) {
    const nestedConfig = readConfigProperty(parsedConfig, key);
    if (nestedConfig === undefined) {
      continue;
    }

    const nestedValue = readValidationConfigProperty(nestedConfig, propertyName);
    if (nestedValue !== undefined) {
      return nestedValue;
    }
  }

  return undefined;
}

function readConditionProperty(condition, propertyName) {
  const key = Object.keys(condition || {}).find((item) => item.toLowerCase() === propertyName.toLowerCase());
  return key ? condition[key] : undefined;
}

function normalizeConditions(conditions) {
  if (!conditions) {
    return [];
  }

  return Array.isArray(conditions) ? conditions : [conditions];
}

function getControllingField(condition, fields) {
  const fieldId = readConditionProperty(condition, "fieldId");
  const fieldKey = readConditionProperty(condition, "fieldKey");

  return fields.find((item) =>
    (fieldId && String(item.id).trim() === String(fieldId).trim())
    || (fieldKey && String(item.fieldKey).trim().toLowerCase() === String(fieldKey).trim().toLowerCase())
  );
}

function normalizeComparableValue(value) {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeComparableValue(item));
  }

  if (value && typeof value === "object") {
    return value.value ?? value.Value ?? "";
  }

  return value === null || value === undefined ? "" : String(value).trim();
}

function comparableEquals(left, right) {
  return String(left).toLowerCase() === String(right).toLowerCase();
}

function conditionMatches(condition, fields, values) {
  if (!condition || typeof condition !== "object") {
    return true;
  }

  const fieldId = readConditionProperty(condition, "fieldId");
  const fieldKey = readConditionProperty(condition, "fieldKey");
  const controllingField = getControllingField(condition, fields);
  const operator = String(readConditionProperty(condition, "operator") || readConditionProperty(condition, "op") || "equals").toLowerCase();

  if ((fieldId || fieldKey) && !controllingField) {
    return operator === "empty";
  }

  const actualValue = normalizeComparableValue(controllingField ? values[controllingField.id] : undefined);
  const expectedValue = normalizeComparableValue(readConditionProperty(condition, "value") ?? readConditionProperty(condition, "values"));

  if (operator === "empty") {
    return Array.isArray(actualValue) ? actualValue.length === 0 : actualValue === "";
  }

  if (operator === "notempty" || operator === "not-empty") {
    return Array.isArray(actualValue) ? actualValue.length > 0 : actualValue !== "";
  }

  if (operator === "in") {
    const expectedValues = Array.isArray(expectedValue) ? expectedValue : [expectedValue];
    return Array.isArray(actualValue)
      ? actualValue.some((value) => expectedValues.some((expected) => comparableEquals(value, expected)))
      : expectedValues.some((expected) => comparableEquals(actualValue, expected));
  }

  if (operator === "notin" || operator === "not-in") {
    const expectedValues = Array.isArray(expectedValue) ? expectedValue : [expectedValue];
    return Array.isArray(actualValue)
      ? actualValue.every((value) => !expectedValues.some((expected) => comparableEquals(value, expected)))
      : !expectedValues.some((expected) => comparableEquals(actualValue, expected));
  }

  if (operator === "notequals" || operator === "not-equals" || operator === "!=") {
    return !comparableEquals(actualValue, expectedValue);
  }

  return comparableEquals(actualValue, expectedValue);
}

function allConditionsMatch(conditions, fields, values) {
  return normalizeConditions(conditions).every((condition) => conditionMatches(condition, fields, values));
}

export function isFieldConditionVisible(field, fields, values) {
  const config = getFieldConditionConfig(field);
  return allConditionsMatch(config.visibleWhen, fields, values)
    && allConditionsMatch(config.showWhen, fields, values);
}

export function isFieldRequiredNow(field, fields, values) {
  if (!isVisibleInputField(field) || !isFieldConditionVisible(field, fields, values)) {
    return false;
  }

  const config = getFieldConditionConfig(field);
  return Boolean(field.isRequired || (config.requiredWhen && allConditionsMatch(config.requiredWhen, fields, values)));
}

export function getActiveInputFields(fields, values) {
  return fields.filter((field) => isVisibleInputField(field) && isFieldConditionVisible(field, fields, values));
}

export function findMissingRequiredField(fields, values) {
  return getActiveInputFields(fields, values).find((field) =>
    isFieldRequiredNow(field, fields, values) && !hasFieldValue({ ...field, isRequired: true }, values[field.id])
  );
}

export function getFirstOrderSteps(steps = []) {
  if (!steps.length) {
    return [];
  }

  const firstOrder = Math.min(...steps.map((step) => Number(step.stepOrder || 0)));
  return steps.filter((step) => Number(step.stepOrder || 0) === firstOrder);
}

export function getFirstOrderFields(steps = []) {
  return flattenFields(getFirstOrderSteps(steps));
}

export function formatFieldValue(field, value) {
  if (!value) {
    return "";
  }

  switch (field?.dataType) {
    case "number":
      return value.valueNumber ?? "";
    case "date":
      return value.valueDate ? dayjs(value.valueDate).format("DD/MM/YYYY") : "";
    case "datetime":
      return value.valueDateTime ? dayjs(value.valueDateTime).format("DD/MM/YYYY HH:mm") : "";
    case "boolean":
      return value.valueBool === null || value.valueBool === undefined ? "" : value.valueBool ? "Yes" : "No";
    case "multi-select":
      try {
        return JSON.parse(value.valueJson || "[]").join(", ");
      } catch {
        return value.valueJson || "";
      }
    case "file":
      return value.files?.length ? value.files.map((file) => file.fileName).join(", ") : "";
    case "stored-procedure":
      try {
        const result = JSON.parse(value.valueJson || "{}");
        const rows = result.rows || result.Rows || [];
        return Array.isArray(rows) ? `${rows.length} row(s)` : "Executed";
      } catch {
        return value.valueJson || "";
      }
    case "table":
      try {
        return value.valueJson ? JSON.parse(value.valueJson) : [];
      } catch {
        return [];
      }
    case "userpicker":
      return value.valueUser || "";
    default:
      return value.valueText || "";
  }
}

export function getFormValueFromStoredValue(field, value) {
  if (!value) {
    return getFieldInitialValue(field);
  }

  switch (field.dataType) {
    case "number":
      return value.valueNumber ?? "";
    case "date":
      return value.valueDate ? dayjs(value.valueDate).format("YYYY-MM-DD") : "";
    case "datetime":
      return value.valueDateTime || "";
    case "boolean":
      return Boolean(value.valueBool);
    case "multi-select":
      try {
        return JSON.parse(value.valueJson || "[]");
      } catch {
        return [];
      }
    case "file":
      return { files: [], existingFiles: value.files || [] };
    case "stored-procedure":
      try {
        return value.valueJson ? JSON.parse(value.valueJson) : null;
      } catch {
        return null;
      }
    case "table":
      try {
        return value.valueJson ? JSON.parse(value.valueJson) : [];
      } catch {
        return [];
      }
    case "userpicker":
      return value.valueUser || "";
    default:
      return value.valueText || "";
  }
}

function getTableCellFormValue(cell) {
  if (!cell) {
    return "";
  }

  if (cell.valueText !== null && cell.valueText !== undefined && cell.valueText !== "") {
    return cell.valueText;
  }

  if (cell.valueNumber !== null && cell.valueNumber !== undefined) {
    return cell.valueNumber;
  }

  if (cell.valueDate !== null && cell.valueDate !== undefined && cell.valueDate !== "") {
    return cell.valueDate;
  }

  if (cell.valueDateTime !== null && cell.valueDateTime !== undefined && cell.valueDateTime !== "") {
    return cell.valueDateTime;
  }

  if (cell.valueBool !== null && cell.valueBool !== undefined) {
    return cell.valueBool;
  }

  if (cell.valueJson !== null && cell.valueJson !== undefined && cell.valueJson !== "") {
    try {
      return JSON.parse(cell.valueJson);
    } catch {
      return cell.valueJson;
    }
  }

  return "";
}

function getTableRowsFormValue(field, tableRows) {
  return tableRows
    .filter((row) => String(row.fieldId) === String(field.id))
    .sort((left, right) => Number(left.rowIndex || 0) - Number(right.rowIndex || 0))
    .map((row, index) => ({
      rowIndex: row.rowIndex || index + 1,
      cells: (row.cells || []).reduce((cells, cell) => ({
        ...cells,
        [cell.columnKey]: getTableCellFormValue(cell),
      }), {}),
    }));
}

export function buildRequestValuesFromDetail(fields, values, tableRows = []) {
  const valueMap = new Map(values.map((value) => [String(value.fieldId), value]));

  return fields.reduce((nextValues, field) => ({
    ...nextValues,
    [field.id]: field.dataType === "table" && getTableRowsFormValue(field, tableRows).length
      ? getTableRowsFormValue(field, tableRows)
      : getFormValueFromStoredValue(field, valueMap.get(String(field.id))),
  }), {});
}

export function hasFieldValue(field, value) {
  if (!field.isRequired || field.dataType === "boolean") {
    return true;
  }

  if (field.dataType === "file") {
    return Boolean(value?.files?.length || value?.existingFiles?.length);
  }

  if (field.dataType === "table") {
    return Array.isArray(value) && value.length > 0;
  }

  if (field.dataType === "stored-procedure") {
    return Boolean(value && (value.rows || value.Rows));
  }

  return Array.isArray(value) ? value.length > 0 : value !== "" && value !== null && value !== undefined;
}

export function getStoredProcedureConfig(field) {
  try {
    const config = JSON.parse(field.validationJson || "{}");
    return {
      connectionName: config.connectionName || config.ConnectionName || "",
      procedureName: config.procedureName || config.ProcedureName || "",
      parameters: Array.isArray(config.parameters || config.Parameters) ? (config.parameters || config.Parameters) : [],
    };
  } catch {
    return { connectionName: "", procedureName: "", parameters: [] };
  }
}

export function validateStepForm(form) {
  if (!form.stepName.trim()) {
    return "Step name is required.";
  }

  const selfResolvedApproverTypes = ["NoApproval", "HOD", "Requester"];
  if (!selfResolvedApproverTypes.includes(form.approverType) && !form.approverValue.trim()) {
    return "Approver value is required.";
  }

  if (form.approvalMode === "ParallelAny" && (!form.minApproveCount || Number(form.minApproveCount) <= 0)) {
    return "Min approve count is required for ParallelAny.";
  }

  if (form.reminderHours !== "" && (!Number.isFinite(Number(form.reminderHours)) || Number(form.reminderHours) <= 0)) {
    return "Reminder hours must be greater than 0.";
  }

  if (!["AnyReject", "AllReject"].includes(form.parallelRejectPolicy || "AnyReject")) {
    return "Parallel reject policy is invalid.";
  }

  return "";
}

export function validateFieldForm(form) {
  if (!form.fieldKey.trim() || !form.label.trim()) {
    return "Field key and label are required.";
  }

  if ((form.dataType === "select" || form.dataType === "multi-select")
    && (form.optionSourceType || "Static") === "Static"
    && !form.options.some((option) => option.value.trim() && option.label.trim() && option.isActive)) {
    return "Select fields require at least one active option.";
  }

  return "";
}

export function downloadJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function getReportRowWorkflowId(row) {
  return row.WorkflowID ?? row.workflowID ?? row.workflowId;
}

export function getReportValueFieldId(value) {
  return String(value.FieldID ?? value.fieldID ?? value.fieldId ?? "");
}

function makeUniqueHeaders(columns) {
  const counts = new Map();
  return columns.map((column) => {
    const nextCount = (counts.get(column.header) || 0) + 1;
    counts.set(column.header, nextCount);
    return {
      ...column,
      header: nextCount === 1 ? column.header : `${column.header} (${nextCount})`,
    };
  });
}

export function downloadCsv(rows, filename, fieldLabelMap = new Map()) {
  const fieldKeys = Array.from(new Set(rows.flatMap((row) =>
    (row.Values ?? row.values ?? []).map(getReportValueFieldId).filter(Boolean)
  )));
  const tableKeys = Array.from(new Set(rows.flatMap((row) =>
    (row.TableRows ?? row.tableRows ?? []).flatMap((tableRow) =>
      (tableRow.Cells ?? tableRow.cells ?? []).map((cell) => `${tableRow.FieldID ?? tableRow.fieldId}.${cell.ColumnKey ?? cell.columnKey}`)
    )
  )));
  const columns = makeUniqueHeaders([
    { key: "ID", header: "ID" },
    { key: "RequestNo", header: "RequestNo" },
    { key: "WorkflowID", header: "WorkflowID" },
    { key: "Title", header: "Title" },
    { key: "Status", header: "Status" },
    { key: "SubmittedBy", header: "SubmittedBy" },
    { key: "SubmittedAt", header: "SubmittedAt" },
    { key: "CompletedAt", header: "CompletedAt" },
    { key: "CreatedAt", header: "CreatedAt" },
    { key: "UpdatedAt", header: "UpdatedAt" },
    ...fieldKeys.map((key) => ({ key, header: fieldLabelMap.get(key) || `Field ${key}` })),
    ...tableKeys.map((key) => {
      const [fieldId, columnKey] = key.split(".");
      return { key, header: `${fieldLabelMap.get(fieldId) || `Field ${fieldId}`}.${columnKey}` };
    }),
  ]);
  const csvRows = [
    columns.map((column) => `"${column.header.replaceAll('"', '""')}"`).join(","),
    ...rows.map((row) => {
      const fieldValueMap = new Map((row.Values ?? row.values ?? []).map((value) => [
        getReportValueFieldId(value),
        formatReportFieldValue(value),
      ]));
      (row.TableRows ?? row.tableRows ?? []).forEach((tableRow) => {
        (tableRow.Cells ?? tableRow.cells ?? []).forEach((cell) => {
          const key = `${tableRow.FieldID ?? tableRow.fieldId}.${cell.ColumnKey ?? cell.columnKey}`;
          const current = fieldValueMap.get(key);
          const nextValue = formatReportFieldValue(cell);
          fieldValueMap.set(key, current ? `${current}; ${nextValue}` : nextValue);
        });
      });

      return columns
        .map((column) => `"${String(fieldValueMap.get(column.key) ?? row[column.key] ?? row[column.key.charAt(0).toLowerCase() + column.key.slice(1)] ?? "").replaceAll('"', '""')}"`)
        .join(",");
    }),
  ];
  const blob = new Blob([`\uFEFF${csvRows.join("\r\n")}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function formatReportFieldValue(value) {
  if (value.ValueText ?? value.valueText) {
    return value.ValueText ?? value.valueText;
  }
  if ((value.ValueNumber ?? value.valueNumber) !== null && (value.ValueNumber ?? value.valueNumber) !== undefined) {
    return value.ValueNumber ?? value.valueNumber;
  }
  if (value.ValueDate ?? value.valueDate) {
    return value.ValueDate ?? value.valueDate;
  }
  if (value.ValueDateTime ?? value.valueDateTime) {
    return value.ValueDateTime ?? value.valueDateTime;
  }
  if ((value.ValueBool ?? value.valueBool) !== null && (value.ValueBool ?? value.valueBool) !== undefined) {
    return value.ValueBool ?? value.valueBool ? "Yes" : "No";
  }
  if (value.ValueUser ?? value.valueUser) {
    return value.ValueUser ?? value.valueUser;
  }
  return value.ValueJson ?? value.valueJson ?? "";
}
