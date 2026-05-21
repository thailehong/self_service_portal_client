import AddRoundedIcon from "@mui/icons-material/AddRounded";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { useEffect, useMemo, useState } from "react";
import { AppSelectField } from "../../components/forms/AppSelectField";
import { AppTextField } from "../../components/forms/AppTextField";
import {
  initialRequestForm,
  moveTypeOptions,
  purposeOptions,
  transportTypeOptions,
  useForOptions,
} from "./constants";
import { normalizeCompareValue } from "./utils";

export function RequestFormDialog({
  open,
  onClose,
  requestForm,
  onSubmit,
  onClear,
  requestSubmitError,
  hodsError,
  locationsError,
  locationOptions,
  hodOptions,
  defaultManagerEmail,
  hodsLoading,
  locationsLoading,
  requestSubmitting,
}) {
  const [form, setForm] = useState(requestForm);
  const isExternalTransport = form.typeOfTransport === "External";
  const isInternalTransport = form.typeOfTransport === "Internal";
  const isGoodsPurpose = form.purpose === "Goods";
  const selectedHodOption = useMemo(
    () =>
      hodOptions.find(
        (option) =>
          normalizeCompareValue(option.value) ===
          normalizeCompareValue(form.managerEmail),
      ) || null,
    [form.managerEmail, hodOptions],
  );

  useEffect(() => {
    if (open) {
      setForm(requestForm);
    }
  }, [open, requestForm]);

  const handleFieldChange = (field, value) => {
    setForm((current) => {
      const nextForm = {
        ...current,
        [field]: value,
      };

      if (field === "typeOfTransport" && value !== "External") {
        nextForm.requestFor = "";
        nextForm.purpose = "";
        nextForm.typeOfGood = "";
        nextForm.sizeOfGood = "";
      }

      if (field === "purpose" && value !== "Goods") {
        nextForm.typeOfGood = "";
        nextForm.sizeOfGood = "";
      }

      return nextForm;
    });
  };

  const handleClear = () => {
    const nextForm = {
      ...initialRequestForm,
      managerEmail: defaultManagerEmail || "",
    };

    setForm(nextForm);
    onClear?.(nextForm);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Book a bus</DialogTitle>
      <DialogContent dividers>
        <Stack
          component="form"
          spacing={2.5}
          sx={{ mt: 0.5 }}
          onSubmit={handleSubmit}
        >
          {requestSubmitError ? (
            <Alert severity="error" variant="outlined">
              {requestSubmitError}
            </Alert>
          ) : null}
          {hodsError ? (
            <Alert severity="warning" variant="outlined">
              {hodsError}
            </Alert>
          ) : null}
          {locationsError ? (
            <Alert severity="warning" variant="outlined">
              {locationsError}
            </Alert>
          ) : null}

          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(0, 1fr))",
              },
            }}
          >
            <AppSelectField
              label="Type of transport"
              value={form.typeOfTransport}
              onChange={(event) =>
                handleFieldChange("typeOfTransport", event.target.value)
              }
              options={transportTypeOptions}
              required
              fullWidth
            />
            <AppSelectField
              label="Type move"
              value={form.typeMove}
              onChange={(event) =>
                handleFieldChange("typeMove", event.target.value)
              }
              options={moveTypeOptions}
              required
              fullWidth
            />
            {isExternalTransport ? (
              <AppSelectField
                label="Use For"
                value={form.requestFor}
                onChange={(event) =>
                  handleFieldChange("requestFor", event.target.value)
                }
                options={useForOptions}
                required
                fullWidth
              />
            ) : null}
            {isExternalTransport ? (
              <AppSelectField
                label="Purpose"
                value={form.purpose}
                onChange={(event) =>
                  handleFieldChange("purpose", event.target.value)
                }
                options={purposeOptions}
                required
                fullWidth
              />
            ) : null}
            {isExternalTransport && isGoodsPurpose ? (
              <AppTextField
                label="Type of Good"
                value={form.typeOfGood}
                onChange={(event) =>
                  handleFieldChange("typeOfGood", event.target.value)
                }
                required
                fullWidth
              />
            ) : null}
            {isExternalTransport && isGoodsPurpose ? (
              <AppTextField
                label="Size of Goods"
                value={form.sizeOfGood}
                onChange={(event) =>
                  handleFieldChange("sizeOfGood", event.target.value)
                }
                required
                fullWidth
              />
            ) : null}
            <DateTimePicker
              label="Pickup time"
              value={form.pickupTime}
              onChange={(value) => handleFieldChange("pickupTime", value)}
              slotProps={{ textField: { fullWidth: true, required: true } }}
            />
            <DateTimePicker
              label="Dropoff time"
              value={form.dropoffTime}
              onChange={(value) => handleFieldChange("dropoffTime", value)}
              slotProps={{ textField: { fullWidth: true, required: true } }}
            />
            {isInternalTransport ? (
              <AppSelectField
                label="Pickup point"
                value={form.pickupPoint}
                onChange={(event) =>
                  handleFieldChange("pickupPoint", event.target.value)
                }
                options={locationOptions}
                required
                fullWidth
                disabled={locationsLoading}
              />
            ) : (
              <AppTextField
                label="Pickup point"
                value={form.pickupPoint}
                onChange={(event) =>
                  handleFieldChange("pickupPoint", event.target.value)
                }
                required
                fullWidth
              />
            )}
            {isInternalTransport ? (
              <AppSelectField
                label="Dropoff point"
                value={form.dropoffPoint}
                onChange={(event) =>
                  handleFieldChange("dropoffPoint", event.target.value)
                }
                options={locationOptions}
                required
                fullWidth
                disabled={locationsLoading}
              />
            ) : (
              <AppTextField
                label="Dropoff point"
                value={form.dropoffPoint}
                onChange={(event) =>
                  handleFieldChange("dropoffPoint", event.target.value)
                }
                required
                fullWidth
              />
            )}
            <AppTextField
              label="Estimate distance"
              value={form.estimateDistance}
              onChange={(event) =>
                handleFieldChange("estimateDistance", event.target.value)
              }
              type="number"
              inputProps={{ min: 0, step: "0.1" }}
              fullWidth
            />
            <Autocomplete
              value={selectedHodOption}
              onChange={(_, option) =>
                handleFieldChange("managerEmail", option?.value || "")
              }
              options={hodOptions}
              getOptionLabel={(option) => option?.label || ""}
              isOptionEqualToValue={(option, value) =>
                normalizeCompareValue(option.value) ===
                normalizeCompareValue(value.value)
              }
              filterOptions={(options, state) => {
                const searchValue = normalizeCompareValue(state.inputValue);

                if (!searchValue) {
                  return options;
                }

                return options.filter((option) =>
                  normalizeCompareValue(option.email).includes(searchValue),
                );
              }}
              loading={hodsLoading}
              fullWidth
              disabled={hodsLoading}
              renderInput={(params) => (
                <AppTextField
                  {...params}
                  label="Manager email"
                  required
                  fullWidth
                />
              )}
            />
          </Box>

          <AppTextField
            label="Passenger"
            value={form.passenger}
            onChange={(event) =>
              handleFieldChange("passenger", event.target.value)
            }
            multiline
            minRows={3}
            fullWidth
          />

          <AppTextField
            label="Reason"
            value={form.reason}
            onChange={(event) =>
              handleFieldChange("reason", event.target.value)
            }
            required
            multiline
            minRows={3}
            fullWidth
          />

          <DialogActions sx={{ px: 0, justifyContent: "space-between" }}>
            <Button onClick={onClose} disabled={requestSubmitting}>
              Cancel
            </Button>
            <Stack direction="row" spacing={1}>
              <Button
                type="button"
                variant="text"
                onClick={handleClear}
                disabled={requestSubmitting}
              >
                Clear
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={
                  requestSubmitting ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <AddRoundedIcon />
                  )
                }
                disabled={requestSubmitting}
              >
                Create request
              </Button>
            </Stack>
          </DialogActions>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
