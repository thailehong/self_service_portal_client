import LunchDiningRoundedIcon from "@mui/icons-material/LunchDiningRounded";
import DirectionsBusRoundedIcon from "@mui/icons-material/DirectionsBusRounded";
import AccessTimeFilledRoundedIcon from "@mui/icons-material/AccessTimeFilledRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";

export function getHrAdminFeatures(t) {
  return [
    {
      id: "order-meal",
      routePath: "/dashboard/hr-admin/order-meal",
      title: t("hrAdmin.features.orderMeal.title", {
        defaultValue: "Order Meal",
      }),
      description: t("hrAdmin.features.orderMeal.description", {
        defaultValue:
          "Submit daily breakfast and lunch orders with clear cut-off times and delivery tracking for each office.",
      }),
      category: t("hrAdmin.features.orderMeal.category", {
        defaultValue: "Daily service",
      }),
      status: t("hrAdmin.features.orderMeal.status", {
        defaultValue: "Open today",
      }),
      accentColor: "warning.main",
      icon: LunchDiningRoundedIcon,
      meta: [
        t("hrAdmin.features.orderMeal.meta.cutoff", {
          defaultValue: "Cut-off 11:30",
        }),
        t("hrAdmin.features.orderMeal.meta.delivery", {
          defaultValue: "Delivery by floor",
        }),
      ],
      metrics: [
        {
          title: t("hrAdmin.features.orderMeal.metrics.requestsTitle", {
            defaultValue: "Orders today",
          }),
          value: "142",
          trend: t("hrAdmin.features.orderMeal.metrics.requestsTrend", {
            defaultValue:
              "Breakfast and lunch demand across all active offices.",
          }),
          icon: ReceiptLongRoundedIcon,
          color: "warning.main",
        },
        {
          title: t("hrAdmin.features.orderMeal.metrics.windowTitle", {
            defaultValue: "Order window",
          }),
          value: "11:30",
          trend: t("hrAdmin.features.orderMeal.metrics.windowTrend", {
            defaultValue:
              "Requests submitted before cut-off move directly to kitchen planning.",
          }),
          icon: ScheduleRoundedIcon,
          color: "primary.main",
        },
        {
          title: t("hrAdmin.features.orderMeal.metrics.ownerTitle", {
            defaultValue: "Service owner",
          }),
          value: t("hrAdmin.features.orderMeal.metrics.ownerValue", {
            defaultValue: "Admin team",
          }),
          trend: t("hrAdmin.features.orderMeal.metrics.ownerTrend", {
            defaultValue:
              "Coordinates vendors, menu rotation, and office delivery slots.",
          }),
          icon: SupportAgentRoundedIcon,
          color: "secondary.main",
        },
      ],
      highlights: [
        t("hrAdmin.features.orderMeal.highlights.one", {
          defaultValue:
            "Review menus by site, meal type, and vendor availability before placing an order.",
        }),
        t("hrAdmin.features.orderMeal.highlights.two", {
          defaultValue:
            "Keep dietary preferences and office delivery notes visible in the same workflow.",
        }),
        t("hrAdmin.features.orderMeal.highlights.three", {
          defaultValue:
            "Track submission timing so late requests can be handled through a controlled exception path.",
        }),
      ],
      workflowSteps: [
        t("hrAdmin.features.orderMeal.steps.one", {
          defaultValue:
            "Choose office, date, and meal option for the current order window.",
        }),
        t("hrAdmin.features.orderMeal.steps.two", {
          defaultValue:
            "Confirm dietary notes and review the vendor cut-off before submission.",
        }),
        t("hrAdmin.features.orderMeal.steps.three", {
          defaultValue:
            "Monitor delivery status and notify employees if menu or timing changes occur.",
        }),
      ],
    },
    {
      id: "booking-bus",
      routePath: "/dashboard/hr-admin/booking-bus",
      title: t("hrAdmin.features.bookingBus.title", {
        defaultValue: "Booking Bus",
      }),
      description: t("hrAdmin.features.bookingBus.description", {
        defaultValue:
          "Reserve employee shuttle seats, view route schedules, and manage transport demand for peak shifts.",
      }),
      category: t("hrAdmin.features.bookingBus.category", {
        defaultValue: "Transportation",
      }),
      status: t("hrAdmin.features.bookingBus.status", {
        defaultValue: "Reservations available",
      }),
      accentColor: "info.main",
      icon: DirectionsBusRoundedIcon,
      meta: [
        t("hrAdmin.features.bookingBus.meta.routes", {
          defaultValue: "12 active routes",
        }),
        t("hrAdmin.features.bookingBus.meta.support", {
          defaultValue: "Seat changes supported",
        }),
      ],
      metrics: [
        {
          title: t("hrAdmin.features.bookingBus.metrics.requestsTitle", {
            defaultValue: "Booked seats",
          }),
          value: "286",
          trend: t("hrAdmin.features.bookingBus.metrics.requestsTrend", {
            defaultValue:
              "Confirmed shuttle capacity for the next departure windows.",
          }),
          icon: ReceiptLongRoundedIcon,
          color: "info.main",
        },
        {
          title: t("hrAdmin.features.bookingBus.metrics.windowTitle", {
            defaultValue: "Next dispatch",
          }),
          value: "17:45",
          trend: t("hrAdmin.features.bookingBus.metrics.windowTrend", {
            defaultValue:
              "Operations uses this slot to finalize passenger manifests.",
          }),
          icon: ScheduleRoundedIcon,
          color: "primary.main",
        },
        {
          title: t("hrAdmin.features.bookingBus.metrics.ownerTitle", {
            defaultValue: "Service owner",
          }),
          value: t("hrAdmin.features.bookingBus.metrics.ownerValue", {
            defaultValue: "HR Operations",
          }),
          trend: t("hrAdmin.features.bookingBus.metrics.ownerTrend", {
            defaultValue:
              "Manages route coverage, occupancy, and transport vendors.",
          }),
          icon: SupportAgentRoundedIcon,
          color: "secondary.main",
        },
      ],
      highlights: [
        t("hrAdmin.features.bookingBus.highlights.one", {
          defaultValue:
            "Show route, stop, and shift alignment in one place before confirming a seat.",
        }),
        t("hrAdmin.features.bookingBus.highlights.two", {
          defaultValue:
            "Keep capacity pressure visible early so HR can open overflow support when needed.",
        }),
        t("hrAdmin.features.bookingBus.highlights.three", {
          defaultValue:
            "Track updates to manifests and communicate last-minute route changes quickly.",
        }),
      ],
      workflowSteps: [
        t("hrAdmin.features.bookingBus.steps.one", {
          defaultValue:
            "Select the route, pick-up point, and departure slot that matches the employee schedule.",
        }),
        t("hrAdmin.features.bookingBus.steps.two", {
          defaultValue:
            "Confirm the request before the booking deadline to secure a seat.",
        }),
        t("hrAdmin.features.bookingBus.steps.three", {
          defaultValue:
            "Review manifest changes and update affected passengers when schedules move.",
        }),
      ],
    },
    {
      id: "visitor-management",
      title: t("hrAdmin.features.visitorManagement.title", {
        defaultValue: "Visitor Management",
      }),
      description: t("hrAdmin.features.visitorManagement.description", {
        defaultValue:
          "Register visitors, manage host approvals, and track check-in activity for controlled site access.",
      }),
      category: t("hrAdmin.features.visitorManagement.category", {
        defaultValue: "Site access",
      }),
      status: t("hrAdmin.features.visitorManagement.status", {
        defaultValue: "Visitor flow active",
      }),
      accentColor: "success.main",
      icon: BadgeRoundedIcon,
      meta: [
        t("hrAdmin.features.visitorManagement.meta.registration", {
          defaultValue: "Pre-registration",
        }),
        t("hrAdmin.features.visitorManagement.meta.access", {
          defaultValue: "Host approval required",
        }),
      ],
      metrics: [
        {
          title: t("hrAdmin.features.visitorManagement.metrics.requestsTitle", {
            defaultValue: "Visitors today",
          }),
          value: "34",
          trend: t("hrAdmin.features.visitorManagement.metrics.requestsTrend", {
            defaultValue:
              "Expected and checked-in visitors across active office locations.",
          }),
          icon: ReceiptLongRoundedIcon,
          color: "success.main",
        },
        {
          title: t("hrAdmin.features.visitorManagement.metrics.windowTitle", {
            defaultValue: "Check-in target",
          }),
          value: "5m",
          trend: t("hrAdmin.features.visitorManagement.metrics.windowTrend", {
            defaultValue:
              "Reception target for validating visitor details and issuing access badges.",
          }),
          icon: ScheduleRoundedIcon,
          color: "primary.main",
        },
        {
          title: t("hrAdmin.features.visitorManagement.metrics.ownerTitle", {
            defaultValue: "Service owner",
          }),
          value: t("hrAdmin.features.visitorManagement.metrics.ownerValue", {
            defaultValue: "Reception team",
          }),
          trend: t("hrAdmin.features.visitorManagement.metrics.ownerTrend", {
            defaultValue:
              "Coordinates visitor registration, host confirmation, and access records.",
          }),
          icon: SupportAgentRoundedIcon,
          color: "secondary.main",
        },
      ],
      highlights: [
        t("hrAdmin.features.visitorManagement.highlights.one", {
          defaultValue:
            "Capture visitor identity, host details, visit purpose, and expected arrival time in one flow.",
        }),
        t("hrAdmin.features.visitorManagement.highlights.two", {
          defaultValue:
            "Keep approval and check-in status visible to reception, security, and employee hosts.",
        }),
        t("hrAdmin.features.visitorManagement.highlights.three", {
          defaultValue:
            "Maintain a clear visitor log for audit, emergency response, and site access reporting.",
        }),
      ],
      workflowSteps: [
        t("hrAdmin.features.visitorManagement.steps.one", {
          defaultValue:
            "Pre-register the visitor with host, schedule, purpose, and required identification details.",
        }),
        t("hrAdmin.features.visitorManagement.steps.two", {
          defaultValue:
            "Route the visit to the employee host or reception team for confirmation before arrival.",
        }),
        t("hrAdmin.features.visitorManagement.steps.three", {
          defaultValue:
            "Check in the visitor, issue the badge, and close the record after check-out.",
        }),
      ],
    },
    // {
    //   id: 'overtime-registration',
    //   title: t('hrAdmin.features.overtimeRegistration.title', { defaultValue: 'Overtime Registration' }),
    //   description: t('hrAdmin.features.overtimeRegistration.description', {
    //     defaultValue:
    //       'Capture overtime requests with shift context, manager approval, and payroll-ready records.',
    //   }),
    //   category: t('hrAdmin.features.overtimeRegistration.category', { defaultValue: 'Time management' }),
    //   status: t('hrAdmin.features.overtimeRegistration.status', { defaultValue: 'Pending approvals' }),
    //   accentColor: 'secondary.main',
    //   icon: AccessTimeFilledRoundedIcon,
    //   meta: [
    //     t('hrAdmin.features.overtimeRegistration.meta.payroll', { defaultValue: 'Payroll aligned' }),
    //     t('hrAdmin.features.overtimeRegistration.meta.audit', { defaultValue: 'Audit-ready records' }),
    //   ],
    //   metrics: [
    //     {
    //       title: t('hrAdmin.features.overtimeRegistration.metrics.requestsTitle', { defaultValue: 'Open submissions' }),
    //       value: '19',
    //       trend: t('hrAdmin.features.overtimeRegistration.metrics.requestsTrend', {
    //         defaultValue: 'Requests waiting for confirmation before payroll cutoff.',
    //       }),
    //       icon: ReceiptLongRoundedIcon,
    //       color: 'secondary.main',
    //     },
    //     {
    //       title: t('hrAdmin.features.overtimeRegistration.metrics.windowTitle', { defaultValue: 'Payroll cutoff' }),
    //       value: '18:00',
    //       trend: t('hrAdmin.features.overtimeRegistration.metrics.windowTrend', {
    //         defaultValue: 'Approved submissions are bundled into the next payroll export.',
    //       }),
    //       icon: ScheduleRoundedIcon,
    //       color: 'primary.main',
    //     },
    //     {
    //       title: t('hrAdmin.features.overtimeRegistration.metrics.ownerTitle', { defaultValue: 'Service owner' }),
    //       value: t('hrAdmin.features.overtimeRegistration.metrics.ownerValue', { defaultValue: 'Compensation team' }),
    //       trend: t('hrAdmin.features.overtimeRegistration.metrics.ownerTrend', {
    //         defaultValue: 'Ensures approvals, rates, and policy rules stay aligned.',
    //       }),
    //       icon: SupportAgentRoundedIcon,
    //       color: 'secondary.main',
    //     },
    //   ],
    //   highlights: [
    //     t('hrAdmin.features.overtimeRegistration.highlights.one', {
    //       defaultValue: 'Capture reason, shift, and expected hours in a single structured submission.',
    //     }),
    //     t('hrAdmin.features.overtimeRegistration.highlights.two', {
    //       defaultValue: 'Keep approval history readable for managers, HR, and payroll review teams.',
    //     }),
    //     t('hrAdmin.features.overtimeRegistration.highlights.three', {
    //       defaultValue: 'Reduce payroll exceptions by validating cutoffs and approval completion before export.',
    //     }),
    //   ],
    //   workflowSteps: [
    //     t('hrAdmin.features.overtimeRegistration.steps.one', {
    //       defaultValue: 'Register overtime hours with shift details and business justification.',
    //     }),
    //     t('hrAdmin.features.overtimeRegistration.steps.two', {
    //       defaultValue: 'Send the request through manager approval before payroll processing.',
    //     }),
    //     t('hrAdmin.features.overtimeRegistration.steps.three', {
    //       defaultValue: 'Confirm approved hours and export the final record set for payroll handling.',
    //     }),
    //   ],
    // },
    // {
    //   id: 'payslip-documents',
    //   title: t('hrAdmin.features.payslipDocuments.title', { defaultValue: 'Payslip & Documents' }),
    //   description: t('hrAdmin.features.payslipDocuments.description', {
    //     defaultValue:
    //       'Provide access to payslips, tax forms, and official HR records from one controlled document area.',
    //   }),
    //   category: t('hrAdmin.features.payslipDocuments.category', { defaultValue: 'Employee records' }),
    //   status: t('hrAdmin.features.payslipDocuments.status', { defaultValue: 'Self-service ready' }),
    //   accentColor: 'primary.main',
    //   icon: DescriptionRoundedIcon,
    //   meta: [
    //     t('hrAdmin.features.payslipDocuments.meta.history', { defaultValue: 'Historical archive' }),
    //     t('hrAdmin.features.payslipDocuments.meta.access', { defaultValue: 'Role-based access' }),
    //   ],
    //   metrics: [
    //     {
    //       title: t('hrAdmin.features.payslipDocuments.metrics.requestsTitle', { defaultValue: 'Documents issued' }),
    //       value: '1.2k',
    //       trend: t('hrAdmin.features.payslipDocuments.metrics.requestsTrend', {
    //         defaultValue: 'Monthly payslips and regulated employee forms available for retrieval.',
    //       }),
    //       icon: ReceiptLongRoundedIcon,
    //       color: 'primary.main',
    //     },
    //     {
    //       title: t('hrAdmin.features.payslipDocuments.metrics.windowTitle', { defaultValue: 'Refresh cycle' }),
    //       value: 'Monthly',
    //       trend: t('hrAdmin.features.payslipDocuments.metrics.windowTrend', {
    //         defaultValue: 'Publishing follows payroll closure and document validation windows.',
    //       }),
    //       icon: ScheduleRoundedIcon,
    //       color: 'info.main',
    //     },
    //     {
    //       title: t('hrAdmin.features.payslipDocuments.metrics.ownerTitle', { defaultValue: 'Service owner' }),
    //       value: t('hrAdmin.features.payslipDocuments.metrics.ownerValue', { defaultValue: 'Payroll services' }),
    //       trend: t('hrAdmin.features.payslipDocuments.metrics.ownerTrend', {
    //         defaultValue: 'Maintains release governance and document retention rules.',
    //       }),
    //       icon: SupportAgentRoundedIcon,
    //       color: 'secondary.main',
    //     },
    //   ],
    //   highlights: [
    //     t('hrAdmin.features.payslipDocuments.highlights.one', {
    //       defaultValue: 'Centralize payslips and related HR records behind a clean self-service experience.',
    //     }),
    //     t('hrAdmin.features.payslipDocuments.highlights.two', {
    //       defaultValue: 'Preserve document history so employees and HR can retrieve prior statements without delay.',
    //     }),
    //     t('hrAdmin.features.payslipDocuments.highlights.three', {
    //       defaultValue: 'Keep release timing and access control visible for compliance and audit needs.',
    //     }),
    //   ],
    //   workflowSteps: [
    //     t('hrAdmin.features.payslipDocuments.steps.one', {
    //       defaultValue: 'Publish validated payroll files into the employee document library.',
    //     }),
    //     t('hrAdmin.features.payslipDocuments.steps.two', {
    //       defaultValue: 'Allow employees to retrieve the latest statements through a secure self-service flow.',
    //     }),
    //     t('hrAdmin.features.payslipDocuments.steps.three', {
    //       defaultValue: 'Retain document history and surface support paths for correction requests.',
    //     }),
    //   ],
    // },
    // {
    //   id: 'employee-letters',
    //   title: t('hrAdmin.features.employeeLetters.title', { defaultValue: 'Employee Letters' }),
    //   description: t('hrAdmin.features.employeeLetters.description', {
    //     defaultValue:
    //       'Request employment confirmation letters and related HR certifications with transparent handling status.',
    //   }),
    //   category: t('hrAdmin.features.employeeLetters.category', { defaultValue: 'Administrative support' }),
    //   status: t('hrAdmin.features.employeeLetters.status', { defaultValue: 'Service window active' }),
    //   accentColor: 'error.main',
    //   icon: BadgeRoundedIcon,
    //   meta: [
    //     t('hrAdmin.features.employeeLetters.meta.templates', { defaultValue: 'Template-controlled' }),
    //     t('hrAdmin.features.employeeLetters.meta.delivery', { defaultValue: 'Digital delivery' }),
    //   ],
    //   metrics: [
    //     {
    //       title: t('hrAdmin.features.employeeLetters.metrics.requestsTitle', { defaultValue: 'Requests in queue' }),
    //       value: '12',
    //       trend: t('hrAdmin.features.employeeLetters.metrics.requestsTrend', {
    //         defaultValue: 'Letters being prepared, reviewed, or scheduled for release.',
    //       }),
    //       icon: ReceiptLongRoundedIcon,
    //       color: 'error.main',
    //     },
    //     {
    //       title: t('hrAdmin.features.employeeLetters.metrics.windowTitle', { defaultValue: 'Standard SLA' }),
    //       value: '2d',
    //       trend: t('hrAdmin.features.employeeLetters.metrics.windowTrend', {
    //         defaultValue: 'Regular turnaround target for standard confirmation requests.',
    //       }),
    //       icon: ScheduleRoundedIcon,
    //       color: 'primary.main',
    //     },
    //     {
    //       title: t('hrAdmin.features.employeeLetters.metrics.ownerTitle', { defaultValue: 'Service owner' }),
    //       value: t('hrAdmin.features.employeeLetters.metrics.ownerValue', { defaultValue: 'HR Shared Services' }),
    //       trend: t('hrAdmin.features.employeeLetters.metrics.ownerTrend', {
    //         defaultValue: 'Controls templates, reviews, and official release standards.',
    //       }),
    //       icon: SupportAgentRoundedIcon,
    //       color: 'secondary.main',
    //     },
    //   ],
    //   highlights: [
    //     t('hrAdmin.features.employeeLetters.highlights.one', {
    //       defaultValue: 'Use standard templates to keep external employment documents consistent and auditable.',
    //     }),
    //     t('hrAdmin.features.employeeLetters.highlights.two', {
    //       defaultValue: 'Show request status and expected completion timing to reduce manual follow-up.',
    //     }),
    //     t('hrAdmin.features.employeeLetters.highlights.three', {
    //       defaultValue: 'Keep document review and release ownership clear inside the same administrative flow.',
    //     }),
    //   ],
    //   workflowSteps: [
    //     t('hrAdmin.features.employeeLetters.steps.one', {
    //       defaultValue: 'Choose the required letter type and provide any necessary recipient details.',
    //     }),
    //     t('hrAdmin.features.employeeLetters.steps.two', {
    //       defaultValue: 'Route the request for HR validation and template-based generation.',
    //     }),
    //     t('hrAdmin.features.employeeLetters.steps.three', {
    //       defaultValue: 'Release the approved document through the agreed digital delivery channel.',
    //     }),
    //   ],
    // },
  ];
}

export function getHrAdminFeatureById(featureId, t) {
  return getHrAdminFeatures(t).find((item) => item.id === featureId) || null;
}
