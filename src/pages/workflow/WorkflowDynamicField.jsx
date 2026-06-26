import { Alert, Checkbox, FormControlLabel, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";
import { WorkflowFileField, WorkflowMultiSelectField, WorkflowSelectField, WorkflowTableField } from "./WorkflowFieldInputs";
import { getStoredProcedureConfig, isFieldConditionVisible, isFieldRequiredNow, isVisibleInputField } from "./workflowUtils";

export function WorkflowDynamicField({
  field,
  fields,
  values,
  onChange,
  preview = false,
  showStoredProcedure = false,
}) {
  if (!field) {
    return null;
  }

  if (field.dataType === "stored-procedure") {
    if (!showStoredProcedure) {
      return null;
    }

    const config = getStoredProcedureConfig(field);
    return (
      <Alert severity="info" variant="outlined">
        {field.label || field.fieldKey}: runs automatically on approval
        {config.procedureName ? ` (${config.procedureName})` : ""}
      </Alert>
    );
  }

  if (!isVisibleInputField(field) || !isFieldConditionVisible(field, fields, values)) {
    return null;
  }

  const value = values[field.id];
  const required = isFieldRequiredNow(field, fields, values);
  const setValue = (nextValue) => onChange(field.id, nextValue);

  if (field.dataType === "boolean") {
    return (
      <FormControlLabel
        control={<Checkbox checked={Boolean(value)} onChange={(event) => setValue(event.target.checked)} />}
        label={field.label}
      />
    );
  }

  if (field.dataType === "select") {
    return <WorkflowSelectField field={field} value={value} onChange={setValue} required={required} values={values} fields={fields} />;
  }

  if (field.dataType === "multi-select") {
    return <WorkflowMultiSelectField field={field} value={value} onChange={setValue} required={required} values={values} fields={fields} />;
  }

  if (field.dataType === "date") {
    return (
      <DatePicker
        label={field.label}
        value={value ? dayjs(value) : null}
        onChange={(nextValue) => setValue(nextValue?.isValid() ? nextValue.format("YYYY-MM-DD") : "")}
        slotProps={{ textField: { fullWidth: true, required, placeholder: field.placeholder || undefined } }}
      />
    );
  }

  if (field.dataType === "datetime") {
    return (
      <DateTimePicker
        label={field.label}
        value={value ? dayjs(value) : null}
        onChange={(nextValue) => setValue(nextValue?.isValid() ? nextValue.toISOString() : "")}
        slotProps={{ textField: { fullWidth: true, required, placeholder: field.placeholder || undefined } }}
      />
    );
  }

  if (field.dataType === "file") {
    return (
      <WorkflowFileField
        field={{ ...field, isRequired: required }}
        value={value}
        onChange={setValue}
        preview={preview}
      />
    );
  }

  if (field.dataType === "table") {
    return (
      <WorkflowTableField
        field={{ ...field, isRequired: required }}
        value={value}
        onChange={setValue}
        preview={preview}
      />
    );
  }

  return (
    <TextField
      label={field.label}
      type={field.dataType === "number" ? "number" : "text"}
      value={value ?? ""}
      onChange={(event) => setValue(event.target.value)}
      required={required}
      placeholder={field.placeholder || undefined}
      multiline={field.dataType === "textarea"}
      minRows={field.dataType === "textarea" ? 3 : undefined}
      fullWidth
    />
  );
}
