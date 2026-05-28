export const approvalModes = ["Sequential", "ParallelAll", "ParallelAny"];
export const approverTypes = ["User", "Users", "WorkflowPermission", "HOD", "NoApproval"];
export const principalTypes = ["User"];
export const permissions = ["Owner", "Approver", "User", "Viewer", "Reporter"];
export const workflowApproverPermissions = ["Owner", "Approver", "User", "Viewer", "Reporter"];
export const statusOptions = ["", "Draft", "InProgress", "Completed", "Rejected", "Cancelled"];
export const fieldTypes = ["text", "textarea", "number", "date", "datetime", "boolean", "select", "multi-select", "userpicker", "file", "stored-procedure"];

export const conditionalValidationTemplate = `{
  "visibleWhen": { "fieldKey": "Answer", "operator": "equals", "value": "No" },
  "requiredWhen": { "fieldKey": "Answer", "operator": "equals", "value": "No" }
}`;

export const initialWorkflowForm = {
  code: "",
  name: "",
  description: "",
  isActive: true,
  isPublic: false,
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
};

export const initialFieldForm = {
  fieldKey: "",
  label: "",
  dataType: "text",
  isRequired: false,
  defaultValue: "",
  validationJson: "",
  displayOrder: 1,
  options: [],
};

export const initialPermissionForm = {
  principalType: "User",
  principalValue: "",
  permission: "User",
};
