import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import EventBusyRoundedIcon from "@mui/icons-material/EventBusyRounded";
import LunchDiningRoundedIcon from "@mui/icons-material/LunchDiningRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
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
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AppDateField } from "../components/forms/AppDateField";
import { AppSelectField } from "../components/forms/AppSelectField";
import { AppTextField } from "../components/forms/AppTextField";
import { PageHeader } from "../components/layout/PageHeader";
import { SectionCard } from "../components/layout/SectionCard";
import { selectAuth } from "../features/auth/authSlice";
import { useAppSelector } from "../hooks/useAppSelector";
import { useNotifier } from "../hooks/useNotifier";
import { mealOrdersApi } from "../services/api/mealOrdersApi";
import { formatDateLabel } from "../utils/formatters";

const periodTypeOptions = [
  { value: "Day", label: "Day" },
  { value: "Week", label: "Week" },
  { value: "Month", label: "Month" },
];

const eatOptionOptions = [
  { value: "Ăn mặn", label: "Ăn mặn" },
  { value: "Ăn nhẹ", label: "Ăn nhẹ" },
  { value: "Ăn chay", label: "Ăn chay" },
  { value: "Alacarte", label: "Alacarte" },
  { value: "Sữa", label: "Sữa" },
];

const nhaMayOptions = [
  { value: "TEM", label: "TEM" },
  { value: "AO", label: "AO" },
  { value: "NT1", label: "NT1" },
];

const mealEatOptionOptions = [
  { value: "\u0102n m\u1eb7n", label: "\u0102n m\u1eb7n" },
  { value: "\u0102n nh\u1eb9", label: "\u0102n nh\u1eb9" },
  { value: "\u0102n chay", label: "\u0102n chay" },
  { value: "Alacarte", label: "Alacarte" },
  { value: "S\u1eefa", label: "S\u1eefa" },
];

const importTemplateHeaders = [
  "STT",
  "Employee ID",
  "Employee Name",
  "EatOption",
];

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const initialForm = {
  id: null,
  employeeId: "",
  date: null,
  eatOption: "",
  periodType: "Day",
  stt: false,
  department: "",
  shift: "",
  nhaMay: "",
};

const initialImportForm = {
  date: null,
  periodType: "Day",
  stt: false,
  shift: "",
  nhaMay: "",
  fileName: "",
  rows: [],
};

function getErrorMessage(error, fallback) {
  const responseData = error.response?.data;

  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  if (Array.isArray(responseData?.errors)) {
    return responseData.errors[0] || fallback;
  }

  if (responseData?.errors && typeof responseData.errors === "object") {
    const firstGroup = Object.values(responseData.errors).find(
      (value) => Array.isArray(value) && value.length > 0,
    );
    if (firstGroup) {
      return firstGroup[0];
    }
  }

  return (
    responseData?.detail ||
    responseData?.message ||
    responseData?.title ||
    error.message ||
    fallback
  );
}

function getMonthLabel(value) {
  return dayjs(value).format("MMMM YYYY");
}

function getFirstNonEmptyDate(...values) {
  const firstValue = values.find((value) => value);
  return firstValue ? formatDateLabel(firstValue) : "";
}

function getEmployeeIdFromUser(user) {
  if (!user || typeof user !== "object") {
    return "";
  }

  return (
    user.employeeID ||
    user.EmployeeID ||
    user.employeeId ||
    user.EmployeeId ||
    ""
  );
}

function getCalendarDays(monthValue) {
  const monthStart = monthValue.startOf("month");
  const startOffset = (monthStart.day() + 6) % 7;
  const calendarStart = monthStart.subtract(startOffset, "day");
  return Array.from({ length: 42 }, (_, index) =>
    calendarStart.add(index, "day"),
  );
}

function getMealOrderDates(dateValue, periodType) {
  const startDate = dayjs(dateValue).startOf("day");

  if (!startDate.isValid()) {
    return [];
  }

  if (periodType === "Day") {
    return [startDate.format("YYYY-MM-DD")];
  }

  let endDate = startDate;

  if (periodType === "Week") {
    endDate = startDate.add((7 - startDate.day()) % 7, "day");
  } else if (periodType === "Month") {
    endDate = startDate.endOf("month").startOf("day");
  }

  const dates = [];
  let cursor = startDate;

  while (cursor.valueOf() <= endDate.valueOf()) {
    if (cursor.day() !== 0) {
      dates.push(cursor.format("YYYY-MM-DD"));
    }
    cursor = cursor.add(1, "day");
  }

  return dates;
}

