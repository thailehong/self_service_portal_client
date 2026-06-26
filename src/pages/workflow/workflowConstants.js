export const approvalModes = ["Sequential", "ParallelAll", "ParallelAny"];
export const parallelRejectPolicies = ["AnyReject", "AllReject"];
export const approverTypes = ["User", "Users", "WorkflowPermission", "Group", "HOD", "Requester", "NoApproval"];
export const principalTypes = ["User", "Group"];
export const permissions = ["Owner", "Approver", "User", "Viewer", "Reporter"];
export const workflowApproverPermissions = ["Owner", "Approver", "User", "Viewer", "Reporter"];
export const statusOptions = ["", "Draft", "InProgress", "Completed", "Rejected", "Cancelled"];
export const fieldTypes = ["text", "textarea", "number", "date", "datetime", "boolean", "select", "multi-select", "userpicker", "file", "stored-procedure", "table"];
export const optionSourceTypes = ["Static", "StoredProcedure", "SqlQuery"];
export const versionModes = ["SnapshotOnCreate", "LatestApproved"];

export const conditionalValidationTemplate = `{
  "visibleWhen": { "fieldKey": "Answer", "operator": "equals", "value": "No" },
  "requiredWhen": { "fieldKey": "Answer", "operator": "equals", "value": "No" }
}`;

export const initialWorkflowForm = {
  code: "",
  name: "",
  description: "",
  ccn: "",
  bu: "",
  department: "",
  isActive: true,
  isPublic: false,
  versionMode: "SnapshotOnCreate",
  mail: "",
  mailProfileName: "",
};

export const initialStepForm = {
  stepOrder: 1,
  stepGroup: "",
  stepCode: "",
  stepName: "",
  approvalMode: "Sequential",
  approverType: "User",
  approverValue: "",
  isRequired: true,
  minApproveCount: "",
  reminderHours: "",
  parallelRejectPolicy: "AnyReject",
  parallelWithStepId: "",
};

export const initialFieldForm = {
  fieldKey: "",
  label: "",
  dataType: "text",
  isRequired: false,
  defaultValue: "",
  placeholder: "",
  optionSourceType: "Static",
  validationJson: "",
  displayOrder: 1,
  options: [],
};

export const initialPermissionForm = {
  principalType: "User",
  principalValue: "",
  permission: "User",
};

export const initialGroupForm = {
  groupCode: "",
  groupName: "",
  description: "",
  isActive: true,
  members: "",
};

export const initialTransitionRuleForm = {
  fromStepId: "",
  action: "Approve",
  targetType: "NextStep",
  targetStepId: "",
  conditionJson: "",
  priority: 0,
  isDefault: false,
  isActive: true,
};
