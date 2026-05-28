import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import { Alert, Box, Button, Chip, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { DragDropUpload } from "../../components/upload/DragDropUpload";
import { workflowApi } from "../../services/api/workflowApi";
import { getErrorMessage, getStoredProcedureConfig } from "./workflowUtils";

export function WorkflowFileField({ field, value, onChange }) {
  const currentValue = value && typeof value === "object" ? value : { files: [], existingFiles: [] };
  const files = Array.from(currentValue.files || []);
  const existingFiles = currentValue.existingFiles || [];

  return (
    <Stack spacing={1}>
      <Stack spacing={0.25}>
        <Typography variant="body2">{field.label}{field.isRequired ? " *" : ""}</Typography>
        {existingFiles.length ? (
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            {existingFiles.map((file) => (
              <Chip key={`existing-${file.id}`} size="small" label={file.fileName} variant="outlined" />
            ))}
          </Stack>
        ) : null}
      </Stack>
      <DragDropUpload
        files={files}
        onFilesChange={(nextFiles) => onChange({ ...currentValue, files: nextFiles })}
        multiple
        allowedExtensions={["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "png", "jpg", "jpeg", "gif", "bmp", "webp", "tif", "tiff"]}
        maxSizeMb={25}
      />
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
