import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
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
import { useEffect, useState } from "react";
import { AppTextField } from "../../components/forms/AppTextField";

export function CancelRequestDialog({
  open,
  request,
  error,
  submitting,
  onClose,
  onSubmit,
}) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) {
      setReason("");
    }
  }, [open]);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(reason);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {request ? `Cancel request #${request.id}` : "Cancel request"}
      </DialogTitle>
      <DialogContent dividers>
        <Stack
          component="form"
          spacing={2.5}
          sx={{ mt: 0.5 }}
          onSubmit={handleSubmit}
        >
          {error ? (
            <Alert severity="error" variant="outlined">
              {error}
            </Alert>
          ) : null}

          <AppTextField
            label="Cancel reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            required
            multiline
            minRows={4}
            fullWidth
          />

          <DialogActions sx={{ px: 0 }}>
            <Button onClick={onClose} disabled={submitting}>
              Close
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="error"
              startIcon={
                submitting ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <BlockRoundedIcon />
                )
              }
              disabled={submitting}
            >
              Cancel request
            </Button>
          </DialogActions>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