function normalizeHeader(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (character === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (character === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += character;
  }

  values.push(current);
  return values.map((value) => value.trim());
}

function parseImportTemplate(text) {
  const normalizedText = String(text || "")
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
  const lines = normalizedText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error(
      "The import file must contain a header row and at least one data row.",
    );
  }

  const headers = parseCsvLine(lines[0]);
  const headerIndexes = Object.fromEntries(
    headers.map((header, index) => [normalizeHeader(header), index]),
  );
  const requiredHeaders = importTemplateHeaders.map(normalizeHeader);
  const missingHeaders = requiredHeaders.filter(
    (header) => headerIndexes[header] === undefined,
  );

  if (missingHeaders.length > 0) {
    throw new Error(
      `The import file is missing required columns: ${missingHeaders.join(", ")}.`,
    );
  }

  const rows = lines
    .slice(1)
    .map((line, index) => {
      const cells = parseCsvLine(line);

      return {
        rowNumber: index + 2,
        stt: cells[headerIndexes[normalizeHeader("STT")]] || String(index + 1),
        employeeId: cells[headerIndexes[normalizeHeader("Employee ID")]] || "",
        employeeName:
          cells[headerIndexes[normalizeHeader("Employee Name")]] || "",
        eatOption: cells[headerIndexes[normalizeHeader("EatOption")]] || "",
      };
    })
    .filter(
      (row) =>
        row.employeeId.trim() ||
        row.employeeName.trim() ||
        row.eatOption.trim(),
    );

  if (rows.length === 0) {
    throw new Error("The import file does not contain any meal-order rows.");
  }

  return rows;
}

function escapeCsvCell(value) {
  const normalizedValue = String(value ?? "");

  if (/[",\n]/.test(normalizedValue)) {
    return `"${normalizedValue.replace(/"/g, '""')}"`;
  }

  return normalizedValue;
}

function downloadTextFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(objectUrl);
}

function MetricPanel({ title, value, trend, icon, color }) {
  return (
    <Box
      sx={{
        border: (theme) => `1px solid ${theme.palette.divider}`,
        bgcolor: "background.paper",
        minHeight: 148,
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 2,
        p: 2.25,
      }}
    >
      <Stack spacing={1.1}>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ letterSpacing: 1, lineHeight: 1.2 }}
        >
          {title}
        </Typography>
        <Typography variant="h3" sx={{ lineHeight: 1 }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {trend}
        </Typography>
      </Stack>
      <Box
        sx={{
          width: 46,
          height: 46,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          color,
          display: "grid",
          placeItems: "center",
          alignSelf: "start",
        }}
      >
        {icon}
      </Box>
    </Box>
  );
}

function CalendarOrderFields({ order, t }) {
  const rows = [
    { label: "Shift", value: order.shift },
    { label: "Eat Option", value: order.eatOption },
    { label: "Canteen", value: order.nhaMay },
  ];

  return (
    <Stack spacing={0.6}>
      {rows.map((item) => (
        <Box key={item.label} sx={{ px: 0.25 }}>
          <Typography
            variant="body2"
            sx={{
              lineHeight: 1.25,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              pr: 3.5,
            }}
          >
            <Box component="span" sx={{ color: "text.secondary" }}>
              {item.label}:
            </Box>{" "}
            <Box
              component="span"
              sx={{ fontWeight: 600, color: "text.primary" }}
            >
              {item.value || t("common.notAvailable")}
            </Box>
          </Typography>
        </Box>
      ))}
    </Stack>
  );
}

