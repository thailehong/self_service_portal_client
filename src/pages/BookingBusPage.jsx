import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ApprovalRoundedIcon from "@mui/icons-material/ApprovalRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { Alert, Box, Button, Chip, Stack, Tab, Tabs, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AssignRequestDialog } from "./bus_booking/AssignRequestDialog";
import { ApprovalDecisionDialog } from "./bus_booking/ApprovalDecisionDialog";
import { CancelRequestDialog } from "./bus_booking/CancelRequestDialog";
import {
  createAdminRequestColumns,
  createLocationColumns,
  createRequestColumns,
  createVehicleColumns,
} from "./bus_booking/columns";
import {
  initialLocationForm,
  initialRequestForm,
  initialVehicleForm,
} from "./bus_booking/constants";
import { LocationDialog, VehicleDialog } from "./bus_booking/MasterDataDialogs";
import { RequestDetailDialog } from "./bus_booking/RequestDetailDialog";
import { RequestFormDialog } from "./bus_booking/RequestFormDialog";
import {
  getDefaultHodEmail,
  getEmployeeIdFromUser,
  getEmailFromUser,
  getErrorMessage,
  getUniqueHodOptions,
  toApiDateTime,
  toPickerValue,
} from "./bus_booking/utils";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { AppDataTable } from "../components/datatable/AppDataTable";
import { PageHeader } from "../components/layout/PageHeader";
import { SectionCard } from "../components/layout/SectionCard";
import { selectAuth } from "../features/auth/authSlice";
import { useAppSelector } from "../hooks/useAppSelector";
import { useNotifier } from "../hooks/useNotifier";
import { busBookingApi } from "../services/api/busBookingApi";
import { masterDataApi } from "../services/api/masterDataApi";
import { ADMINISTRATOR_ROLE_IDS, hasAnyRole } from "../utils/roles";

