export const bookingStatusOptions = [
  "Pending Approval",
  "Approved",
  "Rejected",
  "Resolved",
  "Completed",
  "Cancelled",
];

export const vehicleStatusOptions = [
  { value: "Available", label: "Available" },
  { value: "Maintenance", label: "Maintenance" },
  { value: "Inactive", label: "Inactive" },
];

export const transportTypeOptions = [
  { value: "", label: "Select type" },
  { value: "Internal", label: "Internal" },
  { value: "External", label: "External" },
];

export const purposeOptions = [
  { value: "", label: "Select purpose" },
  { value: "Passenger", label: "Passenger" },
  { value: "Goods", label: "Goods" },
];

export const moveTypeOptions = [
  { value: "", label: "Select move type" },
  { value: "One Way", label: "One Way" },
  { value: "Round Trip", label: "Round Trip" },
];

export const useForOptions = [
  { value: "", label: "Select use for" },
  { value: "Owner", label: "Owner" },
  { value: "Supplier", label: "Supplier" },
  { value: "Visitor", label: "Visitor" },
];

export const initialRequestForm = {
  requestFor: "",
  typeOfTransport: "",
  purpose: "",
  typeOfGood: "",
  sizeOfGood: "",
  typeMove: "",
  pickupTime: null,
  dropoffTime: null,
  pickupPoint: "",
  dropoffPoint: "",
  estimateDistance: "",
  passenger: "",
  reason: "",
  managerEmail: "",
};

export const initialVehicleForm = {
  driverName: "",
  phoneNumber: "",
  plateNumber: "",
  status: "Available",
};

export const initialLocationForm = {
  gate: "",
  ccn: "",
};
