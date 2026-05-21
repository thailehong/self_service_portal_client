import DirectionsBusRoundedIcon from "@mui/icons-material/DirectionsBusRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { AppTextField } from "../../components/forms/AppTextField";
import { formatDateTimeLabel } from "../../utils/formatters";
import { formatBusDateTime } from "./utils";

function getApprovalActionColor(action) {
  if (String(action).toLowerCase() === "approve") {
    return "success";
  }

  if (String(action).toLowerCase() === "reject") {
    return "error";
  }

  if (String(action).toLowerCase() === "pending") {
    return "warning";
  }

  return "default";
}

function formatApprovalSummary(approval) {
  const timestamp = approval.approvedAt || approval.createdAt;
  return timestamp
    ? `${approval.action} - ${formatDateTimeLabel(timestamp)}`
    : approval.action;
}

function ReadonlyTextField({ label, value, multiline = false, minRows = 1 }) {
  return (
    <AppTextField
      label={label}
      value={value || "N/A"}
      fullWidth
      multiline={multiline}
      minRows={minRows}
      InputProps={{ readOnly: true }}
    />
  );
}

function CompactTimelineList({ items }) {
  if (!items.length) {
    return (
      <Alert severity="info" variant="outlined">
        No history is available for this request yet.
      </Alert>
    );
  }

  return (
    <Stack spacing={0}>
      {items.map((item, index) => (
        <Box
          key={item.id || `${item.action}-${item.createdAt}-${index}`}
          sx={{
            display: "grid",
            gridTemplateColumns: "20px minmax(0, 1fr)",
            gap: 2,
            alignItems: "start",
            pb: index < items.length - 1 ? 2 : 0,
          }}
        >
          <Box
            sx={{
              position: "relative",
              display: "flex",
              justifyContent: "center",
              pt: 0.75,
            }}
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                bgcolor: "primary.main",
                boxShadow: (theme) =>
                  `0 0 0 4px ${theme.palette.background.paper}`,
                zIndex: 1,
              }}
            />
            {index < items.length - 1 ? (
              <Box
                sx={{
                  position: "absolute",
                  top: 22,
                  bottom: -22,
                  width: 2,
                  bgcolor: "divider",
                }}
              />
            ) : null}
          </Box>

          <Stack spacing={0.5} sx={{ py: 0.25 }}>
            <Typography variant="subtitle2">{item.action}</Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDateTimeLabel(item.createdAt)} -{" "}
              {item.createdBy || "System"}
            </Typography>
            {item.comment ? (
              <Typography variant="body2" color="text.secondary">
                {item.comment}
              </Typography>
            ) : null}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}

export function RequestDetailDialog({
  open,
  onClose,
  detailRequest,
  detailAssignment,
  detailApprovals,
  detailHistory,
  detailLoading,
  detailError,
  isAdmin,
  availableVehicles,
  onAssign,
  canApprove = false,
  approvalSubmitting = false,
  onApprove,
  onReject,
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ pr: 7 }}>
        {detailRequest ? `Request #${detailRequest.id}` : "Request detail"}
        <IconButton
          aria-label="Close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 12,
            top: 10,
          }}
        >
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {detailError ? (
          <Alert severity="error" variant="outlined" sx={{ mb: 2 }}>
            {detailError}
          </Alert>
        ) : null}

        {detailRequest ? (
          <Stack spacing={3}>
            <Box
              sx={{
                display: "grid",
                gap: 1.5,
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(3, minmax(0, 1fr))",
                },
              }}
            >
              <ReadonlyTextField
                label="Employee"
                value={detailRequest.employeeName || detailRequest.employeeId}
              />
              <ReadonlyTextField label="Status" value={detailRequest.status} />
              <ReadonlyTextField
                label="Created"
                value={formatDateTimeLabel(detailRequest.createdAt)}
              />
              <ReadonlyTextField
                label="Request for"
                value={detailRequest.requestFor}
              />
              <ReadonlyTextField
                label="Passenger"
                value={detailRequest.passenger}
              />
              <ReadonlyTextField
                label="Transport"
                value={detailRequest.typeOfTransport}
              />
              <ReadonlyTextField
                label="Purpose"
                value={detailRequest.purpose}
              />
              <ReadonlyTextField
                label="Type of good"
                value={detailRequest.typeOfGood}
              />
              <ReadonlyTextField
                label="Type move"
                value={detailRequest.typeMove}
              />
              <ReadonlyTextField
                label="Pickup"
                value={`${detailRequest.pickupPoint} - ${formatBusDateTime(detailRequest.pickupTime)}`}
              />
              <ReadonlyTextField
                label="Dropoff"
                value={`${detailRequest.dropoffPoint} - ${formatBusDateTime(detailRequest.dropoffTime)}`}
              />
              <ReadonlyTextField
                label="Estimate distance"
                value={
                  detailRequest.estimateDistance ||
                  detailRequest.estimateDistance === 0
                    ? String(detailRequest.estimateDistance)
                    : ""
                }
              />
              <ReadonlyTextField label="Email" value={detailRequest.email} />
              <ReadonlyTextField
                label="Department"
                value={detailRequest.department}
              />
              <ReadonlyTextField
                label="Reason"
                value={detailRequest.reason}
                multiline
                minRows={3}
              />
            </Box>

            {/* <Box>
              <Stack spacing={0.5} sx={{ mb: 2 }}>
              <Typography variant="h6">Approval</Typography>
              <Typography variant="body2" color="text.secondary">
                  Approvals returned by the approval API for this request.
                </Typography>
              </Stack>
              {detailLoading ? (
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <CircularProgress size={20} />
                  <Typography color="text.secondary">
                    Loading approvals...
                  </Typography>
                </Stack>
              ) : detailApprovals.length ? (
                <Box
                  sx={{
                    display: "grid",
                    gap: 1.25,
                    gridTemplateColumns: {
                      xs: "1fr",
                      md: "repeat(2, minmax(0, 1fr))",
                    },
                  }}
                >
                  {detailApprovals.map((approval) => (
                    <Box key={approval.id} sx={{ p: 2, borderRadius: 0 }}>
                      <Stack spacing={0.5}>
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          flexWrap="wrap"
                        >
                          <Chip
                            label={approval.action}
                            size="small"
                            color={getApprovalActionColor(approval.action)}
                          />
                          <Typography variant="subtitle2">
                            {formatApprovalSummary(approval)}
                          </Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {approval.approverEmail}
                        </Typography>
                        {approval.comment ? (
                          <Typography variant="body2" color="text.secondary">
                            {approval.comment}
                          </Typography>
                        ) : null}
                      </Stack>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Alert severity="info" variant="outlined">
                  No approval items are available.
                </Alert>
              )}
            </Box> */}

            <Box>
              <Stack spacing={0.5} sx={{ mb: 2 }}>
                <Typography variant="h6">Assignment</Typography>
                {/* <Typography variant="body2" color="text.secondary">
                  Latest assignment returned by the assignment API.
                </Typography> */}
              </Stack>
              {detailLoading ? (
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <CircularProgress size={20} />
                  <Typography color="text.secondary">
                    Loading assignment...
                  </Typography>
                </Stack>
              ) : detailAssignment ? (
                <Box
                  sx={{
                    display: "grid",
                    gap: 1.5,
                    gridTemplateColumns: {
                      xs: "1fr",
                      md: "repeat(3, minmax(0, 1fr))",
                    },
                  }}
                >
                  <ReadonlyTextField
                    label="Assigned at"
                    value={formatDateTimeLabel(detailAssignment.assignedAt)}
                  />
                  <ReadonlyTextField
                    label="Planned pickup time"
                    value={formatDateTimeLabel(detailAssignment.planPickupTime)}
                  />
                  <ReadonlyTextField
                    label="Planned dropoff time"
                    value={formatDateTimeLabel(
                      detailAssignment.planDropoffTime,
                    )}
                  />
                  <ReadonlyTextField
                    label="Vehicle ID"
                    value={detailAssignment.vehicleId}
                  />
                  <ReadonlyTextField
                    label="Plate number"
                    value={detailAssignment.vehicle?.plateNumber}
                  />
                  <ReadonlyTextField
                    label="Vehicle status"
                    value={detailAssignment.vehicle?.status}
                  />
                  <ReadonlyTextField
                    label="Driver name"
                    value={detailAssignment.vehicle?.driverName}
                  />
                  <ReadonlyTextField
                    label="Phone number"
                    value={detailAssignment.vehicle?.phoneNumber}
                  />
                  <ReadonlyTextField
                    label="Note"
                    value={detailAssignment.note}
                    multiline
                    minRows={3}
                  />
                </Box>
              ) : (
                <Alert severity="info" variant="outlined">
                  No assignment is available for this request yet.
                </Alert>
              )}
            </Box>

            <Box>
              <Stack spacing={0.5} sx={{ mb: 2 }}>
                <Typography variant="h6">History timeline</Typography>
                {/* <Typography variant="body2" color="text.secondary">
                  Chronological activity returned by the history API.
                </Typography> */}
              </Stack>
              {detailLoading ? (
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <CircularProgress size={20} />
                  <Typography color="text.secondary">
                    Loading history...
                  </Typography>
                </Stack>
              ) : (
                <CompactTimelineList items={detailHistory} />
              )}
            </Box>
          </Stack>
        ) : null}
      </DialogContent>
      <DialogActions>
        {canApprove ? (
          <>
            <Button
              onClick={onReject}
              color="error"
              disabled={approvalSubmitting}
            >
              Reject
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<TaskAltRoundedIcon />}
              onClick={onApprove}
              disabled={approvalSubmitting}
            >
              Approve
            </Button>
          </>
        ) : null}
        {isAdmin && detailRequest?.status === "Approved" ? (
          <Button
            variant="contained"
            startIcon={<DirectionsBusRoundedIcon />}
            onClick={onAssign}
            disabled={!availableVehicles.length}
          >
            Assign vehicle
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  );
}
