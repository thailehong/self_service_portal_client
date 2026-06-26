import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import { Alert, Autocomplete, Box, Button, Chip, FormControl, IconButton, InputLabel, MenuItem, Select, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { createFilterOptions } from "@mui/material/Autocomplete";
import { useEffect, useState } from "react";
import { DragDropUpload } from "../../components/upload/DragDropUpload";
import { workflowApi } from "../../services/api/workflowApi";
import { getErrorMessage, getStoredProcedureConfig } from "./workflowUtils";

export function getTableColumns(field) {
  const config = getTableConfig(field);
  const columns = resolveTableColumns(config);

  return Array.isArray(columns)
    ? columns.map((column) => ({
      ...column,
      key: column.key ?? column.Key ?? column.columnKey ?? column.ColumnKey ?? "",
      label: column.label ?? column.Label ?? column.name ?? column.Name ?? column.key ?? column.Key ?? "",
      dataType: String(column.dataType ?? column.DataType ?? "text").toLowerCase(),
      required: Boolean(column.required ?? column.Required),
      maxLength: column.maxLength ?? column.MaxLength ?? null,
      options: column.options ?? column.Options ?? [],
    })).filter((column) => column.key)
    : [];
}

function readConfigValue(config, keys) {
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    return undefined;
  }

  const matchingKey = Object.keys(config).find((key) => keys.some((candidate) => key.toLowerCase() === candidate.toLowerCase()));
  return matchingKey ? config[matchingKey] : undefined;
}

function parseNestedConfig(value) {
  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function resolveTableColumns(config) {
  const parsedConfig = parseNestedConfig(config);
  if (Array.isArray(parsedConfig)) {
    return parsedConfig;
  }

  if (!parsedConfig || typeof parsedConfig !== "object") {
    return [];
  }

  const directColumns = readConfigValue(parsedConfig, ["columns", "tableColumns"]);
  if (Array.isArray(directColumns)) {
    return directColumns;
  }

  const nestedConfig = readConfigValue(parsedConfig, ["schema", "table", "tableField", "tableSchema", "tableConfig"]);
  return nestedConfig ? resolveTableColumns(nestedConfig) : [];
}

function getTableConfig(field) {
  try {
    let config = JSON.parse(field?.validationJson ?? field?.ValidationJson ?? "{}");
    if (typeof config === "string") {
      config = JSON.parse(config);
    }

    return config || {};
  } catch {
    return {};
  }
}

function getColumnOptions(column) {
  const options = column.options || column.Options || [];
  return Array.isArray(options)
    ? options.map((option) => ({
      value: option.value ?? option.Value ?? "",
      label: option.label ?? option.Label ?? option.value ?? option.Value ?? "",
    })).filter((option) => option.value !== "")
    : [];
}

function getColumnValue(row, columnKey) {
  return (row?.cells || row || {})[columnKey];
}

function formatTableCellValue(column, value) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  if (column.dataType === "boolean") {
    return value === true || value === "true" ? "Yes" : "No";
  }

  if (column.dataType === "multi-select") {
    const values = Array.isArray(value) ? value : String(value).split(",").map((item) => item.trim()).filter(Boolean);
    const options = getColumnOptions(column);
    return values
      .map((item) => options.find((option) => String(option.value) === String(item))?.label || item)
      .join(", ");
  }

  if (column.dataType === "select") {
    return getColumnOptions(column).find((option) => String(option.value) === String(value))?.label || value;
  }

  return String(value);
}

function buildEmptyTableRow(columns, rowIndex) {
  const cells = columns.reduce((next, column) => ({ ...next, [column.key]: column.dataType === "multi-select" ? [] : "" }), {});
  return { rowIndex, cells };
}

const optionFilter = createFilterOptions({
  stringify: (option) => `${option?.label || ""} ${option?.value || ""}`,
});

