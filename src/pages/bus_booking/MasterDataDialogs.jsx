import AddRoundedIcon from "@mui/icons-material/AddRounded";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from "@mui/material";
import { AppSelectField } from "../../components/forms/AppSelectField";
import { AppTextField } from "../../components/forms/AppTextField";
import { vehicleStatusOptions } from "./constants";

export function VehicleDialog({
  dialog,
  form,
  setForm,
  submitting,
  submitError,
  onClose,
  onSubmit,
}) {
  return (
    <Dialog open={dialog.open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {dialog.mode === "edit" ? "Edit vehicle" : "Create vehicle"}
      </DialogTitle>
      <DialogContent dividers>
        <Stack
          component="form"
          spacing={2.5}
          sx={{ mt: 0.5 }}
          onSubmit={onSubmit}
        >
          {submitError ? (
            <Alert severity="error" variant="outlined">
              {submitError}
            </Alert>
          ) : null}

          <AppTextField
            label="Driver name"
            value={form.driverName}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                driverName: event.target.value,
              }))
            }
            required
            fullWidth
          />
          <AppTextField
            label="Phone number"
            value={form.phoneNumber}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                phoneNumber: event.target.value,
              }))
            }
            required
            fullWidth
          />
          <AppTextField
            label="Plate number"
            value={form.plateNumber}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                plateNumber: event.target.value,
              }))
            }
            required
            fullWidth
          />
          <AppSelectField
            label="Status"
            value={form.status}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                status: event.target.value,
              }))
            }
            options={vehicleStatusOptions}
            required
            fullWidth
          />

          <DialogActions sx={{ px: 0 }}>
            <Button onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={
                submitting ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <AddRoundedIcon />
                )
              }
              disabled={submitting}
            >
              {dialog.mode === "edit" ? "Save vehicle" : "Create vehicle"}
            </Button>
          </DialogActions>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

export function LocationDialog({
  dialog,
  form,
  setForm,
  submitting,
  submitError,
  onClose,
  onSubmit,
}) {
  return (
    <Dialog open={dialog.open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {dialog.mode === "edit" ? "Edit location" : "Create location"}
      </DialogTitle>
      <DialogContent dividers>
        <Stack
          component="form"
          spacing={2.5}
          sx={{ mt: 0.5 }}
          onSubmit={onSubmit}
        >
          {submitError ? (
            <Alert severity="error" variant="outlined">
              {submitError}
            </Alert>
          ) : null}

          <AppTextField
            label="Gate"
            value={form.gate}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                gate: event.target.value,
              }))
            }
            required
            fullWidth
          />
          <AppTextField
            label="CCN"
            value={form.ccn}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                ccn: event.target.value,
              }))
            }
            required
            fullWidth
          />

          <DialogActions sx={{ px: 0 }}>
            <Button onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={
                submitting ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <AddRoundedIcon />
                )
              }
              disabled={submitting}
            >
              {dialog.mode === "edit" ? "Save location" : "Create location"}
            </Button>
          </DialogActions>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