export function BookingBusPage() {
  const { t } = useTranslation();
  const { notify } = useNotifier();
  const auth = useAppSelector(selectAuth);
  const isAdmin = hasAnyRole(auth.user, ADMINISTRATOR_ROLE_IDS);
  const currentEmployeeId = getEmployeeIdFromUser(auth.user);
  const lastAutoRefreshKeyRef = useRef("");

  const [myRequests, setMyRequests] = useState([]);
  const [myRequestsLoading, setMyRequestsLoading] = useState(false);
  const [myRequestsError, setMyRequestsError] = useState("");

  const [pendingMyApprovals, setPendingMyApprovals] = useState([]);
  const [pendingMyApprovalsLoading, setPendingMyApprovalsLoading] =
    useState(false);
  const [pendingMyApprovalsError, setPendingMyApprovalsError] = useState("");

  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState("");

  const [locations, setLocations] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [locationsError, setLocationsError] = useState("");

  const [vehicles, setVehicles] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [vehiclesError, setVehiclesError] = useState("");

  const [hods, setHods] = useState([]);
  const [hodsLoading, setHodsLoading] = useState(false);
  const [hodsError, setHodsError] = useState("");

  const [requestForm, setRequestForm] = useState(initialRequestForm);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestSubmitError, setRequestSubmitError] = useState("");

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRequest, setDetailRequest] = useState(null);
  const [detailAssignment, setDetailAssignment] = useState(null);
  const [detailApprovals, setDetailApprovals] = useState([]);
  const [detailHistory, setDetailHistory] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [detailCanApprove, setDetailCanApprove] = useState(false);

  const [approvalDialog, setApprovalDialog] = useState({
    open: false,
    request: null,
  });
  const [approvalSubmitting, setApprovalSubmitting] = useState(false);
  const [approvalError, setApprovalError] = useState("");

  const [cancelRequestDialog, setCancelRequestDialog] = useState({
    open: false,
    request: null,
  });
  const [cancelRequestSubmitting, setCancelRequestSubmitting] = useState(false);
  const [cancelRequestError, setCancelRequestError] = useState("");

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignRequest, setAssignRequest] = useState(null);
  const [assignMode, setAssignMode] = useState("assign");
  const [assignForm, setAssignForm] = useState({
    vehicleId: "",
    planPickupTime: null,
    planDropoffTime: null,
    note: "",
    comment: "",
  });
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [assignError, setAssignError] = useState("");

  const [vehicleDialog, setVehicleDialog] = useState({
    open: false,
    mode: "create",
    item: null,
  });
  const [vehicleForm, setVehicleForm] = useState(initialVehicleForm);
  const [vehicleSubmitting, setVehicleSubmitting] = useState(false);
  const [vehicleSubmitError, setVehicleSubmitError] = useState("");

  const [locationDialog, setLocationDialog] = useState({
    open: false,
    mode: "create",
    item: null,
  });
  const [locationForm, setLocationForm] = useState(initialLocationForm);
  const [locationSubmitting, setLocationSubmitting] = useState(false);
  const [locationSubmitError, setLocationSubmitError] = useState("");

  const [deleteState, setDeleteState] = useState({
    type: "",
    item: null,
  });
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const [masterDataTab, setMasterDataTab] = useState("vehicles");
  const [myRequestsTab, setMyRequestsTab] = useState("mine");
  const [allRequestsTab, setAllRequestsTab] = useState("all");

  const locationOptions = [
    { value: "", label: "Select location" },
    ...locations.map((location) => ({
      value: `${location.gate}${location.ccn ? ` (${location.ccn})` : ""}`,
      label: `${location.gate}${location.ccn ? ` (${location.ccn})` : ""}`,
    })),
  ];
  const hodOptions = getUniqueHodOptions(hods);

  const adminRequests = isAdmin ? requests : [];
  const approvedRequests = adminRequests.filter(
    (request) => request.status === "Approved",
  );
  const resolvedRequests = adminRequests.filter(
    (request) => request.status === "Resolved",
  );
  const visibleAdminRequests =
    allRequestsTab === "approved"
      ? approvedRequests
      : allRequestsTab === "resolved"
        ? resolvedRequests
        : adminRequests;
  const availableVehicles = vehicles.filter(
    (vehicle) => vehicle.status === "Available",
  );

  const loadMyRequests = async () => {
    setMyRequestsLoading(true);
    setMyRequestsError("");

    try {
      const nextRequests = await busBookingApi.getMyRequests({
        employeeId: currentEmployeeId || undefined,
      });
      setMyRequests(nextRequests);
    } catch (error) {
      setMyRequestsError(
        getErrorMessage(error, "Could not load your booking requests."),
      );
    } finally {
      setMyRequestsLoading(false);
    }
  };

  const loadPendingMyApprovals = async () => {
    setPendingMyApprovalsLoading(true);
    setPendingMyApprovalsError("");

    try {
      const nextRequests = await busBookingApi.getPendingMyApprovalRequests();
      setPendingMyApprovals(nextRequests);
    } catch (error) {
      setPendingMyApprovalsError(
        getErrorMessage(error, "Could not load requests pending your approval."),
      );
    } finally {
      setPendingMyApprovalsLoading(false);
    }
  };

  const loadRequests = async () => {
    if (!isAdmin) {
      setRequests([]);
      setRequestsError("");
      return;
    }

    setRequestsLoading(true);
    setRequestsError("");

    try {
      const nextRequests = await busBookingApi.getRequests();
      setRequests(nextRequests);
    } catch (error) {
      setRequestsError(
        getErrorMessage(error, "Could not load booking requests."),
      );
    } finally {
      setRequestsLoading(false);
    }
  };

  const loadLocations = async () => {
    setLocationsLoading(true);
    setLocationsError("");

    try {
      const nextLocations = await busBookingApi.getLocations();
      setLocations(nextLocations);
    } catch (error) {
      setLocationsError(
        getErrorMessage(error, "Could not load bus locations."),
      );
    } finally {
      setLocationsLoading(false);
    }
  };

  const loadHods = async () => {
    setHodsLoading(true);
    setHodsError("");

    try {
      const nextHods = await masterDataApi.getHOD();
      setHods(nextHods);
    } catch (error) {
      setHodsError(getErrorMessage(error, "Could not load HOD list."));
    } finally {
      setHodsLoading(false);
    }
  };

  const loadVehicles = async () => {
    if (!isAdmin) {
      return;
    }

    setVehiclesLoading(true);
    setVehiclesError("");

    try {
      const nextVehicles = await busBookingApi.getVehicles();
      setVehicles(nextVehicles);
    } catch (error) {
      setVehiclesError(getErrorMessage(error, "Could not load vehicles."));
    } finally {
      setVehiclesLoading(false);
    }
  };

  const refreshAll = async () => {
    const tasks = [
      loadMyRequests(),
      loadPendingMyApprovals(),
      loadLocations(),
      loadHods(),
    ];

    if (isAdmin) {
      tasks.push(loadRequests(), loadVehicles());
    }

    await Promise.all(tasks);
  };

  useEffect(() => {
    if (!auth.user) {
      return;
    }

    const refreshKey = [
      currentEmployeeId || getEmailFromUser(auth.user) || "current-user",
      isAdmin ? "admin" : "user",
    ].join(":");

    if (lastAutoRefreshKeyRef.current === refreshKey) {
      return;
    }

    lastAutoRefreshKeyRef.current = refreshKey;
    void refreshAll();
  }, [auth.user, currentEmployeeId, isAdmin]);

  useEffect(() => {
    if (!requestDialogOpen) {
      return;
    }

    const defaultManagerEmail = getDefaultHodEmail(auth.user, hods);
    if (!defaultManagerEmail) {
      return;
    }

    setRequestForm((current) =>
      current.managerEmail
        ? current
        : {
            ...current,
            managerEmail: defaultManagerEmail,
          },
    );
  }, [auth.user, hods, requestDialogOpen]);

  const openRequestDialog = () => {
    setRequestDialogOpen(true);
    setRequestSubmitError("");
    setRequestForm((current) => ({
      ...current,
      managerEmail: current.managerEmail || getDefaultHodEmail(auth.user, hods),
    }));
  };

  const closeRequestDialog = () => {
    setRequestDialogOpen(false);
    setRequestForm({
      ...initialRequestForm,
      managerEmail: getDefaultHodEmail(auth.user, hods),
    });
    setRequestSubmitError("");
  };

  const handleSubmitRequest = async (submittedForm) => {
    const form = submittedForm || requestForm;

    if (!form.typeOfTransport) {
      setRequestSubmitError("Type of transport is required.");
      return;
    }

    if (!form.typeMove) {
      setRequestSubmitError("Type move is required.");
      return;
    }

    if (form.typeOfTransport === "External") {
      if (!form.requestFor.trim()) {
        setRequestSubmitError("Use For is required for external transport.");
        return;
      }

      if (!form.purpose) {
        setRequestSubmitError("Purpose is required for external transport.");
        return;
      }

      if (form.purpose === "Goods") {
        if (!form.typeOfGood.trim()) {
          setRequestSubmitError(
            "Type of Good is required when purpose is Goods.",
          );
          return;
        }

        if (!form.sizeOfGood.trim()) {
          setRequestSubmitError(
            "Size of Goods is required when purpose is Goods.",
          );
          return;
        }
      }
    }

    if (!form.pickupPoint.trim() || !form.dropoffPoint.trim()) {
      setRequestSubmitError("Pickup point and dropoff point are required.");
      return;
    }

    if (!form.pickupTime || !form.dropoffTime) {
      setRequestSubmitError("Pickup time and dropoff time are required.");
      return;
    }

    if (dayjs(form.dropoffTime).isBefore(dayjs(form.pickupTime))) {
      setRequestSubmitError("Dropoff time must be after pickup time.");
      return;
    }

    setRequestSubmitting(true);
    setRequestSubmitError("");

    try {
      await busBookingApi.createRequest({
        ...form,
        pickupTime: toApiDateTime(form.pickupTime),
        dropoffTime: toApiDateTime(form.dropoffTime),
      });

      setRequestForm(initialRequestForm);
      notify({
        message: "Booking request created successfully.",
        severity: "success",
      });
      closeRequestDialog();
      const reloadTasks = [loadMyRequests()];

      if (isAdmin) {
        reloadTasks.push(loadRequests());
      }

      await Promise.all(reloadTasks);
    } catch (error) {
      setRequestSubmitError(
        getErrorMessage(error, "Could not create booking request."),
      );
    } finally {
      setRequestSubmitting(false);
    }
  };

  const openRequestDetail = async (request, { canApprove = false } = {}) => {
    setDetailOpen(true);
    setDetailRequest(request);
    setDetailAssignment(null);
    setDetailLoading(true);
    setDetailError("");
    setDetailCanApprove(canApprove);
    setDetailApprovals([]);
    setDetailHistory([]);

    try {
      const [approvals, history, assignment] = await Promise.all([
        busBookingApi.getApprovals(request.id),
        busBookingApi.getHistory(request.id),
        busBookingApi.getAssignment(request.id),
      ]);
      setDetailApprovals(approvals);
      setDetailHistory(history);
      setDetailAssignment(assignment);
    } catch (error) {
      setDetailError(getErrorMessage(error, "Could not load request detail."));
    } finally {
      setDetailLoading(false);
    }
  };

  const closeRequestDetail = () => {
    setDetailOpen(false);
    setDetailRequest(null);
    setDetailAssignment(null);
    setDetailApprovals([]);
    setDetailHistory([]);
    setDetailError("");
    setDetailCanApprove(false);
  };

  const reloadRequestListsAfterApproval = async () => {
    const reloadTasks = [loadMyRequests(), loadPendingMyApprovals()];

    if (isAdmin) {
      reloadTasks.push(loadRequests());
    }

    await Promise.all(reloadTasks);
  };

  const handleApproveRequest = async () => {
    if (!detailRequest) {
      return;
    }

    const approverEmail = getEmailFromUser(auth.user);
    if (!approverEmail) {
      setDetailError("Cannot resolve current user email for approval.");
      return;
    }

    setApprovalSubmitting(true);
    setDetailError("");

    try {
      await busBookingApi.approveRequest(detailRequest.id, {
        approverEmail,
      });
      notify({
        message: `Request #${detailRequest.id} approved.`,
        severity: "success",
      });
      closeRequestDetail();
      await reloadRequestListsAfterApproval();
    } catch (error) {
      setDetailError(getErrorMessage(error, "Could not approve request."));
    } finally {
      setApprovalSubmitting(false);
    }
  };

  const openRejectApprovalDialog = () => {
    if (!detailRequest) {
      return;
    }

    setApprovalDialog({
      open: true,
      request: detailRequest,
    });
    setApprovalError("");
  };

  const closeRejectApprovalDialog = () => {
    if (approvalSubmitting) {
      return;
    }

    setApprovalDialog({ open: false, request: null });
    setApprovalError("");
  };

  const openCancelRequestDialog = (request) => {
    setCancelRequestDialog({ open: true, request });
    setCancelRequestError("");
  };

  const closeCancelRequestDialog = () => {
    if (cancelRequestSubmitting) {
      return;
    }

    setCancelRequestDialog({ open: false, request: null });
    setCancelRequestError("");
  };

  const handleCancelRequest = async (reasonValue) => {
    if (!cancelRequestDialog.request) {
      return;
    }

    const reason = reasonValue.trim();
    if (!reason) {
      setCancelRequestError("Cancel reason is required.");
      return;
    }

    setCancelRequestSubmitting(true);
    setCancelRequestError("");

    try {
      await busBookingApi.cancelRequest(cancelRequestDialog.request.id, {
        reason,
      });
      notify({
        message: `Request #${cancelRequestDialog.request.id} cancelled.`,
        severity: "success",
      });
      setCancelRequestDialog({ open: false, request: null });
      await loadRequests();
      await loadPendingMyApprovals();
    } catch (error) {
      setCancelRequestError(getErrorMessage(error, "Could not cancel request."));
    } finally {
      setCancelRequestSubmitting(false);
    }
  };

  const handleRejectApproval = async (commentValue) => {
    if (!approvalDialog.request) {
      return;
    }

    const comment = commentValue.trim();
    if (!comment) {
      setApprovalError("Reject reason is required.");
      return;
    }

    const approverEmail = getEmailFromUser(auth.user);
    if (!approverEmail) {
      setApprovalError("Cannot resolve current user email for approval.");
      return;
    }

    setApprovalSubmitting(true);
    setApprovalError("");

    try {
      await busBookingApi.rejectRequestApproval(approvalDialog.request.id, {
        approverEmail,
        comment,
      });
      notify({
        message: `Request #${approvalDialog.request.id} rejected.`,
        severity: "success",
      });
      setApprovalDialog({ open: false, request: null });
      closeRequestDetail();
      await reloadRequestListsAfterApproval();
    } catch (error) {
      setApprovalError(getErrorMessage(error, "Could not reject request."));
    } finally {
      setApprovalSubmitting(false);
    }
  };

  const handleAssignFromDetail = () => {
    if (!detailRequest) {
      return;
    }

    closeRequestDetail();
    openAssignDialog(detailRequest, "assign");
  };

  const openAssignDialog = (request, mode = "assign") => {
    setAssignDialogOpen(true);
    setAssignRequest(request);
    setAssignMode(mode);
    setAssignError("");
    setAssignForm({
      vehicleId: "",
      planPickupTime: toPickerValue(request.pickupTime),
      planDropoffTime: toPickerValue(request.dropoffTime),
      note: "",
      comment: "",
    });
  };

  const closeAssignDialog = () => {
    setAssignDialogOpen(false);
    setAssignRequest(null);
    setAssignError("");
    setAssignForm({
      vehicleId: "",
      planPickupTime: null,
      planDropoffTime: null,
      note: "",
      comment: "",
    });
  };

  const handleAssignVehicle = async (event) => {
    event.preventDefault();

    if (!assignRequest) {
      return;
    }

    if (assignMode === "assign") {
      if (!assignForm.vehicleId) {
        setAssignError("Please choose a vehicle.");
        return;
      }

      if (
        assignForm.planPickupTime &&
        assignForm.planDropoffTime &&
        dayjs(assignForm.planDropoffTime).isBefore(
          dayjs(assignForm.planPickupTime),
        )
      ) {
        setAssignError(
          "Planned dropoff time must be after planned pickup time.",
        );
        return;
      }
    } else if (!assignForm.comment.trim()) {
      setAssignError("Reject reason is required.");
      return;
    }

    setAssignSubmitting(true);
    setAssignError("");

    try {
      if (assignMode === "assign") {
        await busBookingApi.assignRequest(assignRequest.id, {
          vehicleId: assignForm.vehicleId,
          planPickupTime: toApiDateTime(assignForm.planPickupTime),
          planDropoffTime: toApiDateTime(assignForm.planDropoffTime),
          note: assignForm.note,
        });
      } else {
        await busBookingApi.rejectRequestAssignment(assignRequest.id, {
          comment: assignForm.comment,
        });
      }

      notify({
        message:
          assignMode === "assign"
            ? `Vehicle assigned for request #${assignRequest.id}.`
            : `Request #${assignRequest.id} rejected.`,
        severity: "success",
      });
      closeAssignDialog();
      await refreshAll();
    } catch (error) {
      setAssignError(
        getErrorMessage(
          error,
          assignMode === "assign"
            ? "Could not assign vehicle."
            : "Could not reject request.",
        ),
      );
    } finally {
      setAssignSubmitting(false);
    }
  };

  const openVehicleDialog = (mode, item = null) => {
    setVehicleDialog({ open: true, mode, item });
    setVehicleSubmitError("");
    setVehicleForm(
      item
        ? {
            driverName: item.driverName,
            phoneNumber: item.phoneNumber,
            plateNumber: item.plateNumber,
            status: item.status,
          }
        : initialVehicleForm,
    );
  };

  const closeVehicleDialog = () => {
    setVehicleDialog({ open: false, mode: "create", item: null });
    setVehicleForm(initialVehicleForm);
    setVehicleSubmitError("");
  };

  const handleSubmitVehicle = async (event) => {
    event.preventDefault();
    setVehicleSubmitting(true);
    setVehicleSubmitError("");

    try {
      if (vehicleDialog.mode === "edit" && vehicleDialog.item) {
        await busBookingApi.updateVehicle(vehicleDialog.item.id, vehicleForm);
        notify({
          message: "Vehicle updated successfully.",
          severity: "success",
        });
      } else {
        await busBookingApi.createVehicle(vehicleForm);
        notify({
          message: "Vehicle created successfully.",
          severity: "success",
        });
      }

      closeVehicleDialog();
      await loadVehicles();
    } catch (error) {
      setVehicleSubmitError(getErrorMessage(error, "Could not save vehicle."));
    } finally {
      setVehicleSubmitting(false);
    }
  };

  const openLocationDialog = (mode, item = null) => {
    setLocationDialog({ open: true, mode, item });
    setLocationSubmitError("");
    setLocationForm(
      item
        ? {
            gate: item.gate,
            ccn: item.ccn,
          }
        : initialLocationForm,
    );
  };

  const closeLocationDialog = () => {
    setLocationDialog({ open: false, mode: "create", item: null });
    setLocationForm(initialLocationForm);
    setLocationSubmitError("");
  };

  const handleSubmitLocation = async (event) => {
    event.preventDefault();
    setLocationSubmitting(true);
    setLocationSubmitError("");

    try {
      if (locationDialog.mode === "edit" && locationDialog.item) {
        await busBookingApi.updateLocation(
          locationDialog.item.id,
          locationForm,
        );
        notify({
          message: "Location updated successfully.",
          severity: "success",
        });
      } else {
        await busBookingApi.createLocation(locationForm);
        notify({
          message: "Location created successfully.",
          severity: "success",
        });
      }

      closeLocationDialog();
      await loadLocations();
    } catch (error) {
      setLocationSubmitError(
        getErrorMessage(error, "Could not save location."),
      );
    } finally {
      setLocationSubmitting(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteState.type || !deleteState.item) {
      return;
    }

    setDeleteSubmitting(true);

    try {
      if (deleteState.type === "vehicle") {
        await busBookingApi.deleteVehicle(deleteState.item.id);
        notify({
          message: "Vehicle deleted successfully.",
          severity: "success",
        });
        await loadVehicles();
      } else if (deleteState.type === "location") {
        await busBookingApi.deleteLocation(deleteState.item.id);
        notify({
          message: "Location deleted successfully.",
          severity: "success",
        });
        await loadLocations();
      }

      setDeleteState({ type: "", item: null });
    } catch (error) {
      notify({
        message: getErrorMessage(error, "Could not delete the selected item."),
        severity: "error",
      });
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const requestColumns = createRequestColumns({
    onOpenDetail: openRequestDetail,
  });

  const pendingMyApprovalColumns = createRequestColumns({
    onOpenDetail: (row) => openRequestDetail(row, { canApprove: true }),
  });

  const adminRequestColumns = createAdminRequestColumns({
    onOpenDetail: openRequestDetail,
    onAssign: openAssignDialog,
    onCancel: openCancelRequestDialog,
  });

  const vehicleColumns = createVehicleColumns({
    onEdit: (row) => openVehicleDialog("edit", row),
    onDelete: (row) => setDeleteState({ type: "vehicle", item: row }),
  });

  const locationColumns = createLocationColumns({
    onEdit: (row) => openLocationDialog("edit", row),
    onDelete: (row) => setDeleteState({ type: "location", item: row }),
  });

  const typicalFlowSteps = [
    {
      title: "Book a bus",
      description: "Fill in information to create request.",
      icon: <AddRoundedIcon />,
    },
    {
      title: "Approval",
      description: "Head of department approve.",
      icon: <ApprovalRoundedIcon />,
    },
    {
      title: "Assign bus",
      description: "GA assign bus after request approve.",
      icon: <LocalShippingRoundedIcon />,
    },
  ];

  return (
    <Stack spacing={3.5}>
      <PageHeader
        breadcrumbs={[
          { label: t("dashboard.breadcrumbs.root"), to: "/dashboard" },
          { label: t("nav.hr_admin"), to: "/dashboard/hr-admin" },
          { label: "Booking Bus" },
        ]}
        title="Booking Bus"
        subtitle="Create bus booking request and track your request history."
        actions={
          isAdmin ? (
            <Chip label="Admin access" color="secondary" variant="outlined" />
          ) : null
        }
      />

      <SectionCard
        title="Typical flow"
        subtitle="Use this flow to understand how a bus booking request is created, approved, and assigned."
        cardSx={{ borderRadius: 0 }}
      >
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
          }}
        >
          {typicalFlowSteps.map((step, index) => (
            <Box
              key={step.title}
              sx={{
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: 1.5,
                alignItems: "flex-start",
                p: 2,
                borderRadius: 1,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                bgcolor: "background.default",
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  color: "primary.main",
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                }}
              >
                {step.icon}
              </Box>
              <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary">
                  Step {index + 1}
                </Typography>
                <Typography variant="subtitle1">{step.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {step.description}
                </Typography>
              </Stack>
            </Box>
          ))}
        </Box>
      </SectionCard>

      <SectionCard
        title="My requests"
        subtitle={`Review all your booking requests here`}
        cardSx={{ borderRadius: 0 }}
        action={
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={openRequestDialog}
            >
              Book a bus
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshRoundedIcon />}
              onClick={() => void refreshAll()}
              disabled={
                myRequestsLoading ||
                pendingMyApprovalsLoading ||
                requestsLoading ||
                locationsLoading ||
                vehiclesLoading
              }
            >
              Refresh
            </Button>
          </Stack>
        }
      >
        <Stack spacing={2.5}>
          <Tabs
            value={myRequestsTab}
            onChange={(_, value) => setMyRequestsTab(value)}
          >
            <Tab value="mine" label={`My requests (${myRequests.length})`} />
            <Tab
              value="pending-approval"
              label={`Pending my approval (${pendingMyApprovals.length})`}
            />
          </Tabs>

          {myRequestsTab === "mine" && myRequestsError ? (
            <Alert severity="error" variant="outlined">
              {myRequestsError}
            </Alert>
          ) : null}

          {myRequestsTab === "pending-approval" && pendingMyApprovalsError ? (
            <Alert severity="error" variant="outlined">
              {pendingMyApprovalsError}
            </Alert>
          ) : null}

          {myRequestsTab === "pending-approval" ? (
            <AppDataTable
              columns={pendingMyApprovalColumns}
              rows={pendingMyApprovals}
              loading={pendingMyApprovalsLoading}
              defaultRowsPerPage={5}
              searchPlaceholder="Search by any field"
              emptyTitle="No requests pending your approval"
              emptyDescription="Requests waiting for your approval will appear here."
            />
          ) : (
            <AppDataTable
              columns={requestColumns}
              rows={myRequests}
              loading={myRequestsLoading}
              defaultRowsPerPage={5}
              searchPlaceholder="Search by any field"
              emptyTitle="No booking requests yet"
              emptyDescription="Your submitted booking requests will appear here."
            />
          )}
        </Stack>
      </SectionCard>

      {isAdmin ? (
        <>
          <SectionCard
            title="All requests list"
            subtitle="Review every booking request and assign vehicle for approved requests."
            cardSx={{ borderRadius: 0 }}
          >
            <Stack spacing={2.5}>
              <Tabs
                value={allRequestsTab}
                onChange={(_, value) => setAllRequestsTab(value)}
              >
                <Tab value="all" label={`All (${adminRequests.length})`} />
                <Tab
                  value="approved"
                  label={`Approved (${approvedRequests.length})`}
                />
                <Tab
                  value="resolved"
                  label={`Resolved (${resolvedRequests.length})`}
                />
              </Tabs>

              {requestsError ? (
                <Alert severity="error" variant="outlined">
                  {requestsError}
                </Alert>
              ) : null}

              <AppDataTable
                columns={adminRequestColumns}
                rows={visibleAdminRequests}
                loading={requestsLoading}
                defaultRowsPerPage={10}
                pageSizeOptions={[10, 25, 50]}
                searchPlaceholder="Search by any field"
                emptyTitle="No requests available"
                emptyDescription="Booking requests matching the selected tab will appear here."
              />
            </Stack>
          </SectionCard>

          <SectionCard
            title="Master data"
            subtitle="Maintain vehicles and locations used by the booking workflow."
            cardSx={{ borderRadius: 0 }}
            action={
              masterDataTab === "vehicles" ? (
                <Button
                  startIcon={<AddRoundedIcon />}
                  variant="contained"
                  onClick={() => openVehicleDialog("create")}
                >
                  Add vehicle
                </Button>
              ) : (
                <Button
                  startIcon={<AddRoundedIcon />}
                  variant="contained"
                  onClick={() => openLocationDialog("create")}
                >
                  Add location
                </Button>
              )
            }
          >
            <Stack spacing={2.5}>
              <Tabs
                value={masterDataTab}
                onChange={(_, value) => setMasterDataTab(value)}
              >
                <Tab
                  value="vehicles"
                  icon={<LocalShippingRoundedIcon fontSize="small" />}
                  iconPosition="start"
                  label={`Vehicles (${vehicles.length})`}
                />
                <Tab
                  value="locations"
                  icon={<PlaceRoundedIcon fontSize="small" />}
                  iconPosition="start"
                  label={`Locations (${locations.length})`}
                />
              </Tabs>

              {masterDataTab === "vehicles" ? (
                <Stack spacing={2}>
                  {vehiclesError ? (
                    <Alert severity="error" variant="outlined">
                      {vehiclesError}
                    </Alert>
                  ) : null}
                  <AppDataTable
                    columns={vehicleColumns}
                    rows={vehicles}
                    loading={vehiclesLoading}
                    defaultRowsPerPage={5}
                    searchPlaceholder="Search by any field"
                    emptyTitle="No vehicles available"
                    emptyDescription="Create the first vehicle to enable assignment."
                  />
                </Stack>
              ) : (
                <Stack spacing={2}>
                  {locationsError ? (
                    <Alert severity="error" variant="outlined">
                      {locationsError}
                    </Alert>
                  ) : null}
                  <AppDataTable
                    columns={locationColumns}
                    rows={locations}
                    loading={locationsLoading}
                    defaultRowsPerPage={5}
                    searchPlaceholder="Search by any field"
                    emptyTitle="No locations available"
                    emptyDescription="Create pickup and dropoff locations for the booking form."
                  />
                </Stack>
              )}
            </Stack>
          </SectionCard>
        </>
      ) : null}

      <RequestFormDialog
        open={requestDialogOpen}
        onClose={closeRequestDialog}
        requestForm={requestForm}
        onSubmit={handleSubmitRequest}
        onClear={(nextForm) => {
          setRequestForm(nextForm);
          setRequestSubmitError("");
        }}
        requestSubmitError={requestSubmitError}
        hodsError={hodsError}
        locationsError={locationsError}
        locationOptions={locationOptions}
        hodOptions={hodOptions}
        defaultManagerEmail={getDefaultHodEmail(auth.user, hods)}
        hodsLoading={hodsLoading}
        locationsLoading={locationsLoading}
        requestSubmitting={requestSubmitting}
      />

      <RequestDetailDialog
        open={detailOpen}
        onClose={closeRequestDetail}
        detailRequest={detailRequest}
        detailAssignment={detailAssignment}
        detailApprovals={detailApprovals}
        detailHistory={detailHistory}
        detailLoading={detailLoading}
        detailError={detailError}
        isAdmin={isAdmin}
        availableVehicles={availableVehicles}
        onAssign={handleAssignFromDetail}
        canApprove={detailCanApprove}
        approvalSubmitting={approvalSubmitting}
        onApprove={handleApproveRequest}
        onReject={openRejectApprovalDialog}
      />

      <ApprovalDecisionDialog
        open={approvalDialog.open}
        request={approvalDialog.request}
        error={approvalError}
        submitting={approvalSubmitting}
        onClose={closeRejectApprovalDialog}
        onSubmit={handleRejectApproval}
      />

      <CancelRequestDialog
        open={cancelRequestDialog.open}
        request={cancelRequestDialog.request}
        error={cancelRequestError}
        submitting={cancelRequestSubmitting}
        onClose={closeCancelRequestDialog}
        onSubmit={handleCancelRequest}
      />

      <AssignRequestDialog
        open={assignDialogOpen}
        onClose={closeAssignDialog}
        assignRequest={assignRequest}
        assignMode={assignMode}
        assignForm={assignForm}
        setAssignForm={setAssignForm}
        availableVehicles={availableVehicles}
        assignSubmitting={assignSubmitting}
        assignError={assignError}
        onSubmit={handleAssignVehicle}
      />

      <VehicleDialog
        dialog={vehicleDialog}
        form={vehicleForm}
        setForm={setVehicleForm}
        submitting={vehicleSubmitting}
        submitError={vehicleSubmitError}
        onClose={closeVehicleDialog}
        onSubmit={handleSubmitVehicle}
      />

      <LocationDialog
        dialog={locationDialog}
        form={locationForm}
        setForm={setLocationForm}
        submitting={locationSubmitting}
        submitError={locationSubmitError}
        onClose={closeLocationDialog}
        onSubmit={handleSubmitLocation}
      />

      <ConfirmDialog
        open={Boolean(deleteState.type && deleteState.item)}
        title={`Delete ${deleteState.type || "item"}`}
        description={
          deleteState.type === "vehicle"
            ? `Delete vehicle ${deleteState.item?.plateNumber || ""}?`
            : `Delete location ${deleteState.item?.gate || ""}?`
        }
        confirmLabel={deleteSubmitting ? "Deleting..." : "Delete"}
        cancelLabel="Cancel"
        destructive
        onClose={() => {
          if (!deleteSubmitting) {
            setDeleteState({ type: "", item: null });
          }
        }}
        onConfirm={() => void handleDeleteItem()}
      />
    </Stack>
  );
}
