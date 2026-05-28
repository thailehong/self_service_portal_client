import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import { Chip, IconButton, Stack, Tooltip } from "@mui/material";
import { formatDateTimeLabel } from "../../utils/formatters";
import { getStatusColor, getWorkflowName } from "./workflowUtils";

export function workflowColumns({ onSelect, onEdit }) {
  return [
    { id: "code", label: "Code", width: 160 },
    { id: "name", label: "Name", minWidth: 220 },
    {
      id: "isActive",
      label: "Status",
      width: 130,
      render: (row) => <Chip size="small" color={row.isActive ? "success" : "default"} label={row.isActive ? "Active" : "Inactive"} />,
      searchAccessor: (row) => (row.isActive ? "Active" : "Inactive"),
    },
    {
      id: "createdAt",
      label: "Created",
      width: 180,
      render: (row) => formatDateTimeLabel(row.createdAt),
      searchAccessor: (row) => formatDateTimeLabel(row.createdAt),
      sortAccessor: (row) => row.createdAt || "",
    },
    {
      id: "actions",
      label: "Actions",
      width: 150,
      sortable: false,
      searchable: false,
      render: (row) => (
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ height: "100%" }}>
          <Tooltip title="View workflow">
            <IconButton size="small" color="primary" onClick={() => onSelect(row)}>
              <VisibilityRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {row.access.canManage ? (
            <Tooltip title="Edit workflow">
              <IconButton size="small" color="secondary" onClick={() => onEdit(row)}>
                <EditRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
        </Stack>
      ),
    },
  ];
}

export function requestColumns({ workflows, onOpenDetail, onSubmit, onCancel, onEdit }) {
  return [
    { id: "requestNo", label: "Request no", minWidth: 180 },
    { id: "title", label: "Title", minWidth: 220 },
    {
      id: "workflowId",
      label: "Workflow",
      minWidth: 190,
      render: (row) => getWorkflowName(workflows, row.workflowId),
      searchAccessor: (row) => getWorkflowName(workflows, row.workflowId),
    },
    {
      id: "status",
      label: "Status",
      width: 140,
      render: (row) => <Chip label={row.status} color={getStatusColor(row.status)} size="small" />,
    },
    {
      id: "createdAt",
      label: "Created",
      width: 180,
      render: (row) => formatDateTimeLabel(row.createdAt),
      searchAccessor: (row) => formatDateTimeLabel(row.createdAt),
      sortAccessor: (row) => row.createdAt || "",
    },
    {
      id: "actions",
      label: "Actions",
      width: 170,
      sortable: false,
      searchable: false,
      render: (row) => (
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ height: "100%" }}>
          <Tooltip title="View detail">
            <IconButton size="small" color="primary" onClick={() => onOpenDetail(row)}>
              <VisibilityRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {row.status === "Draft" ? (
            <Tooltip title="Submit draft">
              <IconButton size="small" color="success" onClick={() => onSubmit(row)}>
                <SendRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
          {row.status === "Draft" ? (
            <Tooltip title="Edit draft">
              <IconButton size="small" color="secondary" onClick={() => onEdit(row)}>
                <EditRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
          {row.status === "Draft" || row.status === "InProgress" ? (
            <Tooltip title="Cancel request">
              <IconButton size="small" color="error" onClick={() => onCancel(row)}>
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
        </Stack>
      ),
    },
  ];
}

export function pendingColumns({ workflows, onOpenDetail, onApprove, onReject }) {
  return [
    ...requestColumns({ workflows, onOpenDetail, onSubmit: () => {}, onCancel: () => {}, onEdit: () => {} }).filter((column) => column.id !== "actions"),
    {
      id: "actions",
      label: "Actions",
      width: 160,
      sortable: false,
      searchable: false,
      render: (row) => (
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ height: "100%" }}>
          <Tooltip title="View detail">
            <IconButton size="small" color="primary" onClick={() => onOpenDetail(row)}>
              <VisibilityRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Approve request">
            <IconButton size="small" color="success" onClick={() => onApprove(row)}>
              <CheckRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reject request">
            <IconButton size="small" color="error" onClick={() => onReject(row)}>
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];
}