export function WorkflowFileField({ field, value, onChange, preview = false }) {
  const currentValue = value && typeof value === "object" ? value : { files: [], existingFiles: [] };
  const files = Array.from(currentValue.files || []);
  const existingFiles = currentValue.existingFiles || [];
  const [downloadError, setDownloadError] = useState("");

  const downloadTemplate = async () => {
    if (!field.stepId || !field.stepTemplate) {
      return;
    }

    setDownloadError("");
    try {
      const result = await workflowApi.downloadFieldTemplate(field.id);
      const url = URL.createObjectURL(result.blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = field.stepTemplate?.fileName || `${field.fieldKey || "field"}_template.xlsx`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setDownloadError(getErrorMessage(error, "Could not download template."));
    }
  };

  return (
    <Stack spacing={1}>
      <Stack spacing={0.25}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" sx={{ flex: 1, minWidth: 0 }}>{field.label}{field.isRequired ? " *" : ""}</Typography>
          {field.stepTemplate ? (
            <Tooltip title="Download template">
              <Button size="small" variant="outlined" startIcon={<DownloadRoundedIcon />} onClick={downloadTemplate} disabled={preview} sx={{ ml: "auto", flexShrink: 0 }}>
                {field.stepTemplate.fileName || "Template"}
              </Button>
            </Tooltip>
          ) : null}
        </Stack>
        {existingFiles.length ? (
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            {existingFiles.map((file) => (
              <Chip key={`existing-${file.id}`} size="small" label={file.fileName} variant="outlined" />
            ))}
          </Stack>
        ) : null}
      </Stack>
      {downloadError ? <Alert severity="error">{downloadError}</Alert> : null}
      {preview ? (
        <Box sx={{ p: 1.5, borderRadius: 1, border: (theme) => `1px dashed ${theme.palette.divider}`, bgcolor: "background.default" }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <UploadFileRoundedIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">File upload preview</Typography>
            <Chip size="small" label="No upload" variant="outlined" sx={{ ml: "auto" }} />
          </Stack>
        </Box>
      ) : (
        <DragDropUpload
          files={files}
          onFilesChange={(nextFiles) => onChange({ ...currentValue, files: nextFiles })}
          multiple
          allowedExtensions={["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "png", "jpg", "jpeg", "gif", "bmp", "webp", "tif", "tiff"]}
          maxSizeMb={25}
          compact
        />
      )}
    </Stack>
  );
}

export function StoredProcedureField({ field, value, onChange }) {
  const config = getStoredProcedureConfig(field);
  const initialParameters = value?.parameters || value?.Parameters || {};
  const [parameters, setParameters] = useState(initialParameters);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState("");
  const rows = value?.rows || value?.Rows || [];

  useEffect(() => {
    setParameters(value?.parameters || value?.Parameters || {});
  }, [field.id, value]);

  const execute = async () => {
    setExecuting(true);
    setError("");

    try {
      const result = await workflowApi.executeStoredProcedure(field.id, parameters);
      onChange({ parameters, rows: result.Rows || result.rows || [] });
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Could not execute stored procedure."));
    } finally {
      setExecuting(false);
    }
  };

  return (
    <Stack spacing={1.25}>
      <Stack spacing={0.25}>
        <Typography variant="body2">{field.label}{field.isRequired ? " *" : ""}</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: "anywhere" }}>
          {config.connectionName || "Connection"} / {config.procedureName || "Stored procedure"}
        </Typography>
      </Stack>
      {error ? <Alert severity="error" variant="outlined">{error}</Alert> : null}
      {config.parameters.length ? (
        <Box sx={{ display: "grid", gap: 1, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" } }}>
          {config.parameters.map((parameter) => {
            const name = parameter.name || parameter.Name || "";
            const key = name.replace(/^@/, "");
            return (
              <TextField
                key={name || key}
                size="small"
                label={name || "Parameter"}
                value={parameters[key] ?? parameters[name] ?? ""}
                onChange={(event) => setParameters((current) => ({ ...current, [key]: event.target.value }))}
                required={Boolean(parameter.required ?? parameter.Required)}
              />
            );
          })}
        </Box>
      ) : null}
      <Stack direction="row" spacing={1} alignItems="center">
        <Button variant="outlined" startIcon={<PlayArrowRoundedIcon />} onClick={execute} disabled={executing || !config.procedureName}>
          Execute
        </Button>
        {Array.isArray(rows) && rows.length ? <Chip size="small" label={`${rows.length} row(s)`} color="success" variant="outlined" /> : null}
      </Stack>
    </Stack>
  );
}

export function WorkflowTableField({ field, value, onChange, preview = false }) {
  const config = getTableConfig(field);
  const columns = getTableColumns(field);
  const allowManualInput = config.allowManualInput ?? config.AllowManualInput ?? true;
  const allowExcelImport = Boolean(config.allowExcelImport ?? config.AllowExcelImport);
  const rows = Array.isArray(value) ? value : [];
  const visibleRows = rows.length || !columns.length ? rows : [buildEmptyTableRow(columns, 1)];
  const [excelBusy, setExcelBusy] = useState(false);
  const [excelError, setExcelError] = useState("");

  useEffect(() => {
    if (columns.length && Array.isArray(value) && value.length === 0) {
      onChange([buildEmptyTableRow(columns, 1)]);
    }
  }, [field.id, columns.length]);

  const setCell = (rowIndex, columnKey, nextValue) => {
    onChange(visibleRows.map((row, index) => (
      index === rowIndex
        ? { ...row, cells: { ...(row.cells || row), [columnKey]: nextValue } }
        : row
    )));
  };

  const addRow = () => {
    onChange([...visibleRows, buildEmptyTableRow(columns, visibleRows.length + 1)]);
  };

  const downloadTableTemplate = async () => {
    if (!field.id) {
      return;
    }

    setExcelError("");
    setExcelBusy(true);
    try {
      const result = await workflowApi.downloadTableFieldTemplate(field.id);
      const url = URL.createObjectURL(result.blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${field.fieldKey || "table"}_template.xlsx`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setExcelError(getErrorMessage(error, "Could not download table template."));
    } finally {
      setExcelBusy(false);
    }
  };

  const importTableExcel = async (file) => {
    if (!field.id || !file) {
      return;
    }

    setExcelError("");
    setExcelBusy(true);
    try {
      const result = await workflowApi.importTableFieldExcel(field.id, file);
      onChange(result.rows || []);
    } catch (error) {
      setExcelError(getErrorMessage(error, "Could not import Excel file."));
    } finally {
      setExcelBusy(false);
    }
  };

  return (
    <Stack spacing={1.25}>
      <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
        <Typography variant="body2" sx={{ flex: 1, minWidth: 0 }}>{field.label}{field.isRequired ? " *" : ""}</Typography>
        {allowExcelImport ? (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<DownloadRoundedIcon />}
              onClick={downloadTableTemplate}
              disabled={preview || excelBusy || !columns.length}
            >
              Template
            </Button>
            <Button
              size="small"
              variant="outlined"
              component="label"
              startIcon={<UploadFileRoundedIcon />}
              disabled={preview || excelBusy || !columns.length}
            >
              Import Excel
              <Box
                component="input"
                type="file"
                accept=".xlsx"
                sx={{ display: "none" }}
                onChange={(event) => {
                  void importTableExcel(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
            </Button>
          </Stack>
        ) : null}
      </Stack>
      {excelError ? <Alert severity="error" variant="outlined">{excelError}</Alert> : null}
      {!columns.length ? (
        <Alert severity="warning" variant="outlined">Table field requires columns in Validation JSON.</Alert>
      ) : null}
      {columns.length && allowManualInput ? (
        <Box sx={{ width: "100%", overflowX: "auto", border: (theme) => `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
          <Box
            sx={{
              minWidth: Math.max(560, columns.length * 190 + 96),
              display: "grid",
              gridTemplateColumns: `56px repeat(${Math.max(columns.length, 1)}, minmax(180px, 1fr)) 96px`,
            }}
          >
            <Box sx={{ p: 1, bgcolor: "background.default", borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
              <Typography variant="caption" color="text.secondary">#</Typography>
            </Box>
            {columns.map((column) => (
              <Box key={column.key} sx={{ p: 1, bgcolor: "background.default", borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
                <Typography variant="caption" color="text.secondary">{column.label || column.key}{column.required ? " *" : ""}</Typography>
              </Box>
            ))}
            <Box sx={{ p: 0.5, bgcolor: "background.default", borderBottom: (theme) => `1px solid ${theme.palette.divider}`, display: "flex", justifyContent: "center", alignItems: "center" }}>
              <Tooltip title="Add row">
                <IconButton size="small" color="primary" onClick={addRow}>
                  <AddRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            {visibleRows.map((row, rowIndex) => (
              <Box key={rowIndex} sx={{ display: "contents" }}>
                <Box sx={{ p: 1, borderTop: rowIndex ? (theme) => `1px solid ${theme.palette.divider}` : 0 }}>
                  <Chip size="small" label={rowIndex + 1} variant="outlined" />
                </Box>
                {columns.map((column) => {
                  const columnValue = getColumnValue(row, column.key);
                  const options = getColumnOptions(column);
                  const commonSx = { p: 1, minWidth: 0, borderTop: rowIndex ? (theme) => `1px solid ${theme.palette.divider}` : 0 };

                  if (column.dataType === "select") {
                    return (
                      <Box key={column.key} sx={commonSx}>
                        <FormControl size="small" fullWidth required={Boolean(column.required)}>
                          <InputLabel>{column.label || column.key}</InputLabel>
                          <Select
                            label={column.label || column.key}
                            value={columnValue ?? ""}
                            onChange={(event) => setCell(rowIndex, column.key, event.target.value)}
                          >
                            {options.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
                          </Select>
                        </FormControl>
                      </Box>
                    );
                  }

                  if (column.dataType === "multi-select") {
                    const selectedValues = Array.isArray(columnValue)
                      ? columnValue
                      : String(columnValue || "").split(",").map((item) => item.trim()).filter(Boolean);
                    return (
                      <Box key={column.key} sx={commonSx}>
                        <Autocomplete
                          multiple
                          size="small"
                          options={options}
                          value={options.filter((option) => selectedValues.includes(String(option.value)))}
                          onChange={(_, selected) => setCell(rowIndex, column.key, selected.map((option) => option.value))}
                          getOptionLabel={(option) => option.label}
                          renderInput={(params) => <TextField {...params} label={column.label || column.key} required={Boolean(column.required)} />}
                        />
                      </Box>
                    );
                  }

                  if (column.dataType === "boolean") {
                    return (
                      <Box key={column.key} sx={commonSx}>
                        <FormControl size="small" fullWidth required={Boolean(column.required)}>
                          <InputLabel>{column.label || column.key}</InputLabel>
                          <Select
                            label={column.label || column.key}
                            value={columnValue === true || columnValue === "true" ? "true" : columnValue === false || columnValue === "false" ? "false" : ""}
                            onChange={(event) => setCell(rowIndex, column.key, event.target.value === "true")}
                          >
                            <MenuItem value="">-</MenuItem>
                            <MenuItem value="true">Yes</MenuItem>
                            <MenuItem value="false">No</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    );
                  }

                  return (
                    <Box key={column.key} sx={commonSx}>
                      <TextField
                        size="small"
                        label={column.label || column.key}
                        type={column.dataType === "number" ? "number" : column.dataType === "date" ? "date" : column.dataType === "datetime" ? "datetime-local" : "text"}
                        value={columnValue ?? ""}
                        onChange={(event) => setCell(rowIndex, column.key, event.target.value)}
                        required={Boolean(column.required)}
                        multiline={column.dataType === "textarea"}
                        minRows={column.dataType === "textarea" ? 2 : undefined}
                        InputLabelProps={["date", "datetime"].includes(column.dataType) ? { shrink: true } : undefined}
                        slotProps={["date", "datetime"].includes(column.dataType) ? { inputLabel: { shrink: true } } : undefined}
                        placeholder={["date", "datetime"].includes(column.dataType) ? "" : undefined}
                        fullWidth
                      />
                    </Box>
                  );
                })}
                <Box sx={{ p: 0.5, borderTop: rowIndex ? (theme) => `1px solid ${theme.palette.divider}` : 0, display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <Tooltip title="Remove row">
                    <span>
                      <IconButton size="small" color="error" onClick={() => onChange(visibleRows.filter((_, index) => index !== rowIndex))} disabled={visibleRows.length <= 1}>
                        <DeleteOutlineRoundedIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      ) : null}
      {columns.length && !allowManualInput ? (
        <Alert severity="info" variant="outlined">Download the template and import Excel to fill this table.</Alert>
      ) : null}
    </Stack>
  );
}

export function WorkflowTableValueDisplay({ field, value, tableRows = [] }) {
  const columns = getTableColumns(field);
  let rows = Array.isArray(value) ? value : [];
  if (!rows.length && tableRows.length) {
    rows = tableRows.map((row) => ({
      rowIndex: row.rowIndex,
      cells: (row.cells || []).reduce((next, cell) => ({
        ...next,
        [cell.columnKey]: cell.valueText ?? cell.valueNumber ?? cell.valueDate ?? cell.valueDateTime ?? cell.valueBool ?? cell.valueJson ?? "",
      }), {}),
    }));
  }

  if (!columns.length || !rows.length) {
    return <Typography variant="body2" color="text.secondary">&nbsp;</Typography>;
  }

  return (
    <Box sx={{ width: "100%", overflowX: "auto", mt: 0.75 }}>
      <Box
        sx={{
          minWidth: Math.max(520, columns.length * 160 + 48),
          display: "grid",
          gridTemplateColumns: `48px repeat(${columns.length}, minmax(150px, 1fr))`,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: 0.75, bgcolor: "background.default" }}><Typography variant="caption" color="text.secondary">#</Typography></Box>
        {columns.map((column) => (
          <Box key={column.key} sx={{ p: 0.75, bgcolor: "background.default" }}>
            <Typography variant="caption" color="text.secondary">{column.label || column.key}</Typography>
          </Box>
        ))}
        {rows.map((row, rowIndex) => (
          <Box key={rowIndex} sx={{ display: "contents" }}>
            <Box sx={{ p: 0.75, borderTop: (theme) => `1px solid ${theme.palette.divider}` }}>
              <Typography variant="body2">{rowIndex + 1}</Typography>
            </Box>
            {columns.map((column) => (
              <Box key={column.key} sx={{ p: 0.75, minWidth: 0, borderTop: (theme) => `1px solid ${theme.palette.divider}` }}>
                <Typography variant="body2" sx={{ overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}>
                  {formatTableCellValue(column, getColumnValue(row, column.key)) || "\u00a0"}
                </Typography>
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export function WorkflowSelectField({ field, value, onChange, required, values, fields }) {
  const [options, setOptions] = useState(field.options?.filter((option) => option.isActive) || []);

  useEffect(() => {
    let active = true;
    if ((field.optionSourceType || "Static") === "Static") {
      setOptions(field.options?.filter((option) => option.isActive) || []);
      return undefined;
    }

    workflowApi.resolveFieldOptions(field.id, values || {}, fields || [])
      .then((items) => {
        if (active) {
          setOptions(items);
        }
      })
      .catch(() => {
        if (active) {
          setOptions([]);
        }
      });

    return () => {
      active = false;
    };
  }, [field.id, field.optionSourceType, JSON.stringify(values || {})]);

  const selectedOption = options.find((option) => String(option.value) === String(value || "")) || null;

  return (
    <Autocomplete
      options={options}
      value={selectedOption}
      onChange={(_, selected) => onChange(selected?.value || "")}
      filterOptions={optionFilter}
      getOptionLabel={(option) => option?.label || ""}
      isOptionEqualToValue={(option, selected) => String(option.value) === String(selected.value)}
      renderOption={(props, option) => (
        <Box component="li" {...props} key={option.value}>
          <Stack spacing={0.25} sx={{ minWidth: 0 }}>
            <Typography variant="body2">{option.label}</Typography>
            {String(option.value) !== String(option.label) ? (
              <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: "anywhere" }}>{option.value}</Typography>
            ) : null}
          </Stack>
        </Box>
      )}
      renderInput={(params) => <TextField {...params} label={field.label} required={required} placeholder={field.placeholder || undefined} />}
    />
  );
}

export function WorkflowMultiSelectField({ field, value, onChange, required, values, fields }) {
  const [options, setOptions] = useState(field.options?.filter((option) => option.isActive) || []);

  useEffect(() => {
    let active = true;
    if ((field.optionSourceType || "Static") === "Static") {
      setOptions(field.options?.filter((option) => option.isActive) || []);
      return undefined;
    }

    workflowApi.resolveFieldOptions(field.id, values || {}, fields || [])
      .then((items) => {
        if (active) {
          setOptions(items);
        }
      })
      .catch(() => {
        if (active) {
          setOptions([]);
        }
      });

    return () => {
      active = false;
    };
  }, [field.id, field.optionSourceType, JSON.stringify(values || {})]);

  return (
    <Autocomplete
      multiple
      options={options}
      value={options.filter((option) => (value || []).map(String).includes(String(option.value)))}
      onChange={(_, selected) => onChange(selected.map((option) => option.value))}
      filterOptions={optionFilter}
      getOptionLabel={(option) => option?.label || ""}
      isOptionEqualToValue={(option, selected) => String(option.value) === String(selected.value)}
      renderOption={(props, option) => (
        <Box component="li" {...props} key={option.value}>
          <Stack spacing={0.25} sx={{ minWidth: 0 }}>
            <Typography variant="body2">{option.label}</Typography>
            {String(option.value) !== String(option.label) ? (
              <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: "anywhere" }}>{option.value}</Typography>
            ) : null}
          </Stack>
        </Box>
      )}
      renderInput={(params) => <TextField {...params} label={field.label} required={required} placeholder={field.placeholder || undefined} />}
    />
  );
}
