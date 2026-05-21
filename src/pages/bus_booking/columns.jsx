import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import DirectionsBusRoundedIcon from "@mui/icons-material/DirectionsBusRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import { Chip, IconButton, Stack, Typography } from "@mui/material";
import { formatDateTimeLabel } from "../../utils/formatters";
import { bookingStatusOptions, vehicleStatusOptions } from "./constants";
import { formatBusDateTime, getStatusColor } from "./utils";

const actionStackSx = {
  height: "100%",
  alignItems: "center",
};

export function createRequestColumns({ onOpenDetail }) {
  return [
    {
      id: "id",
      label: "Request #",
      width: 120,
      sortAccessor: (row) => row.id,
    },
    {
      id: "typeOfTransport",
      label: "Transport",
      minWidth: 170,
    },
    {
      id: "pickupTime",
      label: "Pickup time",
      width: 190,
      render: (row) => formatBusDateTime(row.pickupTime),
      searchAccessor: (row) => formatBusDateTime(row.pickupTime),
      sortAccessor: (row) => row.pickupTime || "",
    },
    {
      id: "dropoffTime",
      label: "Dropoff time",
      width: 190,
      render: (row) => formatBusDateTime(row.dropoffTime),
      searchAccessor: (row) => formatBusDateTime(row.dropoffTime),
      sortAccessor: (row) => row.dropoffTime || "",
    },
    {
      id: "pickupPoint",
      label: "Pickup point",
      minWidth: 180,
    },
    {
      id: "dropoffPoint",
      label: "Dropoff point",
      minWidth: 180,
    },
    {
      id: "status",
      label: "Status",
      width: 160,
      render: (row) => (
        <Chip
          label={row.status}
          size="small"
          color={getStatusColor(row.status)}
        />
      ),
      searchAccessor: (row) => row.status,
      filterAccessor: (row) => row.status,
      filterType: "select",
      filterOptions: bookingStatusOptions,
      sortAccessor: (row) => row.status,
    },
    {
      id: "actions",
      label: "Actions",
      width: 120,
      sortable: false,
      filterable: false,
      searchable: false,
      actionsOnly: true,
      render: (row) => (
        <Stack direction="row" spacing={0.5} sx={actionStackSx}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => void onOpenDetail(row)}
          >
            <VisibilityRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];
}

export function createAdminRequestColumns({ onOpenDetail, onAssign, onCancel }) {
  return [
    {
      id: "id",
      label: "Request #",
      width: 110,
      sortAccessor: (row) => row.id,
    },
    {
      id: "employeeName",
      label: "Employee",
      minWidth: 180,
      render: (row) => (
        <Stack spacing={0.25}>
          <Typography variant="body2">
            {row.employeeName || "Unknown employee"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.employeeId}
          </Typography>
        </Stack>
      ),
      searchAccessor: (row) =>
        `${row.employeeName} ${row.employeeId} ${row.email}`,
    },
    {
      id: "typeOfTransport",
      label: "Transport",
      minWidth: 150,
    },
    {
      id: "pickupTime",
      label: "Pickup time",
      width: 190,
      render: (row) => formatBusDateTime(row.pickupTime),
      searchAccessor: (row) => formatBusDateTime(row.pickupTime),
      sortAccessor: (row) => row.pickupTime || "",
    },
    {
      id: "dropoffTime",
      label: "Dropoff time",
      width: 190,
      render: (row) => formatBusDateTime(row.dropoffTime),
      searchAccessor: (row) => formatBusDateTime(row.dropoffTime),
      sortAccessor: (row) => row.dropoffTime || "",
    },
    {
      id: "pickupPoint",
      label: "Pickup point",
      minWidth: 180,
    },
    {
      id: "dropoffPoint",
      label: "Dropoff point",
      minWidth: 180,
    },
    {
      id: "status",
      label: "Status",
      width: 160,
      render: (row) => (
        <Chip
          label={row.status}
          size="small"
          color={getStatusColor(row.status)}
        />
      ),
      searchAccessor: (row) => row.status,
      filterAccessor: (row) => row.status,
      filterType: "select",
      filterOptions: bookingStatusOptions,
      sortAccessor: (row) => row.status,
    },
    {
      id: "actions",
      label: "Actions",
      width: 150,
      sortable: false,
      filterable: false,
      searchable: false,
      actionsOnly: true,
      render: (row) => (
        <Stack direction="row" spacing={0.5} sx={actionStackSx}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => void onOpenDetail(row)}
          >
            <VisibilityRoundedIcon fontSize="small" />
          </IconButton>
          {row.status === "Approved" ? (
            <IconButton
              size="small"
              color="secondary"
              onClick={() => onAssign(row)}
            >
              <DirectionsBusRoundedIcon fontSize="small" />
            </IconButton>
          ) : null}
          {row.status === "Approved" || row.status === "Resolved" ? (
            <IconButton
              size="small"
              color="error"
              onClick={() => onCancel(row)}
            >
              <BlockRoundedIcon fontSize="small" />
            </IconButton>
          ) : null}
        </Stack>
      ),
    },
  ];
}

export function createVehicleColumns({ onEdit, onDelete }) {
  return [
    {
      id: "plateNumber",
      label: "Plate number",
      minWidth: 140,
    },
    {
      id: "driverName",
      label: "Driver",
      minWidth: 180,
    },
    {
      id: "phoneNumber",
      label: "Phone",
      width: 150,
    },
    {
      id: "status",
      label: "Status",
      width: 160,
      render: (row) => (
        <Chip
          label={row.status}
          size="small"
          color={getStatusColor(row.status)}
        />
      ),
      searchAccessor: (row) => row.status,
      filterAccessor: (row) => row.status,
      filterType: "select",
      filterOptions: vehicleStatusOptions,
    },
    {
      id: "updatedAt",
      label: "Updated",
      width: 180,
      render: (row) => formatDateTimeLabel(row.updatedAt),
      searchAccessor: (row) => formatDateTimeLabel(row.updatedAt),
      sortAccessor: (row) => row.updatedAt || "",
    },
    {
      id: "actions",
      label: "Actions",
      width: 130,
      sortable: false,
      filterable: false,
      searchable: false,
      actionsOnly: true,
      render: (row) => (
        <Stack direction="row" spacing={0.5} sx={actionStackSx}>
          <IconButton size="small" color="primary" onClick={() => onEdit(row)}>
            <EditRoundedIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => onDelete(row)}>
            <DeleteOutlineRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];
}

export function createLocationColumns({ onEdit, onDelete }) {
  return [
    {
      id: "gate",
      label: "Gate",
      minWidth: 220,
    },
    {
      id: "ccn",
      label: "CCN",
      width: 140,
    },
    {
      id: "actions",
      label: "Actions",
      width: 130,
      sortable: false,
      filterable: false,
      searchable: false,
      actionsOnly: true,
      render: (row) => (
        <Stack direction="row" spacing={0.5} sx={actionStackSx}>
          <IconButton size="small" color="primary" onClick={() => onEdit(row)}>
            <EditRoundedIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => onDelete(row)}>
            <DeleteOutlineRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];
}
