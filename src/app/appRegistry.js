import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import HelpCenterRoundedIcon from "@mui/icons-material/HelpCenterRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import MiscellaneousServicesRoundedIcon from "@mui/icons-material/MiscellaneousServicesRounded";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import DirectionsBusRoundedIcon from "@mui/icons-material/DirectionsBusRounded";
import AppsRoundedIcon from "@mui/icons-material/AppsRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import BusinessCenterRoundedIcon from "@mui/icons-material/BusinessCenterRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import FactoryRoundedIcon from "@mui/icons-material/FactoryRounded";
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded";
import HealthAndSafetyRoundedIcon from "@mui/icons-material/HealthAndSafetyRounded";
import NewspaperRoundedIcon from "@mui/icons-material/NewspaperRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import QrCode2RoundedIcon from "@mui/icons-material/QrCode2Rounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import { ADMINISTRATOR_ROLE_IDS, hasAnyRole } from "../utils/roles";

export const applicationRegistry = [
  {
    id: "dashboard",
    label: "Dashboard",
    type: "internal",
    to: "/dashboard",
    end: true,
    icon: DashboardRoundedIcon,
    quickAccess: true,
  },
  {
    id: "eworkflow",
    label: "eWorkflow",
    type: "internal",
    to: "/dashboard/eworkflow",
    end: true,
    icon: AccountTreeRoundedIcon,
    quickAccess: true,
  },
  {
    id: "self_service",
    label: "Self Service",
    type: "internal",
    to: "/dashboard/self-service",
    end: true,
    icon: MiscellaneousServicesRoundedIcon,
    quickAccess: true,
  },
  {
    id: "it_application_request",
    label: "IT Application Request",
    type: "internal",
    to: "/dashboard/self-service/it-application-request",
    end: true,
    icon: AppsRoundedIcon,
    quickAccess: true,
  },
  {
    id: "hr_admin",
    label: "HR & Admin",
    type: "internal",
    to: "/dashboard/hr-admin",
    end: false,
    icon: PeopleRoundedIcon,
    quickAccess: true,
  },
  {
    id: "order_meal",
    label: "Order Meal",
    type: "internal",
    to: "/dashboard/hr-admin/order-meal",
    end: true,
    icon: RestaurantRoundedIcon,
    quickAccess: true,
  },
  {
    id: "booking_bus",
    label: "Booking Bus",
    type: "internal",
    to: "/dashboard/hr-admin/booking-bus",
    end: true,
    icon: DirectionsBusRoundedIcon,
    quickAccess: true,
  },
  {
    id: "administrator",
    label: "Administrator",
    type: "internal",
    to: "/dashboard/administrator",
    end: true,
    icon: AdminPanelSettingsRoundedIcon,
    quickAccess: true,
    allowedRoleIds: ADMINISTRATOR_ROLE_IDS,
  },
  {
    id: "help_center",
    label: "Report an issue",
    type: "internal",
    to: "/dashboard/help/center",
    end: true,
    icon: HelpCenterRoundedIcon,
    quickAccess: true,
  },
  {
    id: "utility_sales_distribution",
    label: "Sales and Distribution",
    type: "external",
    href: "http://vndms.apac.ii-vi.net/DMS_Utility/SoReview/ReleaseforReview",
    autoLogin: "dms",
    returnUrl: "/DMS_Utility/SoReview/ReleaseforReview",
    icon: BusinessCenterRoundedIcon,
    groupId: "utility_application",
  },
  {
    id: "utility_project_system",
    label: "Project System",
    type: "external",
    href: "http://vndms.apac.ii-vi.net/DMS_Utility/ESuggestion/Index",
    autoLogin: "dms",
    returnUrl: "/DMS_Utility/ESuggestion/Index",
    icon: AccountTreeRoundedIcon,
    groupId: "utility_application",
  },
  {
    id: "utility_h_grade_performance",
    label: "H-grade Performance Management",
    type: "external",
    href: "http://vndms.apac.ii-vi.net/DMS_Utility/PerformanceAppraisal/SetupGoal",
    autoLogin: "dms",
    returnUrl: "/DMS_Utility/PerformanceAppraisal/SetupGoal",
    icon: WorkspacePremiumRoundedIcon,
    groupId: "utility_application",
  },
  {
    id: "utility_h_grade_promotion",
    label: "H-grade Promotion Management",
    type: "external",
    href: "http://vndms.apac.ii-vi.net/DMS_Utility/HGradePromotion",
    autoLogin: "dms",
    returnUrl: "/DMS_Utility/HGradePromotion",
    icon: WorkspacePremiumRoundedIcon,
    groupId: "utility_application",
  },
  {
    id: "utility_kpi_management",
    label: "KPI Management",
    type: "external",
    href: "http://vndms.apac.ii-vi.net/DMS_Utility/KPIManagement/SetupMasterData",
    autoLogin: "dms",
    returnUrl: "/DMS_Utility/KPIManagement/SetupMasterData",
    icon: TrendingUpRoundedIcon,
    groupId: "utility_application",
  },
  {
    id: "utility_production",
    label: "Production",
    type: "external",
    href: "http://vndms.apac.ii-vi.net/DMS_Utility/NewProductranfer/CreateNewProductTranfer?PartNum=%27%27&indextab=%270%27",
    autoLogin: "dms",
    returnUrl: "/DMS_Utility/NewProductranfer/CreateNewProductTranfer?PartNum=%27%27&indextab=%270%27",
    icon: FactoryRoundedIcon,
    groupId: "utility_application",
  },
  {
    id: "utility_ncr",
    label: "NCR",
    type: "external",
    href: "http://vndms.apac.ii-vi.net/DMS_Utility/Help/Index/",
    autoLogin: "dms",
    returnUrl: "/DMS_Utility/Help/Index/",
    icon: ReportProblemRoundedIcon,
    groupId: "utility_application",
  },
  {
    id: "utility_ehs",
    label: "EHS",
    type: "external",
    href: "http://vndms.apac.ii-vi.net/DMS_Utility/HealManagement/patient",
    autoLogin: "dms",
    returnUrl: "/DMS_Utility/HealManagement/patient",
    icon: HealthAndSafetyRoundedIcon,
    groupId: "utility_application",
  },
  {
    id: "utility_coherent_news",
    label: "Coherent News",
    type: "external",
    href: "http://vndms.apac.ii-vi.net/DMS_Utility/Administrator/AddNewsAndVideo",
    autoLogin: "dms",
    returnUrl: "/DMS_Utility/Administrator/AddNewsAndVideo",
    icon: NewspaperRoundedIcon,
    groupId: "utility_application",
  },
  {
    id: "utility_training",
    label: "Training",
    type: "external",
    href: "http://vndms.apac.ii-vi.net/DMS_Utility/iframe/redirect?url=http://vnmbi-dmserp.apac.ii-vi.net/DMSWeb/Report_EmployeeTrainingRecord.aspx",
    autoLogin: "dms",
    returnUrl: "/DMS_Utility/iframe/redirect?url=http://vnmbi-dmserp.apac.ii-vi.net/DMSWeb/Report_EmployeeTrainingRecord.aspx",
    icon: SchoolRoundedIcon,
    groupId: "utility_application",
  },
  {
    id: "utility_qrb_management",
    label: "QRB Management",
    type: "external",
    href: "http://vndms.apac.ii-vi.net/DMS_Utility/QRB/QRBManagement",
    autoLogin: "dms",
    returnUrl: "/DMS_Utility/QRB/QRBManagement",
    icon: QrCode2RoundedIcon,
    groupId: "utility_application",
  },
  {
    id: "sfc_ao_vsip1",
    label: "AO VSIP1",
    type: "external",
    href: "http://vndms.apac.ii-vi.net/intranet/SFC",
    icon: BarChartRoundedIcon,
    groupId: "sfc_report",
  },
  {
    id: "sfc_cts_vsip1",
    label: "CTS VSIP1",
    type: "external",
    href: "http://vndms.apac.ii-vi.net/DMS/",
    autoLogin: "dms",
    autoLoginTarget: "dms",
    returnUrl: "/DMS/",
    icon: BarChartRoundedIcon,
    groupId: "sfc_report",
  },
  {
    id: "analytic_power_bi",
    label: "Power BI",
    type: "external",
    href: "https://cohrinc.sharepoint.com/:u:/r/sites/VN-AllUsers/PBI/SitePages/QA.aspx?csf=1&web=1&e=8Rk5kb",
    icon: AnalyticsRoundedIcon,
    groupId: "analytic",
  },
];

export const externalApplicationGroups = [
  {
    id: "utility_application",
    label: "Utility Application",
    to: "/dashboard/utility-application",
    icon: AppsRoundedIcon,
  },
  {
    id: "sfc_report",
    label: "SFC Report",
    to: "/dashboard/sfc-report",
    icon: AssessmentRoundedIcon,
  },
  {
    id: "analytic",
    label: "Analytic",
    to: "/dashboard/analytic",
    icon: AnalyticsRoundedIcon,
  },
];

export function canDisplayApplication(application, user) {
  if (!application.allowedRoleIds?.length) {
    return true;
  }

  return hasAnyRole(user, application.allowedRoleIds);
}

export function getApplicationsForUser(user) {
  return applicationRegistry.filter((application) =>
    canDisplayApplication(application, user),
  );
}

export function getInternalQuickAccessApplications(user) {
  return getApplicationsForUser(user).filter(
    (application) => application.type === "internal" && application.quickAccess,
  );
}

export function getFavoriteApplicationOptions(user) {
  return getApplicationsForUser(user);
}

export function openExternalApplication(href) {
  if (!href) {
    return;
  }

  window.open(href, "_blank", "noopener,noreferrer");
}
