import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import DirectionsBusRoundedIcon from "@mui/icons-material/DirectionsBusRounded";
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
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AppSelectField } from "../../components/forms/AppSelectField";
import { AppTextField } from "../../components/forms/AppTextField";

export function AssignRequestDialog({
  open,
  onClose,
  assignRequest,
  assignMode,
  assignForm,
  setAssignForm,
  availableVehicles,
  assignSubmitting,
  assignError,
  onSubmit,
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {assignRequest
          ? assignMode === "assign"
            ? `Assign vehicle for request #${assignRequest.id}`
            : `Reject request #${assignRequest.id}`
          : "Assign vehicle"}
      </DialogTitle>
      <DialogContent dividers>
        <Stack
          component="form"
          spacing={2.5}
          sx={{ mt: 0.5 }}
          onSubmit={onSubmit}
        >
          {assignError ? (
            <Alert severity="error" variant="outlined">
              {assignError}
            </Alert>
          ) : null}

          {assignRequest ? (
            <Alert severity="info" variant="outlined">
              {assignRequest.employeeName || assignRequest.employeeId} requested{" "}
              {assignRequest.typeOfTransport} from {assignRequest.pickupPoint}{" "}
              to {assignRequest.dropoffPoint}.
            </Alert>
          ) : null}

          {assignMode === "assign" ? (
            <>
              <AppSelectField
                label="Vehicle"
                value={assignForm.vehicleId}
                onChange={(event) =>
                  setAssignForm((current) => ({
                    ...current,
                    vehicleId: event.target.value,
                  }))
                }
                options={[
                  { value: "", label: "Select vehicle" },
                  ...availableVehicles.map((vehicle) => ({
                    value: vehicle.id,
                    label: `${vehicle.plateNumber} - ${vehicle.driverName}`,
                  })),
                ]}
                required
                fullWidth
              />

              <DateTimePicker
                label="Planned pickup time"
                value={assignForm.planPickupTime}
                onChange={(value) =>
                  setAssignForm((current) => ({
                    ...current,
                    planPickupTime: value,
                  }))
                }
                slotProps={{ textField: { fullWidth: true } }}
              />

              <DateTimePicker
                label="Planned dropoff time"
                value={assignForm.planDropoffTime}
                onChange={(value) =>
                  setAssignForm((current) => ({
                    ...current,
                    planDropoffTime: value,
                  }))
                }
                slotProps={{ textField: { fullWidth: true } }}
              />

              <AppTextField
                label="Note"
                value={assignForm.note}
                onChange={(event) =>
                  setAssignForm((current) => ({
                    ...current,
                    note: event.target.value,
                  }))
                }
                multiline
                minRows={3}
                fullWidth
              />
            </>
          ) : (
            <AppTextField
              label="Reject reason"
              value={assignForm.comment}
              onChange={(event) =>
                setAssignForm((current) => ({
                  ...current,
                  comment: event.target.value,
                }))
              }
              required
              multiline
              minRows={4}
              fullWidth
            />
          )}

          <DialogActions sx={{ px: 0 }}>
            <Button onClick={onClose} disabled={assignSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color={assignMode === "assign" ? "primary" : "error"}
              startIcon={
                assignSubmitting ? (
                  <CircularProgress size={18} color="inherit" />
                ) : assignMode === "assign" ? (
                  <DirectionsBusRoundedIcon />
                ) : (
                  <BlockRoundedIcon />
                )
              }
              disabled={assignSubmitting}
            >
              {assignMode === "assign" ? "Assign vehicle" : "Reject request"}
            </Button>
          </DialogActions>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
