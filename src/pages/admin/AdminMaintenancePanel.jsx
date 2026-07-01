import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Tooltip,
  IconButton,
} from "@mui/material";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import { SectionCard } from "../../components/layout/SectionCard";
import { useNotifier } from "../../hooks/useNotifier";
import { maintenanceApi } from "../../services/api/maintenanceApi";

const DEFAULT_FORM = {
  maintenanceEnable: false,
  maintenanceTitle: "DMS Portal is under maintenance",
  maintenanceMessage:
    "The portal is temporarily unavailable. Please try again later.",
};

function getErrorMessage(error, fallback) {
  const responseData = error.response?.data;

  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  return (
    responseData?.detail ||
    responseData?.message ||
    responseData?.title ||
    error.message ||
    fallback
  );
}

export function AdminMaintenancePanel() {
  const { notify } = useNotifier();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const status = await maintenanceApi.getStatus();
      setForm({
        maintenanceEnable: status.maintenanceEnable,
        maintenanceTitle: status.maintenanceTitle,
        maintenanceMessage: status.maintenanceMessage,
      });
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, "Could not load maintenance settings."),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateField = (field) => (event) => {
    const value =
      field === "maintenanceEnable" ? event.target.checked : event.target.value;
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const status = await maintenanceApi.updateSettings(form);
      setForm({
        maintenanceEnable: status.maintenanceEnable,
        maintenanceTitle: status.maintenanceTitle,
        maintenanceMessage: status.maintenanceMessage,
      });
      notify({
        message: "Maintenance settings saved.",
        severity: "success",
      });
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, "Could not save maintenance settings."),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionCard
      title="Maintenance mode"
      subtitle="Temporarily show a maintenance notice instead of the portal when required."
      action={
        <Tooltip title="Refresh maintenance settings">
          <span>
            <IconButton
              color="primary"
              onClick={loadSettings}
              disabled={loading || saving}
            >
              {loading ? (
                <CircularProgress size={20} />
              ) : (
                <RefreshRoundedIcon />
              )}
            </IconButton>
          </span>
        </Tooltip>
      }
    >
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2.5}>
          {error ? (
            <Alert severity="error" variant="outlined">
              {error}
            </Alert>
          ) : null}

          <FormControlLabel
            control={
              <Switch
                checked={form.maintenanceEnable}
                onChange={updateField("maintenanceEnable")}
                disabled={loading || saving}
              />
            }
            label="Enable maintenance mode"
          />

          <TextField
            label="Maintenance title"
            value={form.maintenanceTitle}
            onChange={updateField("maintenanceTitle")}
            required
            fullWidth
            disabled={loading || saving}
            inputProps={{ maxLength: 200 }}
          />

          <TextField
            label="Maintenance message"
            value={form.maintenanceMessage}
            onChange={updateField("maintenanceMessage")}
            required
            fullWidth
            multiline
            minRows={4}
            disabled={loading || saving}
            inputProps={{ maxLength: 1000 }}
          />

          <Stack direction="row" justifyContent="flex-end">
            <Button
              type="submit"
              variant="contained"
              startIcon={
                saving ? (
                  <CircularProgress color="inherit" size={18} />
                ) : (
                  <SaveRoundedIcon />
                )
              }
              disabled={loading || saving}
            >
              Save settings
            </Button>
          </Stack>
        </Stack>
      </Box>
    </SectionCard>
  );
}
