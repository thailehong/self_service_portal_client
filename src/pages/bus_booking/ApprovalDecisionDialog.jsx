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

export function ApprovalDecisionDialog({
  open,
  request,
  error,
  submitting,
  onClose,
  onSubmit,
}) {
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (open) {
      setComment("");
    }
  }, [open]);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(comment);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {request ? `Reject request #${request.id}` : "Reject request"}
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
            label="Reject reason"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            required
            multiline
            minRows={4}
            fullWidth
          />

          <DialogActions sx={{ px: 0 }}>
            <Button onClick={onClose} disabled={submitting}>
              Cancel
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
              Reject request
            </Button>
          </DialogActions>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