export function MealOrdersPage() {
  const { t } = useTranslation();
  const { notify } = useNotifier();
  const auth = useAppSelector(selectAuth);
  const loggedInEmployeeId = getEmployeeIdFromUser(auth.user);
  const [selectedMonth, setSelectedMonth] = useState(() =>
    dayjs().startOf("month"),
  );
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(
    () => loggedInEmployeeId || "",
  );
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [formError, setFormError] = useState("");
  const [importError, setImportError] = useState("");
  const [form, setForm] = useState(initialForm);
  const [importForm, setImportForm] = useState(initialImportForm);
  const [shiftOptions, setShiftOptions] = useState([]);
  const [importShiftOptions, setImportShiftOptions] = useState([]);
  const [loadingShifts, setLoadingShifts] = useState(false);
  const [loadingImportShifts, setLoadingImportShifts] = useState(false);
  const [shiftsError, setShiftsError] = useState("");
  const [importShiftsError, setImportShiftsError] = useState("");
  const fileInputRef = useRef(null);

  const shiftSelectOptions = useMemo(
    () => [
      {
        value: "",
        label: loadingShifts ? "Loading shifts..." : "Select shift",
      },
      ...shiftOptions,
    ],
    [loadingShifts, shiftOptions],
  );
  const importShiftSelectOptions = useMemo(
    () => [
      {
        value: "",
        label: loadingImportShifts ? "Loading shifts..." : "Select shift",
      },
      ...importShiftOptions,
    ],
    [importShiftOptions, loadingImportShifts],
  );

  const nhaMaySelectOptions = useMemo(
    () => [{ value: "", label: "Select factory" }, ...nhaMayOptions],
    [],
  );
  const eatOptionSelectOptions = useMemo(
    () => [{ value: "", label: "Select eat option" }, ...mealEatOptionOptions],
    [],
  );

  const loadOrders = useCallback(
    async (monthValue) => {
      setLoading(true);
      setError("");

      try {
        const nextOrders = await mealOrdersApi.getMonthlyOrders({
          employeeId: selectedEmployeeId.trim() || undefined,
          year: monthValue.year(),
          month: monthValue.month() + 1,
        });

        setOrders(nextOrders);
      } catch (nextError) {
        setError(
          getErrorMessage(
            nextError,
            "Could not load meal orders for the selected month.",
          ),
        );
      } finally {
        setLoading(false);
      }
    },
    [selectedEmployeeId],
  );

  const fetchShiftOptions = useCallback(async (sttValue) => {
    const shifts = await mealOrdersApi.getShifts({
      ot: sttValue ? "Yes" : "No",
    });

    return shifts
      .map((shift) => shift.shiftName?.trim())
      .filter(Boolean)
      .map((shiftName) => ({
        value: shiftName,
        label: shiftName,
      }));
  }, []);

  const loadShifts = useCallback(
    async (sttValue) => {
      setLoadingShifts(true);
      setShiftsError("");

      try {
        const nextOptions = await fetchShiftOptions(sttValue);

        setShiftOptions(nextOptions);
        setForm((current) => {
          if (!current.shift) {
            return current;
          }

          const hasCurrentShift = nextOptions.some(
            (option) => option.value === current.shift,
          );

          return hasCurrentShift ? current : { ...current, shift: "" };
        });
      } catch (nextError) {
        setShiftOptions([]);
        setShiftsError(
          getErrorMessage(
            nextError,
            "Could not load shifts for the selected STT.",
          ),
        );
      } finally {
        setLoadingShifts(false);
      }
    },
    [fetchShiftOptions],
  );

  const loadImportShifts = useCallback(
    async (sttValue) => {
      setLoadingImportShifts(true);
      setImportShiftsError("");

      try {
        const nextOptions = await fetchShiftOptions(sttValue);

        setImportShiftOptions(nextOptions);
        setImportForm((current) => {
          if (!current.shift) {
            return current;
          }

          const hasCurrentShift = nextOptions.some(
            (option) => option.value === current.shift,
          );

          return hasCurrentShift ? current : { ...current, shift: "" };
        });
      } catch (nextError) {
        setImportShiftOptions([]);
        setImportShiftsError(
          getErrorMessage(
            nextError,
            "Could not load shifts for the import settings.",
          ),
        );
      } finally {
        setLoadingImportShifts(false);
      }
    },
    [fetchShiftOptions],
  );

  useEffect(() => {
    void loadOrders(selectedMonth);
  }, [loadOrders, selectedMonth]);

  useEffect(() => {
    if (!dialogOpen) {
      return;
    }

    void loadShifts(form.stt);
  }, [dialogOpen, form.stt, loadShifts]);

  useEffect(() => {
    if (!importDialogOpen) {
      return;
    }

    void loadImportShifts(importForm.stt);
  }, [importDialogOpen, importForm.stt, loadImportShifts]);

  const resetForm = () => {
    setForm(initialForm);
    setFormError("");
    setShiftsError("");
    setShiftOptions([]);
  };

  const resetImportForm = () => {
    setImportForm(initialImportForm);
    setImportError("");
    setImportShiftsError("");
    setImportShiftOptions([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleOpenImport = () => {
    setImportForm({
      ...initialImportForm,
      date: selectedMonth.startOf("month"),
      nhaMay: nhaMayOptions[0]?.value || "",
    });
    setImportError("");
    setImportDialogOpen(true);
  };

  const handleCloseImport = () => {
    if (importing) {
      return;
    }

    setImportDialogOpen(false);
    resetImportForm();
  };

  const handleDownloadImportTemplate = () => {
    const templateContent = [
      importTemplateHeaders.map(escapeCsvCell).join(","),
      ["1", "E0001", "Nguyen Van A", mealEatOptionOptions[0].value]
        .map(escapeCsvCell)
        .join(","),
    ].join("\n");

    downloadTextFile(
      "meal-order-import-template.csv",
      `\uFEFF${templateContent}`,
      "text/csv;charset=utf-8;",
    );
  };

  const handleImportFileChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const fileText = await file.text();
      const rows = parseImportTemplate(fileText);

      setImportForm((current) => ({
        ...current,
        fileName: file.name,
        rows,
      }));
      setImportError("");
    } catch (nextError) {
      setImportForm((current) => ({
        ...current,
        fileName: "",
        rows: [],
      }));
      setImportError(nextError.message || "Could not read the import file.");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleOpenCreate = (dateValue = selectedMonth.startOf("month")) => {
    setForm({
      ...initialForm,
      employeeId: selectedEmployeeId.trim() || loggedInEmployeeId || "",
      date: dayjs(dateValue).startOf("day"),
      department: auth.user?.department || auth.user?.Department || "",
    });
    setFormError("");
    setDialogOpen(true);
  };

  const handleOpenEdit = (order) => {
    setForm({
      id: order.id,
      employeeId: order.employeeId || selectedEmployeeId.trim() || "",
      date: order.orderDate ? dayjs(order.orderDate) : null,
      eatOption: order.eatOption || "",
      periodType: "Day",
      stt: Boolean(order.stt),
      department: order.department || "",
      shift: order.shift || "",
      nhaMay: order.nhaMay || "",
    });
    setFormError("");
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (saving || deleting) {
      return;
    }

    setDialogOpen(false);
    resetForm();
  };

  const handleDeleteOrder = async () => {
    if (!form.id) {
      return;
    }

    setDeleting(true);
    setFormError("");

    try {
      await mealOrdersApi.deleteOrder(form.id, {
        employeeId: form.employeeId.trim() || undefined,
      });
      notify({
        message: "Meal order cancelled successfully.",
        severity: "success",
      });
      setDialogOpen(false);
      resetForm();
      await loadOrders(selectedMonth);
    } catch (nextError) {
      setFormError(
        getErrorMessage(nextError, "Could not cancel the meal order."),
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.date || !dayjs(form.date).isValid()) {
      setFormError("Date is required.");
      return;
    }

    if (!form.eatOption.trim()) {
      setFormError("EatOption is required.");
      return;
    }

    if (!form.employeeId.trim()) {
      setFormError("Employee ID is required.");
      return;
    }

    if (!form.shift.trim()) {
      setFormError("Shift is required.");
      return;
    }

    if (!form.nhaMay.trim()) {
      setFormError("NhaMay is required.");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      const payload = {
        employeeId: form.employeeId.trim(),
        date: dayjs(form.date).format("YYYY-MM-DD"),
        eatOption: form.eatOption.trim(),
        periodType: form.periodType,
        stt: form.stt,
        department: form.department.trim(),
        shift: form.shift.trim(),
        nhaMay: form.nhaMay.trim(),
      };

      if (form.id) {
        await mealOrdersApi.updateOrder(form.id, payload);
        notify({
          message: "Meal order updated successfully.",
          severity: "success",
        });
      } else {
        const targetDates = getMealOrderDates(form.date, form.periodType);

        if (targetDates.length === 0) {
          setFormError(
            "The selected period does not contain any valid meal-order dates.",
          );
          return;
        }

        const creationResults = await Promise.allSettled(
          targetDates.map((date) =>
            mealOrdersApi.createOrder({
              ...payload,
              date,
              periodType: "Day",
            }),
          ),
        );
        const createdOrders = creationResults
          .filter((result) => result.status === "fulfilled")
          .flatMap((result) => result.value);
        const failedResults = creationResults
          .map((result, index) => ({ result, date: targetDates[index] }))
          .filter(({ result }) => result.status === "rejected");

        if (createdOrders.length === 0 && failedResults.length > 0) {
          setFormError(
            getErrorMessage(
              failedResults[0].result.reason,
              `Could not create the meal order for ${failedResults[0].date}.`,
            ),
          );
          return;
        }

        notify({
          message:
            failedResults.length > 0
              ? `Created ${createdOrders.length} meal order${createdOrders.length === 1 ? "" : "s"}. ${failedResults.length} day${failedResults.length === 1 ? "" : "s"} could not be created.`
              : `Created ${createdOrders.length} meal order${createdOrders.length === 1 ? "" : "s"}.`,
          severity: failedResults.length > 0 ? "warning" : "success",
        });
      }

      setDialogOpen(false);
      resetForm();
      await loadOrders(selectedMonth);
    } catch (nextError) {
      setFormError(
        getErrorMessage(nextError, "Could not save the meal order."),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleImportSubmit = async (event) => {
    event.preventDefault();

    if (!importForm.date || !dayjs(importForm.date).isValid()) {
      setImportError("Date is required.");
      return;
    }

    if (!importForm.shift.trim()) {
      setImportError("Shift is required.");
      return;
    }

    if (!importForm.nhaMay.trim()) {
      setImportError("NhaMay is required.");
      return;
    }

    if (importForm.rows.length === 0) {
      setImportError("Please upload the import template before submitting.");
      return;
    }

    const invalidRow = importForm.rows.find(
      (row) =>
        !row.employeeId.trim() ||
        !row.eatOption.trim() ||
        !mealEatOptionOptions.some(
          (option) => option.value === row.eatOption.trim(),
        ),
    );

    if (invalidRow) {
      setImportError(
        `Row ${invalidRow.rowNumber} must contain Employee ID and a valid EatOption.`,
      );
      return;
    }

    const targetDates = getMealOrderDates(
      importForm.date,
      importForm.periodType,
    );

    if (targetDates.length === 0) {
      setImportError(
        "The selected period does not contain any valid meal-order dates.",
      );
      return;
    }

    setImporting(true);
    setImportError("");

    try {
      const requests = importForm.rows.flatMap((row) =>
        targetDates.map((date) => ({
          row,
          date,
          request: mealOrdersApi.createOrder({
            employeeId: row.employeeId.trim(),
            date,
            eatOption: row.eatOption.trim(),
            periodType: "Day",
            stt: importForm.stt,
            department: "",
            shift: importForm.shift.trim(),
            nhaAn: "",
            nhaMay: importForm.nhaMay.trim(),
          }),
        })),
      );
      const results = await Promise.allSettled(
        requests.map((item) => item.request),
      );
      const createdOrders = results
        .filter((result) => result.status === "fulfilled")
        .flatMap((result) => result.value);
      const failedResults = results
        .map((result, index) => ({
          result,
          row: requests[index].row,
          date: requests[index].date,
        }))
        .filter(({ result }) => result.status === "rejected");

      if (createdOrders.length === 0 && failedResults.length > 0) {
        setImportError(
          getErrorMessage(
            failedResults[0].result.reason,
            `Could not import Employee ID ${failedResults[0].row.employeeId} for ${failedResults[0].date}.`,
          ),
        );
        return;
      }

      notify({
        message:
          failedResults.length > 0
            ? `Imported ${createdOrders.length} meal order${createdOrders.length === 1 ? "" : "s"}. ${failedResults.length} row${failedResults.length === 1 ? "" : "s"} could not be created.`
            : `Imported ${createdOrders.length} meal order${createdOrders.length === 1 ? "" : "s"}.`,
        severity: failedResults.length > 0 ? "warning" : "success",
      });

      setImportDialogOpen(false);
      resetImportForm();
      await loadOrders(selectedMonth);
    } catch (nextError) {
      setImportError(
        getErrorMessage(nextError, "Could not import the meal-order file."),
      );
    } finally {
      setImporting(false);
    }
  };

  const orderedDays = new Set(
    orders.map((order) => order.orderDate).filter(Boolean),
  ).size;
  const distinctEatOptions = new Set(
    orders.map((order) => order.eatOption).filter(Boolean),
  ).size;
  const latestCreatedAt = useMemo(
    () =>
      orders
        .map((order) => order.createdAt)
        .filter(Boolean)
        .sort()
        .at(-1),
    [orders],
  );

  const orderByDate = useMemo(
    () =>
      Object.fromEntries(
        orders
          .filter((order) => order.orderDate)
          .map((order) => [dayjs(order.orderDate).format("YYYY-MM-DD"), order]),
      ),
    [orders],
  );

  const calendarDays = useMemo(
    () => getCalendarDays(selectedMonth),
    [selectedMonth],
  );

  const stats = [
    {
      title: t("mealOrders.stats.recordsTitle", {
        defaultValue: "Orders this month",
      }),
      value: String(orders.length),
      trend: t("mealOrders.stats.recordsTrend", {
        defaultValue:
          "Rows returned from MealOrdersController for the selected month.",
      }),
      icon: <ReceiptLongRoundedIcon />,
      color: "warning.main",
    },
    {
      title: t("mealOrders.stats.daysTitle", { defaultValue: "Ordered days" }),
      value: String(orderedDays),
      trend: t("mealOrders.stats.daysTrend", {
        defaultValue: "Unique order dates returned in the current month.",
      }),
      icon: <CalendarMonthRoundedIcon />,
      color: "primary.main",
    },
    {
      title: t("mealOrders.stats.optionsTitle", {
        defaultValue: "Eat options",
      }),
      value: String(distinctEatOptions),
      trend: latestCreatedAt
        ? `Latest created ${getFirstNonEmptyDate(latestCreatedAt)}.`
        : t("mealOrders.stats.optionsTrend", {
            defaultValue: "No created timestamp available yet.",
          }),
      icon: <RestaurantRoundedIcon />,
      color: "secondary.main",
    },
  ];

  return (
    <Stack spacing={3.5}>
      <PageHeader
        breadcrumbs={[
          { label: t("dashboard.breadcrumbs.root"), to: "/dashboard" },
          { label: t("nav.hr_admin"), to: "/dashboard/hr-admin" },
          {
            label: t("hrAdmin.features.orderMeal.title", {
              defaultValue: "Order Meal",
            }),
          },
        ]}
        title={t("hrAdmin.features.orderMeal.title", {
          defaultValue: "Order Meal",
        })}
        // subtitle={t("mealOrders.subtitle", {
        //   defaultValue:
        //     "Order meals for daily/weekly/monthly basis for yourself or your colleagues.",
        // })}
        actions={
          <Chip
            label={getMonthLabel(selectedMonth)}
            color="warning"
            variant="outlined"
            icon={<LunchDiningRoundedIcon />}
            sx={{ borderRadius: 0, height: 34 }}
          />
        }
      />

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
        }}
      >
        {stats.map((stat) => (
          <MetricPanel key={stat.title} {...stat} />
        ))}
      </Box>

      <SectionCard
        title={t("mealOrders.listTitle", {
          defaultValue: "Monthly Meal Orders",
        })}
        subtitle={t("mealOrders.listSubtitle", {
          defaultValue:
            "Order meals for daily/weekly/monthly basis for yourself or your colleagues.",
        })}
        cardSx={{
          borderRadius: 0,
          boxShadow: "none",
          border: (theme) => `1px solid ${theme.palette.divider}`,
        }}
        contentSx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}
      >
        <Stack spacing={2}>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "1fr",
                lg: "minmax(0, 1fr) auto",
              },
              alignItems: "end",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1.25,
                alignItems: "flex-start",
              }}
            >
              <AppTextField
                label={t("mealOrders.filters.employeeId", {
                  defaultValue: "Employee ID",
                })}
                value={selectedEmployeeId}
                onChange={(event) => setSelectedEmployeeId(event.target.value)}
                size="small"
                sx={{
                  width: { xs: "100%", sm: 220 },
                  flex: "0 0 auto",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 0,
                  },
                }}
              />
              <DatePicker
                label={t("mealOrders.filters.month", { defaultValue: "Month" })}
                value={selectedMonth}
                onChange={(value) => {
                  if (value?.isValid()) {
                    setSelectedMonth(value.startOf("month"));
                  }
                }}
                views={["year", "month"]}
                openTo="month"
                format="MMMM YYYY"
                closeOnSelect
                slotProps={{
                  textField: {
                    size: "small",
                    sx: {
                      width: { xs: "100%", sm: 220 },
                      flex: "0 0 auto",
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 0,
                      },
                    },
                  },
                }}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: { xs: "flex-start", lg: "flex-end" },
                alignItems: "flex-end",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1.25,
                  justifyContent: { xs: "flex-start", lg: "flex-end" },
                }}
              >
                <Button
                  variant="outlined"
                  startIcon={<DownloadRoundedIcon />}
                  onClick={handleDownloadImportTemplate}
                  sx={{ borderRadius: 0, whiteSpace: "nowrap" }}
                >
                  {t("mealOrders.actions.downloadTemplate", {
                    defaultValue: "Download template",
                  })}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<UploadFileRoundedIcon />}
                  onClick={handleOpenImport}
                  sx={{ borderRadius: 0, whiteSpace: "nowrap" }}
                >
                  {t("mealOrders.actions.importExcel", {
                    defaultValue: "Import Excel",
                  })}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshRoundedIcon />}
                  onClick={() => void loadOrders(selectedMonth)}
                  disabled={loading}
                  sx={{ borderRadius: 0, whiteSpace: "nowrap" }}
                >
                  {t("actions.refresh", { defaultValue: "Refresh" })}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddRoundedIcon />}
                  onClick={() => handleOpenCreate()}
                  sx={{ borderRadius: 0, whiteSpace: "nowrap" }}
                >
                  {t("mealOrders.actions.newOrder", {
                    defaultValue: "New order",
                  })}
                </Button>
              </Box>
            </Box>
          </Box>

          {error ? (
            <Alert severity="error" variant="outlined">
              {error}
            </Alert>
          ) : null}

          {loading ? (
            <Box
              sx={{
                minHeight: 420,
                display: "grid",
                placeItems: "center",
                border: (theme) => `1px solid ${theme.palette.divider}`,
                bgcolor: "background.default",
              }}
            >
              <Stack spacing={1.5} alignItems="center">
                <CircularProgress />
                <Typography color="text.secondary">
                  {t("mealOrders.loading", {
                    defaultValue: "Loading calendar...",
                  })}
                </Typography>
              </Stack>
            </Box>
          ) : orders.length === 0 ? (
            <Box
              sx={{
                minHeight: 320,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                bgcolor: "background.default",
                display: "grid",
                placeItems: "center",
                p: 3,
              }}
            >
              <Stack
                spacing={2}
                alignItems="center"
                sx={{ maxWidth: 420, textAlign: "center" }}
              >
                <EventBusyRoundedIcon color="primary" sx={{ fontSize: 40 }} />
                <Typography variant="h5">
                  {t("mealOrders.emptyTitle", {
                    defaultValue: "No meal orders found",
                  })}
                </Typography>
                <Typography color="text.secondary">
                  {t("mealOrders.emptyDescription", {
                    defaultValue:
                      "There are no meal orders for the selected month yet. Create a new order to begin.",
                  })}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => handleOpenCreate()}
                  sx={{ borderRadius: 0 }}
                >
                  {t("mealOrders.actions.newOrder", {
                    defaultValue: "New order",
                  })}
                </Button>
              </Stack>
            </Box>
          ) : (
            <Box>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                  gap: 0,
                  borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                  borderLeft: (theme) => `1px solid ${theme.palette.divider}`,
                }}
              >
                {weekdayLabels.map((label) => (
                  <Box
                    key={label}
                    sx={{
                      px: 1.2,
                      py: 1,
                      bgcolor: "primary.main",
                      borderRight: (theme) =>
                        `1px solid ${theme.palette.divider}`,
                      borderBottom: (theme) =>
                        `1px solid ${theme.palette.divider}`,
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        letterSpacing: 0.5,
                        color: "primary.contrastText",
                        fontWeight: 700,
                      }}
                    >
                      {label}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                  gap: 0,
                  borderLeft: (theme) => `1px solid ${theme.palette.divider}`,
                }}
              >
                {calendarDays.map((dayValue) => {
                  const dayKey = dayValue.format("YYYY-MM-DD");
                  const order = orderByDate[dayKey] || null;
                  const isCurrentMonth =
                    dayValue.month() === selectedMonth.month();
                  const isToday = dayValue.isSame(dayjs(), "day");

                  return (
                    <Box
                      key={dayKey}
                      sx={{
                        position: "relative",
                        minHeight: 150,
                        p: 1.1,
                        borderRight: (theme) =>
                          `1px solid ${theme.palette.divider}`,
                        borderBottom: (theme) =>
                          `1px solid ${theme.palette.divider}`,
                        borderTop: isToday
                          ? (theme) => `2px solid ${theme.palette.primary.main}`
                          : "none",
                        bgcolor: isCurrentMonth
                          ? "background.paper"
                          : "action.hover",
                        opacity: isCurrentMonth ? 1 : 0.5,
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.75,
                        cursor: isCurrentMonth ? "pointer" : "default",
                        transition:
                          "background-color 140ms ease, color 140ms ease, box-shadow 140ms ease",
                        "&:hover": isCurrentMonth
                          ? {
                              bgcolor: order ? "warning.50" : "grey.100",
                              boxShadow: (theme) =>
                                `inset 0 0 0 1px ${theme.palette.primary.main}`,
                            }
                          : undefined,
                      }}
                    >
                      <Chip
                        label={dayValue.format("DD")}
                        size="small"
                        color={isToday ? "primary" : "default"}
                        variant={isToday ? "filled" : "outlined"}
                        sx={{
                          borderRadius: 0,
                          minWidth: 38,
                          alignSelf: "flex-start",
                          bgcolor: isToday
                            ? undefined
                            : isCurrentMonth
                              ? "warning.100"
                              : "transparent",
                          borderColor: isCurrentMonth
                            ? "warning.main"
                            : undefined,
                          color: isToday
                            ? "white"
                            : isCurrentMonth
                              ? "warning.dark"
                              : undefined,
                          fontWeight: 700,
                        }}
                      />

                      {order ? (
                        <Tooltip
                          title={t("mealOrders.actions.edit", {
                            defaultValue: "Edit order",
                          })}
                        >
                          <span>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenEdit(order)}
                              sx={{
                                borderRadius: 0,
                                position: "absolute",
                                top: 6,
                                right: 6,
                              }}
                            >
                              <EditRoundedIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      ) : isCurrentMonth ? (
                        <Tooltip
                          title={t("mealOrders.actions.newOrder", {
                            defaultValue: "New order",
                          })}
                        >
                          <span>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenCreate(dayValue)}
                              sx={{
                                borderRadius: 0,
                                position: "absolute",
                                top: 6,
                                right: 6,
                              }}
                            >
                              <AddRoundedIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      ) : null}

                      {order ? (
                        <Box
                          sx={{
                            pt: 1,
                          }}
                        >
                          <CalendarOrderFields order={order} t={t} />
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            flex: 1,
                            display: "grid",
                            placeItems: "center",
                            color: "text.secondary",
                            textAlign: "center",
                            px: 0.75,
                            py: 0.5,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ lineHeight: 1.3 }}
                          >
                            {isCurrentMonth
                              ? t("mealOrders.calendar.emptyDay", {
                                  defaultValue: "No meal order",
                                })
                              : ""}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}
        </Stack>
      </SectionCard>

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 0,
          },
        }}
      >
        <DialogTitle>
          {form.id
            ? t("mealOrders.dialog.editTitle", {
                defaultValue: "Edit meal order",
              })
            : t("mealOrders.dialog.createTitle", {
                defaultValue: "Create meal order",
              })}
        </DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent dividers>
            <Stack spacing={2}>
              {formError ? (
                <Alert severity="error" variant="outlined">
                  {formError}
                </Alert>
              ) : null}

              <AppDateField
                label={t("mealOrders.form.date", { defaultValue: "Date" })}
                value={form.date}
                onChange={(value) =>
                  setForm((current) => ({ ...current, date: value }))
                }
                slotProps={{
                  textField: {
                    sx: {
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 0,
                      },
                    },
                  },
                }}
              />

              <AppTextField
                label={t("mealOrders.form.employeeId", {
                  defaultValue: "Employee ID",
                })}
                value={form.employeeId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    employeeId: event.target.value,
                  }))
                }
                fullWidth
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
              />

              <AppSelectField
                label={t("mealOrders.form.periodType", {
                  defaultValue: "Period type",
                })}
                value={form.periodType}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    periodType: event.target.value,
                  }))
                }
                options={periodTypeOptions}
                fullWidth
                disabled={Boolean(form.id)}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
              />

              <AppSelectField
                label={t("mealOrders.form.eatOption", {
                  defaultValue: "Eat option",
                })}
                value={form.eatOption}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    eatOption: event.target.value,
                  }))
                }
                options={eatOptionSelectOptions}
                fullWidth
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={form.stt}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        stt: event.target.checked,
                        shift: "",
                      }))
                    }
                  />
                }
                label={t("mealOrders.form.overtime", {
                  defaultValue: "Overtime",
                })}
              />

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
                  label={t("mealOrders.form.shift", {
                    defaultValue: "Shift",
                  })}
                  value={form.shift}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      shift: event.target.value,
                    }))
                  }
                  options={shiftSelectOptions}
                  fullWidth
                  disabled={loadingShifts}
                  error={Boolean(shiftsError)}
                  helperText={shiftsError || undefined}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
                />
                <AppSelectField
                  label={t("mealOrders.form.nhaMay", {
                    defaultValue: "Nha may",
                  })}
                  value={form.nhaMay}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      nhaMay: event.target.value,
                    }))
                  }
                  options={nhaMaySelectOptions}
                  fullWidth
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
                />
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            {form.id ? (
              <Button
                color="error"
                variant="outlined"
                onClick={() => void handleDeleteOrder()}
                disabled={saving || deleting}
                sx={{ borderRadius: 0, mr: "auto" }}
              >
                {deleting
                  ? t("mealOrders.actions.cancellingOrder", {
                      defaultValue: "Cancelling...",
                    })
                  : t("mealOrders.actions.cancelOrder", {
                      defaultValue: "Cancel order",
                    })}
              </Button>
            ) : null}
            <Button
              onClick={handleCloseDialog}
              disabled={saving || deleting}
              sx={{ borderRadius: 0 }}
            >
              {t("actions.cancel", { defaultValue: "Cancel" })}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={saving || deleting}
              startIcon={
                saving ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <LunchDiningRoundedIcon />
                )
              }
              sx={{ borderRadius: 0 }}
            >
              {form.id
                ? t("mealOrders.actions.saveChanges", {
                    defaultValue: "Save changes",
                  })
                : t("mealOrders.actions.placeOrder", {
                    defaultValue: "Place order",
                  })}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog
        open={importDialogOpen}
        onClose={handleCloseImport}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 0,
          },
        }}
      >
        <DialogTitle>
          {t("mealOrders.import.title", {
            defaultValue: "Import meal orders",
          })}
        </DialogTitle>
        <Box component="form" onSubmit={handleImportSubmit}>
          <DialogContent dividers>
            <Stack spacing={2}>
              {importError ? (
                <Alert severity="error" variant="outlined">
                  {importError}
                </Alert>
              ) : null}

              <AppDateField
                label={t("mealOrders.form.date", { defaultValue: "Date" })}
                value={importForm.date}
                onChange={(value) =>
                  setImportForm((current) => ({ ...current, date: value }))
                }
                slotProps={{
                  textField: {
                    sx: {
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 0,
                      },
                    },
                  },
                }}
              />

              <AppSelectField
                label={t("mealOrders.form.periodType", {
                  defaultValue: "Period type",
                })}
                value={importForm.periodType}
                onChange={(event) =>
                  setImportForm((current) => ({
                    ...current,
                    periodType: event.target.value,
                  }))
                }
                options={periodTypeOptions}
                fullWidth
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={importForm.stt}
                    onChange={(event) =>
                      setImportForm((current) => ({
                        ...current,
                        stt: event.target.checked,
                        shift: "",
                      }))
                    }
                  />
                }
                label={t("mealOrders.form.overtime", {
                  defaultValue: "Overtime",
                })}
              />

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
                  label={t("mealOrders.form.shift", {
                    defaultValue: "Shift",
                  })}
                  value={importForm.shift}
                  onChange={(event) =>
                    setImportForm((current) => ({
                      ...current,
                      shift: event.target.value,
                    }))
                  }
                  options={importShiftSelectOptions}
                  fullWidth
                  disabled={loadingImportShifts}
                  error={Boolean(importShiftsError)}
                  helperText={importShiftsError || undefined}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
                />
                <AppSelectField
                  label={t("mealOrders.form.nhaMay", {
                    defaultValue: "Nha may",
                  })}
                  value={importForm.nhaMay}
                  onChange={(event) =>
                    setImportForm((current) => ({
                      ...current,
                      nhaMay: event.target.value,
                    }))
                  }
                  options={nhaMaySelectOptions}
                  fullWidth
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
                />
              </Box>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={(event) => void handleImportFileChange(event)}
                hidden
              />

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.25}
                alignItems={{ xs: "stretch", sm: "center" }}
              >
                <Button
                  variant="outlined"
                  startIcon={<UploadFileRoundedIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    borderRadius: 0,
                    whiteSpace: "nowrap",
                    alignSelf: { xs: "stretch", sm: "flex-start" },
                  }}
                >
                  {importForm.fileName
                    ? t("mealOrders.import.changeFile", {
                        defaultValue: "Change file",
                      })
                    : t("mealOrders.import.chooseFile", {
                        defaultValue: "Choose template file",
                      })}
                </Button>
                {importForm.fileName ? (
                  <Typography
                    color="text.secondary"
                    variant="body2"
                    sx={{ wordBreak: "break-word" }}
                  >
                    {`${importForm.fileName} • ${importForm.rows.length} row${importForm.rows.length === 1 ? "" : "s"}`}
                  </Typography>
                ) : null}
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button
              onClick={handleCloseImport}
              disabled={importing}
              sx={{ borderRadius: 0 }}
            >
              {t("actions.cancel", { defaultValue: "Cancel" })}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={importing}
              startIcon={
                importing ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <UploadFileRoundedIcon />
                )
              }
              sx={{ borderRadius: 0 }}
            >
              {t("mealOrders.import.submit", {
                defaultValue: "Import orders",
              })}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Stack>
  );
}
